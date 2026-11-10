import type { Metadata } from "next";

// Booking pages are per-visitor forms with no content worth indexing.
export const metadata: Metadata = {
  title: "Book a Viewing",
  robots: { index: false, follow: true },
};

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
