"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { hasAccount } from "@/lib/api/accountApi";

interface RequireAccountProps {
  children: ReactNode;
}

export function RequireAccount({ children }: RequireAccountProps) {
  const router = useRouter();
  const [hasChecked, setHasChecked] = useState(false);
  const [userHasAccount, setUserHasAccount] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkAccount = async () => {
      try {
        const hasUserAccount = await hasAccount();
        if (!isMounted) return;
        setUserHasAccount(hasUserAccount);
        if (!hasUserAccount) {
          router.replace("/onboarding");
        }
      } catch (error) {
        if (!isMounted) return;
        console.error("Error checking account status:", error);
        setUserHasAccount(false);
        router.replace("/onboarding");
      } finally {
        if (isMounted) {
          setHasChecked(true);
        }
      }
    };

    checkAccount();

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (hasChecked && !userHasAccount) {
    return null;
  }

  return <>{children}</>;
}
