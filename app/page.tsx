
'use client';

import dynamic from 'next/dynamic';

// 禁用 SSR 以处理客户端独有的 IndexedDB 和 DOM 依赖
const App = dynamic(() => import('../App'), { ssr: false });

export default function Home() {
  return (
    <main className="h-screen w-full">
      <App />
    </main>
  );
}
