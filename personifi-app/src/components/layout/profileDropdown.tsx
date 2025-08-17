"use client";

import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { User } from "lucide-react";
import { InvitePartnerModal } from "@/components/ui/invitePartnerModal";

export function ProfileDropdown() {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const handleValueChange = (value: string) => {
    if (value === "logout") {
      window.location.href = "/auth/logout";
    } else if (value === "invite") {
      setIsInviteModalOpen(true);
    }
  };

  return (
    <>
      <Select onValueChange={handleValueChange}>
        <SelectTrigger className="w-auto border-0 bg-transparent hover:bg-muted p-2">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="invite">
            Invite Partner
          </SelectItem>
          <SelectItem value="logout" className="text-red-600">
            Logout
          </SelectItem>
        </SelectContent>
      </Select>

      <InvitePartnerModal 
        isOpen={isInviteModalOpen} 
        onClose={() => setIsInviteModalOpen(false)} 
      />
    </>
  );
}