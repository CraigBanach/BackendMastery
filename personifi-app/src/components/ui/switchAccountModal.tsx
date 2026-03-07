"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { getInvitationDetails, acceptInvitation } from "@/lib/api/accountApi";
import { AlertTriangle, ArrowRight, Loader2 } from "lucide-react";

interface SwitchAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface InvitationDetails {
  accountName: string;
  inviterEmail: string;
  personalMessage?: string;
  expiresAt: string;
  isAlreadyMember: boolean;
}

type ModalStep = "enter-token" | "confirm" | "success" | "error";

export function SwitchAccountModal({ isOpen, onClose }: SwitchAccountModalProps) {
  const [token, setToken] = useState("");
  const [step, setStep] = useState<ModalStep>("enter-token");
  const [invitationDetails, setInvitationDetails] = useState<InvitationDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newAccountName, setNewAccountName] = useState<string | null>(null);

  const extractToken = (input: string): string => {
    // Handle full URLs like https://app.example.com/invite/TOKEN
    if (input.includes("/invite/")) {
      return input.split("/invite/")[1].split("?")[0];
    }
    return input.trim();
  };

  const handleValidateToken = async () => {
    const cleanToken = extractToken(token);
    if (!cleanToken) {
      setError("Please enter an invitation token or link");
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await getInvitationDetails(cleanToken);
    setIsLoading(false);

    if (!result.success || !result.data) {
      setError(result.error || "Invalid or expired invitation");
      setStep("error");
      return;
    }

    setInvitationDetails(result.data);

    if (result.data.isAlreadyMember) {
      setError("You are already a member of this account.");
      setStep("error");
    } else {
      setStep("confirm");
    }
  };

  const handleConfirmSwitch = async () => {
    const cleanToken = extractToken(token);
    setIsLoading(true);
    setError(null);

    try {
      const result = await acceptInvitation(cleanToken);

      if (!result.success) {
        setError(result.message || "Failed to switch accounts");
        setStep("error");
        return;
      }

      setNewAccountName(result.newAccountName || invitationDetails?.accountName || "new account");
      setStep("success");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to switch accounts";
      setError(errorMessage);
      setStep("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    // Reset state
    setToken("");
    setStep("enter-token");
    setInvitationDetails(null);
    setError(null);
    setNewAccountName(null);
    setIsLoading(false);
    onClose();
  };

  const handleSuccessClose = () => {
    handleClose();
    // Refresh the page to load new account context
    window.location.reload();
  };

  const formatExpiryDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatInviterDisplay = (email: string) => {
    // Extract a display name from the email address
    const localPart = email.split("@")[0];
    // Convert common email formats to readable names
    // e.g., "john.doe" -> "John Doe", "jane_smith" -> "Jane Smith"
    const formattedName = localPart
      .replace(/[._]/g, " ")
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
    return formattedName;
  };

  const renderContent = () => {
    switch (step) {
      case "enter-token":
        return (
          <div className="space-y-6">
            <p className="text-gray-600 text-sm">
              Enter the invitation token or link you received to switch to another account.
            </p>

            <div>
              <label htmlFor="invitation-token" className="text-sm font-medium text-gray-700 mb-2 block">
                Invitation Token or Link
              </label>
              <Input
                id="invitation-token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Enter token or paste invitation link..."
                className="font-mono text-sm"
                onKeyDown={(e) => e.key === "Enter" && handleValidateToken()}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleValidateToken}
                disabled={isLoading || !token.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Validating...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        );

      case "confirm":
        return (
          <div className="space-y-6">
            {invitationDetails && (
              <div className="bg-gray-50 border rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-sm text-gray-500">You are joining:</p>
                  <p className="text-lg font-semibold">{invitationDetails.accountName}</p>
                </div>
                {invitationDetails.inviterEmail && (
                  <div>
                    <p className="text-sm text-gray-500">Invited by:</p>
                    <p className="text-sm font-medium">{formatInviterDisplay(invitationDetails.inviterEmail)}</p>
                    <p className="text-xs text-gray-400">{invitationDetails.inviterEmail}</p>
                  </div>
                )}
                {invitationDetails.personalMessage && (
                  <div>
                    <p className="text-sm text-gray-500">Message:</p>
                    <p className="text-sm italic">&ldquo;{invitationDetails.personalMessage}&rdquo;</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Expires:</p>
                  <p className="text-sm">{formatExpiryDate(invitationDetails.expiresAt)}</p>
                </div>
              </div>
            )}

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-amber-800 font-medium">Warning: This will replace your current account</p>
                  <p className="text-amber-700 text-sm mt-1">
                    Switching accounts will archive your current account and all its data. 
                    This action cannot be undone. Your transactions, categories, budgets, 
                    and buckets will no longer be accessible.
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setStep("enter-token");
                  setError(null);
                }}
                disabled={isLoading}
              >
                Back
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleConfirmSwitch}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Switching...
                  </>
                ) : (
                  "Switch Account"
                )}
              </Button>
            </div>
          </div>
        );

      case "success":
        return (
          <div className="space-y-6 text-center">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <p className="text-green-800 font-medium text-lg">Successfully switched accounts!</p>
              <p className="text-green-700 text-sm mt-2">
                You are now a member of <strong>{newAccountName}</strong>.
              </p>
            </div>

            <div className="flex justify-center pt-4">
              <Button type="button" onClick={handleSuccessClose}>
                Continue
              </Button>
            </div>
          </div>
        );

      case "error":
        return (
          <div className="space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">{error || "An error occurred"}</p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setStep("enter-token");
                  setError(null);
                }}
              >
                Try Again
              </Button>
              <Button type="button" onClick={handleClose}>
                Close
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Switch Account">
      {renderContent()}
    </Modal>
  );
}
