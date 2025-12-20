'use client';

import { usePathname } from 'next/navigation';
import { Footer } from './Footer';

export function ConditionalFooter() {
  const pathname = usePathname();

  // Не показывать Footer на странице /docs
  if (pathname.startsWith('/docs')) {
    return null;
  }

  return <Footer />;
}