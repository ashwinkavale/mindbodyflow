import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mind Body Flow | Rotational Training",
  description: "A skill-based rotational training program by Mind Body Flow, led by Amit Kavale.",
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
