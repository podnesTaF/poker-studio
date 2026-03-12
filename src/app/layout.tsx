import type { Metadata } from "next";
import {
  DM_Sans,
  Geist_Mono,
  Playfair_Display,
  Space_Grotesk,
} from "next/font/google";
import { Providers } from "@/components/Providers";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KitchenVerse Studio | Experiences in Canary Wharf",
  description:
    "Poker nights, cooking classes, business games, karaoke evenings, and pitch events — all under one roof in Canary Wharf, London.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${dmSans.variable} ${geistMono.variable} ${playfair.variable} ${spaceGrotesk.variable} antialiased`}
      >
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
