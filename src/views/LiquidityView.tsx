import React, { useState, useEffect, useCallback } from "react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { Contract, providers } from "ethers";
import { parseUnits, formatUnits } from "ethers/lib/utils";
import { useTokenBalance } from "../hooks/useTokenBalance";
import { useSwitchChain } from "../hooks/useSwitchChain";
import { useWallet } from "../hooks/useWallet";
import { fetchTokenPrices } from "../services/coingecko.service";
import { TOKENS, Token } from "../constants/tokens";
import { PANCAKE_ROUTER_V2, WBNB, BSC_CHAIN_ID } from "../constants/contracts";
import { assertChainBeforeSigning, describeTxError } from "../utils/txErrors";
import { CRYPTO_LOGOS } from "../assets/crypto-icons";



const ROUTER_ABI = [
  "function addLiquidity(address tokenA, address tokenB, uint amountADesired, uint amountBDesired, uint amountAMin, uint amountBMin, address to, uint deadline) external returns (uint amountA, uint amountB, uint liquidity)",
  "function addLiquidityETH(address token, uint amountTokenDesired, uint amountTokenMin, uint amountETHMin, address to, uint deadline) external payable returns (uint amountToken, uint amountETH, uint liquidity)",
  "function removeLiquidity(address tokenA, address tokenB, uint liquidity, uint amountAMin, uint amountBMin, address to, uint deadline) external returns (uint amountA, uint amountB)",
  "function removeLiquidityETH(address token, uint liquidity, uint amountTokenMin, uint amountETHMin, address to, uint deadline) external returns (uint amountToken, uint amountETH)",
];

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
];

const PAIR_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
  "function token0() view returns (address)",
  "function token1() view returns (address)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
];

const MAX_UINT = "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";


const bscReadProvider = new providers.JsonRpcProvider({ url: "https://bsc-dataseed.binance.org/", timeout: 10_000 });



interface PoolDef {
  tokenA: Token;
  tokenB: Token;
  pairAddress: string;
}

const BNB  = TOKENS[0];
const BUSD = TOKENS[1];
const USDT = TOKENS[2];
const ETH  = TOKENS[4];
const BTCB = TOKENS[5];
const CAKE = TOKENS[6];

const POOLS: PoolDef[] = [
  { tokenA: BNB,  tokenB: BUSD, pairAddress: "0x58F876857a02D6762E0101bb5C46A8c1ED44Dc16" },
  { tokenA: BNB,  tokenB: USDT, pairAddress: "0x16b9a82891338f9bA80E2D6970FddA79D1eb0daE" },
  { tokenA: BNB,  tokenB: ETH,  pairAddress: "0x74E4716E431f45807DCF19f284c7aA99F18a4fbc" },
  { tokenA: BNB,  tokenB: BTCB, pairAddress: "0x61EB789d75A95CAa3fF50ed7E47b96c132fEc082" },
  { tokenA: BNB,  tokenB: CAKE, pairAddress: "0x0eD7e52944161450477ee417DE9Cd3a859b14fD0" },
  { tokenA: USDT, tokenB: BUSD, pairAddress: "0x7EFaEf62fDdCCa950418312c6C91Aef321375A00" },
];


interface PoolLive {
  reserveA: number;
  reserveB: number;
  tvl: number | null;
}



const fmtNum = (n: number) =>
  n >= 1e9 ? `$${(n / 1e9).toFixed(2)}B`
  : n >= 1e6 ? `$${(n / 1e6).toFixed(2)}M`
  : `$${n.toLocaleString()}`;

type TxState = "idle" | "approving" | "pending" | "success" | "error";



function TxNotification({ state, hash, error, onClose }: {
  state: TxState; hash: string | null; error: string | null; onClose: () => void;
}) {
  if (state === "idle") return null;
  const cfg = {
    approving: { bg: "bg-indigo-500/10 border-indigo-500/30", icon: "⏳", text: "Approving…",          color: "text-indigo-400" },
    pending:   { bg: "bg-cyan-500/10 border-cyan-500/30",    icon: "🔄", text: "Transaction submitted…", color: "text-cyan-400" },
    success:   { bg: "bg-emerald-500/10 border-emerald-500/30", icon: "✅", text: "Transaction successful!", color: "text-emerald-400" },
    error:     { bg: "bg-red-500/10 border-red-500/30",      icon: "❌", text: error || "Transaction failed", color: "text-red-400" },
  }[state];
  return (
    <div className={`rounded-xl border ${cfg.bg} p-3 mb-4 flex items-start gap-2.5`}>
      <span className="text-base shrink-0 mt-0.5">{cfg.icon}</span>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${cfg.color}`}>{cfg.text}</p>
        {hash && (
          <a href={`https://bscscan.com/tx/${hash}`} target="_blank" rel="noopener noreferrer"
            className="text-slate-500 text-xs hover:text-cyan-400 transition-colors mt-0.5 block truncate">
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



const TOKEN_COLORS: Record<string, string> = {
  BNB:  "#f0b90b", BUSD: "#f0b90b", USDT: "#26a17b",
  USDC: "#2775ca", ETH:  "#627eea", BTCB: "#f7931a",
  CAKE: "#d1884f", LINK: "#2a5ada",
};

function TokenLogo({ token, className }: { token: Token; className: string }) {
  const [failed, setFailed] = React.useState(false);
  if (failed) {
    return (
      <div
        className={`${className} flex items-center justify-center text-white text-[10px] font-bold`}
        style={{ background: TOKEN_COLORS[token.symbol] ?? "#6366f1" }}
      >
        {token.symbol.slice(0, 2)}
      </div>
    );
  }
  const src = CRYPTO_LOGOS[token.symbol] ?? token.logoUrl;
  return (
    <img
      src={src}
      alt={token.symbol}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}

function PairLogos({ a, b }: { a: Token; b: Token }) {
  return (
    <div className="flex items-center shrink-0">
      <TokenLogo token={a} className="w-8 h-8 rounded-full ring-2 ring-[#0c0c24] z-10" />
      <TokenLogo token={b} className="w-8 h-8 rounded-full ring-2 ring-[#0c0c24] -ml-3" />
    </div>
  );
}



const fmtQty = (n: number) =>
  n >= 1e6 ? `${(n / 1e6).toFixed(2)}M`
  : n >= 1e3 ? `${(n / 1e3).toFixed(1)}K`
  : n.toFixed(2);

function PoolsTab({
  onAddLiquidity,
  tokenPrices,
}: {
  onAddLiquidity: (pool: PoolDef) => void;
  tokenPrices: Record<string, number>;
}) {
  const [live, setLive] = useState<Record<string, PoolLive | null>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const results = await Promise.all(
        POOLS.map(async (pool): Promise<[string, PoolLive | null]> => {
          try {
            const pair = new Contract(pool.pairAddress, PAIR_ABI, bscReadProvider);
            const [reserves, token0] = await Promise.all([pair.getReserves(), pair.token0()]);
            const addrA = (pool.tokenA.address ?? WBNB).toLowerCase();
            const aIsToken0 = addrA === token0.toLowerCase();
            const reserveA = parseFloat(formatUnits(aIsToken0 ? reserves[0] : reserves[1], pool.tokenA.decimals));
            const reserveB = parseFloat(formatUnits(aIsToken0 ? reserves[1] : reserves[0], pool.tokenB.decimals));
            const pA = tokenPrices[pool.tokenA.coingeckoId];
            const pB = tokenPrices[pool.tokenB.coingeckoId];
            const tvl = pA && pB ? reserveA * pA + reserveB * pB : null;
            return [pool.pairAddress, { reserveA, reserveB, tvl }];
          } catch {
            return [pool.pairAddress, null];
          }
        })
      );
      if (!cancelled) setLive(Object.fromEntries(results));
    })();
    return () => { cancelled = true; };
  }, [tokenPrices]);

  return (
    <div className="rounded-2xl overflow-hidden border border-indigo-900/40"
      style={{ background: "linear-gradient(160deg, #0f0f2e 0%, #0c0c24 40%, #080818 100%)" }}
    >
      <div className="relative px-5 py-4 border-b border-indigo-900/40"
        style={{ background: "linear-gradient(90deg, rgba(6,182,212,0.06) 0%, rgba(99,102,241,0.08) 50%, rgba(124,58,237,0.06) 100%)" }}
      >
        <div className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(6,182,212,0.4), rgba(124,58,237,0.4), transparent)" }}
        />
        <h2 className="text-slate-100 font-bold text-lg">Liquidity Pools</h2>
        <p className="text-slate-500 text-xs mt-0.5">Provide liquidity and earn trading fees</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px]">
          <thead>
            <tr style={{ background: "linear-gradient(90deg, rgba(99,102,241,0.12) 0%, rgba(6,182,212,0.06) 100%)" }}>
              {["Pool", "TVL", "Pooled Tokens", ""].map((h) => (
                <th key={h} className="text-left text-slate-500 text-xs font-semibold uppercase tracking-wider px-5 py-3.5 border-b border-indigo-900/30">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {POOLS.map((pool, i) => (
              <tr key={pool.pairAddress}
                className="border-b border-indigo-900/20 transition-all"
                style={i % 2 === 1 ? { background: "rgba(99,102,241,0.03)" } : {}}
                onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "linear-gradient(90deg, rgba(6,182,212,0.07) 0%, rgba(99,102,241,0.07) 100%)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = i % 2 === 1 ? "rgba(99,102,241,0.03)" : ""; }}
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <PairLogos a={pool.tokenA} b={pool.tokenB} />
                    <div>
                      <div className="text-slate-100 text-sm font-semibold">{pool.tokenA.symbol}/{pool.tokenB.symbol}</div>
                      <div className="text-slate-600 text-xs">PancakeSwap V2</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-slate-300 text-sm font-medium">
                  {live[pool.pairAddress] === undefined ? (
                    <div className="h-4 w-16 rounded bg-indigo-900/20 animate-pulse" />
                  ) : live[pool.pairAddress]?.tvl != null ? (
                    fmtNum(live[pool.pairAddress]!.tvl!)
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-5 py-4 text-slate-400 text-xs">
                  {live[pool.pairAddress] ? (
                    <>
                      <div>{fmtQty(live[pool.pairAddress]!.reserveA)} {pool.tokenA.symbol}</div>
                      <div>{fmtQty(live[pool.pairAddress]!.reserveB)} {pool.tokenB.symbol}</div>
                    </>
                  ) : live[pool.pairAddress] === undefined ? (
                    <div className="h-4 w-20 rounded bg-indigo-900/20 animate-pulse" />
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-5 py-4">
                  <button
                    onClick={() => onAddLiquidity(pool)}
                    className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 text-white text-xs font-semibold hover:opacity-90 transition-all whitespace-nowrap shadow-sm shadow-cyan-500/20"
                  >
                    Add
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}



function AddLiquidityTab({
  initialPool,
  tokenPrices,
  slippage,
}: {
  initialPool: PoolDef | null;
  tokenPrices: Record<string, number>;
  slippage: number;
}) {
  const { account, provider, isWrongNetwork } = useWallet();
  const switchChain = useSwitchChain();
  const { openConnectModal } = useConnectModal();

  const [tokenA, setTokenA] = useState<Token>(initialPool?.tokenA ?? BNB);
  const [tokenB, setTokenB] = useState<Token | null>(initialPool?.tokenB ?? null);
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [txState, setTxState] = useState<TxState>("idle");
  const [txHash, setTxHash]   = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);


  useEffect(() => {
    setTxState("idle");
    setTxHash(null);
    setTxError(null);
  }, [account]);

  const balA = useTokenBalance(tokenA);
  const balB = useTokenBalance(tokenB);


  useEffect(() => {
    if (initialPool) {
      setTokenA(initialPool.tokenA);
      setTokenB(initialPool.tokenB);
      setAmountA("");
      setAmountB("");
    }
  }, [initialPool?.pairAddress]);


  useEffect(() => {
    if (!amountA || !tokenB) { setAmountB(""); return; }
    const prA = tokenPrices[tokenA.coingeckoId];
    const prB = tokenPrices[tokenB.coingeckoId];
    if (!prA || !prB) { setAmountB(""); return; }
    setAmountB(((parseFloat(amountA) * prA) / prB).toFixed(6));
  }, [amountA, tokenA, tokenB, tokenPrices]);

  const handleAdd = async () => {
    if (!account || !provider || !tokenB || !amountA || !amountB) return;
    if (parseFloat(amountA) <= 0 || parseFloat(amountB) <= 0) return;

    const signer = (provider as any).getSigner();
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
    const sanitize = (v: string, d: number) => {
      const p = v.split(".");
      return p.length === 2 && p[1].length > d ? `${p[0]}.${p[1].slice(0, d)}` : v;
    };

    try {
      setTxError(null);

      await assertChainBeforeSigning(provider, BSC_CHAIN_ID);

      const amtA = parseUnits(sanitize(amountA, tokenA.decimals), tokenA.decimals);
      const amtB = parseUnits(sanitize(amountB, tokenB.decimals), tokenB.decimals);
      const minA = parseUnits(sanitize((parseFloat(amountA) * (1 - slippage / 100)).toFixed(8), tokenA.decimals), tokenA.decimals);
      const minB = parseUnits(sanitize((parseFloat(amountB) * (1 - slippage / 100)).toFixed(8), tokenB.decimals), tokenB.decimals);
      const router = new Contract(PANCAKE_ROUTER_V2, ROUTER_ABI, signer);

      if (!tokenA.address && tokenB.address) {

        const tkB = new Contract(tokenB.address, ERC20_ABI, signer);
        const allowB = await tkB.allowance(account, PANCAKE_ROUTER_V2);
        if (allowB.lt(amtB)) {
          setTxState("approving");
          await (await tkB.approve(PANCAKE_ROUTER_V2, MAX_UINT)).wait();
        }
        setTxState("pending");
        const tx = await router.addLiquidityETH(tokenB.address, amtB, minB, minA, account, deadline, { value: amtA });
        setTxHash(tx.hash);
        await tx.wait();
      } else if (tokenA.address && !tokenB.address) {

        const tkA = new Contract(tokenA.address, ERC20_ABI, signer);
        const allowA = await tkA.allowance(account, PANCAKE_ROUTER_V2);
        if (allowA.lt(amtA)) {
          setTxState("approving");
          await (await tkA.approve(PANCAKE_ROUTER_V2, MAX_UINT)).wait();
        }
        setTxState("pending");
        const tx = await router.addLiquidityETH(tokenA.address, amtA, minA, minB, account, deadline, { value: amtB });
        setTxHash(tx.hash);
        await tx.wait();
      } else if (tokenA.address && tokenB.address) {

        const [tkA, tkB] = [new Contract(tokenA.address, ERC20_ABI, signer), new Contract(tokenB.address, ERC20_ABI, signer)];
        const [allowA, allowB] = await Promise.all([tkA.allowance(account, PANCAKE_ROUTER_V2), tkB.allowance(account, PANCAKE_ROUTER_V2)]);
        if (allowA.lt(amtA) || allowB.lt(amtB)) {
          setTxState("approving");
          const txs = [];
          if (allowA.lt(amtA)) txs.push(tkA.approve(PANCAKE_ROUTER_V2, MAX_UINT));
          if (allowB.lt(amtB)) txs.push(tkB.approve(PANCAKE_ROUTER_V2, MAX_UINT));
          await Promise.all((await Promise.all(txs)).map((t: any) => t.wait()));
        }
        setTxState("pending");
        const tx = await router.addLiquidity(tokenA.address, tokenB.address, amtA, amtB, minA, minB, account, deadline);
        setTxHash(tx.hash);
        await tx.wait();
      }

      setTxState("success");
      setAmountA("");
      setAmountB("");
    } catch (err: any) {
      setTxState("error");
      setTxError(describeTxError(err));
    }
  };

  const totalUSD = (() => {
    const pA = tokenPrices[tokenA.coingeckoId];
    const pB = tokenB ? tokenPrices[tokenB.coingeckoId] : 0;
    const a = parseFloat(amountA) || 0;
    const b = parseFloat(amountB) || 0;
    const v = a * pA + b * pB;
    return v > 0 ? v : null;
  })();

  const getBtn = () => {
    if (!account)         return { label: "Connect Wallet",       disabled: false, action: () => openConnectModal?.() };
    if (isWrongNetwork)  return { label: "Switch to BNB Chain", disabled: false, action: () => switchChain(BSC_CHAIN_ID) };
    if (!tokenB)          return { label: "Select second token",  disabled: true,  action: () => {} };
    if (!amountA || parseFloat(amountA) <= 0) return { label: "Enter an amount", disabled: true, action: () => {} };
    if (balA !== null && parseFloat(amountA) > parseFloat(balA)) return { label: `Insufficient ${tokenA.symbol}`, disabled: true, action: () => {} };
    if (balB !== null && tokenB && amountB && parseFloat(amountB) > parseFloat(balB)) return { label: `Insufficient ${tokenB.symbol}`, disabled: true, action: () => {} };
    if (txState === "approving") return { label: "Approving…", disabled: true, action: () => {} };
    if (txState === "pending")   return { label: "Adding liquidity…", disabled: true, action: () => {} };
    return { label: "Add Liquidity", disabled: false, action: handleAdd };
  };
  const btn = getBtn();

  return (
    <div className="rounded-2xl border border-indigo-900/40 bg-[#0c0c24] p-6 max-w-lg mx-auto">
      <h2 className="text-slate-100 font-bold text-xl mb-5">Add Liquidity</h2>

      <TxNotification state={txState} hash={txHash} error={txError}
        onClose={() => { setTxState("idle"); setTxHash(null); setTxError(null); }} />

      
      <div className="rounded-xl bg-[#080818] border border-indigo-900/40 p-4 focus-within:border-cyan-500/40 transition-all">
        <div className="flex items-center justify-between mb-1">
          <span className="text-slate-500 text-xs">Token A</span>
          {balA !== null && (
            <button onClick={() => setAmountA(balA)} className="text-cyan-400 text-xs font-semibold hover:text-cyan-300 transition-colors">
              Balance: {balA}
            </button>
          )}
        </div>
        <div className="flex items-center gap-3 mt-2">
          <input type="number" value={amountA} onChange={(e) => setAmountA(e.target.value)}
            placeholder="0.00"
            className="bg-transparent text-2xl font-semibold text-slate-100 outline-none flex-1 min-w-0 placeholder-slate-700"
          />
          <div className="flex items-center gap-2 bg-[#0c0c24] border border-indigo-800/50 rounded-xl px-3 py-1.5 shrink-0 text-sm font-semibold text-slate-200">
            <img src={tokenA.logoUrl} alt={tokenA.symbol} className="w-5 h-5 rounded-full"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            {tokenA.symbol}
          </div>
        </div>
      </div>

      
      <div className="flex justify-center my-3">
        <div className="w-9 h-9 rounded-xl bg-indigo-950 border border-indigo-700/50 flex items-center justify-center text-cyan-400 text-lg font-bold">
          +
        </div>
      </div>

      
      <div className="rounded-xl bg-[#080818] border border-indigo-900/40 p-4 mb-5 focus-within:border-cyan-500/40 transition-all">
        <div className="flex items-center justify-between mb-1">
          <span className="text-slate-500 text-xs">Token B</span>
          {balB !== null && tokenB && (
            <span className="text-slate-600 text-xs">Balance: {balB}</span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-2">
          <span className={`text-2xl font-semibold flex-1 ${amountB ? "text-slate-100" : "text-slate-600"}`}>
            {amountB || "0.00"}
          </span>
          {tokenB ? (
            <div className="flex items-center gap-2 bg-[#0c0c24] border border-indigo-800/50 rounded-xl px-3 py-1.5 shrink-0 text-sm font-semibold text-slate-200">
              <img src={tokenB.logoUrl} alt={tokenB.symbol} className="w-5 h-5 rounded-full"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              {tokenB.symbol}
            </div>
          ) : (
            <span className="text-slate-600 text-sm italic shrink-0">No token selected</span>
          )}
        </div>
      </div>

      
      {totalUSD && tokenB && (
        <div className="rounded-xl bg-indigo-950/30 border border-indigo-900/30 px-4 py-3 mb-5 flex flex-col gap-1.5 text-xs">
          <div className="flex justify-between text-slate-400">
            <span>Total deposit value</span>
            <span className="text-slate-200 font-medium">${totalUSD.toLocaleString("en", { maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Rate</span>
            <span className="text-slate-200 font-medium">
              1 {tokenA.symbol} = {amountA && amountB && parseFloat(amountA) > 0
                ? (parseFloat(amountB) / parseFloat(amountA)).toFixed(6)
                : "—"} {tokenB.symbol}
            </span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Slippage tolerance</span>
            <span className="text-slate-200 font-medium">{slippage}%</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>You will receive</span>
            <span className="text-cyan-400 font-medium">{tokenA.symbol}/{tokenB.symbol} LP tokens</span>
          </div>
        </div>
      )}

      <button onClick={btn.action} disabled={btn.disabled}
        className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all ${
          btn.disabled
            ? "bg-indigo-950 border border-indigo-900/40 text-slate-500 cursor-not-allowed"
            : "bg-gradient-to-r from-cyan-500 to-violet-600 text-white hover:opacity-90 shadow-lg shadow-cyan-500/15"
        } ${txState === "approving" || txState === "pending" ? "animate-pulse" : ""}`}
      >
        {btn.label}
      </button>
    </div>
  );
}



interface Position {
  pool: PoolDef;
  lpBalance: string;
  lpBalanceRaw: any;
}

function RemoveModal({ position, slippage, onClose }: {
  position: Position; slippage: number; onClose: () => void;
}) {
  const { account, provider, isWrongNetwork } = useWallet();
  const switchChain = useSwitchChain();
  const [pct, setPct] = useState(100);
  const [txState, setTxState] = useState<TxState>("idle");
  const [txHash, setTxHash]   = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);


  useEffect(() => {
    setTxState("idle");
    setTxHash(null);
    setTxError(null);
  }, [account]);

  const handleRemove = async () => {
    if (!account || !provider) return;
    const signer = (provider as any).getSigner();
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

    try {
      setTxError(null);

      await assertChainBeforeSigning(provider, BSC_CHAIN_ID);
      const lpPair = new Contract(position.pool.pairAddress, PAIR_ABI, signer);
      const lpAmount = position.lpBalanceRaw.mul(pct).div(100);
      const { tokenA, tokenB } = position.pool;


      const [reserves, totalSupply, token0] = await Promise.all([
        lpPair.getReserves(),
        lpPair.totalSupply(),
        lpPair.token0(),
      ]);
      const addrA = (tokenA.address ?? WBNB).toLowerCase();
      const aIsToken0 = addrA === token0.toLowerCase();
      const reserveA = aIsToken0 ? reserves[0] : reserves[1];
      const reserveB = aIsToken0 ? reserves[1] : reserves[0];
      const bps = 10000 - Math.round(slippage * 100);
      const minA = reserveA.mul(lpAmount).div(totalSupply).mul(bps).div(10000);
      const minB = reserveB.mul(lpAmount).div(totalSupply).mul(bps).div(10000);

      const allowance = await lpPair.allowance(account, PANCAKE_ROUTER_V2);
      if (allowance.lt(lpAmount)) {
        setTxState("approving");
        await (await lpPair.approve(PANCAKE_ROUTER_V2, MAX_UINT)).wait();
      }

      setTxState("pending");
      const router = new Contract(PANCAKE_ROUTER_V2, ROUTER_ABI, signer);
      let tx: any;

      if (!tokenA.address && tokenB.address) {
        tx = await router.removeLiquidityETH(tokenB.address, lpAmount, minB, minA, account, deadline);
      } else if (tokenA.address && !tokenB.address) {
        tx = await router.removeLiquidityETH(tokenA.address, lpAmount, minA, minB, account, deadline);
      } else {
        tx = await router.removeLiquidity(tokenA.address, tokenB.address, lpAmount, minA, minB, account, deadline);
      }

      setTxHash(tx.hash);
      await tx.wait();
      setTxState("success");
    } catch (err: any) {
      setTxState("error");
      setTxError(describeTxError(err));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="bg-[#080818] border border-indigo-900/50 rounded-2xl w-full max-w-sm p-6 shadow-2xl shadow-black/60">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-slate-100 font-bold">Remove Liquidity</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 transition-all">✕</button>
        </div>

        <TxNotification state={txState} hash={txHash} error={txError}
          onClose={() => { setTxState("idle"); setTxHash(null); setTxError(null); }} />

        <div className="flex items-center gap-3 mb-5">
          <PairLogos a={position.pool.tokenA} b={position.pool.tokenB} />
          <div>
            <div className="text-slate-100 font-semibold">{position.pool.tokenA.symbol}/{position.pool.tokenB.symbol}</div>
            <div className="text-slate-500 text-xs">LP Balance: {parseFloat(position.lpBalance).toFixed(8)}</div>
          </div>
        </div>

        
        <div className="bg-[#0c0c24] border border-indigo-900/40 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-500 text-xs">Amount to remove</span>
            <span className="text-cyan-400 text-lg font-bold">{pct}%</span>
          </div>
          <input type="range" min={1} max={100} value={pct} onChange={(e) => setPct(Number(e.target.value))}
            className="w-full accent-cyan-500"
          />
          <div className="flex gap-1.5 mt-3">
            {[25, 50, 75, 100].map((v) => (
              <button key={v} onClick={() => setPct(v)}
                className={`flex-1 py-1 rounded-lg text-xs font-semibold transition-all ${
                  pct === v
                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                    : "text-slate-500 border border-indigo-900/40 hover:text-slate-300"
                }`}
              >
                {v === 100 ? "Max" : `${v}%`}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-indigo-950/30 border border-indigo-900/30 px-4 py-3 mb-5 text-xs">
          <div className="flex justify-between text-slate-400 mb-1.5">
            <span>You will receive</span>
            <span className="text-slate-200">{position.pool.tokenA.symbol} + {position.pool.tokenB.symbol}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>LP tokens burned</span>
            <span className="text-slate-200">{(parseFloat(position.lpBalance) * pct / 100).toFixed(8)}</span>
          </div>
        </div>

        <button
          onClick={
            isWrongNetwork
              ? () => switchChain(BSC_CHAIN_ID)
              : txState === "idle" || txState === "error" ? handleRemove : undefined
          }
          disabled={txState === "approving" || txState === "pending" || txState === "success"}
          className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all ${
            txState === "approving" || txState === "pending" || txState === "success"
              ? "bg-indigo-950 border border-indigo-900/40 text-slate-500 cursor-not-allowed animate-pulse"
              : "bg-gradient-to-r from-cyan-500 to-violet-600 text-white hover:opacity-90 shadow-lg shadow-cyan-500/15"
          }`}
        >
          {isWrongNetwork
            ? "Switch to BNB Chain"
            : txState === "approving" ? "Approving…" : txState === "pending" ? "Removing…" : "Remove Liquidity"}
        </button>
      </div>
    </div>
  );
}

function MyPositionsTab({ tokenPrices }: { tokenPrices: Record<string, number> }) {
  const { account, isWrongNetwork } = useWallet();
  const { openConnectModal } = useConnectModal();
  const switchChain = useSwitchChain();
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading]     = useState(false);
  const [removing, setRemoving]   = useState<Position | null>(null);


  const fetchPositions = useCallback(async () => {
    if (!account) return;
    setLoading(true);
    const found: Position[] = [];
    await Promise.all(
      POOLS.map(async (pool) => {
        try {
          const pair = new Contract(pool.pairAddress, PAIR_ABI, bscReadProvider);
          const raw  = await pair.balanceOf(account);
          if (raw.gt(0)) {
            found.push({ pool, lpBalance: formatUnits(raw, 18), lpBalanceRaw: raw });
          }
        } catch {}
      })
    );
    setPositions(found);
    setLoading(false);
  }, [account]);

  useEffect(() => { fetchPositions(); }, [fetchPositions]);

  if (!account) {
    return (
      <div className="rounded-2xl border border-indigo-900/40 bg-[#0c0c24] p-12 text-center">
        <div className="text-4xl mb-3">💧</div>
        <p className="text-slate-300 font-semibold mb-1">No wallet connected</p>
        <p className="text-slate-500 text-sm mb-5">Connect your wallet to see your liquidity positions.</p>
        <button onClick={() => openConnectModal?.()}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-semibold text-sm hover:opacity-90 transition-all">
          Connect Wallet
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-indigo-900/40 bg-[#0c0c24] p-6">
        <h2 className="text-slate-100 font-bold text-lg mb-4">My Positions</h2>
        <div className="flex flex-col gap-3">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-xl bg-indigo-900/10 border border-indigo-900/30 p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-16 h-8 rounded-full bg-indigo-900/30" />
                <div>
                  <div className="h-4 w-28 bg-indigo-900/30 rounded mb-2" />
                  <div className="h-3 w-20 bg-indigo-900/20 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (positions.length === 0) {
    return (
      <div className="rounded-2xl border border-indigo-900/40 bg-[#0c0c24] p-12 text-center">
        <div className="text-4xl mb-3">🏊</div>
        <p className="text-slate-300 font-semibold mb-1">No active positions</p>
        <p className="text-slate-500 text-sm">You haven't provided liquidity to any pool yet.</p>
      </div>
    );
  }

  return (
    <>
      {isWrongNetwork && (
        <div className="mb-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
          <span className="text-yellow-400 text-sm">
            ⚠ Your wallet is on another network — switch to BNB Chain to manage positions.
          </span>
          <button onClick={() => switchChain(BSC_CHAIN_ID)}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 hover:bg-yellow-500/30 transition-all">
            Switch network
          </button>
        </div>
      )}
      <div className="rounded-2xl border border-indigo-900/40 bg-[#0c0c24] p-6">
        <h2 className="text-slate-100 font-bold text-lg mb-4">My Positions</h2>
        <div className="flex flex-col gap-3">
          {positions.map((pos) => {
            const pA = tokenPrices[pos.pool.tokenA.coingeckoId] || 0;
            const pB = tokenPrices[pos.pool.tokenB.coingeckoId] || 0;
            const lpVal = parseFloat(pos.lpBalance);
            return (
              <div key={pos.pool.pairAddress}
                className="rounded-xl bg-indigo-950/30 border border-indigo-900/40 p-4 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <PairLogos a={pos.pool.tokenA} b={pos.pool.tokenB} />
                  <div>
                    <div className="text-slate-100 font-semibold">{pos.pool.tokenA.symbol}/{pos.pool.tokenB.symbol}</div>
                    <div className="text-slate-500 text-xs">LP: {lpVal.toFixed(8)}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-slate-400 text-xs mb-1">Approx. value</div>
                  <div className="text-slate-200 text-sm font-medium">
                    {pA && pB ? `~$${((pA + pB) * lpVal * 0.5).toLocaleString("en", { maximumFractionDigits: 2 })}` : "—"}
                  </div>
                </div>
                <button onClick={() => setRemoving(pos)}
                  className="px-4 py-1.5 rounded-xl border border-red-500/30 text-red-400 text-xs font-semibold hover:bg-red-500/10 transition-all">
                  Remove
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {removing && (
        <RemoveModal
          position={removing}
          slippage={slippage}
          onClose={() => { setRemoving(null); fetchPositions(); }}
        />
      )}
    </>
  );
}


const slippage = parseFloat(localStorage.getItem("novaFi_slippage") || "0.5");



export default function LiquidityView() {
  const [activeTab, setActiveTab] = useState<"pools" | "add" | "positions">("pools");
  const [selectedPool, setSelectedPool] = useState<PoolDef | null>(null);
  const [tokenPrices, setTokenPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    const ids = TOKENS.map((t) => t.coingeckoId);
    fetchTokenPrices(ids).then(setTokenPrices).catch(() => {});
    const interval = setInterval(() => {
      fetchTokenPrices(ids).then(setTokenPrices).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAddFromPool = (pool: PoolDef) => {
    setSelectedPool(pool);
    setActiveTab("add");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-8 py-6">
      
      <div className="flex gap-1 mb-8">
        {(["pools", "add", "positions"] as const).map((tab) => {
          const labels = { pools: "Pools", add: "Add Liquidity", positions: "My Positions" };
          return (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab
                  ? "bg-indigo-950 border border-indigo-700/50 text-white"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {labels[tab]}
            </button>
          );
        })}
      </div>

      {activeTab === "pools" && <PoolsTab onAddLiquidity={handleAddFromPool} tokenPrices={tokenPrices} />}
      {activeTab === "add"   && <AddLiquidityTab initialPool={selectedPool} tokenPrices={tokenPrices} slippage={slippage} />}
      {activeTab === "positions" && <MyPositionsTab tokenPrices={tokenPrices} />}
    </div>
  );
}
