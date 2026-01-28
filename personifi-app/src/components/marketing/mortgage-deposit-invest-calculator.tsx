"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trackEvent } from "@/lib/analytics";

const currency = "GBP";

const defaultForm = {
  propertyPrice: 250000,
  depositScenarioA: 50000,
  depositScenarioB: 25000,
  investmentAmountA: 0,
  investmentAmountB: 25000,
  termYears: 25,
  interestRateA: 4.5,
  interestRateB: 4.7,
  expectedReturn: 7.0,
};

const parseNumber = (value: string, fallback: number) => {
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const amortize = (
  principal: number,
  annualRate: number,
  termYears: number,
  monthsToSimulate: number,
) => {
  const monthlyRate = annualRate / 100 / 12;
  const totalMonths = Math.max(1, Math.round(termYears * 12));
  const simulationMonths = Math.min(totalMonths, Math.round(monthsToSimulate));

  if (principal <= 0) {
    return {
      monthlyPayment: 0,
      totalInterest: 0,
      balance: principal,
    };
  }

  if (monthlyRate === 0) {
    const monthlyPayment = principal / totalMonths;
    const balance = Math.max(0, principal - monthlyPayment * simulationMonths);
    return {
      monthlyPayment,
      totalInterest: 0,
      balance,
    };
  }

  const monthlyPayment =
    (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -totalMonths));

  let balance = principal;
  let totalInterest = 0;

  for (let month = 0; month < simulationMonths; month += 1) {
    const interest = balance * monthlyRate;
    totalInterest += interest;
    const principalPaid = Math.max(0, monthlyPayment - interest);
    balance = Math.max(0, balance - principalPaid);
  }

  return {
    monthlyPayment,
    totalInterest,
    balance,
  };
};

const calculateInvestment = (amount: number, rate: number, years: number) => {
  if (amount <= 0 || rate <= 0 || years <= 0) {
    return amount;
  }
  return amount * Math.pow(1 + rate / 100, years);
};

const calculateInvestmentWithContributions = (
  amount: number,
  monthlyContribution: number,
  months: number,
  annualRate: number,
) => {
  if (months <= 0) {
    return amount;
  }

  const monthlyRate = annualRate / 100 / 12;
  const contribution = Math.max(0, monthlyContribution);

  if (monthlyRate === 0) {
    return amount + contribution * months;
  }

  const growthFactor = Math.pow(1 + monthlyRate, months);
  const contributionFactor = (growthFactor - 1) / monthlyRate;

  return amount * growthFactor + contribution * contributionFactor;
};

const buildPath = (values: Array<{ x: number; y: number }>) => {
  return values
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"}${point.x.toFixed(2)},${point.y.toFixed(2)}`,
    )
    .join(" ");
};

export function MortgageDepositInvestCalculator() {
  const [copied, setCopied] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const hasInteracted = useRef(false);
  const completionTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [form, setForm] = useState(() => {
    const params = searchParams;

    return {
      ...defaultForm,
      propertyPrice: parseNumber(
        params.get("price") ?? "",
        defaultForm.propertyPrice,
      ),
      depositScenarioA: parseNumber(
        params.get("depositA") ?? params.get("deposit") ?? "",
        defaultForm.depositScenarioA,
      ),
      depositScenarioB: parseNumber(
        params.get("depositB") ?? "",
        defaultForm.depositScenarioB,
      ),
      investmentAmountA: parseNumber(
        params.get("investA") ?? "",
        defaultForm.investmentAmountA,
      ),
      investmentAmountB: parseNumber(
        params.get("investB") ?? params.get("invest") ?? "",
        defaultForm.investmentAmountB,
      ),
      termYears: parseNumber(params.get("term") ?? "", defaultForm.termYears),
      interestRateA: parseNumber(
        params.get("rateA") ?? "",
        defaultForm.interestRateA,
      ),
      interestRateB: parseNumber(
        params.get("rateB") ?? "",
        defaultForm.interestRateB,
      ),
      expectedReturn: parseNumber(
        params.get("return") ?? "",
        defaultForm.expectedReturn,
      ),
    };
  });

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("price", form.propertyPrice.toString());
    params.set("depositA", form.depositScenarioA.toString());
    params.set("depositB", form.depositScenarioB.toString());
    params.set("investA", form.investmentAmountA.toString());
    params.set("investB", form.investmentAmountB.toString());
    params.set("term", form.termYears.toString());
    params.set("rateA", form.interestRateA.toString());
    params.set("rateB", form.interestRateB.toString());
    params.set("return", form.expectedReturn.toString());

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [form, pathname, router]);

  const updateForm = (
    updater: (prev: typeof form) => typeof form
  ) => {
    if (!hasInteracted.current) {
      hasInteracted.current = true;
      trackEvent("calc_start");
    }
    setForm(updater);
  };

  const calculations = useMemo(() => {
    const propertyPrice = Math.max(0, form.propertyPrice);
    const depositScenarioA = Math.max(0, form.depositScenarioA);
    const depositScenarioB = Math.max(0, form.depositScenarioB);
    const investmentAmountA = Math.max(0, form.investmentAmountA);
    const investmentAmountB = Math.max(0, form.investmentAmountB);
    const loanScenarioA = Math.max(0, propertyPrice - depositScenarioA);
    const loanScenarioB = Math.max(0, propertyPrice - depositScenarioB);
    const horizons = Array.from(
      new Set([2, 5, Math.max(1, Math.round(form.termYears))]),
    );

    const resultsByHorizon = horizons.map((years) => {
      const months = Math.round(years * 12);
      const scenarioAResult = amortize(
        loanScenarioA,
        form.interestRateA,
        form.termYears,
        months,
      );
      const scenarioBResult = amortize(
        loanScenarioB,
        form.interestRateB,
        form.termYears,
        months,
      );
      const monthlyContribution =
        scenarioBResult.monthlyPayment - scenarioAResult.monthlyPayment;
      const investmentValueA = calculateInvestmentWithContributions(
        investmentAmountA,
        monthlyContribution,
        months,
        form.expectedReturn,
      );
      const investmentValueB = calculateInvestment(
        investmentAmountB,
        form.expectedReturn,
        years,
      );
      const investmentDelta = investmentValueB - investmentValueA;
      const netDelta =
        investmentValueB -
        scenarioBResult.balance -
        (investmentValueA - scenarioAResult.balance);
      const totalA =
        form.propertyPrice + investmentValueA - scenarioAResult.balance;
      const totalB =
        form.propertyPrice + investmentValueB - scenarioBResult.balance;

      return {
        years,
        scenarioAResult,
        scenarioBResult,
        investmentValueA,
        investmentValueB,
        investmentDelta,
        netDelta,
        totalA,
        totalB,
      };
    });

    const maxYears = Math.max(1, Math.round(form.termYears));
    const chartYears = Array.from(
      { length: maxYears + 1 },
      (_, index) => index,
    );
    const chartData = chartYears.map((year) => {
      const months = Math.max(1, Math.round(year * 12));
      const scenarioAResult = amortize(
        loanScenarioA,
        form.interestRateA,
        form.termYears,
        months,
      );
      const scenarioBResult = amortize(
        loanScenarioB,
        form.interestRateB,
        form.termYears,
        months,
      );
      const monthlyContribution =
        scenarioBResult.monthlyPayment - scenarioAResult.monthlyPayment;
      const investmentValueA = calculateInvestmentWithContributions(
        investmentAmountA,
        monthlyContribution,
        months,
        form.expectedReturn,
      );
      const investmentValueB = calculateInvestment(
        investmentAmountB,
        form.expectedReturn,
        year,
      );
      const totalA =
        form.propertyPrice + investmentValueA - scenarioAResult.balance;
      const totalB =
        form.propertyPrice + investmentValueB - scenarioBResult.balance;
      return {
        year,
        totalA,
        totalB,
        investmentValueA,
        investmentValueB,
        mortgageBalanceA: scenarioAResult.balance,
        mortgageBalanceB: scenarioBResult.balance,
      };
    });

    return {
      resultsByHorizon,
      chartData,
    };
  }, [form]);

  useEffect(() => {
    if (!hasInteracted.current) return;
    if (completionTimeout.current) {
      clearTimeout(completionTimeout.current);
    }

    completionTimeout.current = setTimeout(() => {
      const termResult = calculations.resultsByHorizon.find(
        (result) => result.years === Math.max(1, Math.round(form.termYears))
      );
      trackEvent("calc_complete", {
        term_years: form.termYears,
        net_delta: termResult?.netDelta,
      });
    }, 800);

    return () => {
      if (completionTimeout.current) {
        clearTimeout(completionTimeout.current);
      }
    };
  }, [calculations.resultsByHorizon, form.termYears]);

  const chart = useMemo(() => {
    const chartData = calculations.chartData;
    const maxValue = Math.max(
      ...chartData.flatMap((point) => [
        point.totalA,
        point.totalB,
        point.investmentValueA,
        point.investmentValueB,
        point.mortgageBalanceA,
        point.mortgageBalanceB,
      ]),
      1,
    );
    const minValue = 0;
    const maxYears = Math.max(1, Math.round(form.termYears));
    const width = 760;
    const height = 300;
    const padding = 28;
    const scaleX = (value: number) =>
      padding + (value / maxYears) * (width - padding * 2);
    const range = Math.max(1, maxValue - minValue);
    const scaleY = (value: number) =>
      height - padding - ((value - minValue) / range) * (height - padding * 2);

    const yStepOptions = [25000, 50000, 100000, 250000];
    const yStep =
      yStepOptions.find((step) => range / step <= 6) ?? yStepOptions[3];
    const yStart = Math.floor(minValue / yStep) * yStep;
    const yEnd = Math.ceil(maxValue / yStep) * yStep;
    const yTicks = [] as number[];
    for (let value = yStart; value <= yEnd; value += yStep) {
      yTicks.push(value);
    }

    const mapSeries = (key: keyof (typeof chartData)[number]) =>
      chartData.map((point) => ({
        x: scaleX(point.year),
        y: scaleY(point[key] as number),
      }));

    return {
      width,
      height,
      padding,
      maxYears,
      maxValue,
      minValue,
      yTicks,
      paths: {
        totalA: buildPath(mapSeries("totalA")),
        totalB: buildPath(mapSeries("totalB")),
        investmentA: buildPath(mapSeries("investmentValueA")),
        investmentB: buildPath(mapSeries("investmentValueB")),
        mortgageA: buildPath(mapSeries("mortgageBalanceA")),
        mortgageB: buildPath(mapSeries("mortgageBalanceB")),
      },
    };
  }, [calculations.chartData, form.termYears]);

  const handleCopy = async () => {
    if (typeof window === "undefined") return;
    await navigator.clipboard.writeText(window.location.href);
    trackEvent("share_link_copy");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Your scenario</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="propertyPrice">Property price</Label>
              <Input
                id="propertyPrice"
                type="number"
                value={form.propertyPrice}
                onChange={(event) =>
                  updateForm((prev) => ({
                    ...prev,
                    propertyPrice: parseNumber(event.target.value, 0),
                  }))
                }
                min={0}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="termYears">Mortgage term (years)</Label>
              <Input
                id="termYears"
                type="number"
                value={form.termYears}
                onChange={(event) =>
                  updateForm((prev) => ({
                    ...prev,
                    termYears: parseNumber(event.target.value, 0),
                  }))
                }
                min={1}
              />
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <div className="rounded-xl border bg-white p-4 space-y-4">
              <p className="text-xs uppercase font-semibold text-blue-600/80">
                Scenario A
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="depositScenarioA">Deposit</Label>
                  <Input
                    id="depositScenarioA"
                    type="number"
                    value={form.depositScenarioA}
                    onChange={(event) =>
                      updateForm((prev) => ({
                        ...prev,
                        depositScenarioA: parseNumber(event.target.value, 0),
                      }))
                    }
                    min={0}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="investmentAmountA">Investment</Label>
                  <Input
                    id="investmentAmountA"
                    type="number"
                    value={form.investmentAmountA}
                    onChange={(event) =>
                      updateForm((prev) => ({
                        ...prev,
                        investmentAmountA: parseNumber(event.target.value, 0),
                      }))
                    }
                    min={0}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interestRateA">Interest rate</Label>
                  <Input
                    id="interestRateA"
                    type="number"
                    step="0.1"
                    value={form.interestRateA}
                    onChange={(event) =>
                      updateForm((prev) => ({
                        ...prev,
                        interestRateA: parseNumber(event.target.value, 0),
                      }))
                    }
                    min={0}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-white p-4 space-y-4">
              <p className="text-xs uppercase font-semibold text-orange-500/80">
                Scenario B
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="depositScenarioB">Deposit</Label>
                  <Input
                    id="depositScenarioB"
                    type="number"
                    value={form.depositScenarioB}
                    onChange={(event) =>
                      updateForm((prev) => ({
                        ...prev,
                        depositScenarioB: parseNumber(event.target.value, 0),
                      }))
                    }
                    min={0}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="investmentAmountB">Investment</Label>
                  <Input
                    id="investmentAmountB"
                    type="number"
                    value={form.investmentAmountB}
                    onChange={(event) =>
                      updateForm((prev) => ({
                        ...prev,
                        investmentAmountB: parseNumber(event.target.value, 0),
                      }))
                    }
                    min={0}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interestRateB">Interest rate</Label>
                  <Input
                    id="interestRateB"
                    type="number"
                    step="0.1"
                    value={form.interestRateB}
                    onChange={(event) =>
                      updateForm((prev) => ({
                        ...prev,
                        interestRateB: parseNumber(event.target.value, 0),
                      }))
                    }
                    min={0}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expectedReturn">Expected annual return</Label>
              <Input
                id="expectedReturn"
                type="number"
                step="1"
                value={form.expectedReturn}
                onChange={(event) =>
                  updateForm((prev) => ({
                    ...prev,
                    expectedReturn: parseNumber(event.target.value, 0),
                  }))
                }
                min={0}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg order-3">
        <CardHeader>
          <CardTitle className="text-2xl">Chart</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="w-full rounded-xl border bg-white p-4">
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mb-3">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-600" />
                Net worth (A)
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-orange-500" />
                Net worth (B)
              </span>
              <span className="flex items-center gap-2">
                <svg className="h-2 w-6" viewBox="0 0 24 8" aria-hidden="true">
                  <line
                    x1="0"
                    y1="4"
                    x2="24"
                    y2="4"
                    stroke="#60a5fa"
                    strokeWidth="2"
                    strokeDasharray="6 2"
                  />
                </svg>
                Investments (A)
              </span>
              <span className="flex items-center gap-2">
                <svg className="h-2 w-6" viewBox="0 0 24 8" aria-hidden="true">
                  <line
                    x1="0"
                    y1="4"
                    x2="24"
                    y2="4"
                    stroke="#fdba74"
                    strokeWidth="2"
                    strokeDasharray="6 2"
                  />
                </svg>
                Investments (B)
              </span>
              <span className="flex items-center gap-2">
                <svg className="h-2 w-6" viewBox="0 0 24 8" aria-hidden="true">
                  <line
                    x1="0"
                    y1="4"
                    x2="24"
                    y2="4"
                    stroke="#60a5fa"
                    strokeWidth="2"
                    strokeDasharray="2 6"
                  />
                </svg>
                Mortgage balance (A)
              </span>
              <span className="flex items-center gap-2">
                <svg className="h-2 w-6" viewBox="0 0 24 8" aria-hidden="true">
                  <line
                    x1="0"
                    y1="4"
                    x2="24"
                    y2="4"
                    stroke="#fdba74"
                    strokeWidth="2"
                    strokeDasharray="2 6"
                  />
                </svg>
                Mortgage balance (B)
              </span>
            </div>
            <svg
              viewBox={`0 0 ${chart.width} ${chart.height}`}
              className="w-full h-80"
            >
              {chart.yTicks.map((value) => {
                const y =
                  chart.height -
                  chart.padding -
                  ((value - chart.minValue) /
                    Math.max(1, chart.maxValue - chart.minValue)) *
                    (chart.height - chart.padding * 2);
                const valueLabel = formatCurrency(value);
                return (
                  <g key={`grid-y-${value}`}>
                    <line
                      x1={chart.padding}
                      y1={y}
                      x2={chart.width - chart.padding}
                      y2={y}
                      stroke="#e5e7eb"
                      strokeWidth="1"
                    />
                    <text
                      x={chart.padding - 6}
                      y={y + 4}
                      textAnchor="end"
                      fontSize="10"
                      fill="#94a3b8"
                    >
                      {valueLabel}
                    </text>
                  </g>
                );
              })}
              {[0, 2, 5, 10, chart.maxYears]
                .filter((year, index, arr) => arr.indexOf(year) === index)
                .filter((year) => year <= chart.maxYears)
                .map((year) => {
                  const x =
                    chart.padding +
                    (year / chart.maxYears) * (chart.width - chart.padding * 2);
                  return (
                    <g key={`grid-x-${year}`}>
                      <line
                        x1={x}
                        y1={chart.padding}
                        x2={x}
                        y2={chart.height - chart.padding}
                        stroke="#e5e7eb"
                        strokeWidth="1"
                      />
                      <text
                        x={x}
                        y={chart.height - chart.padding + 16}
                        textAnchor="middle"
                        fontSize="10"
                        fill="#94a3b8"
                      >
                        {year}y
                      </text>
                    </g>
                  );
                })}
              <path
                d={chart.paths.totalA}
                fill="none"
                stroke="#2563eb"
                strokeWidth="3"
              />
              <path
                d={chart.paths.totalB}
                fill="none"
                stroke="#f97316"
                strokeWidth="3"
              />
              <path
                d={chart.paths.investmentA}
                fill="none"
                stroke="#60a5fa"
                strokeWidth="1.5"
                strokeDasharray="6 2"
              />
              <path
                d={chart.paths.investmentB}
                fill="none"
                stroke="#fdba74"
                strokeWidth="1.5"
                strokeDasharray="6 2"
              />
              <path
                d={chart.paths.mortgageA}
                fill="none"
                stroke="#60a5fa"
                strokeWidth="1.5"
                strokeDasharray="2 6"
              />
              <path
                d={chart.paths.mortgageB}
                fill="none"
                stroke="#fdba74"
                strokeWidth="1.5"
                strokeDasharray="2 6"
              />
            </svg>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg order-1">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-2xl">Results</CardTitle>
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-sm text-muted-foreground">
                Share your calculation.
              </span>
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={handleCopy}
              >
                {copied ? "Link copied" : "Copy share link"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-4">
            {calculations.resultsByHorizon.map((result) => {
              const outcomeScenario =
                result.netDelta >= 0 ? "Scenario B" : "Scenario A";
              const outcomeValue = Math.abs(result.netDelta);
              return (
                <div key={result.years} className="rounded-lg border p-4">
                  <p className="text-sm font-medium mb-2">
                    After {result.years} years, you will be better off by{" "}
                    {formatCurrency(outcomeValue)} in {outcomeScenario}.
                  </p>
                  <div className="grid gap-4 text-sm">
                    <div className="rounded-lg border border-muted/60 bg-white p-3">
                      <p className="text-xs uppercase font-semibold text-blue-600/80 mb-2">
                        Scenario A
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">
                            House purchase price
                          </span>
                          <span className="font-semibold text-finance-green/70">
                            {formatCurrency(form.propertyPrice)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">
                            Investment value
                          </span>
                          <span className="font-semibold text-finance-green/70">
                            {formatCurrency(result.investmentValueA)}
                          </span>
                        </div>
                        <div className="border-t border-muted-foreground/60 pt-2">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">
                              Mortgage balance
                            </span>
                            <span className="font-semibold text-finance-red/70">
                              {formatCurrency(result.scenarioAResult.balance)}
                            </span>
                          </div>
                        </div>
                        <div className="border-t border-foreground/70 pt-2">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">
                              Net worth
                            </span>
                            <span className="font-semibold">
                              {formatCurrency(
                                form.propertyPrice +
                                  result.investmentValueA -
                                  result.scenarioAResult.balance,
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border border-muted/60 bg-white p-3">
                      <p className="text-xs uppercase font-semibold text-orange-500/80 mb-2">
                        Scenario B
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">
                            House purchase price
                          </span>
                          <span className="font-semibold text-finance-green/70">
                            {formatCurrency(form.propertyPrice)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">
                            Investment value
                          </span>
                          <span className="font-semibold text-finance-green/70">
                            {formatCurrency(result.investmentValueB)}
                          </span>
                        </div>
                        <div className="border-t border-muted-foreground/60 pt-2">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">
                              Mortgage balance
                            </span>
                            <span className="font-semibold text-finance-red/70">
                              {formatCurrency(result.scenarioBResult.balance)}
                            </span>
                          </div>
                        </div>
                        <div className="border-t border-foreground/70 pt-2">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">
                              Net worth
                            </span>
                            <span className="font-semibold">
                              {formatCurrency(
                                form.propertyPrice +
                                  result.investmentValueB -
                                  result.scenarioBResult.balance,
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-lg bg-finance-green-light/30 p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-finance-green-dark">
                        Difference
                      </span>
                      <span className="text-lg font-semibold text-finance-green-dark">
                        {formatCurrency(result.netDelta)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
