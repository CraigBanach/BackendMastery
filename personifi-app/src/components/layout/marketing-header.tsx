"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { trackEvent, trackEventOnce } from "@/lib/analytics";
import { Menu, X } from "lucide-react";

export function MarketingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    trackEventOnce("signup_viewed");
  }, []);

  return (
    <header className="bg-transparent relative z-50 flex flex-col px-4 md:px-6">
      <div className="flex h-16 items-center gap-4">
        <nav className="flex flex-1 items-center justify-between gap-4">
          {/* Logo / Brand */}
          <div className="flex items-center justify-between w-full">
            <Link href="/" className="text-xl font-bold text-finance-green">
              personifi
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="/#how-it-works"
                className="text-finance-green-dark font-medium hover:text-finance-green transition-colors duration-200"
              >
                How it works
              </Link>
              <Link
                href="/#pricing"
                className="text-finance-green-dark font-medium hover:text-finance-green transition-colors duration-200"
              >
                Pricing
              </Link>
              <Link
                href="/free-budget-template"
                className="text-finance-green-dark font-medium hover:text-finance-green transition-colors duration-200"
              >
                Free Template
              </Link>
              <Link
                href="/stories"
                className="text-finance-green-dark font-medium hover:text-finance-green transition-colors duration-200"
              >
                Stories
              </Link>
              <div className="relative group">
                <Link
                  href="/tools"
                  className="text-finance-green-dark font-medium hover:text-finance-green transition-colors duration-200"
                >
                  Tools
                </Link>
                <div className="absolute left-1/2 top-full z-50 hidden w-64 -translate-x-1/2 pt-4 group-hover:block">
                  <div className="rounded-xl border bg-white shadow-lg p-3 text-sm">
                    <Link
                      href="/tools/mortgage-deposit-vs-invest-calculator"
                      className="block rounded-lg px-3 py-2 text-finance-navy hover:bg-finance-green-light/20"
                    >
                      Mortgage Deposit vs Investment
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Login Button + Mobile Menu Toggle */}
            <div className="flex items-center gap-2">
              <Button
                asChild
                size="lg"
                className="bg-finance-green hover:bg-finance-green-dark text-white font-semibold px-6 py-2 rounded-lg transition-all duration-200 relative z-10"
              >
                <a
                  href="/auth/login"
                  onClick={() => trackEvent("login_started")}
                >
                  Login
                </a>
              </Button>

              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2 text-finance-green-dark hover:text-finance-green transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>

          </div>
        </nav>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-finance-green-light/30 bg-white/95 backdrop-blur-sm rounded-b-xl shadow-lg pb-4 pt-2">
          <nav className="flex flex-col space-y-1 px-2">
            <Link
              href="/#how-it-works"
              className="text-finance-green-dark font-medium hover:text-finance-green hover:bg-finance-green-light/10 px-3 py-2 rounded-lg transition-colors duration-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              How it works
            </Link>
            <Link
              href="/#pricing"
              className="text-finance-green-dark font-medium hover:text-finance-green hover:bg-finance-green-light/10 px-3 py-2 rounded-lg transition-colors duration-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link
              href="/free-budget-template"
              className="text-finance-green-dark font-medium hover:text-finance-green hover:bg-finance-green-light/10 px-3 py-2 rounded-lg transition-colors duration-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              Free Template
            </Link>
            <Link
              href="/stories"
              className="text-finance-green-dark font-medium hover:text-finance-green hover:bg-finance-green-light/10 px-3 py-2 rounded-lg transition-colors duration-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              Stories
            </Link>
            <Link
              href="/tools"
              className="text-finance-green-dark font-medium hover:text-finance-green hover:bg-finance-green-light/10 px-3 py-2 rounded-lg transition-colors duration-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              Tools
            </Link>
            <Link
              href="/tools/mortgage-deposit-vs-invest-calculator"
              className="text-muted-foreground font-medium hover:text-finance-green hover:bg-finance-green-light/10 px-3 py-2 pl-6 rounded-lg transition-colors duration-200 text-sm"
              onClick={() => setMobileMenuOpen(false)}
            >
              └ Mortgage Deposit vs Investment
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
