import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrackedLinkButton } from "@/components/ui/tracked-link-button";

import {

  CheckCircle,
  Users,
  Target,
  PoundSterling,
  TrendingUp,
  Heart,
  ArrowRight,
  MessageCircle,
  ChevronRight,
  Download,
} from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Personifi | Stop Arguing About Money. Start Budgeting Together.",
  description:
    "The UK's dedicated finance website for couples. Easily track spending, calculate 'spare cash,' and reduce financial friction for a calmer relationship. Free 30 day trial.",
  keywords:
    "UK couples finance app, couples budgeting UK, joint budget app, UK money management, couples financial planning, financial friction, guilt-free spending",
  robots: "index, follow",
  openGraph: {
    title: "Personifi: Financial Harmony for UK Couples",
    description:
      "The UK's dedicated app for couples to easily track money, calculate 'spare cash,' and resolve budgeting arguments.",
    type: "website",
    url: "https://personifi.xyz",
    locale: "en_GB",
    images: [
      {
        url: "https://personifi.xyz/personifi-opengraph-image.png", // **CRITICAL: REPLACE WITH ABSOLUTE URL TO YOUR 1200x630 IMAGE**
        width: 1200,
        height: 630,
        alt: "Personifi App Mockup: Financial Peace for Couples",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@craigbanach", // **RECOMMENDED: Add your Twitter/X handle**
    creator: "@craigbanach",
    images: "https://personifi.xyz/personifi-opengraph-image.png", // **Must match the URL above**
  },
};

export default function Home() {
  return (

    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-finance-green-light/20 to-white -mt-16 pt-20 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center">
            <Badge
              variant="secondary"
              className="mb-4 bg-finance-green-light text-finance-green-dark hover:bg-finance-green-light/70"
            >
              🚀 Early Access Now Available
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl mb-6 leading-tight">
              Finally, finance management{" "}
              <span className="text-finance-green">built for UK couples</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
              Stop juggling spreadsheets and surprise overspending. Personifi
              lets UK couples track spending, manage budgets, and reach
              financial goals together - with real-time syncing and complete
              transparency.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <TrackedLinkButton
                href="/auth/login?screen_hint=signup"
                eventName="signup_started"
                size="lg"
                className="bg-finance-green hover:bg-finance-green-dark text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 w-full sm:w-auto"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </TrackedLinkButton>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-finance-green text-finance-green hover:bg-finance-green-light hover:text-finance-green-dark text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 w-full sm:w-auto"
              >
                <a href="#how-it-works">
                  <Heart className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  See How It Works
                </a>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              No credit card required • Setup in 2 minutes • Both partners
              included
            </p>
          </div>
        </div>
      </section>

      {/* Key Value Propositions */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 md:mb-16 px-4">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Stop the money miscommunication
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground">
              Finally, a UK personal finance solution designed for how couples
              actually manage money
            </p>
          </div>

          <div className="grid sm:grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 px-4">
            {/* Problem/Solution 1 */}
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 text-center h-full flex flex-col">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 min-h-[3.5rem] flex items-center justify-center">
                No More Money Miscommunication
              </h3>
              <div className="flex-1 flex flex-col justify-between space-y-4">
                <div className="border-l-4 border-red-500 bg-gray-50 p-4 rounded-r-lg text-left">
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    The Problem:
                  </p>
                  <p className="text-sm text-gray-600">
                    Texting receipts, forgotten expenses, surprise overspending
                  </p>
                </div>
                <div className="border-l-4 border-finance-green bg-finance-green-light/20 p-4 rounded-r-lg text-left">
                  <p className="text-sm font-medium text-finance-green-dark mb-1">
                    Our Solution:
                  </p>
                  <p className="text-sm text-finance-green-dark">
                    Every transaction syncs instantly. Both partners see
                    everything in real-time.
                  </p>
                </div>
              </div>
            </div>

            {/* Problem/Solution 2 */}
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 text-center h-full flex flex-col">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 min-h-[3.5rem] flex items-center justify-center">
                Know Who Spent What
              </h3>
              <div className="flex-1 flex flex-col justify-between space-y-4">
                <div className="border-l-4 border-red-500 bg-gray-50 p-4 rounded-r-lg text-left">
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    The Problem:
                  </p>
                  <p className="text-sm text-gray-600">
                    Whose coffee was that? Did you already log the groceries?
                  </p>
                </div>
                <div className="border-l-4 border-finance-green bg-finance-green-light/20 p-4 rounded-r-lg text-left">
                  <p className="text-sm font-medium text-finance-green-dark mb-1">
                    Our Solution:
                  </p>
                  <p className="text-sm text-finance-green-dark">
                    Organized transaction history with smart categorization. No
                    more duplicate entries or confusion.
                  </p>
                </div>
              </div>
            </div>

            {/* Problem/Solution 3 */}
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 text-center h-full flex flex-col">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Target className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 min-h-[3.5rem] flex items-center justify-center">
                Shared Goals, Individual Visibility
              </h3>
              <div className="flex-1 flex flex-col justify-between space-y-4">
                <div className="border-l-4 border-red-500 bg-gray-50 p-4 rounded-r-lg text-left">
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    The Problem:
                  </p>
                  <p className="text-sm text-gray-600">
                    Different spending habits, one shared budget
                  </p>
                </div>
                <div className="border-l-4 border-finance-green bg-finance-green-light/20 p-4 rounded-r-lg text-left">
                  <p className="text-sm font-medium text-finance-green-dark mb-1">
                    Our Solution:
                  </p>
                  <p className="text-sm text-finance-green-dark">
                    Set budgets together, track progress individually. See your
                    impact on shared goals.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="how-it-works" className="py-16 sm:py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Show, don&apos;t tell
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground">
              See how Personifi makes financial transparency effortless
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center mb-12 sm:mb-16">
            <div className="order-2 lg:order-1">
              <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 flex items-center">
                <TrendingUp className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 text-finance-green" />
                Real-Time Dashboard
              </h3>
              <p className="text-base sm:text-lg text-muted-foreground mb-4 sm:mb-6">
                See your combined spending at a glance. Monthly trends, category
                breakdowns, budget progress - updated instantly.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-muted-foreground text-sm sm:text-base">
                  <CheckCircle className="mr-2 h-3 w-3 sm:h-4 sm:w-4 text-finance-green flex-shrink-0" />
                  Live spending updates
                </li>
                <li className="flex items-center text-muted-foreground text-sm sm:text-base">
                  <CheckCircle className="mr-2 h-3 w-3 sm:h-4 sm:w-4 text-finance-green flex-shrink-0" />
                  Visual budget tracking
                </li>
                <li className="flex items-center text-muted-foreground text-sm sm:text-base">
                  <CheckCircle className="mr-2 h-3 w-3 sm:h-4 sm:w-4 text-finance-green flex-shrink-0" />
                  Monthly trend analysis
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-finance-green-light/20 to-finance-green-light/10 p-6 sm:p-8 rounded-xl order-1 lg:order-2">
              <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm">
                <div className="text-xs sm:text-sm text-muted-foreground mb-2">
                  This Month
                </div>
                <div className="text-xl sm:text-2xl font-bold text-finance-green">
                  £2,340.50
                </div>
                <div className="text-xs sm:text-sm text-green-600">
                  ↗ On track for budget
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-8 rounded-xl lg:order-first order-last">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Coffee Shop</span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    New
                  </span>
                </div>
                <div className="text-lg font-semibold">£4.20</div>
                <div className="text-xs text-muted-foreground">
                  Food & Drink • Just now
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-semibold mb-4 flex items-center">
                <PoundSterling className="mr-3 h-6 w-6 text-finance-green" />
                Smart Transaction Tracking
              </h3>
              <p className="text-lg text-muted-foreground mb-6">
                Add expenses in seconds. Smart categorization, custom categories
                with icons, and instant tracking.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-muted-foreground">
                  <CheckCircle className="mr-2 h-4 w-4 text-finance-green" />
                  Quick expense entry
                </li>
                <li className="flex items-center text-muted-foreground">
                  <CheckCircle className="mr-2 h-4 w-4 text-finance-green" />
                  Auto-categorisation
                </li>
                <li className="flex items-center text-muted-foreground">
                  <CheckCircle className="mr-2 h-4 w-4 text-finance-green" />
                  Custom category icons
                </li>
              </ul>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-semibold mb-4 flex items-center">
                <Heart className="mr-3 h-6 w-6 text-finance-green" />
                Built for Two
              </h3>
              <p className="text-lg text-muted-foreground mb-6">
                Invite your partner with one link. Separate logins, shared data.
                Perfect for couples who want transparency without losing
                autonomy.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-muted-foreground">
                  <CheckCircle className="mr-2 h-4 w-4 text-finance-green" />
                  One-click partner invitation
                </li>
                <li className="flex items-center text-muted-foreground">
                  <CheckCircle className="mr-2 h-4 w-4 text-finance-green" />
                  Individual accounts, shared data
                </li>
                <li className="flex items-center text-muted-foreground">
                  <CheckCircle className="mr-2 h-4 w-4 text-finance-green" />
                  Privacy with transparency
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-xl">
              <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                <div className="flex justify-center items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-finance-green rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">S</span>
                  </div>
                  <Heart className="h-4 w-4 text-pink-500" />
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">M</span>
                  </div>
                </div>
                <div className="text-sm font-medium">Connected Partners</div>
                <div className="text-xs text-muted-foreground">
                  Sarah & Mike
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Get started in 3 simple steps
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground">
              From signup to synced finances in under 5 minutes
            </p>
          </div>

          <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-finance-green rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <span className="text-white text-lg sm:text-2xl font-bold">
                  1
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3">
                Sign Up & Create Your Account
              </h3>
              <p className="text-muted-foreground text-sm sm:text-base">
                Quick setup with secure authentication. No credit card required.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-finance-green rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <span className="text-white text-lg sm:text-2xl font-bold">
                  2
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3">
                Invite Your Partner
              </h3>
              <p className="text-muted-foreground text-sm sm:text-base">
                Send a secure link. They join with their own login and access.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-finance-green rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <span className="text-white text-lg sm:text-2xl font-bold">
                  3
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3">
                Start Tracking Together
              </h3>
              <p className="text-muted-foreground text-sm sm:text-base">
                Add transactions, set budgets, watch your finances improve.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 sm:py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Join couples already transforming their finances
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground">
              Real results from real relationships
            </p>
          </div>

          <div className="flex justify-center">
            <Card className="border-0 shadow-lg max-w-lg">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-center justify-center mb-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-400 text-lg">
                        ⭐
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-muted-foreground mb-6 text-center text-base sm:text-lg">
                  &ldquo;We replaced our 9-year-old Google Sheets budget tracker
                  with Personifi. The real-time syncing is a
                  game-changer.&rdquo;
                </p>
                <div className="flex items-center justify-center">
                  <div className="w-12 h-12 bg-finance-green rounded-full flex items-center justify-center mr-4">
                    <span className="text-white text-sm font-semibold">CL</span>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-base">Craig & Leigh-Anne</p>
                    <p className="text-sm text-muted-foreground">
                      Together 16 years
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Free Resources Section */}
      <section className="py-16 sm:py-20 px-4 bg-gradient-to-br from-finance-green-light/10 to-finance-green-light/5">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 md:mb-16">
            <Badge
              variant="secondary"
              className="mb-4 bg-finance-green-light text-finance-green-dark hover:bg-finance-green-light/70"
            >
              📊 Free Spreadsheet Template
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Get our budget template first
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground">
              Download our Google Sheets template - completely separate from our
              app
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div>
              <h3 className="text-xl sm:text-2xl font-semibold mb-4">
                Free Google Sheets Budget Template
              </h3>
              <p className="text-lg text-muted-foreground mb-6">
                A proven spreadsheet system for couples who want to start
                budgeting together. Perfect for testing our approach before
                trying the full Personifi app.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <CheckCircle className="mr-3 h-5 w-5 text-finance-green flex-shrink-0 mt-0.5" />
                  <span>Monthly budget planning for two people</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="mr-3 h-5 w-5 text-finance-green flex-shrink-0 mt-0.5" />
                  <span>Expense tracking with smart categories</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="mr-3 h-5 w-5 text-finance-green flex-shrink-0 mt-0.5" />
                  <span>Automatic calculations & progress tracking</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="mr-3 h-5 w-5 text-finance-green flex-shrink-0 mt-0.5" />
                  <span>Instructions & tips included</span>
                </li>
              </ul>
              <Button
                asChild
                size="lg"
                className="bg-finance-green hover:bg-finance-green-dark text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6"
              >
                <a href="/free-budget-template">
                  Download Spreadsheet Template
                  <Download className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </a>
              </Button>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border">
              <div className="bg-gradient-to-br from-finance-green-light/20 to-finance-green-light/10 p-4 rounded-lg mb-4">
                <div className="text-sm font-medium text-finance-green-dark mb-2">
                  This Month&apos;s Budget
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Income</div>
                    <div className="font-semibold">£4,200</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Expenses</div>
                    <div className="font-semibold">£3,850</div>
                  </div>
                </div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-sm text-green-700 font-medium">
                  £350 under budget! 🎉
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section
        id="pricing"
        className="py-16 sm:py-20 px-4 bg-finance-green text-white"
      >
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-lg sm:text-xl text-finance-green-light mb-8 sm:mb-12">
            One price, both partners included. No hidden fees.
          </p>

          <Card className="max-w-md mx-auto bg-white text-gray-900 border-0 shadow-xl">
            <CardContent className="p-6 sm:p-8">
              <Badge
                variant="secondary"
                className="mb-4 bg-finance-green text-white hover:bg-finance-green/70"
              >
                🎉 Early Access Price
              </Badge>
              <div className="mb-6">
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-3xl sm:text-4xl font-bold">£4.99</span>
                  <span className="text-muted-foreground text-base sm:text-lg">
                    /month
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Regular price £7.99 after launch
                </p>
              </div>

              <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8 text-left text-sm sm:text-base">
                <li className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-finance-green" />
                  Both partners included
                </li>
                <li className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-finance-green" />
                  Unlimited transactions
                </li>
                <li className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-finance-green" />
                  All features unlocked
                </li>
                <li className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-finance-green" />
                  Priority customer support
                </li>
                <li className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-finance-green" />
                  Cancel anytime
                </li>
              </ul>

              <TrackedLinkButton
                href="/auth/login?screen_hint=signup"
                eventName="signup_started"
                size="lg"
                className="w-full bg-finance-green hover:bg-finance-green-dark text-base sm:text-lg py-4 sm:py-6"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </TrackedLinkButton>

              <p className="text-sm text-muted-foreground mt-4">

                No credit card required • 30-day free trial
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 sm:py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Ready to transform your finances together?
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground mb-6 sm:mb-8">
            Join the couples who&apos;ve stopped arguing about money and started
            achieving their goals.
          </p>
          <TrackedLinkButton
            href="/auth/login?screen_hint=signup"
            eventName="signup_started"
            size="lg"
            className="bg-finance-green hover:bg-finance-green-dark text-base sm:text-lg px-8 sm:px-12 py-4 sm:py-6"
          >
            Get Started Free
            <ChevronRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
          </TrackedLinkButton>
        </div>
      </section>
    </div>
  );
}

