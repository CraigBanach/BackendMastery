import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  ArrowRight,
  Users,
  Calculator,
} from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "Free UK Couples Budget Template | Google Sheets Budget Planner | Personifi",
  description:
    "Download our free Google Sheets budget template designed for UK couples. Track expenses, plan finances together, and manage your household budget with our proven spreadsheet system.",
  keywords:
    "UK couples budget template, free budget spreadsheet, couples finance UK, joint budget template, Google Sheets budget, UK personal finance, couples money management, household budget planner",
  robots: "index, follow",
  openGraph: {
    title: "Free UK Couples Budget Template | Google Sheets Budget Planner",
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
      <section className="flex-1 -mt-16 pt-36 pb-8 md:pt-40 md:pb-16 bg-gradient-to-br from-finance-green-light/10 to-white">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <Badge
                variant="secondary"
                className="mb-4 bg-finance-green-light text-finance-green-dark hover:bg-finance-green-light/70 inline-block"
              >
                📊 Free Google Sheets Template
              </Badge>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl mb-4 leading-tight">
                Free budget spreadsheet{" "}
                <span className="text-finance-green">for UK couples</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                A proven Google Sheets budget template designed specifically for
                UK couples. Download, customize, and start tracking your
                finances together.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-finance-green hover:bg-finance-green-dark text-base px-6 py-3"
                >
                  <a
                    href="https://docs.google.com/spreadsheets/d/1txy_9_NyHuKZpSONJ5QyhHvm8if9Af5G8Zq7bn9eX30/edit#gid=0"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Spreadsheet Template
                    <Download className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-finance-green text-finance-green hover:bg-finance-green-light hover:text-finance-green-dark text-base px-6 py-3"
                >
                  <a href="/auth/login?screen_hint=signup">
                    Try Personifi App Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Downloads to your Google Drive • No email required • Works
                offline
              </p>
            </div>

            {/* Right Content - Features Preview */}
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow-lg p-4">
                <div className="bg-gradient-to-br from-finance-green-light/20 to-finance-green-light/10 p-3 rounded-lg mb-3">
                  <div className="text-sm font-medium text-finance-green-dark mb-2">
                    This Month&apos;s Budget Overview
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-muted-foreground">Total Income</div>
                      <div className="font-semibold">£4,200</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">
                        Total Expenses
                      </div>
                      <div className="font-semibold">£3,850</div>
                    </div>
                  </div>
                </div>
                <div className="text-center p-2 bg-green-50 rounded-lg">
                  <div className="text-sm text-green-700 font-medium">
                    £350 under budget! 🎉
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-lg shadow p-3 text-center">
                  <Calculator className="h-8 w-8 text-finance-green mx-auto mb-2" />
                  <div className="text-sm font-medium">Smart Calculator</div>
                  <div className="text-xs text-muted-foreground">
                    Auto calculations
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow p-3 text-center">
                  <Users className="h-8 w-8 text-finance-green mx-auto mb-2" />
                  <div className="text-sm font-medium">Couples Design</div>
                  <div className="text-xs text-muted-foreground">
                    Built for two
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t py-12">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
            {/* Company Section */}
            <div>
              <h3 className="text-xl font-bold text-finance-green mb-2">
                personifi
              </h3>
              <p className="text-muted-foreground mb-4">
                Personal finance for your family
              </p>
              <p className="text-sm text-muted-foreground">
                ✅ 30-day money-back guarantee
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <div className="space-y-2 flex flex-col items-center md:items-start">
                <Link
                  href="/"
                  className="text-finance-green hover:text-finance-green-dark transition-colors duration-200 font-medium"
                >
                  Home
                </Link>
                {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                <a
                  href="/#how-it-works"
                  className="text-finance-green hover:text-finance-green-dark transition-colors duration-200 font-medium"
                >
                  How it works
                </a>
                {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                <a
                  href="/#pricing"
                  className="text-finance-green hover:text-finance-green-dark transition-colors duration-200 font-medium"
                >
                  Pricing
                </a>
              </div>
            </div>

            {/* Contact & Social */}
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm">
                  Follow us for updates:
                </p>
                <div className="flex justify-center md:justify-start space-x-4">
                  <div className="text-muted-foreground text-sm">
                    Social media links coming soon
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t mt-8 pt-6 text-center text-sm text-muted-foreground">
            <p>
              &copy; {new Date().getFullYear()} personifi. Made with ❤️ for
              couples who want financial clarity.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
