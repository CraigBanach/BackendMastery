"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { createAccount } from "@/lib/api/accountApi";

interface CreateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateAccountModal({ isOpen, onClose, onSuccess }: CreateAccountModalProps) {
  const [accountName, setAccountName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accountName.trim()) {
      setError("Account name is required");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await createAccount(accountName.trim());
      
      // Reset form
      setAccountName("");
      
      // Call success callback and close modal
      onSuccess?.();
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create account";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setAccountName("");
      setError(null);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create Your Account">
      <div className="space-y-4">
        <div className="text-sm text-gray-600">
          <p>Welcome to Personifi! To get started, please create your personal finance account.</p>
          <p className="mt-2">You can invite your partner to collaborate once your account is set up.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="accountName">Account Name</Label>
            <Input
              id="accountName"
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="Our Family Finances"
              required
              disabled={isLoading}
              className="mt-1"
            />
            <p className="text-sm text-gray-500 mt-1">
              Choose a name that represents your household (e.g., "Smith Family", "Our Finances")
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !accountName.trim()}
            >
              {isLoading ? "Creating..." : "Create Account"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}