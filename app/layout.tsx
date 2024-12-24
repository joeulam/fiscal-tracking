import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cotracker",
  description: "A cute fiscal tracker",
};

// app/layout.jsx
import { UserProvider } from '@auth0/nextjs-auth0/client';
import { LayoutProps } from "@/.next/types/app/layout";


export default function RootLayout({ children, ...props }: LayoutProps) {
  return (
    <html lang="en">
    <UserProvider>
      <body>{children}</body>
    </UserProvider>
    </html>
  );
}
