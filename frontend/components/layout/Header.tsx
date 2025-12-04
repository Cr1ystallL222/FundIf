// components/layout/Header.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAccount } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import { ConnectButton } from '@/components/wallet/ConnectButton';

interface NavLink {
  href: string;
  label: string;
  icon?: string;
  authRequired?: boolean;
}

const navLinks: NavLink[] = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/explore', label: 'Explore', icon: '🔍' },
  { href: '/create', label: 'Create', icon: '✨' },
  { href: '/profile', label: 'Dashboard', icon: '👤', authRequired: true },
];

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { isConnected } = useAccount();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Filter nav links based on auth state
  const visibleLinks = navLinks.filter(
    (link) => !link.authRequired || isConnected
  );

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const isActiveLink = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-surface/80 backdrop-blur-xl border-b border-border shadow-lg shadow-background/50'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 flex-shrink-0 group"
            onClick={closeMobileMenu}
          >
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Logo Glow */}
              <div className="absolute -inset-2 bg-gradient-to-r from-primary via-secondary to-primary rounded-full opacity-0 group-hover:opacity-50 blur-lg transition-opacity duration-500" />
              
              {/* Logo Icon */}
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-white font-bold text-lg">F</span>
              </div>
            </motion.div>
            
            <span className="text-xl md:text-2xl font-bold">
              <span className="bg-gradient-to-r from-primary via-purple-400 to-secondary bg-clip-text text-transparent">
                Fund
              </span>
              <span className="text-text-main">If</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {visibleLinks.map((link) => {
              const isActive = isActiveLink(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative px-4 py-2 rounded-lg group"
                >
                  {/* Active/Hover Background */}
                  <motion.div
                    className={`absolute inset-0 rounded-lg transition-colors duration-200 ${
                      isActive
                        ? 'bg-primary/20'
                        : 'bg-transparent group-hover:bg-border/50'
                    }`}
                    layoutId="nav-highlight"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                  
                  {/* Link Content */}
                  <span
                    className={`relative flex items-center gap-2 font-medium transition-colors duration-200 ${
                      isActive
                        ? 'text-primary'
                        : 'text-text-muted group-hover:text-text-main'
                    }`}
                  >
                    <span className="text-sm">{link.icon}</span>
                    {link.label}
                  </span>
                  
                  {/* Active Indicator */}
                  {isActive && (
                    <motion.div
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                      layoutId="active-dot"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Connect Button */}
          <div className="hidden md:flex items-center gap-4">
            {/* Wallet Status Indicator for Connected Users */}
            {isConnected && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/20 border border-secondary/30"
              >
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                <span className="text-xs font-medium text-secondary">Connected</span>
              </motion.div>
            )}
            <ConnectButton />
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            type="button"
            className="md:hidden relative p-2 rounded-xl bg-surface/50 border border-border text-text-muted hover:text-text-main hover:bg-surface transition-colors duration-200"
            onClick={toggleMobileMenu}
            whileTap={{ scale: 0.95 }}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            <div className="w-6 h-6 flex flex-col justify-center items-center gap-1.5">
              <motion.span
                className="w-5 h-0.5 bg-current rounded-full"
                animate={{
                  rotate: isMobileMenuOpen ? 45 : 0,
                  y: isMobileMenuOpen ? 4 : 0,
                }}
                transition={{ duration: 0.2 }}
              />
              <motion.span
                className="w-5 h-0.5 bg-current rounded-full"
                animate={{
                  opacity: isMobileMenuOpen ? 0 : 1,
                  scaleX: isMobileMenuOpen ? 0 : 1,
                }}
                transition={{ duration: 0.2 }}
              />
              <motion.span
                className="w-5 h-0.5 bg-current rounded-full"
                animate={{
                  rotate: isMobileMenuOpen ? -45 : 0,
                  y: isMobileMenuOpen ? -4 : 0,
                }}
                transition={{ duration: 0.2 }}
              />
            </div>
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-background/80 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobileMenu}
              style={{ top: '64px' }}
            />

            {/* Menu Panel */}
            <motion.div
              id="mobile-menu"
              className="absolute top-full left-0 right-0 md:hidden bg-surface/95 backdrop-blur-xl border-b border-border shadow-2xl"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: 'spring', bounce: 0.25, duration: 0.4 }}
            >
              <nav className="px-4 py-4 space-y-1">
                {visibleLinks.map((link, index) => {
                  const isActive = isActiveLink(link.href);
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        href={link.href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                          isActive
                            ? 'bg-primary/20 text-primary'
                            : 'text-text-muted hover:text-text-main hover:bg-border/50'
                        }`}
                        onClick={closeMobileMenu}
                      >
                        <span className="text-lg">{link.icon}</span>
                        <span>{link.label}</span>
                        {isActive && (
                          <motion.span
                            className="ml-auto w-2 h-2 rounded-full bg-primary"
                            layoutId="mobile-active-dot"
                          />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}

                {/* Mobile Connect Button */}
                <motion.div
                  className="pt-4 mt-4 border-t border-border"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {isConnected && (
                    <div className="flex items-center gap-2 px-4 py-2 mb-3 rounded-lg bg-secondary/10">
                      <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                      <span className="text-sm text-secondary">Wallet Connected</span>
                    </div>
                  )}
                  <div className="px-1">
                    <ConnectButton />
                  </div>
                </motion.div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Header;