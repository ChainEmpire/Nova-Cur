import { useMemo } from "react";

interface SparklineProps {
  
  seed: string;
  positive: boolean;
  className?: string;
}


export default function Sparkline({ seed, positive, className = "h-8 w-24" }: SparklineProps) {
  const points = useMemo(() => {
    let s = 0;
    for (const ch of seed) s = (s * 31 + ch.charCodeAt(0)) % 9973;
    const rand = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
    const pts: number[] = [];
    let y = 24 + rand() * 8;
    const drift = positive ? -0.55 : 0.55;
    for (let i = 0; i < 28; i++) {
      y += (rand() - 0.5) * 8 + drift;
      y = Math.max(4, Math.min(36, y));
      pts.push(y);
    }
    return pts.map((v, i) => `${(i * 100) / 27},${v}`).join(" ");
  }, [seed, positive]);

  const color = positive ? "#10b981" : "#fb7185";

  return (
    <svg viewBox="0 0 100 40" className={className} aria-hidden preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      />
    </svg>
  );
}
