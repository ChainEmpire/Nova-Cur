import dynamic from 'next/dynamic';

const NFTView = dynamic(() => import('../src/views/NFTView'), { ssr: false });

export default function NFTPage() {
  return <NFTView />;
}
