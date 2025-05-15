// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter, Playfair_Display, Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

// Primary font - Inter
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});


const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

// Alternative Geist fonts
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PIM System",
  description: "Product Information Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <body
        className={`${inter.variable} ${playfair.variable} ${geistSans.variable} ${geistMono.variable} antialiased font-sans`}
      >
        <Providers>
          {/* Skip Link for accessibility */}
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          
          {children}
        </Providers>
      </body>
    </html>
  );
}