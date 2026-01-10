import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Leekduck Calendar",
  description: "A calendar view for Leekduck events",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
