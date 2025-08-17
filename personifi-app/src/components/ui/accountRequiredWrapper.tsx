"use client";

import { ReactNode } from "react";
import { CreateAccountModal } from "./createAccountModal";
import { useAccountRequired } from "@/lib/hooks/useAccountRequired";

interface AccountRequiredWrapperProps {
  children: ReactNode;
}

export function AccountRequiredWrapper({ children }: AccountRequiredWrapperProps) {
  const { showCreateAccount, setShowCreateAccount, handleAccountCreated } = useAccountRequired();

  return (
    <>
      {children}
      <CreateAccountModal
        isOpen={showCreateAccount}
        onClose={() => setShowCreateAccount(false)}
        onSuccess={handleAccountCreated}
      />
    </>
  );
}