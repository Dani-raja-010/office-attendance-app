import type { Metadata, Viewport } from "next";
import { Geist_Mono, Space_Grotesk } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = { themeColor: "#0b0e1a", colorScheme: "dark" };

export const metadata: Metadata = {
  title: { default: "WorkTrack", template: "%s · WorkTrack" },
  description: "GPS-verified attendance and daily task management for your team.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${geistMono.variable} dark h-full antialiased`}>
      <body className="min-h-full font-sans">
        {children}
        <Toaster theme="dark" richColors position="top-right" closeButton />
      </body>
    </html>
  );
}
