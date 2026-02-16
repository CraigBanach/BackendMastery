import { Badge } from "@/components/ui/badge";
import { BudgetTemplateForm } from "@/components/marketing/budget-template-form";
import {
  Users,
  Calculator,
} from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";


export const metadata: Metadata = {
  title: "Free UK Couples Budget Template",
  description:
    "Download our free Google Sheets budget template designed for UK couples. Track expenses, plan finances together, and manage your household budget with our proven spreadsheet system.",
  keywords:
    "UK couples budget template, free budget spreadsheet, couples finance UK, joint budget template, Google Sheets budget, UK personal finance, couples money management, household budget planner",
  robots: "index, follow",
  alternates: {
    canonical: "/free-budget-template",
  },
  openGraph: {
    title: "Free UK Couples Budget Template",
    description:
      "Download our free Google Sheets budget template designed for UK couples. No signup required.",
    type: "website",
    locale: "en_GB",
  },
};

export default function FreeBudgetTemplate() {
  return (
    <div className="flex flex-col min-h-screen">

      {/* Hero Section */}
      <section className="flex-1 -mt-16 pt-36 pb-12 md:pt-40 md:pb-24 bg-gradient-to-br from-finance-green-light/10 to-white">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">
            {/* Left Content */}
            <div className="text-center lg:text-left space-y-8">
              <div>
                <Badge
                  variant="secondary"
                  className="mb-4 bg-finance-green-light text-finance-green-dark hover:bg-finance-green-light/70 inline-block"
                >
                  📊 Free Google Sheets Template
                </Badge>
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl mb-6 leading-tight">
                  Free Couples Budget Template{" "}
                  <span className="text-finance-green block mt-2">Get it Delivered Instantly</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Start building a shared budget system you both trust.
                  Track expenses, plan together, and stop fighting about money.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-6 text-left max-w-lg mx-auto lg:mx-0">
                <div className="space-y-3">
                  <h3 className="font-semibold text-finance-navy flex items-center">
                    <Users className="h-5 w-5 text-finance-green mr-2" />
                    For Couples
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Designed specifically for two people managing one life.
                  </p>
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-finance-navy flex items-center">
                    <Calculator className="h-5 w-5 text-finance-green mr-2" />
                    Smart tracking
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Easy shared monthly tracking that jumpstarts your planning.
                  </p>
                </div>
              </div>

              <div className="text-left bg-blue-50/50 rounded-xl p-6 border border-blue-100 hidden lg:block">
                <h3 className="font-semibold mb-3">How it works:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <span className="bg-blue-100 text-blue-700 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">1</span>
                    Enter your email to get the secure link
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-100 text-blue-700 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">2</span>
                    Make a copy to your own Google Drive
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-100 text-blue-700 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">3</span>
                    Start planning your future together
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Content - Form */}
            <div className="w-full max-w-md mx-auto lg:mt-8">
              <BudgetTemplateForm />
              
               {/* Mobile-only "How it works" */}
              <div className="mt-8 text-left bg-blue-50/50 rounded-xl p-6 border border-blue-100 lg:hidden user-select-none">
                <h3 className="font-semibold mb-3">How it works:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <span className="bg-blue-100 text-blue-700 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">1</span>
                    Enter your email to get the secure link
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-100 text-blue-700 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">2</span>
                    Make a copy to your own Google Drive
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      {/* Footer removed as it is now in the global layout */}

      {/* Related Pages */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-xl font-semibold mb-4 text-center">
            More ways to get started
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center text-center items-center">
            <Link
              href="/free-month-budget-review"
              className="text-finance-green hover:text-finance-green-dark font-medium transition-colors duration-200"
            >
              Get a free budget critique →
            </Link>
            <span className="hidden sm:inline text-muted-foreground">|</span>
            <Link
              href="/stories"
              className="text-finance-green hover:text-finance-green-dark font-medium transition-colors duration-200"
            >
              Read real money stories →
            </Link>
            <span className="hidden sm:inline text-muted-foreground">|</span>
            <Link
              href="/tools"
              className="text-finance-green hover:text-finance-green-dark font-medium transition-colors duration-200"
            >
              Explore our planning tools →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
