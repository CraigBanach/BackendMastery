"use client";

import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { User } from "lucide-react";

export function ProfileDropdown() {
  const handleValueChange = (value: string) => {
    if (value === "logout") {
      window.location.href = "/auth/logout";
    }
  };

  return (
    <Select onValueChange={handleValueChange}>
      <SelectTrigger className="w-auto border-0 bg-transparent hover:bg-muted p-2">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">Profile</span>
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="logout" className="text-red-600">
          Logout
        </SelectItem>
      </SelectContent>
    </Select>
  );
}