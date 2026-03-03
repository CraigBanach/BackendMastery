"use client";

import { useState } from "react";
import { User } from "lucide-react";
import { InvitePartnerModal } from "@/components/ui/invitePartnerModal";
import { SwitchAccountModal } from "@/components/ui/switchAccountModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useModalManager } from "@/lib/providers/modal-provider";

export function ProfileDropdown() {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isSwitchAccountModalOpen, setIsSwitchAccountModalOpen] =
    useState(false);
  const [selectValue, setSelectValue] = useState("");
  const { isModalOpen } = useModalManager();

  const handleValueChange = (value: string) => {
    if (isModalOpen) {
      setSelectValue("");
      return;
    }

    if (value === "logout") {
      window.location.href = "/auth/logout";
    } else if (value === "invite") {
      setIsInviteModalOpen(true);
    } else if (value === "switch-account") {
      setIsSwitchAccountModalOpen(true);
    }
    // Reset the select value to allow re-selection
    setSelectValue("");
  };

  return (
    <>
      <Select
        value={selectValue}
        onValueChange={handleValueChange}
        disabled={isModalOpen}
      >
        <SelectTrigger className="w-auto border-0 bg-transparent hover:bg-muted p-2">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="invite">Invite Partner</SelectItem>
          <SelectItem value="switch-account">Join Partner's Account</SelectItem>
          <SelectItem value="logout" className="text-red-600">
            Logout
          </SelectItem>
        </SelectContent>
      </Select>

      <InvitePartnerModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />

      <SwitchAccountModal
        isOpen={isSwitchAccountModalOpen}
        onClose={() => setIsSwitchAccountModalOpen(false)}
      />
    </>
  );
}
