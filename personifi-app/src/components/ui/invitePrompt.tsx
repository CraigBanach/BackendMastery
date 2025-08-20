"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, X } from "lucide-react";
import { InvitePartnerModal } from "@/components/ui/invitePartnerModal";
import { dismissInvitePrompt, getInvitePromptStatus } from "@/lib/api/userPreferencesApi";

export function InvitePrompt() {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkDismissalStatus = async () => {
      try {
        const status = await getInvitePromptStatus();
        setIsDismissed(status.dismissed);
      } catch (error: unknown) {
        console.error('Error checking invite prompt status:', error);
        // Default to showing prompt on error
        setIsDismissed(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkDismissalStatus();
  }, []);

  const handleDismiss = async () => {
    try {
      await dismissInvitePrompt();
      setIsDismissed(true);
    } catch (error: unknown) {
      console.error('Error dismissing invite prompt:', error);
      // Still dismiss locally as fallback
      setIsDismissed(true);
    }
  };

  // Show loading state or nothing while checking
  if (isLoading || isDismissed) {
    return null;
  }

  return (
    <>
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg text-blue-900">
              See your complete spending picture
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-blue-700 mb-4">
            Add your partner to see shared transactions and get a complete view of your household spending.
          </CardDescription>
          <Button 
            onClick={() => setIsInviteModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Invite Partner
          </Button>
        </CardContent>
      </Card>

      <InvitePartnerModal 
        isOpen={isInviteModalOpen} 
        onClose={() => setIsInviteModalOpen(false)} 
      />
    </>
  );
}