import dynamic from 'next/dynamic';

const LandingTradingView = dynamic(
  () => import('../src/views/landing/LandingTradingView'),
  { ssr: false }
);

export default function TradingPage() {
  return <LandingTradingView />;
}
