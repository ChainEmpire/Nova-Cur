import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useConnectModal, useAccountModal, useChainModal } from "@rainbow-me/rainbowkit";
import { useDisconnect } from "wagmi";
import { clearSession, isLoggedIn } from "../utils/clientAuth";
import { useSwitchChain } from "../hooks/useSwitchChain";
import { useWallet } from "../hooks/useWallet";
import {
  ARBITRUM_CHAIN_ID,
  AVALANCHE_CHAIN_ID,
  BASE_CHAIN_ID,
  BSC_CHAIN_ID,
  ETH_CHAIN_ID,
  OPTIMISM_CHAIN_ID,
  POLYGON_CHAIN_ID,
} from "../constants/contracts";
import logo from "../assets/logo/logoNovaFi.png";

const NAV_LINKS = [
  { label: "Swap", path: "/swap" },
  { label: "Liquidity", path: "/liquidity" },
  { label: "Overview", path: "/overview" },
  { label: "NFTs", path: "/nft" },
  { label: "Blog", path: "/blog" },
  { label: "Coins", path: "/coins" },
];

export function Header() {
  const { account, balance, isWrongNetwork, isConnecting, chainId } = useWallet();
  const { openConnectModal } = useConnectModal();
  const { openAccountModal } = useAccountModal();
  const { openChainModal } = useChainModal();
  const { disconnect } = useDisconnect();
  const switchChain = useSwitchChain();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);

  const refreshAuthState = () => {
    setIsAuthenticated(isLoggedIn());
  };

  useEffect(() => {
    refreshAuthState();

    if (typeof window === "undefined") return;

    const handleAuthChange = () => refreshAuthState();
    window.addEventListener("novafi-auth-changed", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      window.removeEventListener("novafi-auth-changed", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  const truncate = (addr: string) => addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "";
  const isActive = (path: string) => router.pathname === path;
  const networkOptions = [
    { id: BSC_CHAIN_ID, label: "BNB" },
    { id: ETH_CHAIN_ID, label: "ETH" },
    { id: POLYGON_CHAIN_ID, label: "Polygon" },
    { id: ARBITRUM_CHAIN_ID, label: "Arbitrum" },
    { id: OPTIMISM_CHAIN_ID, label: "Optimism" },
    { id: AVALANCHE_CHAIN_ID, label: "Avalanche" },
    { id: BASE_CHAIN_ID, label: "Base" },
  ];

  const handleExitTrading = (disconnectWallets: boolean) => {
    clearSession();

    if (disconnectWallets) {
      try {
        disconnect();
      } catch {

      }
    }

    setShowExitDialog(false);
    void router.push("/");
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-indigo-900/30 bg-[#03030f]/85 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-8 h-16 flex items-center justify-between gap-4">

          
          <Link href="/" className="flex items-center shrink-0">
            <img src={logo.src} alt="novaFi" className="h-11 w-auto object-contain drop-shadow-lg" />
          </Link>

          
          {isAuthenticated && (
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map(({ label, path }) => (
                <Link
                  key={path}
                  href={path}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    isActive(path)
                      ? "bg-indigo-950 border border-indigo-700/50 text-white"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>
          )}

          
          <div className="flex items-center gap-2 shrink-0">
            {!isAuthenticated && router.pathname !== "/login" && (
              <Link
                href="/login"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
                  }
                }}
                className="hidden sm:inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium border border-indigo-800/50 text-slate-300 hover:border-cyan-500/40 hover:text-white hover:bg-white/5 transition-all"
              >
                Sign in / Register
              </Link>
            )}

            {account && (
              <div className="hidden md:flex items-center rounded-xl border border-white/10 bg-white/5 px-2 py-1.5">
                <span className="mr-2 text-[10px] uppercase tracking-[0.22em] text-slate-400">Chain</span>
                <select
                  aria-label="Select wallet network"
                  value={chainId ?? BSC_CHAIN_ID}
                  onChange={(event) => {
                    const nextChainId = Number(event.target.value);
                    void switchChain(nextChainId);
                  }}
                  className="bg-transparent text-xs font-medium text-slate-200 outline-none"
                >
                  {networkOptions.map((network) => (
                    <option key={network.id} value={network.id} className="bg-[#0b0d1a] text-slate-200">
                      {network.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={() =>
                isWrongNetwork
                  ? openChainModal?.()
                  : account
                  ? openAccountModal?.()
                  : openConnectModal?.()
              }
              disabled={isConnecting}
              aria-label={account ? "Wallet account" : "Connect wallet"}
              className={`flex min-w-[168px] items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all shadow-sm disabled:opacity-60 disabled:cursor-wait whitespace-nowrap ${
                isWrongNetwork
                  ? "bg-gradient-to-r from-rose-500 to-pink-600 shadow-rose-500/20"
                  : "bg-gradient-to-r from-cyan-500 to-violet-600 shadow-cyan-500/20"
              }`}
            >
              {isConnecting ? (
                "Connecting…"
              ) : isWrongNetwork ? (
                "Wrong network"
              ) : account ? (
                <span className="max-w-[110px] truncate">{truncate(account)}</span>
              ) : (
                "Connect Wallet"
              )}
            </button>

            {router.pathname === "/login" && (
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
                  }
                  void router.push("/");
                }}
                aria-label="Return to landing page"
                title="Return to landing page"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/40 bg-gradient-to-r from-slate-900/80 to-slate-800/80 text-slate-200 transition hover:border-cyan-300/60 hover:text-white"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M16 17l5-5-5-5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}

            {isAuthenticated && (
              <button
                type="button"
                onClick={() => {
                  if (account) {
                    setShowExitDialog(true);
                    return;
                  }

                  clearSession();
                  void router.push("/");
                }}
                aria-label="Exit trading and return to landing page"
                title="Exit trading"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:border-cyan-500/40 hover:text-white"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M16 17l5-5-5-5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}

            
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        
        {mobileOpen && isAuthenticated && (
          <div className="lg:hidden border-t border-indigo-900/30 bg-[#03030f]/95 backdrop-blur-xl px-4 py-3 flex flex-col gap-1">
            {NAV_LINKS.map(({ label, path }) => (
              <Link
                key={path}
                href={path}
                onClick={() => setMobileOpen(false)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive(path)
                    ? "bg-indigo-950 border border-indigo-700/50 text-white"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {label}
              </Link>
            ))}
            <Link
              href="/swap"
              onClick={() => setMobileOpen(false)}
              className="mt-1 px-4 py-2.5 rounded-xl text-sm font-medium text-center border border-indigo-800/50 text-slate-300 hover:border-cyan-500/40 hover:text-white transition-all"
            >
              Buy &amp; Sell
            </Link>
          </div>
        )}
      </header>

      {showExitDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#02040b]/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-indigo-900/50 bg-[#0b0d1a] p-6 shadow-2xl shadow-indigo-950/30">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-400">Exit trading</p>
            <h3 className="mt-3 text-xl font-semibold text-white">Keep your wallet connected?</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              You can leave the trading dashboard and return to the landing page. Choose whether to keep your wallet connection active or disconnect it completely.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => handleExitTrading(false)}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-cyan-500/40 hover:text-white"
              >
                Keep connected
              </button>
              <button
                type="button"
                onClick={() => handleExitTrading(true)}
                className="flex-1 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Disconnect wallet
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;
