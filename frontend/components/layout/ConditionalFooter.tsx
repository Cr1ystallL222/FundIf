'use client';

import { usePathname } from 'next/navigation';
import { Footer } from './Footer';

export function ConditionalFooter() {
  const pathname = usePathname();

  // Не показывать Footer на странице /docs, /token, /explore, /create и /whitepaper
  if (pathname.startsWith('/docs') || pathname.startsWith('/token') || pathname.startsWith('/explore') || pathname.startsWith('/create') || pathname.startsWith('/whitepaper')) {
    return null;
  }

  return <Footer />;
}