"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@auth0/nextjs-auth0";
import { getInvitationDetails, acceptInvitation } from "@/lib/api/accountApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface InvitationDetails {
  accountName: string;
  inviterEmail: string;
  personalMessage?: string;
  expiresAt: string;
}

interface PageProps {
  params: Promise<{
    token: string;
  }>;
}

export default function InvitationPage({ params }: PageProps) {
  const [token, setToken] = useState<string>("");

  useEffect(() => {
    params.then(p => setToken(p.token));
  }, [params]);
  const { user, isLoading: isUserLoading } = useUser();
  const router = useRouter();
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    
    const loadInvitation = async () => {
      try {
        const details = await getInvitationDetails(token);
        setInvitation(details);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load invitation";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadInvitation();
  }, [token]);

  const handleAcceptInvitation = async () => {
    if (!user) {
      // Redirect to login with return URL
      window.location.href = `/api/auth/login?returnTo=${encodeURIComponent(window.location.pathname)}`;
      return;
    }

    setIsAccepting(true);
    setError(null);

    try {
      await acceptInvitation(token);
      // Redirect to budget on success
      router.push("/budget");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to accept invitation";
      setError(errorMessage);
    } finally {
      setIsAccepting(false);
    }
  };

  const handleDecline = () => {
    router.push("/");
  };

  if (isLoading || isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Invitation Error</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">{error}</p>
            <Button onClick={() => router.push("/")} variant="outline">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Invitation Not Found</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">This invitation may have expired or is invalid.</p>
            <Button onClick={() => router.push("/")} variant="outline">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const expiresAt = new Date(invitation.expiresAt);
  const isExpired = expiresAt < new Date();

  if (isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Invitation Expired</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              This invitation expired on {expiresAt.toLocaleDateString()}.
            </p>
            <p className="text-sm text-gray-500">
              Please ask {invitation.inviterEmail} to send you a new invitation.
            </p>
            <Button onClick={() => router.push("/")} variant="outline">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">You&apos;re Invited!</CardTitle>
          <CardDescription>
            {invitation.inviterEmail} invited you to collaborate on Personifi
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Account: {invitation.accountName}</h3>
            <p className="text-sm text-blue-700">
              You&apos;ll be able to:
            </p>
            <ul className="text-sm text-blue-700 mt-2 space-y-1">
              <li>✓ View and add transactions</li>
              <li>✓ Manage shared budgets</li>
              <li>✓ See spending analytics</li>
            </ul>
          </div>

          {invitation.personalMessage && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Personal Message:</h4>
              <p className="text-gray-700 italic">&quot;{invitation.personalMessage}&quot;</p>
            </div>
          )}

          <div className="text-center text-sm text-gray-500">
            This invitation expires on {expiresAt.toLocaleDateString()} at {expiresAt.toLocaleTimeString()}
          </div>

          {!user ? (
            <div className="space-y-4">
              <p className="text-center text-gray-600">
                You need to sign in to accept this invitation.
              </p>
              <Button 
                onClick={handleAcceptInvitation} 
                className="w-full"
                size="lg"
              >
                Sign In & Accept Invitation
              </Button>
            </div>
          ) : (
            <div className="flex gap-3">
              <Button 
                onClick={handleDecline} 
                variant="outline" 
                className="flex-1"
                disabled={isAccepting}
              >
                Decline
              </Button>
              <Button 
                onClick={handleAcceptInvitation} 
                className="flex-1"
                disabled={isAccepting}
                size="lg"
              >
                {isAccepting ? "Accepting..." : "Accept & Join"}
              </Button>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}