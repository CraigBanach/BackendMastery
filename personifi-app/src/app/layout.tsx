import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ModalProvider } from "@/lib/providers/modal-provider";
import { PostHogProvider } from "@/lib/providers/posthog-provider";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://personifi.xyz"),
  title: {
    default: "Conscious Spending for Couples | Personifi",
    template: "%s | Personifi",
  },
  description: "A simple shared money tool for couples who want to spend intentionally and save together for life goals.",
  openGraph: {
    images: [
      {
        url: "https://personifi.xyz/personifi-opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Personifi — Conscious Spending for Couples",
      },
    ],
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Personifi",
              url: "https://personifi.xyz",
              logo: "https://personifi.xyz/personifi-opengraph-image.png",
              sameAs: [
                "https://www.instagram.com/personifi_app/",
                "https://www.youtube.com/@Personifi_app",
                "https://www.tiktok.com/@personifi_app",
              ],
              contactPoint: {
                "@type": "ContactPoint",
                email: "hello@personifi.xyz",
                contactType: "customer service",
              },
            }),
          }}
        />
        <PostHogProvider
          options={{
            api_host: "/ingest",
            ui_host: "https://eu.posthog.com",
            defaults: "2025-05-24",
            capture_exceptions: true,
            debug: process.env.NODE_ENV === "development",
          }}
        >
          <ModalProvider>{children}</ModalProvider>
        </PostHogProvider>

      </body>
    </html>
  );
}
