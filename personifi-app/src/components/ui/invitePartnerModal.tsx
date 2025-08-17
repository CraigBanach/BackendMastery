"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import { sendInvitation } from "@/lib/api/accountApi";

interface InvitePartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InvitePartnerModal({ isOpen, onClose }: InvitePartnerModalProps) {
  const [email, setEmail] = useState("");
  const [personalMessage, setPersonalMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await sendInvitation(email.trim(), personalMessage.trim() || undefined);
      
      setSuccess(`Invitation sent successfully! Your partner can accept the invitation using this link: ${result.invitationUrl}`);
      
      // Reset form
      setEmail("");
      setPersonalMessage("");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to send invitation";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setPersonalMessage("");
    setError(null);
    setSuccess(null);
    onClose();
  };

  const copyInvitationUrl = () => {
    if (success) {
      const urlMatch = success.match(/https?:\/\/[^\s]+/);
      if (urlMatch) {
        navigator.clipboard.writeText(urlMatch[0]);
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Invite Your Partner">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Partner&apos;s Email Address</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="partner@example.com"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <Label htmlFor="message">Personal Message (Optional)</Label>
          <Textarea
            id="message"
            value={personalMessage}
            onChange={(e) => setPersonalMessage(e.target.value)}
            placeholder="Let's manage our finances together!"
            rows={3}
            disabled={isLoading}
          />
          <p className="text-sm text-gray-500 mt-1">
            Add a personal touch to your invitation
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-green-700 text-sm mb-2">{success}</p>
            <Button
              type="button"
              onClick={copyInvitationUrl}
              variant="outline"
              size="sm"
            >
              Copy Invitation Link
            </Button>
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
            disabled={isLoading || !email.trim()}
          >
            {isLoading ? "Sending..." : "Send Invitation"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}