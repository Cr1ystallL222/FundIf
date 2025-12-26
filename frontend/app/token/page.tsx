'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { BeamsBackground } from '@/components/ui/beams-background'

const Badge = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-mono bg-white/5 border border-white/10 text-zinc-300">
    {children}
  </span>
)

const GlassCard = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl bg-black/40 border border-white/10 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_0_60px_rgba(255,255,255,0.05)]">
    {children}
  </div>
)

const Kpi = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4">
    <div className="text-[11px] uppercase tracking-widest text-zinc-500 font-mono">{label}</div>
    <div className="mt-2 text-base md:text-lg font-semibold text-white">{value}</div>
  </div>
)

const SectionHeader = ({ kicker, title, desc }: { kicker: string; title: string; desc: string }) => (
  <div className="text-center mb-10">
    <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
      <Badge>{kicker}</Badge>
      <Badge>NO REAL NUMBERS</Badge>
    </div>
    <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">{title}</h2>
    <p className="text-zinc-400 max-w-3xl mx-auto">{desc}</p>
  </div>
)

const ListItem = ({ title, desc }: { title: string; desc: string }) => (
  <div className="flex gap-4">
    <div className="mt-1.5 w-2.5 h-2.5 rounded-full bg-[#bef264] shadow-[0_0_14px_rgba(190,242,100,0.35)] shrink-0" />
    <div>
      <div className="text-sm font-semibold text-white">{title}</div>
      <div className="text-sm text-zinc-400 leading-relaxed mt-1">{desc}</div>
    </div>
  </div>
)

export default function TokenPage() {
  return (
    <BeamsBackground className="text-zinc-300 font-sans">
      <div className="relative z-10">
        <section className="relative px-6 pt-10 pb-12">
          <div className="max-w-6xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
                <Badge>FUNDIF_TOKEN</Badge>
                <Badge>CONCEPT UI</Badge>
                <Badge>ILLUSTRATIVE</Badge>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                <div className="lg:col-span-7">
                  <div className="relative">
                    <div className="absolute -inset-8 blur-3xl opacity-30 bg-gradient-to-r from-[#bef264]/20 via-white/10 to-blue-400/10" />
                    <div className="relative">
                      <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4">
                        <span className="text-white">$FUND</span>
                        <span className="text-[#bef264]">IF</span>
                      </h1>
                      <p className="text-lg md:text-xl text-zinc-400 leading-relaxed max-w-2xl">
                        $FUNDIF aligns incentives across FundIf’s ecosystem. It powers curation, reputation, and optional governance — while keeping core escrow logic immutable.
                        This page describes the token’s intended role. Final parameters are not shown.
                      </p>

                      <div className="mt-6 flex items-center gap-3">
                        <div className="flex-1 rounded-xl bg-black/40 border border-white/10 backdrop-blur-xl p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1">Contract Address</div>
                              <div className="text-sm font-mono text-zinc-300">AvfcPZqeGL21bVugrknQDuqP85Ejt7PdFs6bsuNKpump</div>
                            </div>
                            <button 
                              className="p-2 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                              onClick={() => navigator.clipboard.writeText('AvfcPZqeGL21bVugrknQDuqP85Ejt7PdFs6bsuNKpump')}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 flex items-center gap-3 flex-wrap">
                        <Link href="/explore" className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/[0.14] border border-white/10 text-white transition-colors">
                          Explore Campaigns
                        </Link>
                        <Link href="/whitepaper" className="px-5 py-3 rounded-xl bg-transparent hover:bg-white/[0.06] border border-white/10 text-zinc-200 transition-colors">
                          Whitepaper
                        </Link>
                        <Link href="/docs" className="px-5 py-3 rounded-xl bg-transparent hover:bg-white/[0.06] border border-white/10 text-zinc-200 transition-colors">
                          Docs
                        </Link>
                      </div>

                      <div className="mt-10 flex items-center justify-start gap-2 flex-wrap">
                        <a href="#overview" className="text-xs font-mono text-zinc-400 hover:text-white transition-colors">#overview</a>
                        <span className="text-xs text-zinc-700">/</span>
                        <a href="#utility" className="text-xs font-mono text-zinc-400 hover:text-white transition-colors">#utility</a>
                        <span className="text-xs text-zinc-700">/</span>
                        <a href="#lifecycle" className="text-xs font-mono text-zinc-400 hover:text-white transition-colors">#lifecycle</a>
                        <span className="text-xs text-zinc-700">/</span>
                        <a href="#faq" className="text-xs font-mono text-zinc-400 hover:text-white transition-colors">#faq</a>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5">
                  <GlassCard>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-5">
                        <div>
                          <div className="text-sm font-semibold text-white">$FUNDIF Token</div>
                          <div className="text-sm text-zinc-400 mt-1">Ecosystem governance and utility token</div>
                        </div>
                        <Badge>PREVIEW</Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Kpi label="Token Type" value="Utility" />
                        <Kpi label="Holders" value="Community" />
                        <Kpi label="Use Case" value="Governance" />
                        <Kpi label="Phase" value="Development" />
                      </div>

                      <div className="mt-6 rounded-xl bg-white/[0.03] border border-white/10 p-4">
                        <div className="text-[11px] uppercase tracking-widest text-zinc-500 font-mono">Notes</div>
                        <div className="text-sm text-zinc-400 leading-relaxed mt-2">
                          $FUNDIF enables decentralized governance and ecosystem utilities. Token specifications and allocation details will be released with the official protocol launch.
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="overview" className="px-6 pb-20">
          <div className="max-w-6xl mx-auto">
            <SectionHeader
              kicker="OVERVIEW"
              title="Purpose and Scope"
              desc="$FUNDIF is designed to improve coordination without compromising security or escrow integrity."
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <GlassCard>
                <div className="p-6">
                  <div className="text-sm font-semibold text-white">Economic Coordination</div>
                  <div className="text-sm text-zinc-400 leading-relaxed mt-2">
                    Aligns incentives between backers, creators, and market participants. Encourages truthful outcomes and reduces friction.
                  </div>
                </div>
              </GlassCard>

              <GlassCard>
                <div className="p-6">
                  <div className="text-sm font-semibold text-white">Utility-First Design</div>
                  <div className="text-sm text-zinc-400 leading-relaxed mt-2">
                    Powers optional modules: campaign curation, creator reputation, and non-critical governance. Core escrow remains token-agnostic.
                  </div>
                </div>
              </GlassCard>

              <GlassCard>
                <div className="p-6">
                  <div className="text-sm font-semibold text-white">Risk Management</div>
                  <div className="text-sm text-zinc-400 leading-relaxed mt-2">
                    Provides throttling and safety mechanisms to limit spam and protect new participants. Does not control escrow funds.
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>
        </section>

        <section id="utility" className="px-6 pb-20">
          <div className="max-w-6xl mx-auto">
            <SectionHeader
              kicker="UTILITY"
              title="Key Use Cases"
              desc="$FUNDIF enables specific coordination tools while keeping core protocol functions independent."
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7">
                <GlassCard>
                  <div className="p-6 space-y-6">
                    <ListItem
                      title="Campaign Curation"
                      desc="Stake tokens to signal campaign quality. Higher signals increase visibility. Signals decay over time to ensure fresh relevance."
                    />
                    <ListItem
                      title="Safety Controls"
                      desc="Rate limiting and anti-spam mechanisms scale with token holdings. New participants start with conservative limits that relax over time."
                    />
                    <ListItem
                      title="Creator Reputation"
                      desc="Track creator history across campaigns. Reputation improves access to features and reduces throttling limits for trusted creators."
                    />
                    <ListItem
                      title="Optional Governance"
                      desc="Vote on non-protocol-critical parameters: fee structures, curation rules, and safety thresholds. Core escrow logic remains unchanged."
                    />
                  </div>
                </GlassCard>
              </div>

              <div className="lg:col-span-5">
                <GlassCard>
                  <div className="p-6">
                    <div className="text-sm font-semibold text-white">Tokenomics Overview</div>
                    <div className="text-sm text-zinc-400 leading-relaxed mt-2">
                      The tokenomics structure is designed for long-term alignment. Exact numbers are not displayed in this UI.
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-4">
                      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                        <div className="text-[11px] uppercase tracking-widest text-zinc-500 font-mono">Distribution</div>
                        <div className="mt-2 text-sm text-zinc-400">Community, ecosystem, and strategic reserves with vesting</div>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                        <div className="text-[11px] uppercase tracking-widest text-zinc-500 font-mono">Emissions</div>
                        <div className="mt-2 text-sm text-zinc-400">Controlled release tied to platform growth and utility usage</div>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                        <div className="text-[11px] uppercase tracking-widest text-zinc-500 font-mono">Vesting</div>
                        <div className="mt-2 text-sm text-zinc-400">Long-term vesting for team and investors to align incentives</div>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </div>
          </div>
        </section>

        <section id="lifecycle" className="px-6 pb-20">
          <div className="max-w-6xl mx-auto">
            <SectionHeader
              kicker="LIFECYCLE"
              title="Integration Flow"
              desc="$FUNDIF plugs into FundIf at specific coordination points without interfering with core escrow."
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <GlassCard>
                <div className="p-6">
                  <div className="text-sm font-semibold text-white">01. Token Acquisition</div>
                  <div className="text-sm text-zinc-400 mt-2 leading-relaxed">
                    Tokens are distributed through ecosystem programs, early participation, and public liquidity provision. Exact methods are defined in the tokenomics.
                  </div>
                </div>
              </GlassCard>
              <GlassCard>
                <div className="p-6">
                  <div className="text-sm font-semibold text-white">02. Utility Usage</div>
                  <div className="text-sm text-zinc-400 mt-2 leading-relaxed">
                    Stake tokens for campaign curation, participate in governance votes, and build reputation through consistent platform engagement.
                  </div>
                </div>
              </GlassCard>
              <GlassCard>
                <div className="p-6">
                  <div className="text-sm font-semibold text-white">03. Network Safety</div>
                  <div className="text-sm text-zinc-400 mt-2 leading-relaxed">
                    Token-based throttling and reputation systems reduce spam while protecting genuine participants. Safety parameters adjust based on network maturity.
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>
        </section>

        <section id="faq" className="px-6 pb-24">
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              kicker="FAQ"
              title="Common Questions"
              desc="Clear answers about $FUNDIF's role and limitations."
            />

            <div className="space-y-4">
              <details className="group rounded-2xl bg-black/40 border border-white/10 backdrop-blur-xl p-5">
                <summary className="cursor-pointer list-none flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">Is $FUNDIF required to use FundIf?</span>
                  <span className="text-xs font-mono text-zinc-500 group-open:text-zinc-300">toggle</span>
                </summary>
                <div className="mt-3 text-sm text-zinc-400 leading-relaxed">
                  No. Core FundIf features — creating campaigns, funding, and refunds — work without $FUNDIF. The token only enables optional coordination features.
                </div>
              </details>

              <details className="group rounded-2xl bg-black/40 border border-white/10 backdrop-blur-xl p-5">
                <summary className="cursor-pointer list-none flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">Does $FUNDIF control user funds?</span>
                  <span className="text-xs font-mono text-zinc-500 group-open:text-zinc-300">toggle</span>
                </summary>
                <div className="mt-3 text-sm text-zinc-400 leading-relaxed">
                  No. $FUNDIF never controls escrow funds: it is used for curation, reputation, and governance only. All funds remain in the core escrow contracts.
                </div>
              </details>

              <details className="group rounded-2xl bg-black/40 border border-white/10 backdrop-blur-xl p-5">
                <summary className="cursor-pointer list-none flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">What happens if I don't hold tokens?</span>
                  <span className="text-xs font-mono text-zinc-500 group-open:text-zinc-300">toggle</span>
                </summary>
                <div className="mt-3 text-sm text-zinc-400 leading-relaxed">
                  You can still use all core FundIf features. Token holders get additional capabilities like enhanced curation influence and governance voting rights.
                </div>
              </details>
            </div>

            <div className="mt-10 text-center">
              <p className="text-xs text-zinc-500 leading-relaxed">
                This page describes the intended token design. Final implementation details may differ.
              </p>
            </div>
          </div>
        </section>
      </div>
    </BeamsBackground>
  )
}
