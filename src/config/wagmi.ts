import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  walletConnectWallet,
  coinbaseWallet,
  trustWallet,
  okxWallet,
  binanceWallet,
  injectedWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { fallback, http } from "wagmi";
import { arbitrum, avalanche, base, bsc, mainnet, optimism, polygon } from "wagmi/chains";


const WC_PROJECT_ID = process.env.REACT_APP_WC_PROJECT_ID || "novafi-dev-placeholder";


const BSC_RPCS = [
  "https://bsc-dataseed.binance.org/",
  "https://bsc-dataseed1.defibit.io/",
  "https://bsc-dataseed1.ninicoin.io/",
];

export const wagmiConfig = getDefaultConfig({
  appName: "NovaFi",
  projectId: WC_PROJECT_ID,

  chains: [bsc, mainnet, polygon, arbitrum, optimism, avalanche, base],
  transports: {
    [bsc.id]: fallback(BSC_RPCS.map((url) => http(url, { timeout: 10_000 }))),
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [avalanche.id]: http(),
    [base.id]: http(),
  },

  wallets: [
    {
      groupName: "Recommended",
      wallets: [walletConnectWallet],
    },
    {
      groupName: "More wallets",
      wallets: [okxWallet, binanceWallet, coinbaseWallet, trustWallet, injectedWallet],
    },
  ],
});
