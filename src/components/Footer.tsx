import React, { useEffect, useState } from "react";
import Link from "next/link";
import logo from "../assets/logo/logo.png";
import { isLoggedIn } from "../utils/clientAuth";

import Twitter from "../assets/social/twitter.svg";
import Discord from "../assets/social/discord.svg";
import Telegram from "../assets/social/telegram.svg";

const SOCIAL = [
  { icon: Twitter, label: "Twitter", href: "https://twitter.com" },
  { icon: Discord, label: "Discord", href: "https://discord.gg" },
  { icon: Telegram, label: "Telegram", href: "https://t.me" },
];

const LINKS = [
  { label: "Swap", path: "/swap" },
  { label: "Overview", path: "/overview" },
  { label: "NFTs", path: "/nft" },
  { label: "Blog", path: "/blog" },
  { label: "Coins", path: "/coins" },
];

const LEGAL = [
  { label: "Privacy Policy", path: "/privacy-policy" },
  { label: "Terms & Conditions", path: "/terms-conditions" },
  { label: "Cookies", path: "/cookies" },
];

export function Footer() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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

  return (
    <footer className="mt-24 border-t border-indigo-900/30 bg-[#03030f]/60 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">

          
          <div className="sm:col-span-1">
            <a href="/" className="flex items-center mb-4">
              <img src={logo.src} alt="novaFi" className="h-16 w-16 object-contain" />
            </a>
            <p className="text-slate-500 text-sm leading-relaxed mb-5">
              Decentralized DeFi trading, staking and prediction platform powered by real-time data.
            </p>
            <div className="flex gap-3">
              {SOCIAL.map(({ icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg border border-indigo-900/50 flex items-center justify-center hover:border-cyan-500/40 hover:bg-white/5 transition-all"
                  aria-label={label}
                >
                  <img src={icon.src} alt={label} className="w-4 h-4 opacity-60" />
                </a>
              ))}
            </div>
          </div>

          
          {isAuthenticated && (
            <div>
              <div className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-4">Product</div>
              <div className="flex flex-col gap-2.5">
                {LINKS.map(({ label, path }) => (
                  <Link
                    key={path}
                    href={path}
                    className="text-slate-500 text-sm hover:text-cyan-400 transition-colors"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          )}

          
          <div>
            <div className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-4">Legal</div>
            <div className="flex flex-col gap-2.5">
              {LEGAL.map(({ label, path }) => (
                <Link
                  key={path}
                  href={path}
                  className="text-slate-500 text-sm hover:text-cyan-400 transition-colors"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

        </div>

        
        <div className="mt-10 pt-6 border-t border-indigo-900/30 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-slate-600 text-sm">© {new Date().getFullYear()} novaFi. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <span className="text-slate-600 text-xs">Built with ❤️ on DeFi</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
