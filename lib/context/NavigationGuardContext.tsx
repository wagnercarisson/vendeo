"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";

interface NavigationGuardContextType {
  isBlocked: boolean;
  setBlocked: (blocked: boolean) => void;
  requestNavigation: (url: string) => void;
  confirmNavigation: () => void;
  cancelNavigation: () => void;
  showModal: boolean;
  pendingUrl: string | null;
}

const NavigationGuardContext = createContext<NavigationGuardContextType | undefined>(undefined);

export function NavigationGuardProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isBlocked, setBlocked] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);

  const requestNavigation = useCallback((url: string) => {
    if (isBlocked) {
      setPendingUrl(url);
      setShowModal(true);
    } else {
      router.push(url);
    }
  }, [isBlocked, router]);

  const confirmNavigation = useCallback(() => {
    if (pendingUrl) {
      setBlocked(false); // Desbloqueia para permitir a navegação
      setShowModal(false);
      const url = pendingUrl;
      setPendingUrl(null);
      router.push(url);
    }
  }, [pendingUrl, router]);

  const cancelNavigation = useCallback(() => {
    setShowModal(false);
    setPendingUrl(null);
  }, []);

  // Proteção do Navegador (beforeunload)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isBlocked) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isBlocked]);

  return (
    <NavigationGuardContext.Provider
      value={{
        isBlocked,
        setBlocked,
        requestNavigation,
        confirmNavigation,
        cancelNavigation,
        showModal,
        pendingUrl,
      }}
    >
      {children}
    </NavigationGuardContext.Provider>
  );
}

export function useNavigationGuard() {
  const context = useContext(NavigationGuardContext);
  if (context === undefined) {
    throw new Error("useNavigationGuard must be used within a NavigationGuardProvider");
  }
  return context;
}
