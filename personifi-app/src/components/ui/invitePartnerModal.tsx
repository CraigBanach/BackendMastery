"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { generateInviteToken } from "@/lib/api/accountApi";
import { Copy, RefreshCw } from "lucide-react";

interface InvitePartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InvitePartnerModal({ isOpen, onClose }: InvitePartnerModalProps) {
  const [token, setToken] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // Generate token when modal opens
  useEffect(() => {
    if (isOpen && !token) {
      generateToken();
    }
  }, [isOpen, token]);

  const generateToken = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await generateInviteToken();
      setToken(result.token);
      setExpiresAt(result.expiresAt);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to generate invite token";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToken = async () => {
    if (token) {
      await navigator.clipboard.writeText(token);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleClose = () => {
    setToken(null);
    setExpiresAt(null);
    setError(null);
    setCopySuccess(false);
    onClose();
  };

  const formatExpiryDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Invite Your Partner">
      <div className="space-y-6">
        <p className="text-gray-600 text-sm">
          Share this invite token with your partner. They can use it to join your account by entering it after creating their own account.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="bg-gray-50 border rounded-lg p-6 text-center">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-gray-600" />
            <p className="text-gray-600 text-sm">Generating invite token...</p>
          </div>
        ) : token ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Invite Token
              </label>
              <div className="flex gap-2">
                <Input
                  value={token}
                  readOnly
                  className="font-mono text-sm bg-gray-50"
                />
                <Button
                  type="button"
                  onClick={copyToken}
                  variant="outline"
                  size="icon"
                  className="flex-shrink-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              {copySuccess && (
                <p className="text-green-600 text-xs mt-1">✓ Copied to clipboard!</p>
              )}
            </div>

            {expiresAt && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-800 text-sm">
                  <strong>Expires:</strong> {formatExpiryDate(expiresAt)}
                </p>
              </div>
            )}
          </div>
        ) : null}

        <div className="flex justify-between items-center pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={generateToken}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Generate New Token
          </Button>
          
          <Button
            type="button"
            onClick={handleClose}
          >
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
}