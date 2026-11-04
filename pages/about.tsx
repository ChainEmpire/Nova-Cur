import dynamic from 'next/dynamic';

const LandingAboutView = dynamic(
  () => import('../src/views/landing/LandingAboutView'),
  { ssr: false }
);

export default function AboutPage() {
  return <LandingAboutView />;
}
