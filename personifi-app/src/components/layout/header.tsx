import SessionHeader from "@/components/layout/sessionHeader";
import TopNavigation from "@/components/layout/topNavigation";

const Header = async () => {
  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <nav className="flex flex-1 items-center justify-between justify-items-end gap-4">
        <TopNavigation />
        <SessionHeader />
      </nav>
    </header>
  );
};

export default Header;
