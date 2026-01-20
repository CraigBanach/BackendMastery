import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrackedLinkButton } from "@/components/ui/tracked-link-button";
import Link from "next/link";

import { CheckCircle, ArrowRight, ChevronRight } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Personifi | Conscious Spending for Couples",
  description:
    "Be intentional with your money, enjoy your spending, and move forward together on the goals that matter most.",
  keywords:
    "conscious spending, couples budgeting, shared finances, money goals, UK couples finance app, joint budget app",
  robots: "index, follow",
  openGraph: {
    title: "Personifi: Conscious Spending for Couples",
    description:
      "Be intentional with your money, enjoy your spending, and move forward together on the goals that matter most.",
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
              <span className="text-finance-green">Conscious spending</span> for
              couples with big goals
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
              Be intentional with your money, enjoy your spending, and move
              forward together on the goals that matter most.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <TrackedLinkButton
                href="/auth/login?screen_hint=signup"
                eventName="signup_started"
                size="lg"
                className="bg-finance-green hover:bg-finance-green-dark text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 w-full sm:w-auto"
              >
                Try it with your partner
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </TrackedLinkButton>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-finance-green text-finance-green hover:bg-finance-green-light hover:text-finance-green-dark text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 w-full sm:w-auto"
              >
                <Link href="/stories/how-we-use-personifi">See a real example</Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              No credit card required • Setup in 2 minutes • Both partners
              included
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Flying solo? Personifi works just as well.
            </p>
          </div>
        </div>
      </section>

      {/* Emotional Context */}
      <section className="py-16 sm:py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              When saving starts to feel real.
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground">
              These are the moments where couples start paying closer attention
              to money and where rigid budgeting tools often start to get in the
              way.
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="grid sm:grid-cols-2 gap-4 text-gray-900">
              <div className="bg-white rounded-xl shadow-sm border p-5 text-center">
                <CheckCircle className="mx-auto h-5 w-5 text-finance-green mb-2" />
                Your dream home
              </div>
              <div className="bg-white rounded-xl shadow-sm border p-5 text-center">
                <CheckCircle className="mx-auto h-5 w-5 text-finance-green mb-2" />
                A wedding you actually want to enjoy
              </div>
              <div className="bg-white rounded-xl shadow-sm border p-5 text-center">
                <CheckCircle className="mx-auto h-5 w-5 text-finance-green mb-2" />
                That bucket list trip you keep talking about
              </div>
              <div className="bg-white rounded-xl shadow-sm border p-5 text-center">
                <CheckCircle className="mx-auto h-5 w-5 text-finance-green mb-2" />
                The safety of knowing you’ve got a buffer if life throws
                something at you
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Conscious Spending */}
      <section id="how-it-works" className="py-16 sm:py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                Not strict budgeting. Conscious spending.
              </h2>
              <p className="text-lg sm:text-xl text-muted-foreground">
                Conscious spending is about understanding where your money goes,
                deciding what’s worth it, and staying intentional together.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
              <ul className="space-y-4 text-sm sm:text-base">
                <li className="flex items-start gap-3 text-muted-foreground">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-finance-green" />
                  See all your money in one shared place
                </li>
                <li className="flex items-start gap-3 text-muted-foreground">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-finance-green" />
                  Decide what you want to prioritise, together
                </li>
                <li className="flex items-start gap-3 text-muted-foreground">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-finance-green" />
                  Spend confidently on what matters to you
                </li>
                <li className="flex items-start gap-3 text-muted-foreground">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-finance-green" />
                  Adjust as life changes, without breaking your system
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Big Goals */}
      <section className="py-16 sm:py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-5xl grid lg:grid-cols-2 gap-10 items-center">
          <div className="order-1 lg:order-2">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Make progress on big goals without putting life on hold.
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground mb-4">
              Some things do not fit neatly into a monthly budget. Personifi
              helps you separate day-to-day spending from longer-term goals, so
              you can see progress without constantly asking, &quot;Are we still on
              track?&quot;
            </p>
            <ul className="space-y-2 text-muted-foreground text-sm sm:text-base">
              <li className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 text-finance-green" />
                Saving for a house
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 text-finance-green" />
                Planning a wedding
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 text-finance-green" />
                Building an emergency fund
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 text-finance-green" />
                Future-you savings
              </li>
            </ul>
          </div>
          <Card className="border-0 shadow-lg order-2 lg:order-1">
            <CardContent className="p-6 sm:p-8 space-y-4">
              <div className="rounded-lg bg-finance-green-light/20 p-4">
                <div className="text-xs uppercase text-finance-green-dark mb-1">
                  Everyday spending
                </div>
                <div className="text-xl font-semibold">£1,240</div>
                <div className="text-xs text-muted-foreground">This month</div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-xs uppercase text-muted-foreground mb-1">
                  Big goals
                </div>
                <div className="text-xl font-semibold">£15,500</div>
                <div className="text-xs text-muted-foreground">
                  Deposit progress
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Keep progress visible without losing sight of the day-to-day.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Built for Couples */}
      <section className="py-16 sm:py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Built for two people, not one power user.
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground">
              Shared visibility without forcing a single way to manage money.
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <ul className="space-y-3 text-muted-foreground text-sm sm:text-base text-center">
              <li className="flex items-center justify-center gap-3">
                <CheckCircle className="mt-0.5 h-4 w-4 text-finance-green" />
                Both partners can add transactions
              </li>
              <li className="flex items-center justify-center gap-3">
                <CheckCircle className="mt-0.5 h-4 w-4 text-finance-green" />
                Custom categories that match how you actually live
              </li>
              <li className="flex items-center justify-center gap-3">
                <CheckCircle className="mt-0.5 h-4 w-4 text-finance-green" />A
                simple monthly overview: income, spending, what is left
              </li>
              <li className="flex items-center justify-center gap-3">
                <CheckCircle className="mt-0.5 h-4 w-4 text-finance-green" />
                No forced methodology or &quot;correct&quot; way to spend
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 sm:py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Early, but already useful.
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground">
              Personifi is still early, but it is already helping couples make
              sense of money together.
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
                  &ldquo;We had tried a few budgeting apps while getting serious
                  about saving. This was the one that actually stuck.&rdquo;
                </p>
                <div className="flex items-center justify-center">
                  <div className="w-12 h-12 bg-finance-green rounded-full flex items-center justify-center mr-4">
                    <span className="text-white text-sm font-semibold">CL</span>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-base">Craig & Leigh-Anne</p>
                    <p className="text-sm text-muted-foreground">Founders</p>
                  </div>
                </div>
              </CardContent>
            </Card>
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
                Try it with your partner
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
            See the same numbers. Plan together.
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground mb-6 sm:mb-8">
            If you are saving towards something meaningful and want clarity
            without constant friction, Personifi might be for you.
          </p>
          <TrackedLinkButton
            href="/auth/login?screen_hint=signup"
            eventName="signup_started"
            size="lg"
            className="bg-finance-green hover:bg-finance-green-dark text-base sm:text-lg px-8 sm:px-12 py-4 sm:py-6"
          >
            Try it with your partner
            <ChevronRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
          </TrackedLinkButton>
        </div>
      </section>
    </div>
  );
}
