import { Button } from "@/components/ui/button";
import { Settings, Cylinder } from "lucide-react";
import { headers } from "next/headers";
import { ProfileDropdown } from "./profileDropdown";

const SessionHeader = async () => {
  const headerList = await headers();
  const pathName = headerList.get("x-current-path");
  const isCategoriesPage = pathName?.includes("/categories") ?? false;
  const isBucketsPage = pathName?.includes("/buckets") ?? false;

  return (
    <div className="flex items-center gap-3">
      <Button
        asChild
        variant={isBucketsPage ? "default" : "ghost"}
        size="sm"
        className="hidden lg:flex"
      >
        <a href="/buckets" className="flex items-center">
          <Cylinder className="h-4 w-4 mr-2" />
          Buckets
        </a>
      </Button>

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

      <ProfileDropdown />
    </div>
  );
};

export default SessionHeader;

