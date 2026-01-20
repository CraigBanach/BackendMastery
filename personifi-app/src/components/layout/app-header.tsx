import SessionHeader from "@/components/layout/sessionHeader";
import TopNavigation from "@/components/layout/topNavigation";
import { AppHeaderAnalytics } from "@/components/layout/app-header-analytics";
import { auth0 } from "@/lib/auth0";

export default async function AppHeader() {
  const session = await auth0.getSession();
  const user = session?.user;

  return (
    <header className="sticky top-0 bg-white border-b z-50 flex h-16 items-center gap-4 px-4 md:px-6">
      <AppHeaderAnalytics userId={user?.sub ?? null} email={user?.email ?? null} />
      <nav className="flex flex-1 items-center justify-between gap-4">
        <TopNavigation />
        <SessionHeader />
      </nav>
    </header>
  );
}

