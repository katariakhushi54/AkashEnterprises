import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KHUSHI | Premium Fashion",
  description: "Premium essentials for everyday living.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased bg-[#F8F6F0] dark:bg-[#111111] transition-colors duration-300">
      <body className={`${inter.variable} ${playfair.variable} min-h-full flex flex-col bg-[#F8F6F0] dark:bg-[#111111] text-[#111111] dark:text-[#F8F6F0] font-sans transition-colors duration-300`}>
        {children}
      </body>
    </html>
  );
}
