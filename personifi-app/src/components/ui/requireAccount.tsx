import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { hasAccount } from "@/lib/api/accountApi";

interface RequireAccountProps {
  children: ReactNode;
}

export async function RequireAccount({ children }: RequireAccountProps) {
  const userHasAccount = await hasAccount();

  if (!userHasAccount) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}