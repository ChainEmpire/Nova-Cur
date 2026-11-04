import { useState, type FormEvent, type ReactElement } from "react";
import Link from "next/link";
import logoIcon from "../../assets/landing/logo-icon.png";

const PAGES: { label: string; href: string }[] = [
  { label: "Home", href: "/" },
  { label: "Trading", href: "/trading" },
  { label: "About", href: "/about" },
];

const CONTACT: { label: string; href?: string; icon: ReactElement }[] = [
  {
    label: "hello@novafi.io",
    href: "mailto:hello@novafi.io",
    icon: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),
  },
  {
    label: "+1 (555) 013-4297",
    href: "tel:+15550134297",
    icon: (
      <path d="M5 4h4l2 5-2.5 1.5a12 12 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
    ),
  },
  {
    label: "100 Market Street, San Francisco, CA 94105",
    icon: (
      <>
        <path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
  },
];

const SOCIALS: { label: string; href: string; icon: ReactElement }[] = [
  {
    label: "X (Twitter)",
    href: "#",
    icon: (
      <path d="M17.5 3h3.1l-6.8 7.8L21.8 21h-6.3l-4.9-6.4L5 21H1.9l7.3-8.3L2.2 3h6.4l4.4 5.9L17.5 3zm-1.1 16.1h1.7L7.7 4.7H5.9l10.5 14.4z" />
    ),
  },
  {
    label: "GitHub",
    href: "#",
    icon: (
      <path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.2-3.4-1.2-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.6 2.4 1.1 3 .9.1-.7.4-1.1.6-1.4-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.2-.4-1.2.1-2.6 0 0 .9-.3 2.8 1a9.4 9.4 0 0 1 5 0c1.9-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.6.6.7 1 1.6 1 2.7 0 3.9-2.4 4.7-4.6 5 .4.3.7.9.7 1.9v2.7c0 .3.2.6.7.5A10 10 0 0 0 12 2z" />
    ),
  },
  {
    label: "Discord",
    href: "#",
    icon: (
      <path d="M19.3 5.3A17 17 0 0 0 15.1 4l-.2.4c1.6.4 2.9 1 3.9 1.7a13.6 13.6 0 0 0-11.6 0c1-.7 2.3-1.3 3.9-1.7L10.9 4a17 17 0 0 0-4.2 1.3C4 9.1 3.3 12.8 3.6 16.4c1.8 1.3 3.5 2.1 5.2 2.6l.8-1.4c-.9-.3-1.7-.7-2.4-1.2l.6-.4c2.7 1.3 5.7 1.3 8.4 0l.6.4c-.7.5-1.5.9-2.4 1.2l.8 1.4c1.7-.5 3.4-1.3 5.2-2.6.4-4.2-.7-7.8-3.1-11.1zM9.7 14.2c-.8 0-1.5-.8-1.5-1.7s.7-1.7 1.5-1.7 1.5.8 1.5 1.7-.7 1.7-1.5 1.7zm4.6 0c-.8 0-1.5-.8-1.5-1.7s.7-1.7 1.5-1.7 1.5.8 1.5 1.7-.7 1.7-1.5 1.7z" />
    ),
  },
];

export default function Footer() {
  const year = new Date().getFullYear();
  const [subscribed, setSubscribed] = useState(false);


  const handleSubscribe = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubscribed(true);
  };

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-nova-bg-alt/60">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-64 w-[42rem] -translate-x-1/2 rounded-full bg-nova-emerald/[0.06] blur-3xl"
      />

      <div className="mx-auto max-w-6xl px-6 py-16">
        
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-md md:flex-row md:items-center">
          <div>
            <h3 className="text-xl font-bold tracking-tight">Stay in the loop</h3>
            <p className="mt-1.5 text-sm text-nova-muted">
              Market insights and product updates, straight to your inbox. No spam.
            </p>
          </div>
          {subscribed ? (
            <p className="text-sm font-medium text-nova-emerald">
              Thanks — you&apos;re on the list!
            </p>
          ) : (
            <form className="flex w-full max-w-md gap-2" onSubmit={handleSubscribe}>
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                placeholder="you@example.com"
                className="w-full rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-nova-text placeholder:text-nova-muted backdrop-blur-md transition-colors focus:border-nova-cyan/60 focus:outline-none"
              />
              <button
                type="submit"
                className="shrink-0 rounded-full bg-gradient-nova px-6 py-2.5 text-sm font-semibold text-nova-bg transition-transform hover:scale-105 active:scale-95"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>

        
        <div className="mt-14 grid gap-10 sm:grid-cols-2 md:grid-cols-[1.2fr_0.8fr_1.4fr]">
          <div className="sm:col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex">
              <img
                src={logoIcon.src}
                alt="novaFi"
                width={67}
                height={80}
                loading="lazy"
                className="h-9 w-auto"
              />
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-nova-muted">
              Fast, secure, and transparent trading infrastructure for the next
              generation of markets.
            </p>
            <div className="mt-5 flex gap-3">
              {SOCIALS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-nova-muted backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-nova-cyan/40 hover:text-nova-cyan hover:shadow-[0_0_16px_rgba(6,182,212,0.25)]"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                    {social.icon}
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-nova-text">Pages</h3>
            <ul className="mt-4 space-y-3">
              {PAGES.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-nova-muted transition-colors hover:text-nova-cyan"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-nova-text">Contact</h3>
            <ul className="mt-4 space-y-3">
              {CONTACT.map((item) => (
                <li key={item.label} className="flex items-start gap-2.5 text-sm text-nova-muted">
                  <svg
                    viewBox="0 0 24 24"
                    className="mt-0.5 h-4 w-4 shrink-0 text-nova-emerald"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.7}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    {item.icon}
                  </svg>
                  {item.href ? (
                    <a href={item.href} className="transition-colors hover:text-nova-cyan">
                      {item.label}
                    </a>
                  ) : (
                    <span>{item.label}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-sm text-nova-muted md:flex-row">
          <p>&copy; {year} novaFi. All rights reserved.</p>
          <p className="text-xs">Trading involves risk. Past performance is not indicative of future results.</p>
        </div>

        <p className="mt-4 text-center text-xs text-nova-muted md:text-right">
          Animations inspired by{" "}
          <a
            href="https://emilkowal.ski"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-dotted transition-colors hover:text-nova-cyan"
          >
            Emil Kowalski
          </a>
        </p>
      </div>
    </footer>
  );
}
