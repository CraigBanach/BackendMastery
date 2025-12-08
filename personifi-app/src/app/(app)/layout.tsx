import AppHeader from "@/components/layout/app-header";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-grow p-3 sm:p-4 md:p-6">
        {children}
      </main>
    </div>
  );
}
