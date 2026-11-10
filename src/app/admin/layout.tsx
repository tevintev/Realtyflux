import type { Metadata } from "next";

// The admin area is private: keep every page in it out of search results.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
