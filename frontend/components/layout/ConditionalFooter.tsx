'use client';

import { usePathname } from 'next/navigation';
import { Footer } from './Footer';

export function ConditionalFooter() {
  const pathname = usePathname();

  // Не показывать Footer на странице /docs, /token и /explore
  if (pathname.startsWith('/docs') || pathname.startsWith('/token') || pathname.startsWith('/explore')) {
    return null;
  }

  return <Footer />;
}