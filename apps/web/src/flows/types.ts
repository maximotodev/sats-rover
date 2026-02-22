export type FlowIdentityRequirement = "required" | "optional";
export type FlowWalletRequirement = "required" | "optional" | "not_required";

export interface FlowRequirement {
  identity: FlowIdentityRequirement;
  wallet: FlowWalletRequirement;
}

export type FlowNextAction = {
  kind: "need_identity" | "need_wallet" | "run" | "error";
  reason?: string;
};

export interface FlowContextInput {
  identityStatus: "anon" | "authenticating" | "ready" | "error";
  walletState: "disconnected" | "connecting" | "connected" | "error";
}

export function evaluateFlowRequirement(
  requirement: FlowRequirement,
  context: FlowContextInput,
): FlowNextAction {
  if (context.identityStatus === "error") {
    return { kind: "error", reason: "identity_error" };
  }
  if (context.identityStatus === "authenticating") {
    return { kind: "error", reason: "identity_authenticating" };
  }
  if (requirement.identity === "required" && context.identityStatus !== "ready") {
    return { kind: "need_identity", reason: "missing_identity" };
  }

  if (context.walletState === "error") {
    return { kind: "error", reason: "wallet_error" };
  }
  if (requirement.wallet === "required" && context.walletState !== "connected") {
    return { kind: "need_wallet", reason: "missing_wallet" };
  }

  return { kind: "run" };
}
