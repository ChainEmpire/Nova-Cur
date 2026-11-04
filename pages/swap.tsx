import dynamic from 'next/dynamic';

const SwapView = dynamic(() => import('../src/views/SwapView'), { ssr: false });

export default function SwapPage() {
  return <SwapView />;
}
