'use client'
import * as React from 'react'
import Link from 'next/link'

// Custom X (Twitter) icon component
const XIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    fill="currentColor"
    viewBox="0 0 24 24"
    className={className}
  >
    <path d="M13.795 10.533 20.68 2h-3.073l-5.255 6.517L7.69 2H1l7.806 10.91L1.47 22h3.074l5.705-7.07L15.31 22H22l-8.205-11.467Zm-2.38 2.95L9.97 11.464 4.36 3.627h2.31l4.528 6.317 1.443 2.02 6.018 8.409h-2.31l-4.934-6.89Z"/>
  </svg>
)

// Custom Telegram icon component
const TelegramIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    className={className}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.644 11.94a0.255 0.255 0 0 0 -0.162 0.235c0 0.102 0.067 0.198 0.162 0.234l2.987 1.09 6.154 -3.177a0.154 0.154 0 0 1 0.19 0.05 0.154 0.154 0 0 1 -0.022 0.195L9.536 14.46l4.916 3.558c0.067 0.048 0.157 0.06 0.234 0.032a0.254 0.254 0 0 0 0.156 -0.177L17.3 7.536a0.254 0.254 0 0 0 -0.078 -0.246 0.254 0.254 0 0 0 -0.254 -0.046L4.644 11.94Z"
      strokeWidth="1"
    />
    <path
      stroke="currentColor"
      strokeLinejoin="round"
      d="M1.5 12a10.5 10.5 0 1 0 21 0 10.5 10.5 0 1 0 -21 0"
      strokeWidth="1"
    />
  </svg>
)
import { Vortex } from '@/components/ui/vortex'


// Footer Component
export function Footer() {
    const socialLinks = [
        { href: 'https://t.me', label: 'Telegram', icon: TelegramIcon },
        { href: 'https://x.com', label: 'X', icon: XIcon },
    ]

    return (
        <footer className="relative mt-auto">
            {/* Vortex Background */}
            <div className="relative h-80 overflow-hidden">
                <Vortex
                    className="h-full"
                    containerClassName="h-full"
                    particleCount={700}
                    baseHue={120}
                    rangeHue={60}
                    baseSpeed={0.0}
                    rangeSpeed={1.5}
                    backgroundColor="#000000"
                >
                    {/* Content Overlay */}
                    <div className="relative z-10 w-full max-w-6xl mx-auto px-6 h-full flex items-center">
                        <div className="w-full">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                                {/* Brand Column */}
                                <div className="md:col-span-1">
                                    <Link href="/" className="inline-flex items-center gap-2 mb-3 group">
                                        <span className="text-2xl font-bold tracking-tight">
                                            <span className="text-white">Fund</span>
                                            <span className="text-lime-400">If</span>
                                        </span>
                                    </Link>
                                    <p className="text-zinc-500 text-sm leading-relaxed mb-4">
                                        Prediction-gated crowdfunding on Base
                                    </p>
                                    <div className="flex gap-2">
                                        {socialLinks.map((social) => (
                                            <a
                                                key={social.label}
                                                href={social.href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 rounded-lg bg-white/5 text-zinc-500 hover:text-lime-400 hover:bg-white/10 transition-all"
                                                aria-label={social.label}
                                            >
                                                <social.icon className="w-4 h-4" />
                                            </a>
                                        ))}
                                    </div>
                                </div>

                                {/* Platform Links */}
                                <div>
                                    <h4 className="text-white text-sm font-semibold mb-3">Platform</h4>
                                    <nav className="flex flex-col gap-2">
                                        <Link href="/" className="text-zinc-500 hover:text-lime-400 text-sm transition-colors">
                                            Home
                                        </Link>
                                        <Link href="/explore" className="text-zinc-500 hover:text-lime-400 text-sm transition-colors">
                                            Explore
                                        </Link>
                                        <Link href="/create" className="text-zinc-500 hover:text-lime-400 text-sm transition-colors">
                                            Create
                                        </Link>
                                    </nav>
                                </div>

                                {/* Resources Links */}
                                <div>
                                    <h4 className="text-white text-sm font-semibold mb-3">Resources</h4>
                                    <nav className="flex flex-col gap-2">
                                        <Link href="/docs" className="text-zinc-500 hover:text-lime-400 text-sm transition-colors">
                                            Documentation
                                        </Link>
                                        <Link href="/whitepaper" className="text-zinc-500 hover:text-lime-400 text-sm transition-colors">
                                            Whitepaper
                                        </Link>
                                        <Link href="/token" className="text-zinc-500 hover:text-lime-400 text-sm transition-colors">
                                            Token
                                        </Link>
                                    </nav>
                                </div>

                                {/* Community Links */}
                                <div>
                                    <h4 className="text-white text-sm font-semibold mb-3">Community</h4>
                                    <nav className="flex flex-col gap-2">
                                        <a href="https://t.me" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-lime-400 text-sm transition-colors">
                                            Telegram
                                        </a>
                                        <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-lime-400 text-sm transition-colors">
                                            X (Twitter)
                                        </a>
                                    </nav>
                                </div>
                            </div>

                            {/* Bottom Bar */}
                            <div className="pt-6 border-t border-white/5">
                                <p className="text-zinc-600 text-xs text-center">
                                    © 2025 FundIf. All rights reserved.
                                </p>
                            </div>
                        </div>
                    </div>
                </Vortex>
            </div>
        </footer>
    )
}

