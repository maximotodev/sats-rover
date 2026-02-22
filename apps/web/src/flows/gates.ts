"use client";

import { useCallback, useState } from "react";
import type { FlowNextAction } from "./types";

export type GateDecision = "identity" | "wallet" | "none" | "error";

export function decideGateFromAction(nextAction: FlowNextAction): GateDecision {
  if (nextAction.kind === "need_identity") return "identity";
  if (nextAction.kind === "need_wallet") return "wallet";
  if (nextAction.kind === "run") return "none";
  return "error";
}

export function useFlowGates() {
  const [identityOpen, setIdentityOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);

  const closeAll = useCallback(() => {
    setIdentityOpen(false);
    setWalletOpen(false);
  }, []);

  const closeIdentity = useCallback(() => {
    setIdentityOpen(false);
  }, []);

  const closeWallet = useCallback(() => {
    setWalletOpen(false);
  }, []);

  const openForAction = useCallback((nextAction: FlowNextAction) => {
    const decision = decideGateFromAction(nextAction);
    if (decision === "identity") {
      setWalletOpen(false);
      setIdentityOpen(true);
      return;
    }
    if (decision === "wallet") {
      setIdentityOpen(false);
      setWalletOpen(true);
      return;
    }
    if (decision === "none") {
      setIdentityOpen(false);
      setWalletOpen(false);
    }
  }, []);

  return {
    identityOpen,
    walletOpen,
    openForAction,
    closeAll,
    closeIdentity,
    closeWallet,
  };
}
