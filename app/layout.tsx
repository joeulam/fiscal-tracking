import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Calico",
  description: "A cute cat themed fiscal tracker",
};

// app/layout.jsx
import { UserProvider } from "@auth0/nextjs-auth0/client";
import { LayoutProps } from "@/.next/types/app/layout";


export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="en">
      <script defer src="https://cloud.umami.is/script.js" data-website-id="e1c2962b-cf6a-4027-8640-4844c735afa2"></script>
    <UserProvider>
      <body>{children}</body>
    </UserProvider>
    </html>
  );
}
