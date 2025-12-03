import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer"; // Import the Footer component
import { headers } from "next/headers";

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
      <head>
        <script
          defer
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon='{"token": "b6b8e2a171ca40eb9a80a2c613f122ef"}'
        ></script>
      </head>
      <body className={`${inter.className} antialiased`}>
        <Header></Header>
        <main
          className={`flex flex-col ${
            isLandingPage ? "" : "p-3 sm:p-4 md:p-6"
          }`}
        >
          {children}
        </main>
        {isLandingPage && <Footer />}
      </body>
    </html>
  );
}
