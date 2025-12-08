import { MarketingHeader } from "@/components/layout/marketing-header";
import Footer from "@/components/layout/footer";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <MarketingHeader />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}
