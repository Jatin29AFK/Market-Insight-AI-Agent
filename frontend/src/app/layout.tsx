import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Market Insight AI",
  description: "Agentic AI stock market research assistant",
  icons: {
    icon: "/app-icon.svg",
    shortcut: "/app-icon.svg",
    apple: "/app-icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
