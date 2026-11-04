type IconProps = { className?: string };

export function SolanaIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className}>
      <defs>
        <linearGradient id="sol-g" x1="0" y1="32" x2="32" y2="0">
          <stop offset="0" stopColor="#00FFA3" />
          <stop offset="1" stopColor="#DC1FFF" />
        </linearGradient>
      </defs>
      <path d="M6 21.5c.3-.3.7-.5 1.2-.5h18.3c.8 0 1.2 1 .7 1.6l-4 4c-.3.3-.7.5-1.2.5H2.7c-.8 0-1.2-1-.7-1.6l4-4z" fill="url(#sol-g)" />
      <path d="M6 6.4c.3-.3.7-.5 1.2-.5h18.3c.8 0 1.2 1 .7 1.6l-4 4c-.3.3-.7.5-1.2.5H2.7c-.8 0-1.2-1-.7-1.6l4-4z" fill="url(#sol-g)" />
      <path d="M22.2 13.9c-.3-.3-.7-.5-1.2-.5H2.7c-.8 0-1.2 1-.7 1.6l4 4c.3.3.7.5 1.2.5h18.3c.8 0 1.2-1 .7-1.6l-4-4z" fill="url(#sol-g)" />
    </svg>
  );
}

export function ChainlinkIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className}>
      <path d="M16 2 4 9v14l12 7 12-7V9L16 2z" fill="#375BD2" />
      <path d="M16 8 9.5 11.8v7.6L16 23.2l6.5-3.8v-7.6L16 8z" fill="#fff" opacity="0.9" />
      <path d="M16 12.2 12.8 14v4.2l3.2 1.8 3.2-1.8V14L16 12.2z" fill="#375BD2" />
    </svg>
  );
}

export function AvalancheIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className}>
      <circle cx="16" cy="16" r="16" fill="#E84142" />
      <path d="M20.8 20.4h3.1c.6 0 .9-.6.6-1.1l-6.7-11.6a.7.7 0 0 0-1.2 0l-2.2 3.8a1.4 1.4 0 0 0 0 1.4l4.9 8.5c.2.4.6.6 1 .6h.5z" fill="#fff" />
      <path d="M12.9 15.1 9 21.8a.6.6 0 0 0 .5.9h7.8a.6.6 0 0 0 .5-.9l-2-3.4-2-3.4a.6.6 0 0 0-1 0z" fill="#fff" />
    </svg>
  );
}

export function PolygonIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className}>
      <circle cx="16" cy="16" r="16" fill="#8247E5" />
      <path
        d="M20.5 12.8l-3.8-2.2a1.4 1.4 0 0 0-1.4 0l-3.8 2.2a1.4 1.4 0 0 0-.7 1.2v4.4c0 .5.3 1 .7 1.2l3.8 2.2c.4.2 1 .2 1.4 0l3.8-2.2c.4-.2.7-.7.7-1.2V14c0-.5-.3-1-.7-1.2z"
        fill="#fff"
        opacity="0.9"
      />
      <path d="M16 13.3l2.3 1.3v2.6L16 18.5l-2.3-1.3v-2.6L16 13.3z" fill="#8247E5" />
    </svg>
  );
}

export function ArbitrumIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className}>
      <circle cx="16" cy="16" r="16" fill="#213147" />
      <path d="M11 20.5 15.3 10h1.9l-4.3 10.5H11z" fill="#28A0F0" />
      <path d="M16.6 20.5 20.9 10h1.9l-4.3 10.5h-1.9z" fill="#96BEDC" />
      <path d="M16 8.5 22 20.5h-2.2L14.2 9.3 16 8.5z" fill="#fff" opacity="0.9" />
    </svg>
  );
}

export function OptimismIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className}>
      <circle cx="16" cy="16" r="16" fill="#FF0420" />
      <circle cx="13" cy="16" r="4.2" fill="none" stroke="#fff" strokeWidth="2.6" />
      <rect x="18.5" y="14.7" width="7" height="2.6" rx="1.3" fill="#fff" />
    </svg>
  );
}

export function UniswapIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className}>
      <circle cx="16" cy="16" r="16" fill="#FF007A" />
      <path
        d="M13.5 9c2.8 1.8 4.6 4 5.4 6.7 1 3.3-.2 6.6-2.7 7.9-.3.2-.6-.1-.4-.4 1.4-2.1.6-4-.8-5.7-1.6-2-3.6-3.4-3.7-6 0-1 .5-1.9 1.3-2.6.3-.2.7 0 .9.1z"
        fill="#fff"
        opacity="0.9"
      />
      <circle cx="12.6" cy="11.4" r="1" fill="#fff" />
    </svg>
  );
}

export function SuiIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className}>
      <circle cx="16" cy="16" r="16" fill="#6FBCF0" />
      <path d="M16 8c3.2 4 4.8 7 4.8 9.4a4.8 4.8 0 1 1-9.6 0C11.2 15 12.8 12 16 8z" fill="#fff" />
    </svg>
  );
}

export function AptosIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className}>
      <circle cx="16" cy="16" r="16" fill="#0F0F0F" />
      <path d="M7 13.5h10.3c.5 0 1 .3 1.2.8l1.3 2.6H9.6c-.5 0-1-.3-1.2-.8L7 13.5z" fill="#fff" />
      <path d="M25 18.5H14.7c-.5 0-1-.3-1.2-.8l-1.3-2.6h10.2c.5 0 1 .3 1.2.8l1.4 2.6z" fill="#fff" />
      <path d="M16 9.2c.4.7.7 1.4.9 2H13c.3-.8.8-1.5 1.4-2.1.5-.4 1.2-.4 1.6.1z" fill="#fff" opacity="0.85" />
    </svg>
  );
}

export function NearIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className}>
      <rect width="32" height="32" rx="9" fill="#000" />
      <rect x="8" y="9" width="4.5" height="14" rx="2.2" transform="rotate(20 8 9)" fill="#fff" />
      <rect x="19.5" y="9" width="4.5" height="14" rx="2.2" transform="rotate(-20 19.5 9)" fill="#fff" />
    </svg>
  );
}

export function CosmosIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className}>
      <circle cx="16" cy="16" r="16" fill="#2E3148" />
      <circle cx="16" cy="16" r="2.6" fill="#fff" />
      <ellipse cx="16" cy="16" rx="10" ry="4" fill="none" stroke="#fff" strokeWidth="1.3" />
      <ellipse cx="16" cy="16" rx="10" ry="4" fill="none" stroke="#fff" strokeWidth="1.3" transform="rotate(60 16 16)" />
      <ellipse cx="16" cy="16" rx="10" ry="4" fill="none" stroke="#fff" strokeWidth="1.3" transform="rotate(120 16 16)" />
    </svg>
  );
}
