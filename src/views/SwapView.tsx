import React, { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { Contract, providers } from "ethers";
import { parseUnits, formatUnits } from "ethers/lib/utils";
import { useLiveData } from "../hooks/useLiveData";
import { useTokenBalance } from "../hooks/useTokenBalance";
import { useSwitchChain } from "../hooks/useSwitchChain";
import { useWallet } from "../hooks/useWallet";
import { fetchCoinChart, fetchTokenPrices } from "../services/coingecko.service";
import { TOKENS, Token } from "../constants/tokens";
import { PANCAKE_ROUTER_V2, WBNB, BSC_CHAIN_ID } from "../constants/contracts";
import { assertChainBeforeSigning, describeTxError } from "../utils/txErrors";
import { CRYPTO_LOGOS } from "../assets/crypto-icons";
import { pgCreateTransaction } from "../services/pg.api.service";

const ROUTER_ABI = [
  "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)",
  "function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
  "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
  "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)",
];

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
];

const SLIPPAGE_PRESETS = [0.1, 0.5, 1.0];


const bscProvider = new providers.JsonRpcProvider({ url: "https://bsc-dataseed.binance.org/", timeout: 10_000 });

const buildPath = (from: Token, to: Token): string[] => {
  if (!from.address) return [WBNB, to.address!];
  if (!to.address) return [from.address, WBNB];
  return [from.address, WBNB, to.address!];
};

const sanitizeAmount = (val: string, decimals: number): string => {
  const parts = val.split(".");
  if (parts.length === 2 && parts[1].length > decimals) {
    return `${parts[0]}.${parts[1].slice(0, decimals)}`;
  }
  return val;
};

const TIME_OPTIONS: { label: string; days: number | string }[] = [
  { label: "1H", days: 0.04 },
  { label: "24H", days: 1 },
  { label: "7D", days: 7 },
  { label: "1M", days: 30 },
  { label: "1Y", days: 365 },
];

const TIP = {
  background: "#0c0c24",
  border: "1px solid rgba(99,102,241,0.3)",
  borderRadius: 12,
  color: "#e2e8f0",
  fontSize: 12,
};

type TxState = "idle" | "approving" | "pending" | "success" | "error";

const Spinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="w-7 h-7 border-2 border-indigo-800 border-t-cyan-400 rounded-full animate-spin" />
  </div>
);



function TokenModal({
  onClose,
  onSelect,
  excludeId,
}: {
  onClose: () => void;
  onSelect: (t: Token) => void;
  excludeId?: string;
}) {
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const filtered = TOKENS.filter(
    (t) =>
      t.id !== excludeId &&
      (t.symbol.toLowerCase().includes(search.toLowerCase()) ||
        t.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="bg-[#080818] border border-indigo-900/50 rounded-2xl w-full max-w-sm shadow-2xl shadow-black/60">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-indigo-900/40">
          <h3 className="text-slate-100 font-bold text-base">Select a token</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 transition-all">✕</button>
        </div>

        <div className="px-4 py-3">
          <div className="flex items-center gap-2 bg-[#0c0c24] border border-indigo-900/40 rounded-xl px-3 py-2.5 focus-within:border-cyan-500/50 transition-all">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#64748b" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              ref={inputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or symbol"
              className="bg-transparent text-sm text-slate-200 outline-none placeholder-slate-600 flex-1"
            />
          </div>
        </div>

        <div className="overflow-y-auto max-h-72 px-2 pb-4">
          {filtered.length === 0 ? (
            <p className="text-center text-slate-600 text-sm py-6">No tokens found</p>
          ) : (
            filtered.map((token) => (
              <button
                key={token.id}
                onClick={() => { onSelect(token); onClose(); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all text-left"
              >
                <img
                  src={CRYPTO_LOGOS[token.symbol] ?? token.logoUrl}
                  alt={token.symbol}
                  className="w-8 h-8 rounded-full shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-slate-100 text-sm font-semibold">{token.symbol}</div>
                  <div className="text-slate-500 text-xs truncate">{token.name}</div>
                </div>
                {token.address && (
                  <span className="text-slate-700 text-[10px] font-mono shrink-0">
                    {token.address.slice(0, 6)}…{token.address.slice(-4)}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}



function SettingsPanel({
  slippage,
  onChange,
  onClose,
}: {
  slippage: number;
  onChange: (v: number) => void;
  onClose: () => void;
}) {
  const [custom, setCustom] = useState(
    SLIPPAGE_PRESETS.includes(slippage) ? "" : String(slippage)
  );
  const [error, setError] = useState("");

  const apply = (val: string) => {
    setCustom(val);
    const num = parseFloat(val);
    if (!val) { setError(""); return; }
    if (isNaN(num) || num <= 0) { setError("Enter a valid percentage"); return; }
    if (num > 50) { setError("Slippage too high (max 50%)"); return; }
    setError("");
    onChange(num);
    localStorage.setItem("novaFi_slippage", String(num));
  };

  const pick = (p: number) => {
    setCustom("");
    setError("");
    onChange(p);
    localStorage.setItem("novaFi_slippage", String(p));
  };

  return (
    <div className="absolute right-0 top-12 z-30 bg-[#080818] border border-indigo-900/50 rounded-2xl p-4 w-64 shadow-2xl shadow-black/50">
      <div className="flex items-center justify-between mb-3">
        <span className="text-slate-200 text-sm font-semibold">Slippage Tolerance</span>
        <button onClick={onClose} className="text-slate-600 hover:text-white text-sm transition-colors">✕</button>
      </div>
      <div className="flex gap-1.5 mb-3">
        {SLIPPAGE_PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => pick(p)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              slippage === p && !custom
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                : "text-slate-500 border border-indigo-900/40 hover:text-slate-300 hover:border-indigo-700/50"
            }`}
          >
            {p}%
          </button>
        ))}
      </div>
      <div className="relative">
        <input
          type="number"
          value={custom}
          onChange={(e) => apply(e.target.value)}
          placeholder="Custom"
          className="w-full bg-[#0c0c24] border border-indigo-900/40 rounded-xl px-3 py-2 text-sm text-slate-200 outline-none placeholder-slate-600 focus:border-cyan-500/50 transition-all pr-7"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">%</span>
      </div>
      {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
      {!error && slippage > 5 && (
        <p className="text-yellow-400 text-xs mt-1.5">⚠ High slippage — risk of frontrun</p>
      )}
    </div>
  );
}



function TxNotification({
  state,
  hash,
  error,
  onClose,
}: {
  state: TxState;
  hash: string | null;
  error: string | null;
  onClose: () => void;
}) {
  if (state === "idle") return null;

  const configs = {
    approving: { bg: "bg-indigo-500/10 border-indigo-500/30", icon: "⏳", text: "Approving token spend…", color: "text-indigo-400" },
    pending:   { bg: "bg-cyan-500/10 border-cyan-500/30",    icon: "🔄", text: "Transaction submitted…", color: "text-cyan-400" },
    success:   { bg: "bg-emerald-500/10 border-emerald-500/30", icon: "✅", text: "Swap successful!", color: "text-emerald-400" },
    error:     { bg: "bg-red-500/10 border-red-500/30",       icon: "❌", text: error || "Transaction failed", color: "text-red-400" },
  };

  const cfg = configs[state];

  return (
    <div className={`rounded-xl border ${cfg.bg} p-3 mb-4 flex items-start gap-2.5`}>
      <span className="text-base shrink-0 mt-0.5">{cfg.icon}</span>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${cfg.color}`}>{cfg.text}</p>
        {hash && (
          <a
            href={`https://bscscan.com/tx/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 text-xs hover:text-cyan-400 transition-colors mt-0.5 block truncate"
          >
            {hash.slice(0, 18)}…{hash.slice(-8)} ↗
          </a>
        )}
      </div>
      {(state === "success" || state === "error") && (
        <button onClick={onClose} className="text-slate-600 hover:text-white text-xs shrink-0 transition-colors mt-0.5">✕</button>
      )}
    </div>
  );
}



export default function SwapView() {
  const router = useRouter();
  const { account, provider, isWrongNetwork } = useWallet();
  const switchChain = useSwitchChain();
  const { openConnectModal } = useConnectModal();

  const [fromToken, setFromToken] = useState<Token>(TOKENS[0]);
  const [toToken, setToToken]     = useState<Token | null>(null);
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount]   = useState("");

  const [slippage, setSlippage] = useState<number>(() =>
    parseFloat(localStorage.getItem("novaFi_slippage") || "0.5")
  );

  const [tokenModal, setTokenModal]   = useState<"from" | "to" | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [activeFilter, setActiveFilter] = useState(TIME_OPTIONS[1]);

  const [tokenPrices, setTokenPrices] = useState<Record<string, number>>({});
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [priceImpact, setPriceImpact] = useState<number | null>(null);
  const [quoteSource, setQuoteSource] = useState<"amm" | "estimate" | null>(null);

  const [txState, setTxState] = useState<TxState>("idle");
  const [txHash, setTxHash]   = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);


  useEffect(() => {
    setTxState("idle");
    setTxHash(null);
    setTxError(null);
  }, [account]);

  const fromBalance = useTokenBalance(fromToken);
  const toBalance   = useTokenBalance(toToken);


  const chartFetcher = useCallback(
    () => fetchCoinChart(fromToken.coingeckoId, activeFilter.days),
    [fromToken.coingeckoId, activeFilter.days]
  );
  const { data: chartData, loading: chartLoading, lastUpdated } = useLiveData(chartFetcher, 30000);

  const chartChange = (() => {
    if (!chartData || chartData.length < 2) return null;
    const first = chartData[0].price;
    const last  = chartData[chartData.length - 1].price;
    const pct   = ((last - first) / first) * 100;
    return { pct, positive: pct >= 0 };
  })();


  useEffect(() => {
    const ids = TOKENS.map((t) => t.coingeckoId);
    fetchTokenPrices(ids)
      .then(setTokenPrices)
      .catch(() => {});

    const interval = setInterval(() => {
      fetchTokenPrices(ids).then(setTokenPrices).catch(() => {});
    }, 30000);

    return () => clearInterval(interval);
  }, []);


  useEffect(() => {
    const amount = parseFloat(fromAmount);
    if (!fromAmount || !toToken || isNaN(amount) || amount <= 0) {
      setToAmount("");
      setPriceImpact(null);
      setQuoteSource(null);
      setQuoteLoading(false);
      return;
    }

    setQuoteLoading(true);
    let cancelled = false;

    const fetchQuote = async () => {
      try {
        const amountIn = parseUnits(sanitizeAmount(fromAmount, fromToken.decimals), fromToken.decimals);
        const path = buildPath(fromToken, toToken);
        const router = new Contract(PANCAKE_ROUTER_V2, ROUTER_ABI, bscProvider);


        const baseIn = amountIn.div(1000);
        const [amounts, baseAmounts] = await Promise.all([
          router.getAmountsOut(amountIn, path),
          baseIn.isZero() ? Promise.resolve(null) : router.getAmountsOut(baseIn, path),
        ]);

        if (cancelled) return;

        const out = parseFloat(formatUnits(amounts[amounts.length - 1], toToken.decimals));
        setToAmount(out.toFixed(6));
        setQuoteSource("amm");

        if (baseAmounts) {
          const baseOut = parseFloat(formatUnits(baseAmounts[baseAmounts.length - 1], toToken.decimals));
          const spotOut = baseOut * 1000;
          const impact = spotOut > 0 ? Math.max(0, (1 - out / spotOut) * 100) : null;
          setPriceImpact(impact);
        } else {
          setPriceImpact(null);
        }
      } catch {

        if (!cancelled) {
          const fromPrice = tokenPrices[fromToken.coingeckoId];
          const toPrice   = tokenPrices[toToken.coingeckoId];
          if (fromPrice && toPrice) {
            setToAmount(((amount * fromPrice) / toPrice).toFixed(6));
            setQuoteSource("estimate");
          } else {
            setToAmount("");
            setQuoteSource(null);
          }
          setPriceImpact(null);
        }
      } finally {
        if (!cancelled) setQuoteLoading(false);
      }
    };

    const timer = setTimeout(fetchQuote, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [fromAmount, fromToken, toToken, tokenPrices]);


  const handleSwapSides = () => {
    if (!toToken) return;
    const prev = fromToken;
    setFromToken(toToken);
    setToToken(prev);
    setFromAmount(toAmount);
    setToAmount("");
    setPriceImpact(null);
  };


  const executeSwap = async () => {
    if (!account || !provider || !toToken || !fromAmount) return;

    const fromFloat = parseFloat(fromAmount);
    if (isNaN(fromFloat) || fromFloat <= 0) return;

    try {
      setTxError(null);

      await assertChainBeforeSigning(provider, BSC_CHAIN_ID);
      const signer = (provider as any).getSigner();
      const fromAmountWei = parseUnits(sanitizeAmount(fromAmount, fromToken.decimals), fromToken.decimals);
      const path = buildPath(fromToken, toToken);
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
      const MAX_UINT = "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";


      const readRouter = new Contract(PANCAKE_ROUTER_V2, ROUTER_ABI, bscProvider);
      const amounts = await readRouter.getAmountsOut(fromAmountWei, path);
      const expectedOut = amounts[amounts.length - 1];
      const slippageBps = Math.round(slippage * 100);
      const amountOutMin = expectedOut.mul(10000 - slippageBps).div(10000);

      let tx: any;

      if (!fromToken.address) {

        setTxState("pending");
        const router = new Contract(PANCAKE_ROUTER_V2, ROUTER_ABI, signer);
        tx = await router.swapExactETHForTokens(
          amountOutMin,
          path,
          account,
          deadline,
          { value: fromAmountWei }
        );
      } else if (!toToken.address) {

        const tokenContract = new Contract(fromToken.address, ERC20_ABI, signer);
        const allowance = await tokenContract.allowance(account, PANCAKE_ROUTER_V2);
        if (allowance.lt(fromAmountWei)) {
          setTxState("approving");
          const approveTx = await tokenContract.approve(PANCAKE_ROUTER_V2, MAX_UINT);
          await approveTx.wait();
        }
        setTxState("pending");
        const router = new Contract(PANCAKE_ROUTER_V2, ROUTER_ABI, signer);
        tx = await router.swapExactTokensForETH(
          fromAmountWei,
          amountOutMin,
          path,
          account,
          deadline
        );
      } else {

        const tokenContract = new Contract(fromToken.address, ERC20_ABI, signer);
        const allowance = await tokenContract.allowance(account, PANCAKE_ROUTER_V2);
        if (allowance.lt(fromAmountWei)) {
          setTxState("approving");
          const approveTx = await tokenContract.approve(PANCAKE_ROUTER_V2, MAX_UINT);
          await approveTx.wait();
        }
        setTxState("pending");
        const router = new Contract(PANCAKE_ROUTER_V2, ROUTER_ABI, signer);
        tx = await router.swapExactTokensForTokens(
          fromAmountWei,
          amountOutMin,
          path,
          account,
          deadline
        );
      }

      setTxHash(tx.hash);
      await tx.wait();
      setTxState("success");


      if (localStorage.getItem("pg_token")) {
        pgCreateTransaction({
          type: "swap",
          coin_id: fromToken.coingeckoId,
          coin_symbol: `${fromToken.symbol}/${toToken.symbol}`,
          amount_usd: fromFloat * (tokenPrices[fromToken.coingeckoId] ?? 0),
          amount_coin: fromFloat,
          tx_hash: tx.hash,
        }).catch(() => {});
      }

      setFromAmount("");
    } catch (err: any) {
      setTxState("error");
      setTxError(describeTxError(err));
    }
  };


  const getBtn = (): { label: string; disabled: boolean; action: () => void } => {
    if (!account)
      return { label: "Connect Wallet", disabled: false, action: () => openConnectModal?.() };
    if (isWrongNetwork)
      return { label: "Switch to BNB Chain", disabled: false, action: () => switchChain(BSC_CHAIN_ID) };
    if (!toToken)
      return { label: "Select a token", disabled: true, action: () => {} };
    if (!fromAmount || parseFloat(fromAmount) <= 0)
      return { label: "Enter an amount", disabled: true, action: () => {} };
    if (fromToken.id === toToken.id)
      return { label: "Select different tokens", disabled: true, action: () => {} };
    if (!quoteLoading && !toAmount && quoteSource === null)
      return { label: "No liquidity for this pair", disabled: true, action: () => {} };
    if (fromBalance !== null && parseFloat(fromAmount) > parseFloat(fromBalance))
      return { label: "Insufficient balance", disabled: true, action: () => {} };
    if (priceImpact !== null && priceImpact > 15)
      return { label: "Price impact too high", disabled: true, action: () => {} };
    if (txState === "approving")
      return { label: "Approving…", disabled: true, action: () => {} };
    if (txState === "pending")
      return { label: "Swapping…", disabled: true, action: () => {} };
    return { label: "Swap", disabled: false, action: executeSwap };
  };

  const btn = getBtn();


  const fromPrice  = tokenPrices[fromToken.coingeckoId];
  const toPrice    = toToken ? tokenPrices[toToken.coingeckoId] : 0;
  const usdValue   = fromAmount && fromPrice ? (parseFloat(fromAmount) * fromPrice).toLocaleString("en", { maximumFractionDigits: 2 }) : null;
  const toUsdValue = toAmount && toPrice ? (parseFloat(toAmount) * toPrice).toLocaleString("en", { maximumFractionDigits: 2 }) : null;
  const minReceived = toAmount && toToken
    ? (parseFloat(toAmount) * (1 - slippage / 100)).toFixed(6)
    : null;
  const rate = toAmount && fromAmount && parseFloat(fromAmount) > 0 && toToken
    ? `1 ${fromToken.symbol} = ${(parseFloat(toAmount) / parseFloat(fromAmount)).toFixed(6)} ${toToken.symbol}`
    : fromPrice && toPrice && toToken
      ? `1 ${fromToken.symbol} = ${(fromPrice / toPrice).toFixed(6)} ${toToken.symbol}`
      : null;

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 sm:px-8 py-6">
        
        <div className="flex gap-1 mb-8">
          <button className="px-5 py-2 rounded-xl text-sm font-semibold transition-all bg-indigo-950 border border-indigo-700/50 text-white">
            SWAP
          </button>
          <button onClick={() => router.push("/liquidity")}
            className="px-5 py-2 rounded-xl text-sm font-semibold transition-all text-slate-500 hover:text-slate-300">
            Liquidity
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-5">

          
          <div className="rounded-2xl border border-indigo-900/40 bg-[#0c0c24] p-6">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div>
                {chartLoading ? (
                  <div className="h-10 w-48 rounded-lg bg-indigo-900/20 animate-pulse" />
                ) : (
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-bold text-slate-100">
                      {fromPrice ? `$${fromPrice.toLocaleString("en", { maximumFractionDigits: 2 })}` : "—"}
                    </span>
                    {chartChange && (
                      <span className={`text-sm font-semibold px-2 py-0.5 rounded-lg ${chartChange.positive ? "text-emerald-400 bg-emerald-500/10" : "text-red-400 bg-red-500/10"}`}>
                        {chartChange.positive ? "▲" : "▼"} {Math.abs(chartChange.pct).toFixed(2)}%
                      </span>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-4 h-4 rounded-full shrink-0" style={{ background: fromToken.color }} />
                  <span className="text-slate-500 text-sm">{fromToken.symbol} / USD</span>
                  {lastUpdated && (
                    <span className="text-slate-700 text-xs">
                      · {lastUpdated.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {TIME_OPTIONS.map((f) => (
                  <button key={f.label} onClick={() => setActiveFilter(f)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      activeFilter.label === f.label
                        ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                        : "text-slate-500 border border-indigo-900/40 hover:text-slate-300 hover:border-indigo-700/50"
                    }`}
                  >{f.label}</button>
                ))}
              </div>
            </div>

            {chartLoading ? <Spinner /> : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData ?? []} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="swapGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={fromToken.color} stopOpacity={0.25} />
                        <stop offset="95%" stopColor={fromToken.color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                    <YAxis hide domain={["auto", "auto"]} />
                    <Tooltip contentStyle={TIP} formatter={(v: any) => [`$${Number(v).toLocaleString()}`, fromToken.symbol]} />
                    <Area type="monotone" dataKey="price" stroke={fromToken.color} strokeWidth={2} fill="url(#swapGrad)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          
          <div className="rounded-2xl border border-indigo-900/40 bg-[#0c0c24] p-6 flex flex-col">

            
            <div className="flex items-center justify-between mb-5 relative">
              <h2 className="text-2xl font-bold text-slate-100">Swap</h2>
              <button
                onClick={() => setShowSettings((v) => !v)}
                className={`p-2 rounded-lg transition-all ${showSettings ? "text-cyan-400 bg-cyan-500/10" : "text-slate-500 hover:text-slate-300 hover:bg-white/5"}`}
              >
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              {showSettings && (
                <SettingsPanel slippage={slippage} onChange={setSlippage} onClose={() => setShowSettings(false)} />
              )}
            </div>

            
            <TxNotification
              state={txState}
              hash={txHash}
              error={txError}
              onClose={() => { setTxState("idle"); setTxHash(null); setTxError(null); }}
            />

            
            <div className="rounded-xl bg-[#080818] border border-indigo-900/40 p-4 mb-2 focus-within:border-cyan-500/40 transition-all">
              <div className="flex items-center justify-between mb-1">
                <span className="text-slate-500 text-xs font-medium">From</span>
                {fromBalance !== null && (
                  <button
                    onClick={() => setFromAmount(fromBalance)}
                    className="text-cyan-400 text-xs font-semibold hover:text-cyan-300 transition-colors"
                  >
                    Balance: {fromBalance}
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3 mt-2">
                <input
                  type="number"
                  min="0"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  placeholder="0.00"
                  className="bg-transparent text-2xl font-semibold text-slate-100 outline-none flex-1 min-w-0 placeholder-slate-700"
                />
                <button
                  onClick={() => setTokenModal("from")}
                  className="flex items-center gap-2 bg-[#0c0c24] border border-indigo-800/50 rounded-xl px-3 py-1.5 shrink-0 text-sm font-semibold text-slate-200 hover:border-cyan-500/40 hover:text-white transition-all"
                >
                  <img src={CRYPTO_LOGOS[fromToken.symbol] ?? fromToken.logoUrl} alt={fromToken.symbol} className="w-5 h-5 rounded-full"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                  {fromToken.symbol}
                  <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20" className="text-slate-500">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </button>
              </div>
              {usdValue && (
                <p className="text-slate-600 text-xs mt-1.5">≈ ${usdValue} USD</p>
              )}
            </div>

            
            <div className="flex justify-center my-2">
              <button
                onClick={handleSwapSides}
                className="w-9 h-9 rounded-xl bg-indigo-950 border border-indigo-700/50 flex items-center justify-center text-cyan-400 hover:bg-indigo-900/50 hover:scale-105 transition-all"
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </button>
            </div>

            
            <div className="rounded-xl bg-[#080818] border border-indigo-900/40 p-4 mb-4 focus-within:border-cyan-500/40 transition-all">
              <div className="flex items-center justify-between mb-1">
                <span className="text-slate-500 text-xs font-medium">To</span>
                {toBalance !== null && toToken && (
                  <span className="text-slate-600 text-xs">Balance: {toBalance}</span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-2">
                {quoteLoading ? (
                  <div className="h-8 w-28 rounded bg-indigo-900/20 animate-pulse flex-1" />
                ) : (
                  <span className={`text-2xl font-semibold flex-1 ${toAmount ? "text-slate-100" : "text-slate-600"}`}>
                    {toAmount || "0.00"}
                  </span>
                )}
                <button
                  onClick={() => setTokenModal("to")}
                  className={`flex items-center gap-2 rounded-xl px-3 py-1.5 shrink-0 text-sm font-semibold border transition-all ${
                    toToken
                      ? "bg-[#0c0c24] border-indigo-800/50 text-slate-200 hover:border-cyan-500/40 hover:text-white"
                      : "bg-gradient-to-r from-cyan-500/20 to-violet-600/20 border-cyan-500/30 text-cyan-300 hover:opacity-90"
                  }`}
                >
                  {toToken ? (
                    <>
                      <img src={CRYPTO_LOGOS[toToken.symbol] ?? toToken.logoUrl} alt={toToken.symbol} className="w-5 h-5 rounded-full"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                      {toToken.symbol}
                      <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20" className="text-slate-500">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </>
                  ) : (
                    <>
                      Select token
                      <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
              {toUsdValue && (
                <p className="text-slate-600 text-xs mt-1.5">≈ ${toUsdValue} USD</p>
              )}
            </div>

            
            {rate && (
              <div className="rounded-xl bg-indigo-950/30 border border-indigo-900/30 px-4 py-3 mb-4 flex flex-col gap-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Rate {quoteSource === "estimate" && <span className="text-slate-600">(estimated)</span>}</span>
                  <span className="text-slate-300 font-medium">{rate}</span>
                </div>
                {priceImpact !== null && (
                  <div className="flex justify-between text-slate-400">
                    <span>Price impact</span>
                    <span className={`font-medium ${
                      priceImpact < 1 ? "text-emerald-400"
                      : priceImpact < 3 ? "text-slate-300"
                      : priceImpact < 5 ? "text-yellow-400"
                      : "text-red-400"
                    }`}>
                      {priceImpact < 0.01 ? "<0.01" : priceImpact.toFixed(2)}%
                    </span>
                  </div>
                )}
                {minReceived && toToken && (
                  <div className="flex justify-between text-slate-400">
                    <span>Min. received ({slippage}% slippage)</span>
                    <span className="text-slate-300 font-medium">{minReceived} {toToken.symbol}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400">
                  <span>Network</span>
                  <span className="text-yellow-400 font-medium">BNB Chain</span>
                </div>
                {priceImpact !== null && priceImpact >= 5 && priceImpact <= 15 && (
                  <p className="text-red-400/90 mt-1 flex items-center gap-1.5">
                    ⚠ High price impact — you lose {priceImpact.toFixed(1)}% of value on this trade
                  </p>
                )}
              </div>
            )}

            
            <button
              onClick={btn.action}
              disabled={btn.disabled}
              className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all mt-auto ${
                btn.disabled
                  ? "bg-indigo-950 border border-indigo-900/40 text-slate-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-cyan-500 to-violet-600 text-white hover:opacity-90 shadow-lg shadow-cyan-500/15"
              } ${txState === "approving" || txState === "pending" ? "animate-pulse" : ""}`}
            >
              {btn.label}
            </button>
          </div>
        </div>
      </div>

      
      {tokenModal === "from" && (
        <TokenModal
          onClose={() => setTokenModal(null)}
          onSelect={(t) => { setFromToken(t); setFromAmount(""); }}
          excludeId={toToken?.id}
        />
      )}
      {tokenModal === "to" && (
        <TokenModal
          onClose={() => setTokenModal(null)}
          onSelect={setToToken}
          excludeId={fromToken.id}
        />
      )}
    </>
  );
}
