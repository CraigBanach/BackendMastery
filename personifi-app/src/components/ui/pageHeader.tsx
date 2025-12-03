import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subTitle: string;
  className?: string;
}

export const PageHeader = ({ title, subTitle, className }: PageHeaderProps) => (
  <section className={cn("flex flex-col justify-between gap-1 py-4 px-2", className)}>
    <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
    <p className="text-muted-foreground">{subTitle}</p>
  </section>
);
