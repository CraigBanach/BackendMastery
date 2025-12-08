import Link from "next/link";
import { Button } from "@/components/ui/button";

export function MarketingHeader() {
  return (
    <header className="bg-transparent relative z-50 flex h-16 items-center gap-4 px-4 md:px-6">
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
          </div>

          {/* Login Button */}
          <div>
            <Button
              asChild
              size="lg"
              className="bg-finance-green hover:bg-finance-green-dark text-white font-semibold px-6 py-2 rounded-lg transition-all duration-200 relative z-10"
            >
              <a href="/auth/login">Login</a>
            </Button>
          </div>
        </div>
      </nav>
    </header>
  );
}
