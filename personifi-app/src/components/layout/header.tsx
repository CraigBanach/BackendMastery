import SessionHeader from "@/components/layout/sessionHeader";
import TopNavigation from "@/components/layout/topNavigation";
import { headers } from "next/headers";

const Header = async () => {
  const headerList = await headers();
  const pathName = headerList.get("x-current-path");
  const isLandingPage = pathName === "/" || pathName === null;
  
  return (
    <header className={`${isLandingPage ? 'bg-transparent relative z-50' : 'sticky top-0 bg-gradient-to-br from-finance-green-light/20 to-white z-50'} flex h-16 items-center gap-4 px-4 md:px-6`}>
      <nav className="flex flex-1 items-center justify-between justify-items-end gap-4">
        <TopNavigation />
        <SessionHeader />
      </nav>
    </header>
  );
};

export default Header;
