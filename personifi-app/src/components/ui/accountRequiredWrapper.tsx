"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccountRequired } from "@/lib/hooks/useAccountRequired";

interface AccountRequiredWrapperProps {
  children: ReactNode;
}

export function AccountRequiredWrapper({ children }: AccountRequiredWrapperProps) {
  const { showCreateAccount } = useAccountRequired();
  const router = useRouter();

  useEffect(() => {
    if (showCreateAccount) {
      router.push("/onboarding");
    }
  }, [showCreateAccount, router]);

  return <>{children}</>;
}