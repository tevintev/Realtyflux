"use server";

import { db } from "@/lib/db";
import { isAdmin, NOT_ADMIN_ERROR } from "@/lib/require-admin";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { TIME_SLOTS, slotByValue, slotForTime } from "@/lib/booking-slots";

interface BookingInput {
  propertyId: string;
  fullName: string;
  phone: string;
  email: string;
  preferredDate: string; // "YYYY-MM-DD"
  preferredTimeSlot: string; // e.g. "09:00 AM - 11:00 AM"
  message?: string;
}

// Only a confirmed viewing holds a slot. Pending requests don't block anyone
// until an admin accepts one of them.
const BLOCKING_STATUS = "confirmed";

const SLOT_TAKEN_MESSAGE =
  "Sorry, that time slot is already booked for this property. Please choose another time or a different day.";

function isValidDateString(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
}

function toDbDate(value: string) {
  return new Date(`${value}T00:00:00Z`);
}

function toDbTime(time: string) {
  return new Date(`1970-01-01T${time}Z`);
}

/**
 * Slots already taken by a confirmed viewing for this property on this day,
 * so the booking form can grey them out.
 */
export async function getBookedSlots(propertyId: string, date: string): Promise<string[]> {
  if (!propertyId || !isValidDateString(date)) return [];
  try {
    const bookings = await db.booking.findMany({
      where: { propertyId, preferredDate: toDbDate(date), status: BLOCKING_STATUS },
      select: { preferredTime: true },
    });
    return bookings
      .map((b) => slotForTime(b.preferredTime)?.value)
      .filter((v): v is (typeof TIME_SLOTS)[number]["value"] => Boolean(v));
  } catch (error) {
    console.error("Failed to load booked slots:", error);
    return [];
  }
}

export async function createBooking(data: BookingInput) {
  const slot = slotByValue(data.preferredTimeSlot);
  if (!slot) return { error: "Please choose one of the available time slots." };
  if (!isValidDateString(data.preferredDate)) return { error: "Please choose a valid date." };
  const today = new Date().toISOString().slice(0, 10);
  if (data.preferredDate < today) return { error: "Please choose a date from today onwards." };

  const preferredDate = toDbDate(data.preferredDate);
  const preferredTime = toDbTime(slot.time);

  try {
    // Check and insert in one serializable transaction so two people can't
    // both grab the last free slot at the same moment.
    const result = await db.$transaction(
      async (tx) => {
        const taken = await tx.booking.findFirst({
          where: { propertyId: data.propertyId, preferredDate, preferredTime, status: BLOCKING_STATUS },
          select: { id: true },
        });
        if (taken) return { taken: true as const };

        const booking = await tx.booking.create({
          data: {
            propertyId: data.propertyId,
            fullName: data.fullName,
            phone: data.phone,
            email: data.email,
            preferredDate,
            preferredTime,
            message: data.message || null,
            status: "pending",
          },
        });
        return { taken: false as const, id: booking.id };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    );

    if (result.taken) {
      return { error: SLOT_TAKEN_MESSAGE, slotTaken: true };
    }

    revalidatePath("/admin/bookings");
    revalidatePath("/admin");
    return { success: true, bookingId: result.id };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") {
      // Another request touched the same rows at the same time.
      return { error: "That slot was just updated. Please try again.", slotTaken: true };
    }
    console.error("Failed to create booking:", error);
    return { error: "Failed to submit booking request. Please try again." };
  }
}

export async function updateBookingStatus(bookingId: string, status: string) {
  if (!(await isAdmin())) return { error: NOT_ADMIN_ERROR };
  try {
    if (status === BLOCKING_STATUS) {
      const booking = await db.booking.findUnique({
        where: { id: bookingId },
        select: { propertyId: true, preferredDate: true, preferredTime: true },
      });
      if (!booking) return { error: "Booking not found." };
      const clash = await db.booking.findFirst({
        where: {
          id: { not: bookingId },
          propertyId: booking.propertyId,
          preferredDate: booking.preferredDate,
          preferredTime: booking.preferredTime,
          status: BLOCKING_STATUS,
        },
        select: { fullName: true },
      });
      if (clash) {
        return {
          error: `${clash.fullName} already has a confirmed viewing for this property at that time. Reschedule or cancel one of them first.`,
        };
      }
    }

    await db.booking.update({
      where: { id: bookingId },
      data: { status, updatedAt: new Date() },
    });
    revalidatePath("/admin/bookings");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to update booking status:", error);
    return { error: "Failed to update booking status." };
  }
}

export async function deleteBooking(bookingId: string) {
  if (!(await isAdmin())) return { error: NOT_ADMIN_ERROR };
  try {
    await db.booking.delete({
      where: { id: bookingId },
    });
    revalidatePath("/admin/bookings");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete booking:", error);
    return { error: "Failed to delete booking." };
  }
}
