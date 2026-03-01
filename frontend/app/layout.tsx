import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner"; // Import Sonner

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OnTrack AI | Habit Tracker",
  description: "NLP powered habit tracking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 text-slate-900`}>
        {children}
        {/* Add the Toaster here so it is available globally */}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}