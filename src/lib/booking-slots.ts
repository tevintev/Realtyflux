// Viewing time slots, shared by the booking form, the server actions and the
// admin views. `value` is what the form submits; `time` is stored in the
// bookings.preferredTime column (a TIME, kept in UTC).
export const TIME_SLOTS = [
  { value: "09:00 AM - 11:00 AM", label: "Morning", time: "09:00:00", hour: 9 },
  { value: "11:00 AM - 01:00 PM", label: "Mid-Day", time: "11:00:00", hour: 11 },
  { value: "02:00 PM - 04:00 PM", label: "Afternoon", time: "14:00:00", hour: 14 },
  { value: "04:00 PM - 06:00 PM", label: "Late Afternoon", time: "16:00:00", hour: 16 },
] as const;

export type TimeSlot = (typeof TIME_SLOTS)[number];

export function slotByValue(value: string): TimeSlot | undefined {
  return TIME_SLOTS.find((slot) => slot.value === value);
}

/** The slot a stored preferredTime falls in, read in UTC as it was written. */
export function slotForTime(time: Date): TimeSlot | undefined {
  return TIME_SLOTS.find((slot) => slot.hour === time.getUTCHours());
}

/** "YYYY-MM-DD" for a stored preferredDate (a DATE column, read in UTC). */
export function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Readable slot text for a stored time, falling back to HH:MM. */
export function formatSlot(time: Date): string {
  return slotForTime(time)?.value ?? time.toISOString().slice(11, 16);
}
