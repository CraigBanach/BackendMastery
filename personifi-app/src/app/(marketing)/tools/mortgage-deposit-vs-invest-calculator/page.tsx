import type { Metadata } from "next";
import { Suspense } from "react";

import Link from "next/link";

import { CalculatorCtaButton } from "@/components/marketing/calculator-cta-button";
import { MortgageDepositInvestCalculator } from "@/components/marketing/mortgage-deposit-invest-calculator";

export const metadata: Metadata = {
  title: "Mortgage Deposit vs Investment Calculator | Personifi",
  description:
    "Compare a larger mortgage deposit vs investing the difference. A smaller deposit plus investment growth can sometimes leave you better off, depending on rate changes.",
  keywords:
    "mortgage deposit calculator, investment vs deposit, LTV rate change, UK mortgage tool, mortgage calculator",
  robots: "index, follow",
  alternates: {
    canonical:
      "https://personifi.xyz/tools/mortgage-deposit-vs-invest-calculator",
  },
  openGraph: {
    title: "Mortgage Deposit vs Investment Calculator",
    description:
      "Compare a larger mortgage deposit vs investing the difference and see when a smaller deposit plus investment growth could win.",
    type: "website",
    url: "https://personifi.xyz/tools/mortgage-deposit-vs-invest-calculator",
    locale: "en_GB",
  },
};

export default function MortgageDepositInvestCalculatorPage() {
  const appSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Mortgage Deposit vs Investment Calculator",
    applicationCategory: "FinanceApplication",
    operatingSystem: "All",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "GBP",
    },
  };

  return (
    <div className="flex flex-col min-h-screen">
      <section className="relative overflow-hidden bg-gradient-to-br from-finance-green-light/20 to-white -mt-16 pt-20 pb-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="flex justify-start">
            <Link
              href="/tools"
              className="inline-flex items-center text-sm font-semibold text-finance-green-dark hover:text-finance-green mb-4"
            >
              ← Back to Tools
            </Link>
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
              Mortgage Deposit vs Investment Calculator
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              Compare a larger deposit vs investing the difference. A smaller
              deposit plus investment growth can sometimes leave you better off,
              depending on the rate uplift.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid gap-8 items-start lg:grid-cols-[1.1fr_0.9fr]">
            <div className="order-1 space-y-4 text-muted-foreground">
              <p>
                A smaller deposit can push you into a higher rate, but it also
                frees up cash that could grow if invested well. The balance is
                whether the investment growth beats the extra mortgage cost.
              </p>
              <p>
                Use this calculator to compare a higher deposit vs investing the
                difference. Adjust the rate uplift and investment returns to see
                when a smaller deposit could work out better financially.
              </p>
              <p>
                We assume that in the higher deposit scenario, you will invest
                the mortgage payment difference, gaining the same interest rate
                as the lower deposit scenario.
              </p>
            </div>

            <div className="order-2 lg:order-3 lg:col-span-2">
              <Suspense fallback={<div className="text-center text-muted-foreground">Loading calculator...</div>}>
                <MortgageDepositInvestCalculator />
              </Suspense>
            </div>

            <div className="order-3 rounded-xl border bg-white p-6 shadow-sm lg:order-2 lg:col-start-2">
              <h2 className="text-xl font-semibold mb-3">
                Ready to plan together?
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Personifi helps couples track shared goals and make intentional
                decisions with their money.
              </p>
              <CalculatorCtaButton className="w-full bg-finance-green hover:bg-finance-green-dark text-base" />
            </div>
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([appSchema]),
        }}
      />
    </div>
  );
}
