interface PageHeaderProps {
  title: string;
  subTitle: string;
}

export const PageHeader = ({ title, subTitle }: PageHeaderProps) => (
  <section className="flex flex-col justify-between gap-1 py-4 px-2">
    <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
    <p className="text-muted-foreground">{subTitle}</p>
  </section>
);
