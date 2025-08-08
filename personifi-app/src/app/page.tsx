import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center px-4">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
        Welcome to <span className="text-finance-green">Personifi</span>
      </h1>
      <p className="mt-6 text-lg text-muted-foreground max-w-3xl">
        Your personal finance companion for the UK. Track expenses, manage
        budgets, and achieve your financial goals with our intuitive dashboard.
      </p>
      <div className="mt-10 flex flex-col sm:flex-row gap-4">
        <Button
          asChild
          size="lg"
          className="bg-finance-green hover:bg-finance-green-dark"
        >
          <a href="/auth/login">Login</a>
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="border-finance-green text-finance-green hover:bg-finance-green-light hover:text-finance-green-dark"
        >
          Learn More
        </Button>
      </div>
    </main>
  );
}
