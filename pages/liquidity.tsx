import dynamic from 'next/dynamic';

const LiquidityView = dynamic(() => import('../src/views/LiquidityView'), { ssr: false });

export default function LiquidityPage() {
  return <LiquidityView />;
}
