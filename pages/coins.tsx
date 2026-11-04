import dynamic from 'next/dynamic';

const CoinDetailsView = dynamic(() => import('../src/views/CoinDetailsView'), { ssr: false });

export default function CoinsPage() {
  return <CoinDetailsView />;
}
