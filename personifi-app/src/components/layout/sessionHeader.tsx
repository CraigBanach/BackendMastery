import { Button } from "@/components/ui/button";
import { auth0 } from "@/lib/auth0";
import { Settings } from "lucide-react";
import { headers } from "next/headers";
import { ProfileDropdown } from "./profileDropdown";
import { hasAccount } from "@/lib/api/accountApi";

const SessionHeader = async () => {
  const session = await auth0.getSession();
  
  if (!session) {
    return (
      <Button
        asChild
        size="lg"
        className="bg-finance-green hover:bg-finance-green-dark"
      >
        <a href="/auth/login">Login</a>
      </Button>
    );
  }

  const userHasAccount = await hasAccount();
  const headerList = await headers();
  const pathName = headerList.get("x-current-path");
  const isCategoriesPage = pathName?.includes("/categories");

  return (
    <div className="flex items-center gap-3">
      {/* Categories - hide on mobile (collapsing priority) and when no account */}
      {userHasAccount && (
        <Button
          asChild
          variant={isCategoriesPage ? "default" : "ghost"}
          size="sm"
          className="hidden lg:flex"
        >
          <a href="/categories" className="flex items-center">
            <Settings className="h-4 w-4 mr-2" />
            Categories
          </a>
        </Button>
      )}

      {/* Profile Dropdown */}
      <ProfileDropdown />
    </div>
  );
};

export default SessionHeader;
