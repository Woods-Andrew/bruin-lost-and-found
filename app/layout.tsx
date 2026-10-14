import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Shell } from "@/components/shell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bruin Lost and Found",
  description: "AI-assisted lost and found for campus.",
};

export const dynamic = "force-dynamic";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
