'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { FloatingPaths } from '@/components/ui/background-paths'

// ============================================================================
// ICON COMPONENTS
// ============================================================================

const Book = ({ size = 18, className = "" }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
)

const Code = ({ size = 18, className = "" }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
)

const Shield = ({ size = 18, className = "" }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)

const Cpu = ({ size = 18, className = "" }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
    <rect x="9" y="9" width="6" height="6" />
    <line x1="9" y1="1" x2="9" y2="4" />
    <line x1="15" y1="1" x2="15" y2="4" />
    <line x1="9" y1="20" x2="9" y2="23" />
    <line x1="15" y1="20" x2="15" y2="23" />
    <line x1="20" y1="9" x2="23" y2="9" />
    <line x1="20" y1="15" x2="23" y2="15" />
    <line x1="1" y1="9" x2="4" y2="9" />
    <line x1="1" y1="15" x2="4" y2="15" />
  </svg>
)

const Layers = ({ size = 18, className = "" }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
)

const Check = ({ size = 14, className = "" }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const ExternalLink = ({ size = 12, className = "" }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
)

const Copy = ({ size = 14, className = "" }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
)

// ============================================================================
// REUSABLE COMPONENTS
// ============================================================================

const DocSection = ({ title, children, id }: { title: string; children: React.ReactNode; id: string }) => (
  <div id={id} className="mb-16 scroll-mt-24">
    <h2 className="text-3xl font-bold text-white mb-6 border-b border-zinc-800 pb-2">{title}</h2>
    <div className="text-zinc-400 leading-relaxed space-y-4">
      {children}
    </div>
  </div>
)

const SubHeading = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-xl font-semibold text-zinc-200 mt-8 mb-4 flex items-center">
    <span className="w-1.5 h-6 bg-green-500 rounded-full mr-3 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
    {children}
  </h3>
)

const CodeBlock = ({ code, language = "solidity" }: { code: string; language?: string }) => {
  const [copied, setCopied] = React.useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="my-6 rounded-lg overflow-hidden bg-black shadow-lg border border-zinc-800 group">
      <div className="flex justify-between items-center px-4 py-2 bg-zinc-900 border-b border-zinc-800">
        <span className="text-xs font-mono text-zinc-500 uppercase group-hover:text-green-400 transition-colors">{language}</span>
        <button
          onClick={copyToClipboard}
          className="text-zinc-500 hover:text-green-400 transition-colors p-1"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
      <div className="p-4 overflow-x-auto">
        <pre className="text-sm font-mono text-zinc-300">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  )
}

const Note = ({ type = "info", children }: { type?: "info" | "warning" | "success"; children: React.ReactNode }) => {
  const styles = {
    info: "bg-blue-950/30 border-blue-500/50 text-blue-200",
    warning: "bg-amber-950/30 border-amber-500/50 text-amber-200",
    success: "bg-green-950/30 border-green-500/50 text-green-200"
  }

  return (
    <div className={`p-4 rounded-md border-l-4 my-6 ${styles[type]}`}>
      <div className="flex gap-3">
        <div className="shrink-0 pt-0.5 opacity-80">
          {type === 'info' && <Book size={18} />}
          {type === 'warning' && <Shield size={18} />}
          {type === 'success' && <Check size={18} />}
        </div>
        <div className="text-sm">{children}</div>
      </div>
    </div>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function FundIfWhitepaper() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0">
          <FloatingPaths position={1} />
          <FloatingPaths position={-1} />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
                <span className="text-white">Fund</span>
                <span className="text-[#bef264]">If</span>
              </h1>
              <p className="text-xl text-zinc-400 mb-8 max-w-2xl mx-auto">
                Whitepaper
              </p>
              <div className="text-sm text-zinc-500 mb-12">
                Version 1.0 • December 2025
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-3xl mx-auto text-lg text-zinc-300 leading-relaxed"
            >
              <p className="mb-6">
                FundIf represents a paradigm shift in crowdfunding, introducing conditional funding where success depends on verifiable real-world outcomes rather than promises or timelines.
              </p>
              <p>
                By leveraging blockchain technology, decentralized oracles, and prediction markets, FundIf creates a trustless environment where funding decisions are objective, transparent, and economically efficient.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Table of Contents */}
        <section className="px-6 py-16">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-white mb-8 text-center">Table of Contents</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <a href="#abstract" className="block p-3 rounded-lg border border-zinc-800 hover:border-green-500/30 transition-colors group">
                    <span className="text-green-400 font-mono text-sm">1.</span>
                    <span className="text-zinc-300 group-hover:text-white transition-colors ml-2">Abstract</span>
                  </a>
                  <a href="#problem" className="block p-3 rounded-lg border border-zinc-800 hover:border-green-500/30 transition-colors group">
                    <span className="text-green-400 font-mono text-sm">2.</span>
                    <span className="text-zinc-300 group-hover:text-white transition-colors ml-2">Problem Statement</span>
                  </a>
                  <a href="#solution" className="block p-3 rounded-lg border border-zinc-800 hover:border-green-500/30 transition-colors group">
                    <span className="text-green-400 font-mono text-sm">3.</span>
                    <span className="text-zinc-300 group-hover:text-white transition-colors ml-2">Solution Overview</span>
                  </a>
                  <a href="#architecture" className="block p-3 rounded-lg border border-zinc-800 hover:border-green-500/30 transition-colors group">
                    <span className="text-green-400 font-mono text-sm">4.</span>
                    <span className="text-zinc-300 group-hover:text-white transition-colors ml-2">Technical Architecture</span>
                  </a>
                </div>
                <div className="space-y-2">
                  <a href="#economics" className="block p-3 rounded-lg border border-zinc-800 hover:border-green-500/30 transition-colors group">
                    <span className="text-green-400 font-mono text-sm">5.</span>
                    <span className="text-zinc-300 group-hover:text-white transition-colors ml-2">Economic Model</span>
                  </a>
                  <a href="#security" className="block p-3 rounded-lg border border-zinc-800 hover:border-green-500/30 transition-colors group">
                    <span className="text-green-400 font-mono text-sm">6.</span>
                    <span className="text-zinc-300 group-hover:text-white transition-colors ml-2">Security & Audits</span>
                  </a>
                  <a href="#roadmap" className="block p-3 rounded-lg border border-zinc-800 hover:border-green-500/30 transition-colors group">
                    <span className="text-green-400 font-mono text-sm">7.</span>
                    <span className="text-zinc-300 group-hover:text-white transition-colors ml-2">Roadmap</span>
                  </a>
                  <a href="#conclusion" className="block p-3 rounded-lg border border-zinc-800 hover:border-green-500/30 transition-colors group">
                    <span className="text-green-400 font-mono text-sm">8.</span>
                    <span className="text-zinc-300 group-hover:text-white transition-colors ml-2">Conclusion</span>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Main Content */}
        <main className="px-6 pb-24">
          <div className="max-w-4xl mx-auto">

            {/* Abstract */}
            <DocSection title="1. Abstract" id="abstract">
              <p>
                FundIf is a decentralized crowdfunding protocol that introduces conditional funding mechanisms, where campaign success is determined by objective, verifiable real-world outcomes rather than traditional subjective criteria. By integrating blockchain technology with decentralized oracles and prediction markets, FundIf eliminates the trust problems inherent in traditional crowdfunding platforms.
              </p>

              <p>
                The protocol enables creators to define specific conditions for funding success, such as "Will our product reach 10,000 users within 6 months?" or "Will we secure FDA approval by Q1 2026?" Backers contribute stablecoins (USDC) to a smart contract escrow, which automatically releases funds only when oracle-verified outcomes confirm the predefined conditions have been met.
              </p>

              <p>
                FundIf operates on the Base network, utilizing Aave's lending protocol for yield generation on escrowed funds, creating an economically efficient system where locked capital generates returns until campaign resolution.
              </p>
            </DocSection>

            {/* Problem Statement */}
            <DocSection title="2. Problem Statement" id="problem">
              <p>
                Traditional crowdfunding platforms suffer from fundamental trust and incentive misalignment issues:
              </p>

              <SubHeading>The Trust Problem</SubHeading>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
                  <h4 className="text-red-400 font-bold mb-2">Creator Risk</h4>
                  <p className="text-sm text-zinc-400">
                    Creators often fail to deliver on promises, leading to project abandonment and backer losses. According to research, approximately 9% of Kickstarter projects never deliver their rewards.
                  </p>
                </div>
                <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
                  <h4 className="text-red-400 font-bold mb-2">Backer Risk</h4>
                  <p className="text-sm text-zinc-400">
                    Backers have no objective way to assess project viability. Success depends on subjective factors like marketing, creator reputation, and timing rather than measurable outcomes.
                  </p>
                </div>
              </div>

              <SubHeading>Economic Inefficiencies</SubHeading>
              <ul className="list-disc pl-6 space-y-2 marker:text-red-500 text-zinc-400">
                <li><strong className="text-zinc-200">Opportunity Cost:</strong> Funds are locked in traditional platforms without generating returns</li>
                <li><strong className="text-zinc-200">Platform Dependency:</strong> Centralized platforms can censor campaigns or change terms unilaterally</li>
                <li><strong className="text-zinc-200">Information Asymmetry:</strong> Backers lack access to objective success metrics and project health indicators</li>
                <li><strong className="text-zinc-200">Timing Risks:</strong> Campaigns fail due to poor timing rather than lack of merit</li>
              </ul>

              <SubHeading>Current Solutions Fall Short</SubHeading>
              <p>
                Existing attempts to solve these problems include:
              </p>
              <div className="space-y-4">
                <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
                  <h4 className="text-amber-400 font-bold mb-2">Traditional Crowdfunding (Kickstarter, Indiegogo)</h4>
                  <p className="text-sm text-zinc-400">
                    Relies on "all-or-nothing" funding but still depends on subjective success criteria and platform trust.
                  </p>
                </div>
                <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
                  <h4 className="text-amber-400 font-bold mb-2">DAO-based Funding</h4>
                  <p className="text-sm text-zinc-400">
                    While decentralized, these systems still rely on governance token voting rather than objective outcomes.
                  </p>
                </div>
                <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
                  <h4 className="text-amber-400 font-bold mb-2">Prediction Market Funding</h4>
                  <p className="text-sm text-zinc-400">
                    Limited to specific use cases and lack the crowdfunding mechanics needed for project funding.
                  </p>
                </div>
              </div>
            </DocSection>

            {/* Solution Overview */}
            <DocSection title="3. Solution Overview" id="solution">
              <p>
                FundIf introduces Conditional Funding - a novel approach that ties crowdfunding success to objective, verifiable outcomes through decentralized infrastructure.
              </p>

              <SubHeading>Core Innovation: Conditional Funding</SubHeading>
              <div className="bg-black p-6 rounded-lg border border-zinc-800 mb-6 font-mono text-sm text-green-400">
                <pre>{`Traditional Crowdfunding:
Project Success = f(subjective_criteria)

FundIf Conditional Funding:
Project Success = f(objective_outcome_verification)`}</pre>
              </div>

              <SubHeading>How FundIf Works</SubHeading>
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-zinc-900 rounded-lg border border-zinc-800">
                  <div className="text-2xl mb-2">🎯</div>
                  <h4 className="text-green-400 font-bold text-sm mb-2">Define</h4>
                  <p className="text-xs text-zinc-500">Creator sets objective success condition</p>
                </div>
                <div className="text-center p-4 bg-zinc-900 rounded-lg border border-zinc-800">
                  <div className="text-2xl mb-2">💰</div>
                  <h4 className="text-green-400 font-bold text-sm mb-2">Fund</h4>
                  <p className="text-xs text-zinc-500">Backers contribute to smart contract escrow</p>
                </div>
                <div className="text-center p-4 bg-zinc-900 rounded-lg border border-zinc-800">
                  <div className="text-2xl mb-2">🔮</div>
                  <h4 className="text-green-400 font-bold text-sm mb-2">Verify</h4>
                  <p className="text-xs text-zinc-500">Oracle resolves the outcome objectively</p>
                </div>
                <div className="text-center p-4 bg-zinc-900 rounded-lg border border-zinc-800">
                  <div className="text-2xl mb-2">✨</div>
                  <h4 className="text-green-400 font-bold text-sm mb-2">Execute</h4>
                  <p className="text-xs text-zinc-500">Success = funds released, Fail = automatic refunds</p>
                </div>
              </div>

              <SubHeading>Key Advantages</SubHeading>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
                    <h4 className="text-green-400 font-bold mb-2 flex items-center">
                      <Shield className="mr-2" size={16} />
                      Trustless Architecture
                    </h4>
                    <p className="text-sm text-zinc-400">No centralized control - everything governed by immutable smart contracts</p>
                  </div>
                  <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
                    <h4 className="text-green-400 font-bold mb-2 flex items-center">
                      <Code className="mr-2" size={16} />
                      Objective Outcomes
                    </h4>
                    <p className="text-sm text-zinc-400">Success determined by verifiable real-world data, not opinions</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
                    <h4 className="text-green-400 font-bold mb-2 flex items-center">
                      <Layers className="mr-2" size={16} />
                      Economic Efficiency
                    </h4>
                    <p className="text-sm text-zinc-400">Escrowed funds generate yield, reducing opportunity costs</p>
                  </div>
                  <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
                    <h4 className="text-green-400 font-bold mb-2 flex items-center">
                      <Cpu className="mr-2" size={16} />
                      Transparent & Verifiable
                    </h4>
                    <p className="text-sm text-zinc-400">All transactions and conditions visible on-chain</p>
                  </div>
                </div>
              </div>
            </DocSection>

            {/* Technical Architecture */}
            <DocSection title="4. Technical Architecture" id="architecture">
              <p>
                FundIf's architecture is designed for maximum security, composability, and efficiency. The protocol uses a modular design that separates concerns while maintaining atomic state transitions.
              </p>

              <SubHeading>System Architecture</SubHeading>
              <div className="my-8 p-6 bg-black border border-zinc-800 rounded-lg font-mono text-sm overflow-x-auto text-green-400">
                <pre>{`FundIf Protocol Stack
├── Application Layer (Frontend)
│   ├── Wagmi/Viem (Contract Interaction)
│   ├── Coinbase Smart Wallet (Account Abstraction)
│   └── Prediction Market APIs
│
├── Protocol Layer (Smart Contracts)
│   ├── CampaignFactory (Deployment & Registry)
│   ├── Campaign (Escrow Logic & State Management)
│   └── Oracle Adapters (Outcome Verification)
│
├── Infrastructure Layer
│   ├── Base Network (L2 Settlement)
│   ├── Aave Protocol (Yield Generation)
│   └── IPFS/Arweave (Metadata Storage)
│
└── Data Verification Layer
    ├── UMA Optimistic Oracle
    ├── Polymarket Integration
    └── Chainlink Price Feeds`}</pre>
              </div>

              <SubHeading>Smart Contract Components</SubHeading>
              <div className="space-y-6">
                <div className="border border-zinc-800 bg-zinc-900 rounded-lg p-6">
                  <h4 className="text-green-400 font-bold mb-3 font-mono">CampaignFactory.sol</h4>
                  <p className="text-sm text-zinc-400 mb-4">
                    The protocol's entry point responsible for deploying campaign instances using the ERC-1167 Minimal Proxy pattern for gas efficiency.
                  </p>
                  <CodeBlock language="solidity" code={`contract CampaignFactory {
    // Core deployment function
    function createCampaign(
        address _oracle,
        bytes32 _conditionId,
        uint256 _targetAmount,
        uint256 _duration
    ) external returns (address) {
        // Deploy minimal proxy
        address campaign = Clones.clone(campaignImplementation);

        // Initialize with campaign parameters
        Campaign(campaign).initialize(
            msg.sender, _oracle, _conditionId,
            _targetAmount, _duration
        );

        return campaign;
    }
}`} />
                </div>

                <div className="border border-zinc-800 bg-zinc-900 rounded-lg p-6">
                  <h4 className="text-green-400 font-bold mb-3 font-mono">Campaign.sol (Escrow)</h4>
                  <p className="text-sm text-zinc-400 mb-4">
                    Individual campaign contracts that hold USDC in escrow, integrate with Aave for yield generation, and manage state transitions based on oracle outcomes.
                  </p>
                  <CodeBlock language="solidity" code={`contract Campaign {
    enum Status { ACTIVE, SUCCESSFUL, FAILED, CANCELLED }

    function pledge(uint256 amount) external {
        require(status == Status.ACTIVE, "Campaign not active");

        // Transfer USDC to contract
        usdc.safeTransferFrom(msg.sender, address(this), amount);

        // Deposit to Aave for yield generation
        aavePool.supply(address(usdc), amount, address(this), 0);

        // Update backer balance
        backerBalances[msg.sender] += amount;
    }

    function settle() external {
        require(block.timestamp >= deadline, "Campaign still active");
        require(status == Status.ACTIVE, "Already settled");

        // Query oracle for outcome
        bool outcome = IOracle(oracle).getResult(conditionId);

        // State transition
        status = outcome ? Status.SUCCESSFUL : Status.FAILED;
    }
}`} />
                </div>
              </div>

              <SubHeading>Oracle Integration</SubHeading>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
                  <h4 className="text-green-400 font-bold mb-2">UMA Optimistic Oracle</h4>
                  <ul className="text-sm text-zinc-400 space-y-1">
                    <li>• Decentralized truth verification</li>
                    <li>• Economic security guarantees</li>
                    <li>• Community-verified outcomes</li>
                    <li>• Cost-effective for most use cases</li>
                  </ul>
                </div>
                <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
                  <h4 className="text-green-400 font-bold mb-2">Prediction Markets</h4>
                  <ul className="text-sm text-zinc-400 space-y-1">
                    <li>• Real-time market-based pricing</li>
                    <li>• Crowd-sourced information aggregation</li>
                    <li>• Wide range of condition types</li>
                    <li>• Integration with Polymarket API</li>
                  </ul>
                </div>
              </div>
            </DocSection>

            {/* Economic Model */}
            <DocSection title="5. Economic Model" id="economics">
              <p>
                FundIf's economic model is designed to align incentives between creators, backers, and the protocol while maximizing capital efficiency.
              </p>

              <SubHeading>Fee Structure</SubHeading>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800 text-center">
                  <div className="text-2xl mb-2">📈</div>
                  <h4 className="text-green-400 font-bold text-sm mb-2">Protocol Fee</h4>
                  <p className="text-lg font-mono text-white">1.0%</p>
                  <p className="text-xs text-zinc-500">On successful campaigns</p>
                </div>
                <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800 text-center">
                  <div className="text-2xl mb-2">💰</div>
                  <h4 className="text-green-400 font-bold text-sm mb-2">Yield Generation</h4>
                  <p className="text-lg font-mono text-white">Variable</p>
                  <p className="text-xs text-zinc-500">Aave lending rates</p>
                </div>
                <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800 text-center">
                  <div className="text-2xl mb-2">⚡</div>
                  <h4 className="text-green-400 font-bold text-sm mb-2">Gas Optimization</h4>
                  <p className="text-lg font-mono text-white">~80%</p>
                  <p className="text-xs text-zinc-500">Savings vs direct deployment</p>
                </div>
              </div>

              <SubHeading>Capital Efficiency</SubHeading>
              <p>
                FundIf maximizes capital efficiency through yield generation on escrowed funds:
              </p>
              <ul className="list-disc pl-6 space-y-2 marker:text-green-500 text-zinc-400">
                <li><strong className="text-zinc-200">Yield Generation:</strong> Escrowed USDC is automatically supplied to Aave, earning lending interest</li>
                <li><strong className="text-zinc-200">Backer Benefits:</strong> Successful campaigns may share yield with backers</li>
                <li><strong className="text-zinc-200">Creator Incentives:</strong> Yield reduces effective cost of capital for successful projects</li>
                <li><strong className="text-zinc-200">Protocol Sustainability:</strong> Fee revenue funds ongoing development and security</li>
              </ul>

              <SubHeading>Tokenomics (Future)</SubHeading>
              <Note type="info">
                FundIf is currently operating without a native token. Future token implementation may include governance and utility functions to further align network incentives.
              </Note>
            </DocSection>

            {/* Security & Audits */}
            <DocSection title="6. Security & Audits" id="security">
              <p>
                Security is fundamental to FundIf's design. The protocol implements multiple layers of protection to ensure fund safety and system integrity.
              </p>

              <SubHeading>Smart Contract Security</SubHeading>
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-zinc-900 p-5 rounded-lg border border-zinc-800 text-center hover:border-green-500/30 transition-colors">
                  <Shield className="mx-auto text-green-500 mb-3" size={32} />
                  <h4 className="font-bold mb-1 text-zinc-200">Non-Custodial</h4>
                  <p className="text-xs text-zinc-500">Funds never controlled by administrators</p>
                </div>
                <div className="bg-zinc-900 p-5 rounded-lg border border-zinc-800 text-center hover:border-green-500/30 transition-colors">
                  <Layers className="mx-auto text-green-500 mb-3" size={32} />
                  <h4 className="font-bold mb-1 text-zinc-200">Battle-Tested</h4>
                  <p className="text-xs text-zinc-500">Built on audited OpenZeppelin contracts</p>
                </div>
                <div className="bg-zinc-900 p-5 rounded-lg border border-zinc-800 text-center hover:border-green-500/30 transition-colors">
                  <Code className="mx-auto text-green-500 mb-3" size={32} />
                  <h4 className="font-bold mb-1 text-zinc-200">Audited</h4>
                  <p className="text-xs text-zinc-500">External security audits planned for Q3 2025</p>
                </div>
              </div>

              <SubHeading>Risk Mitigation</SubHeading>
              <div className="space-y-4">
                <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
                  <h4 className="text-green-400 font-bold mb-2">Oracle Failure Protection</h4>
                  <div className="text-sm text-zinc-400 space-y-2">
                    <p>• <strong>Multi-Oracle Support:</strong> Integration with multiple oracle providers (UMA, Chainlink, Pyth)</p>
                    <p>• <strong>Dispute Resolution:</strong> UMA's Optimistic Oracle includes community dispute mechanisms</p>
                    <p>• <strong>Fallback Mechanisms:</strong> Protocol can pause and migrate to alternative oracles if needed</p>
                  </div>
                </div>

                <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
                  <h4 className="text-green-400 font-bold mb-2">Economic Security</h4>
                  <div className="text-sm text-zinc-400 space-y-2">
                    <p>• <strong>Insurance Reserves:</strong> Protocol maintains reserves for extreme scenarios</p>
                    <p>• <strong>Bond Requirements:</strong> Oracle disputes require economic commitments</p>
                    <p>• <strong>Graduated Rollout:</strong> Initial campaigns limited by size and scope</p>
                  </div>
                </div>

                <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
                  <h4 className="text-green-400 font-bold mb-2">Operational Security</h4>
                  <div className="text-sm text-zinc-400 space-y-2">
                    <p>• <strong>Timelock Controls:</strong> Critical changes require delay for community review</p>
                    <p>• <strong>Emergency Pause:</strong> Circuit breakers for system-wide issues</p>
                    <p>• <strong>Upgrade Mechanism:</strong> Transparent proxy patterns for secure upgrades</p>
                  </div>
                </div>
              </div>

              <SubHeading>Audit Status</SubHeading>
              <Note type="warning">
                The current protocol implementation has undergone internal security review. External audit by leading DeFi security firms is scheduled for Q3 2025. Users should exercise caution and only fund amounts they can afford to lose during the initial audit period.
              </Note>

              <SubHeading>Bug Bounty Program</SubHeading>
              <p>
                FundIf will launch a comprehensive bug bounty program following external audit completion, with rewards up to $100,000 for critical vulnerability disclosures.
              </p>
            </DocSection>

            {/* Roadmap */}
            <DocSection title="7. Roadmap" id="roadmap">
              <p>
                FundIf's development follows a phased approach, prioritizing security and user experience while expanding functionality.
              </p>

              <SubHeading>Phase 1: Core Protocol (Current - Q1 2025)</SubHeading>
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 p-3 bg-zinc-900 rounded-lg border border-zinc-800">
                  <Check className="text-green-500 shrink-0" size={16} />
                  <span className="text-zinc-300">Smart contract deployment on Base</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-zinc-900 rounded-lg border border-zinc-800">
                  <Check className="text-green-500 shrink-0" size={16} />
                  <span className="text-zinc-300">Basic campaign creation and funding</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-zinc-900 rounded-lg border border-zinc-800">
                  <Check className="text-green-500 shrink-0" size={16} />
                  <span className="text-zinc-300">UMA Optimistic Oracle integration</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-zinc-900 rounded-lg border border-zinc-800">
                  <div className="w-4 h-4 rounded-full bg-amber-500 animate-pulse"></div>
          <span className="text-zinc-300">Security audit completion</span>
        </div>
        <div className="flex items-center gap-3 p-3 bg-zinc-900 rounded-lg border border-zinc-800">
          <div className="w-4 h-4 rounded-full bg-amber-500 animate-pulse"></div>
          <span className="text-zinc-300">User interface improvements</span>
        </div>
      </div>

      <SubHeading>Phase 2: Enhanced Features (Q2-Q3 2025)</SubHeading>
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="space-y-4">
          <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
            <h4 className="text-blue-400 font-bold mb-2">🔮 Multi-Oracle Support</h4>
            <p className="text-sm text-zinc-400">
              Integration with Chainlink, Pyth, and prediction markets for broader condition types and increased reliability.
            </p>
          </div>
          <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
            <h4 className="text-blue-400 font-bold mb-2">🌐 Cross-Chain Expansion</h4>
            <p className="text-sm text-zinc-400">
              Deployment on Optimism, Arbitrum, and Polygon for wider accessibility.
            </p>
          </div>
          <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
            <h4 className="text-blue-400 font-bold mb-2">📊 Advanced Analytics</h4>
            <p className="text-sm text-zinc-400">
              Campaign performance metrics and success prediction models.
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
            <h4 className="text-blue-400 font-bold mb-2">🎯 Quadratic Funding</h4>
            <p className="text-sm text-zinc-400">
              Implementation of quadratic funding mechanisms for public goods.
            </p>
          </div>
          <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
            <h4 className="text-blue-400 font-bold mb-2">📱 Mobile Applications</h4>
            <p className="text-sm text-zinc-400">
              Native iOS and Android apps with wallet integration.
            </p>
          </div>
          <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
            <h4 className="text-blue-400 font-bold mb-2">🎮 Gaming Integration</h4>
            <p className="text-sm text-zinc-400">
              Integration with gaming protocols and NFT communities.
            </p>
          </div>
        </div>
      </div>

      <SubHeading>Phase 3: Ecosystem Expansion (2026)</SubHeading>
      <div className="space-y-4">
        <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
          <h4 className="text-purple-400 font-bold mb-2">🏛️ Institutional Adoption</h4>
          <p className="text-sm text-zinc-400">
            Enterprise-grade compliance, institutional interfaces, and regulatory framework integration.
          </p>
        </div>
        <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
          <h4 className="text-purple-400 font-bold mb-2">🌍 Global Expansion</h4>
          <p className="text-sm text-zinc-400">
            Multi-language support, localization, and region-specific oracle networks.
          </p>
        </div>
        <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
          <h4 className="text-purple-400 font-bold mb-2">🔗 DeFi Integration</h4>
          <p className="text-sm text-zinc-400">
            Deep integration with lending protocols, yield aggregators, and other DeFi primitives.
          </p>
        </div>
      </div>

      <Note type="info">
        This roadmap represents our current development priorities. Community feedback and technical feasibility may influence the final implementation timeline and feature set.
      </Note>
    </DocSection>

            {/* Conclusion */}
            <DocSection title="8. Conclusion" id="conclusion">
              <p>
                FundIf represents a fundamental rethinking of crowdfunding, moving from subjective trust-based systems to objective, outcome-driven funding mechanisms. By leveraging blockchain technology, decentralized oracles, and prediction markets, FundIf creates a more efficient, transparent, and trustworthy alternative to traditional crowdfunding platforms.
              </p>

              <SubHeading>Key Achievements</SubHeading>
              <ul className="list-disc pl-6 space-y-2 marker:text-green-500 text-zinc-400 mb-6">
                <li><strong className="text-zinc-200">Trustless Architecture:</strong> Eliminates reliance on platform trust through smart contracts</li>
                <li><strong className="text-zinc-200">Objective Outcomes:</strong> Success determined by verifiable real-world data</li>
                <li><strong className="text-zinc-200">Economic Efficiency:</strong> Yield generation on escrowed funds reduces opportunity costs</li>
                <li><strong className="text-zinc-200">Composability:</strong> Modular design enables integration with broader DeFi ecosystem</li>
                <li><strong className="text-zinc-200">Security First:</strong> Multiple layers of protection ensure fund safety</li>
              </ul>

              <SubHeading>Future Impact</SubHeading>
              <p>
                As FundIf matures, we envision it becoming the standard for conditional funding across industries:
              </p>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800 text-center">
                  <div className="text-2xl mb-2">🚀</div>
                  <h4 className="text-green-400 font-bold text-sm mb-2">Innovation Funding</h4>
                  <p className="text-xs text-zinc-500">Objective metrics for tech startups</p>
                </div>
                <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800 text-center">
                  <div className="text-2xl mb-2">🌱</div>
                  <h4 className="text-green-400 font-bold text-sm mb-2">Impact Projects</h4>
                  <p className="text-xs text-zinc-500">Measurable outcomes for social good</p>
                </div>
                <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800 text-center">
                  <div className="text-2xl mb-2">🏭</div>
                  <h4 className="text-green-400 font-bold text-sm mb-2">Enterprise</h4>
                  <p className="text-xs text-zinc-500">Corporate milestone-based funding</p>
                </div>
              </div>

              <SubHeading>Join the Revolution</SubHeading>
              <p>
                FundIf is more than a crowdfunding platform—it's a new paradigm for aligning incentives between creators and backers. By making funding success dependent on objective outcomes rather than promises, FundIf creates a more efficient and trustworthy ecosystem for innovation and entrepreneurship.
              </p>

              <p>
                We invite developers, creators, and backers to join us in building this future. Whether you're looking to fund your next big idea or support projects that matter, FundIf provides the tools and infrastructure to make conditional funding a reality.
              </p>

              <Note type="success">
                <strong>Ready to get started?</strong> Visit <a href="/" className="text-green-400 hover:underline">fundif.app</a> to explore active campaigns or create your first conditional funding campaign.
              </Note>
            </DocSection>

            {/* Footer */}
            <div className="mt-16 pt-8 border-t border-zinc-800 text-center">
              <p className="text-zinc-500 text-sm mb-4">
                This whitepaper is a living document. For the latest updates, visit our documentation.
              </p>
              <div className="flex justify-center gap-4 text-xs text-zinc-600">
                <span>Version 1.0</span>
                <span>•</span>
                <span>December 2025</span>
                <span>•</span>
                <a href="/" className="text-green-400 hover:underline">fundif.app</a>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
