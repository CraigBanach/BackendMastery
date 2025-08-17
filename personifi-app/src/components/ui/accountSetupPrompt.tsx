"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Plus } from "lucide-react";
import { createAccountAction, joinAccountAction } from "@/lib/actions/accountActions";

export function AccountSetupPrompt() {
  const [mode, setMode] = useState<"choose" | "create" | "join">("choose");
  const [error, setError] = useState<string | null>(null);

  const handleCreateAccountAction = async (formData: FormData) => {
    const accountName = formData.get("accountName") as string;
    
    if (!accountName.trim()) {
      setError("Account name is required");
      return;
    }

    setError(null);
    const result = await createAccountAction(accountName.trim());
    
    if (result?.error) {
      setError(result.error);
    }
    // If successful, the server action will redirect
  };

  const handleJoinAccountAction = async (formData: FormData) => {
    const invitationToken = formData.get("invitationToken") as string;
    
    if (!invitationToken.trim()) {
      setError("Invitation link or token is required");
      return;
    }

    setError(null);
    const result = await joinAccountAction(invitationToken.trim());
    
    if (result?.error) {
      setError(result.error);
    }
    // If successful, the server action will redirect
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
                onClick={() => setMode("create")}
                className="h-32 flex flex-col items-center justify-center space-y-3 p-6"
                variant="outline"
              >
                <Plus className="h-8 w-8" />
                <span className="text-lg font-medium">Create New Account</span>
                <span className="text-sm text-muted-foreground text-center">Start managing your finances</span>
              </Button>
              
              <Button
                onClick={() => setMode("join")}
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
            <form action={handleCreateAccountAction} className="space-y-4">
              <div>
                <Label htmlFor="accountName">Account Name</Label>
                <Input
                  id="accountName"
                  name="accountName"
                  placeholder="e.g., Smith Family Finances"
                  required
                />
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
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                >
                  Create Account
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
            <form action={handleJoinAccountAction} className="space-y-4">
              <div>
                <Label htmlFor="invitationToken">Invitation Link or Token</Label>
                <Input
                  id="invitationToken"
                  name="invitationToken"
                  placeholder="Paste invitation link or token here"
                  required
                />
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
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                >
                  Join Account
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