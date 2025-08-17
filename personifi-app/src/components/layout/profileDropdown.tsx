"use client";

import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { User } from "lucide-react";
import { InvitePartnerModal } from "@/components/ui/invitePartnerModal";
import { hasAccount } from "@/lib/api/accountApi";

export function ProfileDropdown() {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [userHasAccount, setUserHasAccount] = useState(false);
  const [isCheckingAccount, setIsCheckingAccount] = useState(true);

  useEffect(() => {
    const checkAccount = async () => {
      try {
        const hasUserAccount = await hasAccount();
        setUserHasAccount(hasUserAccount);
      } catch (error) {
        console.error('Error checking account status:', error);
        setUserHasAccount(false);
      } finally {
        setIsCheckingAccount(false);
      }
    };

    checkAccount();
  }, []);

  const handleValueChange = (value: string) => {
    if (value === "logout") {
      window.location.href = "/auth/logout";
    } else if (value === "invite" && userHasAccount) {
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
          {userHasAccount && (
            <SelectItem value="invite">
              Invite Partner
            </SelectItem>
          )}
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