import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import AIAssistant from "@/components/AIAssistant";
import AppProviders from "@/components/AppProviders";
import NotificationListener from "@/components/NotificationListener";

const plusJakartaSans = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  variable: '--font-plus-jakarta',
  weight: ['400', '600', '700', '800']
});

const beVietnamPro = Be_Vietnam_Pro({ 
  subsets: ["latin"],
  variable: '--font-be-vietnam',
  weight: ['300', '400', '500', '600']
});

export const metadata: Metadata = {
  title: "Echoes — Digital Sanctuary",
  description: "A sanctuary for the thoughts you've never spoken. Resonate with others in silence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className={`${plusJakartaSans.variable} ${beVietnamPro.variable}`}>
        <AppProviders>
          {children}
          <NotificationListener />
          <AIAssistant />
        </AppProviders>
      </body>
    </html>
  );
}
