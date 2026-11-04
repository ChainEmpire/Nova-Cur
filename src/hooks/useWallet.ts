import { useMemo } from "react";
import { providers } from "ethers";
import { useAccount, useBalance, useConnectorClient } from "wagmi";
import { SUPPORTED_WALLET_CHAIN_IDS } from "../constants/contracts";



export function useWallet() {
  const { address, chainId, isConnected, isConnecting, isReconnecting } = useAccount();
  const { data: client } = useConnectorClient();


  const { data: balanceData, isLoading: balanceLoading } = useBalance({
    address,
    query: { refetchInterval: 15_000 },
  });

  const provider = useMemo(() => {
    if (!client) return null;
    const network = client.chain
      ? { chainId: client.chain.id, name: client.chain.name }
      : undefined;

    return new providers.Web3Provider(client.transport as any, network);
  }, [client]);

  return {
    account: (address as string | undefined) ?? null,
    chainId: chainId ?? null,
    provider,
    isConnected,
    
    isConnecting: isConnecting || isReconnecting,
    
    isWrongNetwork: isConnected && !SUPPORTED_WALLET_CHAIN_IDS.includes(chainId ?? 0),
    
    balance: balanceData ? balanceData.formatted : null,
    balanceSymbol: balanceData?.symbol ?? "BNB",
    balanceLoading,
  };
}
