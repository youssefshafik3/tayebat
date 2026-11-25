import type { Metadata } from "next";
import "./globals.css";
import { FeedbackProvider } from "@/components/ui/FeedbackBanner";

export const metadata: Metadata = {
  title: "Tayebat · Local Business Delivery & Fulfillment",
  description:
    "Local Business Delivery and Fulfillment Management System connecting customers, partners, riders, and platform administrators.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <FeedbackProvider>{children}</FeedbackProvider>
      </body>
    </html>
  );
}
