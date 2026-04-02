import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SATMAP7 — Live Satellite Tracker",
};

export default function TrackerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
