import { useState, useEffect } from "react";
import { Contract } from "ethers";
import { formatUnits } from "ethers/lib/utils";
import { useWallet } from "./useWallet";
import { Token } from "../constants/tokens";

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
];

export function useTokenBalance(token: Token | null): string | null {
  const { account, provider } = useWallet();
  const [balance, setBalance] = useState<string | null>(null);

  useEffect(() => {
    if (!account || !provider || !token) {
      setBalance(null);
      return;
    }

    let cancelled = false;

    const fetchBalance = async () => {
      try {
        let bal: string;
        if (!token.address) {
          const raw = await provider.getBalance(account);
          bal = parseFloat(formatUnits(raw, 18)).toFixed(4);
        } else {
          const contract = new Contract(token.address, ERC20_ABI, provider);
          const raw = await contract.balanceOf(account);
          bal = parseFloat(formatUnits(raw, token.decimals)).toFixed(4);
        }
        if (!cancelled) setBalance(bal);
      } catch {
        if (!cancelled) setBalance("0.0000");
      }
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 15000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [account, provider, token?.id]);

  return balance;
}
