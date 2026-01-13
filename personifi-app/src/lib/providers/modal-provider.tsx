"use client";

import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

interface ModalManagerContextValue {
  isModalOpen: boolean;
  requestOpen: () => boolean;
  release: () => void;
}

const ModalManagerContext = createContext<ModalManagerContextValue | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isModalOpenRef = useRef(false);

  const requestOpen = useCallback(() => {
    if (isModalOpenRef.current) {
      return false;
    }

    isModalOpenRef.current = true;
    setIsModalOpen(true);
    return true;
  }, []);

  const release = useCallback(() => {
    if (!isModalOpenRef.current) {
      return;
    }

    isModalOpenRef.current = false;
    setIsModalOpen(false);
  }, []);

  const value = useMemo(
    () => ({
      isModalOpen,
      requestOpen,
      release,
    }),
    [isModalOpen, requestOpen, release]
  );

  return (
    <ModalManagerContext.Provider value={value}>
      {children}
    </ModalManagerContext.Provider>
  );
}

export function useModalManager() {
  const context = useContext(ModalManagerContext);

  if (!context) {
    throw new Error("useModalManager must be used within ModalProvider");
  }

  return context;
}
