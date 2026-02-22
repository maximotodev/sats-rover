// apps/web/src/flows/transmit-signal-flow.ts
"use client";

import { useMemo } from "react";
import { useIdentity } from "../context/identity-context";
import { useWallet } from "../context/wallet-context";
import { evaluateFlowRequirement, type FlowNextAction } from "./types";

const TRANSMIT_REQUIREMENT = {
  identity: "required",
  wallet: "not_required",
} as const;

export function decideTransmitSignalNextAction(input: {
  identityStatus: "anon" | "authenticating" | "ready" | "error";
  walletState: "disconnected" | "connecting" | "connected" | "error";
}): FlowNextAction {
  return evaluateFlowRequirement(TRANSMIT_REQUIREMENT, input);
}

export function useTransmitSignalFlow() {
  const { state: identityState } = useIdentity();
  const { state: walletState } = useWallet();

  const nextAction = useMemo(
    () =>
      decideTransmitSignalNextAction({
        identityStatus: identityState.status,
        walletState,
      }),
    [identityState.status, walletState],
  );

  const run = async <T>(fn: () => Promise<T>): Promise<T> => {
    const action = decideTransmitSignalNextAction({
      identityStatus: identityState.status,
      walletState,
    });
    if (action.kind !== "run") {
      throw new Error(action.reason || "flow_blocked");
    }
    return fn();
  };

  return {
    requirement: TRANSMIT_REQUIREMENT,
    nextAction,
    run,
  };
}
