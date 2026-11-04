





export async function assertChainBeforeSigning(
  provider: { getNetwork: () => Promise<{ chainId: number }> },
  expectedChainId: number
): Promise<void> {
  const net = await provider.getNetwork();
  if (net.chainId !== expectedChainId) {
    const err = new Error("Wallet is not on the expected network") as Error & { code: string };
    err.code = "WRONG_NETWORK";
    throw err;
  }
}



export function describeTxError(err: any): string {
  const code = err?.code;
  const innerCode = err?.error?.code ?? err?.data?.code;
  const msg: string =
    err?.error?.message || err?.reason || err?.shortMessage || err?.message || "";


  if (code === "WRONG_NETWORK")
    return "Wallet is on the wrong network — switch to BNB Chain and try again";


  if (code === 4001 || innerCode === 4001 || code === "ACTION_REJECTED")
    return "Transaction cancelled";


  if (code === -32002 || innerCode === -32002 || /already pending/i.test(msg))
    return "A request is already pending in your wallet — open it to continue";


  if (code === "INSUFFICIENT_FUNDS" || /insufficient funds/i.test(msg))
    return "Insufficient funds for amount + gas";


  if (/INSUFFICIENT_OUTPUT_AMOUNT|INSUFFICIENT_A_AMOUNT|INSUFFICIENT_B_AMOUNT|EXCESSIVE_INPUT_AMOUNT/.test(msg))
    return "Price moved too much — try increasing slippage";


  if (/EXPIRED/.test(msg))
    return "Transaction deadline expired — try again";


  if (code === "UNPREDICTABLE_GAS_LIMIT" || code === "CALL_EXCEPTION")
    return "Transaction would fail — check amounts and allowances, then try again";


  if (code === "NETWORK_ERROR" || code === "TIMEOUT" || /timeout|network error/i.test(msg))
    return "Network error — the RPC did not respond, please try again";

  return err?.shortMessage || err?.reason || err?.message || "Transaction failed";
}
