import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TrackedLinkButton } from "@/components/ui/tracked-link-button";
import {
  ArrowRight,
  CalendarCheck,
  MessageCircle,
  Sparkles,
  Target,
  ShieldCheck,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Free Monthly Budget Review | Personifi",
  description:
    "Claim a free extra month of Personifi plus a personalized budget and spending critique. Start your trial and get clear, actionable feedback on your money habits.",
  keywords:
    "free month budgeting app, budget review, spending critique, personal finance audit, couples budgeting, Personifi offer",
  robots: "index, follow",
  alternates: {
    canonical: "/free-month-budget-review",
  },
  openGraph: {
    title: "Free Monthly Budget Review | Personifi",
    description:
      "Start your Personifi trial and unlock a free extra month plus a personalized budget critique.",
    type: "website",
    locale: "en_GB",
  },
};

export default function FreeMonthBudgetReview() {
  return (
    <div className="flex flex-col min-h-screen">
      <section className="relative -mt-16 overflow-hidden bg-gradient-to-br from-finance-navy-light/50 via-white to-finance-gold-light/40 pt-24 pb-20 px-4">
        <div className="absolute inset-0">
          <div className="absolute -top-24 -left-16 h-48 w-48 rounded-full bg-finance-green-light/40 blur-3xl" />
          <div className="absolute top-12 right-10 h-64 w-64 rounded-full bg-finance-gold-light/60 blur-3xl" />
        </div>
        <div className="relative container mx-auto max-w-6xl">
          <div className="text-center">
            <Badge
              variant="secondary"
              className="mb-4 bg-finance-gold-light text-finance-navy-dark hover:bg-finance-gold-light/80"
            >
              Limited Early Access Bonus
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight">
              Your first 30 days are free,
              <span className="text-finance-green">
                {" "}
                get a second month on us
              </span>
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Start your Personifi trial and get a personal spending critique.
              Sign up on this page to unlock an extra month of access, plus a
              review of your categories, quick wins, and a clear plan.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <TrackedLinkButton
                href="/auth/login?screen_hint=signup&signup_source=free_month"
                eventName="signup_started"
                size="lg"
                className="bg-finance-green hover:bg-finance-green-dark text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6"
              >
                Start 30 days free + bonus month
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </TrackedLinkButton>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-finance-green text-finance-green hover:bg-finance-green-light hover:text-finance-green-dark text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6"
              >
                <Link href="#how-it-works">See how it works</Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              No credit card required • Bonus month added after signup
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <CalendarCheck className="h-8 w-8 text-finance-green mb-4" />
                <h3 className="text-lg font-semibold mb-2">Free extra month</h3>
                <p className="text-sm text-muted-foreground">
                  Your trial starts with 30 days free. Sign up here to unlock a
                  second month at no cost.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <MessageCircle className="h-8 w-8 text-finance-navy mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Personal critique
                </h3>
                <p className="text-sm text-muted-foreground">
                  Get a review of your categories, cash flow, and spending
                  friction points from the Personifi team.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <ShieldCheck className="h-8 w-8 text-finance-gold-dark mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Actionable next steps
                </h3>
                <p className="text-sm text-muted-foreground">
                  Leave with 3 to 5 concrete changes that make your budget feel
                  lighter and more realistic.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-16 sm:py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-start">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                A review that feels like a coach, not a lecture.
              </h2>
              <p className="text-lg sm:text-xl text-muted-foreground mb-6">
                We look for spending pressure, category drift, and areas where
                your money is working hard without feeling intentional.
              </p>
              <ul className="space-y-4 text-sm sm:text-base text-muted-foreground">
                <li className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 h-5 w-5 text-finance-green" />
                  Identify the top 3 categories shaping your month.
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 h-5 w-5 text-finance-green" />
                  Separate essentials from lifestyle creep with clarity.
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 h-5 w-5 text-finance-green" />
                  Recommend simple tweaks that create instant breathing room.
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 h-5 w-5 text-finance-green" />
                  Give you a plan for the next 30 days in Personifi.
                </li>
              </ul>
            </div>
            <Card className="border-0 shadow-xl bg-white">
              <CardContent className="p-6 sm:p-8 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-wide text-finance-navy">
                    Sample feedback
                  </p>
                  <Badge
                    variant="secondary"
                    className="bg-finance-green-light text-finance-green-dark"
                  >
                    Free bonus
                  </Badge>
                </div>
                <div className="rounded-lg border border-finance-green-light bg-finance-green-light/20 p-4">
                  <p className="text-sm text-finance-navy-dark font-semibold">
                    Priority Insight
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Top spend driver: eating out. Plan your dinner dates in
                    advance to get value for your money.
                  </p>
                </div>
                <div className="grid gap-3">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-finance-green" />
                    <span className="text-sm text-muted-foreground">
                      Three subscriptions overlap. Consolidate to one and put
                      £35/month back into goals.
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Target className="h-5 w-5 text-finance-navy" />
                    <span className="text-sm text-muted-foreground">
                      Shared priorities are clear, but one category is
                      drifting. Agree a monthly nice-to-have cap.
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-finance-gold-dark" />
                    <span className="text-sm text-muted-foreground">
                      Best win: simplify categories. Fewer buckets will make
                      decisions easier.
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 px-4 bg-white">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              How it works in three calm steps.
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground">
              The review is lightweight and designed to keep you moving.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border border-finance-green-light/40 shadow-sm">
              <CardContent className="p-6">
                <p className="text-xs uppercase text-finance-green mb-2">
                  Step 1
                </p>
                <h3 className="text-lg font-semibold mb-2">Start your trial</h3>
                <p className="text-sm text-muted-foreground">
                  Sign up for Personifi and import your transactions in minutes.
                </p>
              </CardContent>
            </Card>
            <Card className="border border-finance-green-light/40 shadow-sm">
              <CardContent className="p-6">
                <p className="text-xs uppercase text-finance-navy mb-2">
                  Step 2
                </p>
                <h3 className="text-lg font-semibold mb-2">
                  Share your snapshot
                </h3>
                <p className="text-sm text-muted-foreground">
                  We guide you to send a simple summary of your categories.
                </p>
              </CardContent>
            </Card>
            <Card className="border border-finance-green-light/40 shadow-sm">
              <CardContent className="p-6">
                <p className="text-xs uppercase text-finance-gold-dark mb-2">
                  Step 3
                </p>
                <h3 className="text-lg font-semibold mb-2">Receive feedback</h3>
                <p className="text-sm text-muted-foreground">
                  Get your critique, action plan, and bonus month applied.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 px-4 bg-finance-navy text-white">
        <div className="container mx-auto max-w-5xl">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-10 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                Is this offer for you?
              </h2>
              <p className="text-lg text-finance-navy-light mb-6">
                Perfect if you want a calmer monthly rhythm and honest feedback
                on where your money is drifting.
              </p>
              <ul className="space-y-3 text-sm sm:text-base text-finance-navy-light">
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-finance-gold" />
                  You want a budget that feels realistic.
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-finance-gold" />
                  You want to spot quiet overspending early.
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-finance-gold" />
                  You want both partners aligned on priorities.
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-finance-gold" />
                  You want practical steps, not judgement.
                </li>
              </ul>
            </div>
            <Card className="border-0 bg-white text-gray-900 shadow-xl">
              <CardContent className="p-6 sm:p-8 space-y-4">
                <h3 className="text-xl font-semibold">
                  What early users are saying
                </h3>
                <p className="text-muted-foreground text-sm sm:text-base">
                  &ldquo;The review pointed out a pattern we could never explain.
                  It was simple, actionable, and made our monthly check-in feel
                  lighter.&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-finance-green text-white flex items-center justify-center text-sm font-semibold">
                    JR
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Jamie & Riley</p>
                    <p className="text-xs text-muted-foreground">
                      Early access
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 px-4 bg-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Ready to claim the bonus month?
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground mb-6 sm:mb-8">
            Your first 30 days are free. Sign up on this page to get the bonus
            month and the budget critique.
          </p>
          <TrackedLinkButton
            href="/auth/login?screen_hint=signup&signup_source=free_month"
            eventName="signup_started"
            size="lg"
            className="bg-finance-green hover:bg-finance-green-dark text-base sm:text-lg px-8 sm:px-12 py-4 sm:py-6"
          >
            Start 30 days free + bonus month
            <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
          </TrackedLinkButton>
          <p className="mt-4 text-sm text-muted-foreground">
            Have questions? Email us at hello@personifi.xyz
          </p>
        </div>
      </section>

      {/* Related Pages */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-xl font-semibold mb-4 text-center">
            Not quite ready? Try these instead
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center text-center items-center">
            <Link
              href="/free-budget-template"
              className="text-finance-green hover:text-finance-green-dark font-medium transition-colors duration-200"
            >
              Free budget spreadsheet →
            </Link>
            <span className="hidden sm:inline text-muted-foreground">|</span>
            <Link
              href="/stories"
              className="text-finance-green hover:text-finance-green-dark font-medium transition-colors duration-200"
            >
              Real money stories →
            </Link>
            <span className="hidden sm:inline text-muted-foreground">|</span>
            <Link
              href="/tools"
              className="text-finance-green hover:text-finance-green-dark font-medium transition-colors duration-200"
            >
              Planning tools →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
