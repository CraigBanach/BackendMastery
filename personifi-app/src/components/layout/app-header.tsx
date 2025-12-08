import SessionHeader from "@/components/layout/sessionHeader";
import TopNavigation from "@/components/layout/topNavigation";

export default function AppHeader() {
  return (
    <header className="sticky top-0 bg-white border-b z-50 flex h-16 items-center gap-4 px-4 md:px-6">
      <nav className="flex flex-1 items-center justify-between gap-4">
        <TopNavigation />
        <SessionHeader />
      </nav>
    </header>
  );
}
