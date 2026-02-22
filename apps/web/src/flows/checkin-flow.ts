"use client";

import { useMemo } from "react";
import { useIdentity } from "../context/identity-context";
import { useWallet } from "../context/wallet-context";
import {
  evaluateFlowRequirement,
  type FlowNextAction,
  type FlowWalletRequirement,
} from "./types";

export function decideCheckinNextAction(input: {
  identityStatus: "anon" | "authenticating" | "ready" | "error";
  walletState: "disconnected" | "connecting" | "connected" | "error";
  walletRequirement?: FlowWalletRequirement;
}): FlowNextAction {
  return evaluateFlowRequirement(
    {
      identity: "required",
      wallet: input.walletRequirement || "optional",
    },
    {
      identityStatus: input.identityStatus,
      walletState: input.walletState,
    },
  );
}

export function useCheckinFlow(options?: { walletRequirement?: FlowWalletRequirement }) {
  const { state: identityState } = useIdentity();
  const { state: walletState } = useWallet();
  const walletRequirement = options?.walletRequirement || "optional";

  const nextAction = useMemo(
    () =>
      decideCheckinNextAction({
        identityStatus: identityState.status,
        walletState,
        walletRequirement,
      }),
    [identityState.status, walletState, walletRequirement],
  );

  const run = async <T,>(fn: () => Promise<T>): Promise<T> => {
    const action = decideCheckinNextAction({
      identityStatus: identityState.status,
      walletState,
      walletRequirement,
    });
    if (action.kind !== "run") {
      throw new Error(action.reason || "flow_blocked");
    }
    return fn();
  };

  return {
    requirement: {
      identity: "required" as const,
      wallet: walletRequirement,
    },
    nextAction,
    run,
  };
}
