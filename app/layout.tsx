import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WellnessOS | Premium Salon & Clinic Management",
  description: "Next-generation booking, management, and CRM platform for wellness businesses.",
};

import { Providers } from "@/components/providers/session-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
      suppressHydrationWarning // Used by next-themes for dark mode
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground transition-colors">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
