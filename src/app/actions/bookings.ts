"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

interface BookingInput {
  propertyId: string;
  fullName: string;
  phone: string;
  email: string;
  preferredDate: string; // "YYYY-MM-DD"
  preferredTimeSlot: string; // e.g. "09:00 AM - 11:00 AM"
  message?: string;
}

// Helper to map slot text to a 24h ISO time format for db TIME columns
const timeSlotMap: Record<string, string> = {
  "09:00 AM - 11:00 AM": "09:00:00",
  "11:00 AM - 01:00 PM": "11:00:00",
  "02:00 PM - 04:00 PM": "14:00:00",
  "04:00 PM - 06:00 PM": "16:00:00",
};

export async function createBooking(data: BookingInput) {
  try {
    const timeStr = timeSlotMap[data.preferredTimeSlot] || "12:00:00";
    
    // Create Date objects representing DB DATE and DB TIME respectively
    const dateObj = new Date(data.preferredDate); // Date component
    const timeObj = new Date(`1970-01-01T${timeStr}Z`); // Time component (UTC formatted for Prisma time)

    const booking = await db.booking.create({
      data: {
        propertyId: data.propertyId,
        fullName: data.fullName,
        phone: data.phone,
        email: data.email,
        preferredDate: dateObj,
        preferredTime: timeObj,
        message: data.message || null,
        status: "pending",
      },
    });

    revalidatePath("/admin/bookings");
    revalidatePath("/admin");
    return { success: true, bookingId: booking.id };
  } catch (error) {
    console.error("Failed to create booking:", error);
    return { error: "Failed to submit booking request. Please try again." };
  }
}

export async function updateBookingStatus(bookingId: string, status: string) {
  try {
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
