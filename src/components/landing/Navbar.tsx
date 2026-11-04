import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { AnimatePresence, LazyMotion, domAnimation, m } from "framer-motion";
import { EASE_OUT } from "../../lib/landing/motion";
import logoFull from "../../assets/landing/logo-full.png";

type NavLink = {
  label: string;
  href: string;
};

const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Trading", href: "/trading" },
  { label: "About", href: "/about" },
];

export default function Navbar() {
  const { pathname } = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);


  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);


  const blurred = scrolled || isOpen;

  return (
    <LazyMotion features={domAnimation} strict>
    <m.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: EASE_OUT }}
      className={`sticky top-0 z-50 border-b border-transparent bg-transparent transition-[backdrop-filter] duration-300 ${
        blurred ? "backdrop-blur-xl" : ""
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center">
          <img
            src={logoFull.src}
            alt="novaFi"
            width={316}
            height={80}
            className="h-8 w-auto md:h-9"
          />
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`relative text-sm font-medium transition-colors hover:text-nova-cyan ${
                  isActive(link.href) ? "text-nova-cyan" : "text-nova-muted"
                }`}
              >
                {link.label}
                {isActive(link.href) && (
                  <span className="absolute -bottom-1.5 left-0 right-0 h-px bg-gradient-nova" />
                )}
              </Link>
            </li>
          ))}
        </ul>

        <m.div
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.98 }}
          className="hidden md:inline-block"
        >
          <Link
            href="/login"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.scrollTo({ top: 0, left: 0, behavior: "auto" });
              }
            }}
            className="inline-block rounded-full bg-gradient-nova px-5 py-2 text-sm font-semibold text-nova-bg shadow-lg shadow-nova-emerald/25"
          >
            Sign in / Register
          </Link>
        </m.div>

        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/5 text-nova-text backdrop-blur-md md:hidden"
        >
          <span className="sr-only">Toggle menu</span>
          {isOpen ? (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <m.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
            className="overflow-hidden border-t border-white/10 bg-nova-bg/95 backdrop-blur-xl md:hidden"
          >
            <ul className="flex flex-col gap-4 px-6 pb-6 pt-4">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`block text-base font-medium ${
                      isActive(link.href) ? "text-nova-cyan" : "text-nova-muted"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/login"
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
                    }
                  }}
                  className="mt-2 inline-block w-full rounded-full bg-gradient-nova px-5 py-2 text-center text-sm font-semibold text-nova-bg"
                >
                  Sign in / Register
                </Link>
              </li>
            </ul>
          </m.div>
        )}
      </AnimatePresence>
    </m.header>
    </LazyMotion>
  );
}
