


import { useEffect, useRef } from "react";
import { useAccount } from "wagmi";
import { useSwitchChain } from "../hooks/useSwitchChain";

export function NetworkGuard() {
  const { isConnected, chainId } = useAccount();
  const switchChain = useSwitchChain();
  const attemptedFor = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!isConnected || chainId === undefined) return;

    const supported = [
      1, 56, 137, 42161, 10, 43114, 8453,
    ].includes(chainId);
    if (supported) {
      attemptedFor.current = undefined;
      return;
    }

    if (attemptedFor.current === chainId) return;
    attemptedFor.current = chainId;


    switchChain(56);
  }, [isConnected, chainId, switchChain]);

  return null;
}

export default NetworkGuard;
