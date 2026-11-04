import dynamic from 'next/dynamic';

const OverviewView = dynamic(() => import('../src/views/OverviewView'), { ssr: false });

export default function OverviewPage() {
  return <OverviewView />;
}
