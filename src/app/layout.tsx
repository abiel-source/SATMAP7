import type { Metadata } from "next";
import { Space_Mono, Syne } from "next/font/google";
import "./globals.css";

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "600", "800"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SATMAP7 — Live Satellite Tracker",
  description:
    "Real-time 3D visualization of active satellites in Earth orbit. Powered by CelesTrak GP data and SGP4 orbital propagation.",
  keywords: [
    "satellite tracker",
    "real-time",
    "orbit",
    "satmap7",
    "3D",
    "CelesTrak",
    "ISS",
    "Starlink",
  ],
  openGraph: {
    title: "SATMAP7 — Live Satellite Tracker",
    description: "Real-time 3D satellite tracker powered by CelesTrak",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${spaceMono.variable} ${syne.variable}`}>
      <body className="bg-space-950 text-white antialiased overflow-hidden">
        {children}
      </body>
    </html>
  );
}
