import dynamic from 'next/dynamic';

const BlogView = dynamic(() => import('../src/views/BlogView'), { ssr: false });

export default function BlogPage() {
  return <BlogView />;
}
