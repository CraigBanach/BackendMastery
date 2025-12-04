import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer"; // Import the Footer component
import { headers } from "next/headers";
import { PostHogProvider } from "@/lib/providers/posthog-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "personifi",
  description: "Personal Finance for your family",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerList = await headers();
  const pathName = headerList.get("x-current-path");
  const isLandingPage =
    pathName === "/" ||
    pathName === "/free-budget-template" ||
    (pathName && pathName.startsWith("/stories"));

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
          <Header></Header>
          <main
            className={`flex flex-col ${
              isLandingPage ? "" : "p-3 sm:p-4 md:p-6"
            }`}
          >
            {children}
          </main>
          {isLandingPage && <Footer />}
        </PostHogProvider>
      </body>
    </html>
  );
}
