import { useCallback } from "react";
import { useSwitchChain as useWagmiSwitchChain } from "wagmi";



export function useSwitchChain() {
  const { switchChainAsync } = useWagmiSwitchChain();


  return useCallback(
    async (desiredChain: number) => {
      try {
        await switchChainAsync({ chainId: desiredChain });
      } catch (err: any) {

        if (err?.code !== 4001 && err?.name !== "UserRejectedRequestError") {
          console.error("switchChain failed:", err);
        }
      }
    },
    [switchChainAsync]
  );
}
