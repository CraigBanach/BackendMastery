import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PostHogProvider } from "@/lib/providers/posthog-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "personifi",
  description: "Personal Finance for your family",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <PostHogProvider
          apiKey={process.env.POSTHOG_KEY}
          options={{
            api_host: "/ingest",
            ui_host: "https://eu.posthog.com",
            defaults: "2025-05-24",
            capture_exceptions: true,
            debug: process.env.NODE_ENV === "development",
          }}
        >
          {children}
        </PostHogProvider>
      </body>
    </html>
  );
}