import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rotational Training | Gold’s Gym Mumbai",
  description: "A skill-based rotational training program for Gold’s Gym members, led by Amit Kavale.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
