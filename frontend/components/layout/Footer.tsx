'use client'
import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'

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
import { FloatingPaths } from '@/components/ui/background-paths'


// Footer Component
export function Footer() {
    const pathname = usePathname()

    const footerLinks = [
        { href: '/', label: 'Home', desc: 'Landing Page' },
        { href: '/explore', label: 'Explore', desc: 'Prediction Markets' },
        { href: '/create', label: 'Create', desc: 'New Campaign' },
    ]

    const socialLinks = [
        { href: 'https://t.me', label: 'Telegram', icon: TelegramIcon },
        { href: 'https://x.com', label: 'X', icon: XIcon },
    ]

    return (
        <footer className="relative mt-auto">
            {/* Background Paths */}
            <div className="relative h-80 overflow-hidden bg-black">
                <div className="absolute inset-0">
                    <FloatingPaths position={1} />
                    <FloatingPaths position={-1} />
                </div>

                {/* Content Overlay */}
                <div className="relative z-10 flex flex-col items-center justify-center h-full px-6">
                    {/* Brand */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="text-center mb-8"
                    >
                        <Link href="/" className="inline-block group">
                            <span className="text-4xl md:text-5xl font-bold tracking-tight font-display">
                                <span className="text-white">Fund</span>
                                <span className="text-[#bef264]">If</span>
                            </span>
                        </Link>
                        <p className="text-zinc-400 text-sm mt-2 max-w-md mx-auto">
                            Prediction-gated crowdfunding platform built on Base Sepolia
                        </p>
                    </motion.div>

                    {/* Navigation Links */}
                    <motion.nav
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="flex flex-wrap justify-center gap-6 mb-8"
                    >
                        {footerLinks.map((link) => {
                            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))

                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                                        isActive
                                            ? 'text-white bg-white/10 border border-white/20'
                                            : 'text-zinc-400 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    {link.label}
                                </Link>
                            )
                        })}
                    </motion.nav>

                    {/* Social Links */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        viewport={{ once: true }}
                        className="flex gap-4 mb-8"
                    >
                        {socialLinks.map((social) => (
                            <motion.a
                                key={social.label}
                                href={social.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className="p-3 rounded-full bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
                                aria-label={social.label}
                            >
                                <social.icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                            </motion.a>
                        ))}
                    </motion.div>

                    {/* Bottom Text */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        viewport={{ once: true }}
                        className="text-center"
                    >
                        <p className="text-zinc-500 text-xs">
                            © 2025 FundIf. Built with ❤️ on Base Sepolia.
                        </p>
                    </motion.div>
                </div>
            </div>
        </footer>
    )
}
