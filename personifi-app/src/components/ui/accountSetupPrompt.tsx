"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Plus } from "lucide-react";
import { createAccountAction, joinAccountAction } from "@/lib/actions/accountActions";
import { trackEvent, trackEventOnce } from "@/lib/analytics";


export function AccountSetupPrompt() {
  const [mode, setMode] = useState<"choose" | "create" | "join">("choose");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    trackEventOnce("onboarding_started");
  }, []);

  const handleCreateAccountSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isPending) return; // Prevent double submission

    trackEvent("onboarding_form_submitted");

    const formData = new FormData(e.currentTarget);
    const accountName = formData.get("accountName") as string;
    const pendingEmail = formData.get("email") as string | null;

    if (!accountName.trim()) {
      setError("Account name is required");
      return;
    }

    if (pendingEmail) {
      window.localStorage.setItem("posthog_signup_email", pendingEmail);
    }

    setError(null);

    startTransition(async () => {
      const result = await createAccountAction(accountName.trim());

      if (result?.error) {
        setError(result.error);
      } else {
        trackEvent("signup_completed");
          trackEventOnce("onboarding_completed");

      }
      // If successful, the server action will redirect
    });


  };


  const handleJoinAccountSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isPending) return; // Prevent double submission

    trackEvent("onboarding_form_submitted");

    const formData = new FormData(e.currentTarget);
    const invitationToken = formData.get("invitationToken") as string;
    const pendingEmail = formData.get("email") as string | null;

    if (!invitationToken.trim()) {
      setError("Invitation link or token is required");
      return;
    }

    if (pendingEmail) {
      window.localStorage.setItem("posthog_signup_email", pendingEmail);
    }

    setError(null);

    startTransition(async () => {
      const result = await joinAccountAction(invitationToken.trim());

      if (result?.error) {
        setError(result.error);
      } else {
        trackEvent("signup_completed");
          trackEventOnce("onboarding_completed");

      }
      // If successful, the server action will redirect
    });


  };


  if (mode === "choose") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl mb-2">Welcome to Personifi!</CardTitle>
            <CardDescription className="text-lg">
              To get started, you can either create a new account or join an existing one.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6 px-4">
      <Button
        onClick={() => {
          trackEvent("onboarding_choice_create");
          setMode("create");
        }}
        className="h-32 flex flex-col items-center justify-center space-y-3 p-6"
        variant="outline"
      >

                <Plus className="h-8 w-8" />
                <span className="text-lg font-medium">Create New Account</span>
                <span className="text-sm text-muted-foreground text-center">Start managing your finances</span>
              </Button>
              
      <Button
        onClick={() => {
          trackEvent("onboarding_choice_join");
          setMode("join");
        }}
        className="h-32 flex flex-col items-center justify-center space-y-3 p-6"
        variant="outline"
      >

                <Users className="h-8 w-8" />
                <span className="text-lg font-medium">Join Existing Account</span>
                <span className="text-sm text-muted-foreground text-center">Use an invitation link</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (mode === "create") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Create Your Account</CardTitle>
            <CardDescription>
              Choose a name for your financial account. You can invite others to collaborate later.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleCreateAccountSubmit} className="space-y-4">
              <div>
                <Label htmlFor="accountName">Account Name</Label>
                <Input
                  id="accountName"
                  name="accountName"
                  placeholder="e.g., Smith Family Finances"
                  required
                  disabled={isPending}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  disabled={isPending}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Optional: used for analytics only.
                </p>
              </div>


              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <div className="flex space-x-3">
                <Button
                  type="button"
                  onClick={() => setMode("choose")}
                  variant="outline"
                  className="flex-1"
                  disabled={isPending}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isPending}
                >
                  {isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Creating...
                    </div>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (mode === "join") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Join Existing Account</CardTitle>
            <CardDescription>
              Enter the invitation link or token you received to join an existing account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleJoinAccountSubmit} className="space-y-4">
              <div>
                <Label htmlFor="invitationToken">Invitation Link or Token</Label>
                <Input
                  id="invitationToken"
                  name="invitationToken"
                  placeholder="Paste invitation link or token here"
                  required
                  disabled={isPending}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  disabled={isPending}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Optional: used for analytics only.
                </p>
              </div>


              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <div className="flex space-x-3">
                <Button
                  type="button"
                  onClick={() => setMode("choose")}
                  variant="outline"
                  className="flex-1"
                  disabled={isPending}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isPending}
                >
                  {isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Joining...
                    </div>
                  ) : (
                    "Join Account"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}