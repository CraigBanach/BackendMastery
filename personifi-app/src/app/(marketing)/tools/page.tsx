import type { Metadata } from "next";
import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Tools | Personifi",
  description:
    "Practical money tools that help you plan, compare, and make confident decisions together.",
  robots: "index, follow",
  alternates: {
    canonical: "https://personifi.xyz/tools",
  },
};

export default function ToolsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <section className="relative overflow-hidden bg-gradient-to-br from-finance-green-light/20 to-white -mt-16 pt-20 pb-16 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
            Planning tools for real life
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            Focused calculators and guides that help couples make confident
            money decisions together.
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16 px-4">
        <div className="container mx-auto max-w-6xl grid md:grid-cols-2 gap-6">
          <Link
            href="/tools/mortgage-deposit-vs-invest-calculator"
            className="block"
          >
            <Card className="border-0 shadow-lg transition-shadow hover:shadow-xl">
              <CardContent className="p-6 sm:p-8 space-y-4">
                <p className="text-xs uppercase text-muted-foreground">
                  Mortgage planning tool
                </p>
                <h2 className="text-xl font-semibold">
                  Mortgage Deposit vs Investment Calculator
                </h2>
                <p className="text-sm text-muted-foreground">
                  Compare a larger deposit vs investing the difference and see
                  when investment growth could outweigh an increase in the
                  mortgage rate.
                </p>
                <span className="text-finance-green font-medium hover:text-finance-green-dark">
                  Open calculator →
                </span>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      <section className="pb-16 px-4 text-center">
        <p className="text-sm text-muted-foreground">
          Looking for a simpler starting point? Try our{" "}
          <Link
            href="/free-budget-template"
            className="text-finance-green font-medium hover:text-finance-green-dark"
          >
            free budget spreadsheet
          </Link>{" "}
          or read{" "}
          <Link
            href="/stories"
            className="text-finance-green font-medium hover:text-finance-green-dark"
          >
            real money stories
          </Link>{" "}
          from couples using Personifi.
        </p>
      </section>
    </div>
  );
}
