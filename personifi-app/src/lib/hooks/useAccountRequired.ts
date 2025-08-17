"use client";

import { useState, useCallback } from "react";

export function useAccountRequired() {
  const [showCreateAccount, setShowCreateAccount] = useState(false);

  const wrapApiCall = useCallback(async <T>(apiCall: () => Promise<T>): Promise<T> => {
    try {
      return await apiCall();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "";
      
      // Check if the error is about missing account
      if (errorMessage.includes("Please create an account first")) {
        setShowCreateAccount(true);
        throw error; // Re-throw to let the component handle it
      }
      
      throw error;
    }
  }, []);

  const handleAccountCreated = useCallback(() => {
    setShowCreateAccount(false);
    // Optionally reload the page or refresh data
    window.location.reload();
  }, []);

  return {
    showCreateAccount,
    setShowCreateAccount,
    wrapApiCall,
    handleAccountCreated,
  };
}