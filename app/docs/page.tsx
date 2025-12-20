'use client'

import React, { useState, useEffect } from 'react';

// --- Inline SVG Icons to prevent external dependency errors ---

const Book = ({ size = 18, className = "" }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const Code = ({ size = 18, className = "" }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

const Terminal = ({ size = 18, className = "" }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="4 17 10 11 4 5" />
    <line x1="12" y1="19" x2="20" y2="19" />
  </svg>
);

const Layers = ({ size = 18, className = "" }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);

const Shield = ({ size = 18, className = "" }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

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
);

const Menu = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const CloseIcon = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ChevronRight = ({ size = 14, className = "" }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const ExternalLink = ({ size = 12, className = "" }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const Copy = ({ size = 14, className = "" }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const Check = ({ size = 14, className = "" }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// Custom Social Icons
const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className={`shrink-0 ${className || ""}`}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L7.69 2H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const TelegramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" className={`shrink-0 ${className || ""}`}>
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12.017 12.017 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>
);

const DocSection = ({ title, children, id }: { title: string; children: React.ReactNode; id: string }) => (
  <div id={id} className="mb-16 scroll-mt-24">
    <h2 className="text-3xl font-bold text-white mb-6 border-b border-zinc-800 pb-2">{title}</h2>
    <div className="text-zinc-400 leading-relaxed space-y-4">
      {children}
    </div>
  </div>
);

const SubHeading = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-xl font-semibold text-zinc-200 mt-8 mb-4 flex items-center">
    <span className="w-1.5 h-6 bg-green-500 rounded-full mr-3 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
    {children}
  </h3>
);

const CodeBlock = ({ code, language = "bash" }: { code: string; language?: string }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
  );
};

const Note = ({ type = "info", children }: { type?: "info" | "warning" | "success"; children: React.ReactNode }) => {
  const styles = {
    info: "bg-blue-950/30 border-blue-500/50 text-blue-200",
    warning: "bg-amber-950/30 border-amber-500/50 text-amber-200",
    success: "bg-green-950/30 border-green-500/50 text-green-200"
  };

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
  );
};

export default function FundIfDocs() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('intro');

  // Navigation structure - expanded with more sections
  const navigation = [
    { id: 'intro', title: 'Introduction', icon: <Book size={18} /> },
    { id: 'getting-started', title: 'Getting Started', icon: <Terminal size={18} /> },
    { id: 'architecture', title: 'Protocol Architecture', icon: <Layers size={18} /> },
    { id: 'smart-contracts', title: 'Smart Contracts', icon: <Code size={18} /> },
    { id: 'core-logic', title: 'Core Logic', icon: <Cpu size={18} /> },
    { id: 'api-reference', title: 'API Reference', icon: <Terminal size={18} /> },
    { id: 'examples', title: 'Examples', icon: <Code size={18} /> },
    { id: 'security', title: 'Security & Audits', icon: <Shield size={18} /> },
    { id: 'troubleshooting', title: 'Troubleshooting', icon: <Shield size={18} /> },
    { id: 'faq', title: 'FAQ', icon: <Book size={18} /> },
    { id: 'roadmap', title: 'Roadmap', icon: <Layers size={18} /> },
  ];

  // Close sidebar on section click (mobile)
  const handleNavClick = (id: string) => {
    setActiveSection(id);
    setIsSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans selection:bg-green-900 selection:text-green-100">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 w-full bg-zinc-900 border-b border-zinc-800 z-50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-xl text-green-500 font-mono">
          <div className="w-8 h-8 bg-green-600/20 border border-green-500/50 rounded flex items-center justify-center text-green-400">F</div>
          FundIf_Docs
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-zinc-400">
          {isSidebarOpen ? <CloseIcon /> : <Menu />}
        </button>
      </div>

      <div className="flex pt-16 lg:pt-0 max-w-screen-2xl mx-auto">
        {/* Sidebar */}
        <aside className={`
          fixed lg:sticky top-0 h-screen w-72 bg-zinc-900 border-r border-zinc-800
          transform transition-transform duration-300 z-40 overflow-y-auto
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="p-6 h-full flex flex-col">

            <nav className="space-y-1 flex-1">
              {navigation.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
                    ${activeSection === item.id
                      ? 'bg-green-950/30 text-green-400 border-l-2 border-green-500'
                      : 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200'}
                  `}
                >
                  <span className={activeSection === item.id ? "text-green-400" : "text-zinc-600"}>{item.icon}</span>
                  {item.title}
                  {activeSection === item.id && <ChevronRight size={14} className="ml-auto opacity-50" />}
                </button>
              ))}
            </nav>

            <div className="mt-10 pt-6 border-t border-zinc-800 space-y-3">
              <h4 className="px-4 text-xs font-semibold text-zinc-600 uppercase tracking-wider mb-2">Community</h4>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-zinc-950 border border-zinc-800 text-sm text-zinc-400 hover:text-white hover:border-zinc-600 transition-all group">
                <XIcon />
                <span className="group-hover:translate-x-1 transition-transform">Follow on X</span>
              </a>
              <a href="https://telegram.org" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-zinc-950 border border-zinc-800 text-sm text-zinc-400 hover:text-[#0088cc] hover:border-[#0088cc]/30 transition-all group">
                <TelegramIcon />
                <span className="group-hover:translate-x-1 transition-transform">Join Telegram</span>
              </a>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 px-4 sm:px-8 lg:px-12 py-10 lg:py-12">

          {/* Intro Section */}
          {activeSection === 'intro' && (
            <DocSection title="Introduction to FundIf" id="intro">
              <p className="text-lg text-zinc-300">
                <strong>FundIf</strong> is a next-generation decentralized crowdfunding protocol built on the Base network.
                We solve the fundamental trust problem in fundraising by introducing
                <span className="text-green-400 font-semibold font-mono"> Conditional Funding</span>.
              </p>

              <div className="grid md:grid-cols-2 gap-6 my-8">
                <div className="p-6 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-green-500/30 transition-colors">
                  <h4 className="text-green-400 font-bold mb-2 font-mono">Trustless Architecture</h4>
                  <p className="text-sm text-zinc-400">Funds are not held by the campaign creator. They are locked in a smart contract until conditions are verified by independent Oracles.</p>
                </div>
                <div className="p-6 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-green-500/30 transition-colors">
                  <h4 className="text-green-400 font-bold mb-2 font-mono">Oracle Verification</h4>
                  <p className="text-sm text-zinc-400">Integration with prediction markets (Polymarket, UMA) for objective event outcome verification.</p>
                </div>
              </div>

              <SubHeading>How FundIf Works</SubHeading>
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-zinc-900 rounded-lg border border-zinc-800">
                  <div className="text-2xl mb-2">🎯</div>
                  <h4 className="text-green-400 font-bold text-sm mb-2">1. Create</h4>
                  <p className="text-xs text-zinc-500">Define campaign with success condition</p>
                </div>
                <div className="text-center p-4 bg-zinc-900 rounded-lg border border-zinc-800">
                  <div className="text-2xl mb-2">💰</div>
                  <h4 className="text-green-400 font-bold text-sm mb-2">2. Fund</h4>
                  <p className="text-xs text-zinc-500">Backers contribute USDC to escrow</p>
                </div>
                <div className="text-center p-4 bg-zinc-900 rounded-lg border border-zinc-800">
                  <div className="text-2xl mb-2">🔮</div>
                  <h4 className="text-green-400 font-bold text-sm mb-2">3. Verify</h4>
                  <p className="text-xs text-zinc-500">Oracle resolves the outcome</p>
                </div>
                <div className="text-center p-4 bg-zinc-900 rounded-lg border border-zinc-800">
                  <div className="text-2xl mb-2">✅</div>
                  <h4 className="text-green-400 font-bold text-sm mb-2">4. Execute</h4>
                  <p className="text-xs text-zinc-500">Success = funds released, Fail = refunds</p>
                </div>
              </div>

              <SubHeading>Key Benefits</SubHeading>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
                  <h4 className="text-green-400 font-bold mb-2 flex items-center">
                    <Shield className="mr-2" size={16} />
                    Trustless
                  </h4>
                  <p className="text-sm text-zinc-400">No centralized control - everything governed by smart contracts</p>
                </div>
                <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
                  <h4 className="text-green-400 font-bold mb-2 flex items-center">
                    <Terminal className="mr-2" size={16} />
                    Objective
                  </h4>
                  <p className="text-sm text-zinc-400">Success determined by verifiable real-world outcomes</p>
                </div>
                <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
                  <h4 className="text-green-400 font-bold mb-2 flex items-center">
                    <Layers className="mr-2" size={16} />
                    Efficient
                  </h4>
                  <p className="text-sm text-zinc-400">Funds generate yield while locked, reducing opportunity cost</p>
                </div>
                <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
                  <h4 className="text-green-400 font-bold mb-2 flex items-center">
                    <Code className="mr-2" size={16} />
                    Transparent
                  </h4>
                  <p className="text-sm text-zinc-400">All transactions and conditions visible on-chain</p>
                </div>
              </div>
            </DocSection>
          )}

          {/* Getting Started Section */}
          {activeSection === 'getting-started' && (
            <DocSection title="Getting Started with FundIf" id="getting-started">
              <p>
                This guide will help you get started with FundIf, from understanding the basics to launching your first campaign.
              </p>

              <SubHeading>Prerequisites</SubHeading>
              <p className="mb-4">Before you begin, ensure you have:</p>
              <ul className="list-disc pl-6 space-y-2 marker:text-green-500 text-zinc-400">
                <li><strong className="text-zinc-200">Web3 Wallet:</strong> MetaMask, Coinbase Wallet, or any wallet supporting Base network</li>
                <li><strong className="text-zinc-200">Base Network:</strong> Switch to Base Mainnet in your wallet</li>
                <li><strong className="text-zinc-200">USDC:</strong> Stablecoin for funding campaigns</li>
                <li><strong className="text-zinc-200">Gas Fee:</strong> Small amount of ETH for transaction fees</li>
              </ul>

              <SubHeading>Creating Your First Campaign</SubHeading>
              <ol className="list-decimal pl-6 space-y-3 marker:text-green-500 text-zinc-400">
                <li><strong className="text-zinc-200">Connect Wallet:</strong> Click "Connect Wallet" in the top-right corner</li>
                <li><strong className="text-zinc-200">Navigate to Create:</strong> Click "Create" in the navigation menu</li>
                <li><strong className="text-zinc-200">Fill Campaign Details:</strong> Enter your project information and funding goal</li>
                <li><strong className="text-zinc-200">Choose Condition:</strong> Select a prediction market event that will determine success</li>
                <li><strong className="text-zinc-200">Set Parameters:</strong> Define funding duration and minimum contribution</li>
                <li><strong className="text-zinc-200">Deploy Campaign:</strong> Review and deploy your campaign to the blockchain</li>
              </ol>

              <SubHeading>Funding a Campaign</SubHeading>
              <ol className="list-decimal pl-6 space-y-3 marker:text-green-500 text-zinc-400">
                <li><strong className="text-zinc-200">Browse Campaigns:</strong> Explore active campaigns on the main page</li>
                <li><strong className="text-zinc-200">Review Details:</strong> Check campaign goals, conditions, and creator information</li>
                <li><strong className="text-zinc-200">Make Contribution:</strong> Enter USDC amount and confirm transaction</li>
                <li><strong className="text-zinc-200">Track Progress:</strong> Monitor campaign status and wait for resolution</li>
              </ol>

              <Note type="info">
                All funds are held securely in smart contracts. You can withdraw your contribution anytime before the campaign deadline if you change your mind.
              </Note>
            </DocSection>
          )}

          {/* Architecture Section */}
          {activeSection === 'architecture' && (
            <DocSection title="Protocol Architecture" id="architecture">
              <p>
                FundIf uses a modular architecture ensuring fund security and flexibility for external oracle connections.
              </p>

              <div className="my-8 p-6 bg-black border border-zinc-800 rounded-lg font-mono text-sm overflow-x-auto text-green-400">
                <pre>{`FundIf Protocol
├── Smart Contracts Layer (Foundry)
│   ├── CampaignFactory (Registry & Deployment)
│   ├── Campaign (Individual Escrow Logic)
│   └── Oracle Adapters (IOracle Implementation)
│
├── Data Verification Layer
│   ├── Optimistic Oracle (UMA)
│   └── Prediction Markets (Polymarket API)
│
└── Interface Layer
    ├── Wagmi/Viem (Contract Interaction)
    └── Coinbase Smart Wallet (Account Abstraction)`}</pre>
              </div>

              <SubHeading>Key Components</SubHeading>
              <div className="space-y-4">
                <details className="group border border-zinc-800 bg-zinc-900 rounded-lg p-4 open:border-green-500/50 transition-all">
                  <summary className="font-semibold cursor-pointer list-none flex justify-between items-center text-zinc-200 group-hover:text-green-400 transition-colors">
                    <span>CampaignFactory.sol</span>
                    <span className="text-zinc-600 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-2 text-sm text-zinc-500">
                    The main entry point. Responsible for deploying new campaign instances using the Minimal Proxy (Clones) pattern for gas efficiency. Maintains a registry of all active fundraisers.
                  </p>
                </details>
                <details className="group border border-zinc-800 bg-zinc-900 rounded-lg p-4 open:border-green-500/50 transition-all">
                  <summary className="font-semibold cursor-pointer list-none flex justify-between items-center text-zinc-200 group-hover:text-green-400 transition-colors">
                    <span>Campaign.sol (Escrow)</span>
                    <span className="text-zinc-600 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-2 text-sm text-zinc-500">
                    Isolated contract for each campaign. Holds USDC, interacts with Aave Pool for yield generation on locked capital, and contains condition execution logic.
                  </p>
                </details>
                <details className="group border border-zinc-800 bg-zinc-900 rounded-lg p-4 open:border-green-500/50 transition-all">
                  <summary className="font-semibold cursor-pointer list-none flex justify-between items-center text-zinc-200 group-hover:text-green-400 transition-colors">
                    <span>IOracle Interface</span>
                    <span className="text-zinc-600 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-2 text-sm text-zinc-500">
                    Abstract interface allowing connection to any source of truth. Current implementation supports binary outcomes (YES/NO).
                  </p>
                </details>
              </div>
            </DocSection>
          )}

          {/* Smart Contracts Section */}
          {activeSection === 'smart-contracts' && (
            <DocSection title="Smart Contracts" id="smart-contracts">
              <p>
                The protocol is written in Solidity 0.8.30 using the Foundry framework.
                We utilize standard OpenZeppelin libraries to ensure token and access security.
              </p>

              <SubHeading>Technical Specifications</SubHeading>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-green-400 font-bold mb-3">Development Stack</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2 text-zinc-400">
                      <Check className="text-green-500 shrink-0" size={14} />
                      <span><strong className="text-zinc-200">Framework:</strong> Foundry v1.x</span>
                    </li>
                    <li className="flex items-center gap-2 text-zinc-400">
                      <Check className="text-green-500 shrink-0" size={14} />
                      <span><strong className="text-zinc-200">Language:</strong> Solidity 0.8.30</span>
                    </li>
                    <li className="flex items-center gap-2 text-zinc-400">
                      <Check className="text-green-500 shrink-0" size={14} />
                      <span><strong className="text-zinc-200">Testing:</strong> Forge + Solidity Coverage</span>
                    </li>
                    <li className="flex items-center gap-2 text-zinc-400">
                      <Check className="text-green-500 shrink-0" size={14} />
                      <span><strong className="text-zinc-200">Libraries:</strong> OpenZeppelin v5.x</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-green-400 font-bold mb-3">Network & Tokens</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2 text-zinc-400">
                      <Check className="text-green-500 shrink-0" size={14} />
                      <span><strong className="text-zinc-200">Network:</strong> Base Mainnet</span>
                    </li>
                    <li className="flex items-center gap-2 text-zinc-400">
                      <Check className="text-green-500 shrink-0" size={14} />
                      <span><strong className="text-zinc-200">Stablecoin:</strong> USDC (ERC-20)</span>
                    </li>
                    <li className="flex items-center gap-2 text-zinc-400">
                      <Check className="text-green-500 shrink-0" size={14} />
                      <span><strong className="text-zinc-200">Yield Protocol:</strong> Aave v3</span>
                    </li>
                    <li className="flex items-center gap-2 text-zinc-400">
                      <Check className="text-green-500 shrink-0" size={14} />
                      <span><strong className="text-zinc-200">Gas Optimization:</strong> Clones Pattern</span>
                    </li>
                  </ul>
                </div>
              </div>

              <SubHeading>Oracle Integration</SubHeading>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
                  <h4 className="text-green-400 font-bold mb-2">UMA Optimistic Oracle</h4>
                  <ul className="text-sm text-zinc-400 space-y-1">
                    <li>• Decentralized truth verification</li>
                    <li>• Economic security guarantees</li>
                    <li>• Community-verified outcomes</li>
                    <li>• Integration via OOV3</li>
                  </ul>
                </div>
                <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
                  <h4 className="text-green-400 font-bold mb-2">Custom Adapters</h4>
                  <ul className="text-sm text-zinc-400 space-y-1">
                    <li>• Polymarket integration</li>
                    <li>• Chainlink price feeds</li>
                    <li>• Pyth Network oracles</li>
                    <li>• Extensible adapter system</li>
                  </ul>
                </div>
              </div>

              <SubHeading>Interaction Methods</SubHeading>
              <p className="mb-4 text-zinc-400">Key functions for integrating with the campaign contract:</p>

              <CodeBlock language="solidity" code={`// Core functions of Campaign.sol

function pledge(uint256 amount) external;
// Deposits USDC into escrow

function refund() external;
// Returns funds to backer if condition fails (Oracle == NO)

function claimFunds() external;
// Transfers funds to creator if condition met (Oracle == YES)

function getStatus() external view returns (CampaignStatus);
// Returns current status: Active, Successful, Failed`} />

              <Note type="warning">
                The <code>refund()</code> function is callable by any user after oracle resolution, but uses a Pull-payment pattern for security.
              </Note>
            </DocSection>
          )}

          {/* Core Logic Section */}
           {activeSection === 'core-logic' && (
            <DocSection title="Core Logic Flow" id="integration">
              <p>
                The FundIf protocol logic ensures atomic state transitions based on Oracle inputs. Below is the simplified logic flow for campaign settlement.
              </p>

              <SubHeading>Settlement Mechanism</SubHeading>
              <CodeBlock language="solidity" code={`// Simplified Logic Flow

function settleCampaign(bytes32 conditionId) internal {
    // 1. Fetch result from Oracle
    bool result = Oracle.getResult(conditionId);

    // 2. State Transition
    if (result == true) {
        state = CampaignStatus.SUCCESSFUL;
        enableCreatorWithdrawal();
    } else {
        state = CampaignStatus.FAILED;
        enableBackerRefunds();
    }

    // 3. Emit Event
    emit CampaignSettled(conditionId, result);
}`} />

              <SubHeading>Data Indexing Strategy</SubHeading>
              <p>
                We use a hybrid approach: campaign state data is read directly from the blockchain (On-chain), while metadata (images, descriptions) is stored in distributed storage (IPFS) and linked via content hash.
              </p>
            </DocSection>
          )}

          {/* API Reference Section */}
          {activeSection === 'api-reference' && (
            <DocSection title="API Reference" id="api-reference">
              <p>
                Complete API reference for interacting with FundIf smart contracts and prediction markets.
              </p>

              <SubHeading>CampaignFactory Contract</SubHeading>
              <CodeBlock language="solidity" code={`// Deploy new campaign
function createCampaign(
    address _oracle,
    bytes32 _conditionId,
    uint256 _targetAmount,
    uint256 _duration
) external returns (address);

// Get all deployed campaigns
function getCampaigns() external view returns (address[] memory);

// Get campaign count
function campaignCount() external view returns (uint256);

// Get campaign by index
function getCampaign(uint256 index) external view returns (address);`} />

              <SubHeading>Campaign Contract</SubHeading>
              <CodeBlock language="solidity" code={`// Contribute to campaign
function pledge(uint256 amount) external;

// Withdraw successful campaign funds (creator only)
function claimFunds() external;

// Refund contribution if campaign fails
function refund() external;

// Get campaign status
function getStatus() external view returns (CampaignStatus);

// Get current raised amount
function raisedAmount() external view returns (uint256);

// Get target amount
function targetAmount() external view returns (uint256);

// Get campaign deadline
function deadline() external view returns (uint256);

// Check if campaign is active
function isActive() external view returns (bool);`} />

              <SubHeading>Oracle Interface</SubHeading>
              <CodeBlock language="solidity" code={`interface IOracleAdapter {
    function getResult(bytes32 conditionId) external view returns (bool);
    function isResolved(bytes32 conditionId) external view returns (bool);
    function getResolutionTime(bytes32 conditionId) external view returns (uint256);
    function getConditionUrl(bytes32 conditionId) external view returns (string memory);
}`} />

              <SubHeading>Campaign Status Enum</SubHeading>
              <CodeBlock language="solidity" code={`enum CampaignStatus {
    ACTIVE,      // Campaign is accepting pledges
    SUCCESSFUL,  // Condition met, funds can be claimed
    FAILED,      // Condition not met, refunds available
    CANCELLED    // Campaign cancelled by creator
}`} />

              <Note type="warning">
                Always check campaign status before pledging. Once a campaign resolves, you cannot change your contribution.
              </Note>
            </DocSection>
          )}

          {/* Examples Section */}
          {activeSection === 'interfaces' && (
            <DocSection title="Protocol Interfaces" id="interfaces">
              <p>
                For developers building on top of FundIf, we expose the following interfaces for direct smart contract interaction.
              </p>

              <SubHeading>ICampaignFactory</SubHeading>
              <p className="text-sm text-zinc-500 mb-4">Registry and deployment interface.</p>
              <CodeBlock language="solidity" code={`interface ICampaignFactory {
    event CampaignDeployed(address indexed campaign, address indexed creator);

    function createCampaign(
        address _oracle,
        bytes32 _conditionId,
        uint256 _targetAmount,
        uint256 _duration
    ) external returns (address);

    function getCampaigns() external view returns (address[] memory);
}`} />

              <SubHeading>IOracleAdapter</SubHeading>
              <p className="text-sm text-zinc-500 mb-4">Standardized adapter for Prediction Markets.</p>
              <CodeBlock language="solidity" code={`interface IOracleAdapter {
    function getResult(bytes32 conditionId) external view returns (bool);
    function isResolved(bytes32 conditionId) external view returns (bool);
    function getResolutionTime(bytes32 conditionId) external view returns (uint256);
}`} />

              <Note type="info">
                These interfaces ensure composability with other DeFi protocols on Base.
              </Note>
            </DocSection>
          )}

          {/* Examples Section */}
          {activeSection === 'examples' && (
            <DocSection title="Examples & Use Cases" id="examples">
              <p>
                Real-world examples of how FundIf can be used across different industries and scenarios.
              </p>

              <SubHeading>Tech Startup Funding</SubHeading>
              <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800 mb-6">
                <h4 className="text-green-400 font-bold mb-3 font-mono">Mainnet Launch Campaign</h4>
                <p className="text-sm text-zinc-400 mb-3">
                  A blockchain startup wants to fund their mainnet launch. They create a campaign where success depends on reaching 1000 users within 6 months.
                </p>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong className="text-zinc-200">Condition:</strong>
                    <p className="text-zinc-500">Will project reach 1000 daily active users by December 31st?</p>
                  </div>
                  <div>
                    <strong className="text-zinc-200">Funding Goal:</strong>
                    <p className="text-zinc-500">$50,000 USDC</p>
                  </div>
                </div>
              </div>

              <SubHeading>Environmental Projects</SubHeading>
              <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800 mb-6">
                <h4 className="text-green-400 font-bold mb-3 font-mono">Carbon Credit Project</h4>
                <p className="text-sm text-zinc-400 mb-3">
                  An environmental organization wants to fund reforestation. Success depends on verified carbon sequestration metrics.
                </p>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong className="text-zinc-200">Condition:</strong>
                    <p className="text-zinc-500">Will the project sequester 1000 tons of CO2 within 2 years?</p>
                  </div>
                  <div>
                    <strong className="text-zinc-200">Funding Goal:</strong>
                    <p className="text-zinc-500">$100,000 USDC</p>
                  </div>
                </div>
              </div>

              <SubHeading>Research & Development</SubHeading>
              <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800 mb-6">
                <h4 className="text-green-400 font-bold mb-3 font-mono">Medical Research</h4>
                <p className="text-sm text-zinc-400 mb-3">
                  A research team needs funding for clinical trials. Success depends on FDA approval within 18 months.
                </p>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong className="text-zinc-200">Condition:</strong>
                    <p className="text-zinc-500">Will the drug receive FDA approval by Q2 2026?</p>
                  </div>
                  <div>
                    <strong className="text-zinc-200">Funding Goal:</strong>
                    <p className="text-zinc-500">$2,000,000 USDC</p>
                  </div>
                </div>
              </div>

              <SubHeading>DeFi Protocol Launch</SubHeading>
              <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800 mb-6">
                <h4 className="text-green-400 font-bold mb-3 font-mono">Liquidity Mining Program</h4>
                <p className="text-sm text-zinc-400 mb-3">
                  A DeFi protocol wants to bootstrap liquidity. Success depends on reaching $10M TVL within 3 months.
                </p>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong className="text-zinc-200">Condition:</strong>
                    <p className="text-zinc-500">Will TVL reach $10M by launch + 90 days?</p>
                  </div>
                  <div>
                    <strong className="text-zinc-200">Funding Goal:</strong>
                    <p className="text-zinc-500">$500,000 USDC</p>
                  </div>
                </div>
              </div>

              <SubHeading>Creating Custom Conditions</SubHeading>
              <p>
                FundIf supports any binary outcome that can be verified. Here are some creative condition ideas:
              </p>
              <ul className="list-disc pl-6 space-y-2 marker:text-green-500 text-zinc-400 mt-4">
                <li><strong className="text-zinc-200">Product Milestones:</strong> "Will the app reach 10,000 downloads in 6 months?"</li>
                <li><strong className="text-zinc-200">Market Performance:</strong> "Will the token price exceed $1.00 within 1 year?"</li>
                <li><strong className="text-zinc-200">Community Growth:</strong> "Will Discord server reach 50,000 members by Q4?"</li>
                <li><strong className="text-zinc-200">Partnership Deals:</strong> "Will we secure a partnership with Company X within 6 months?"</li>
                <li><strong className="text-zinc-200">Regulatory Approval:</strong> "Will we receive regulatory approval in target market by Q1 2026?"</li>
              </ul>
            </DocSection>
          )}

          {/* Security Section */}
          {activeSection === 'security' && (
            <DocSection title="Security & Audits" id="security">
              <p>
                User fund security is our top priority. The FundIf architecture prevents protocol administrators from accessing user funds.
              </p>

              <div className="grid md:grid-cols-3 gap-6 my-8">
                <div className="bg-zinc-900 p-5 rounded-lg border border-zinc-800 text-center hover:border-green-500/30 transition-colors">
                  <Shield className="mx-auto text-green-500 mb-3" size={32} />
                  <h4 className="font-bold mb-1 text-zinc-200">Non-Custodial</h4>
                  <p className="text-xs text-zinc-500">Smart contracts are fully autonomous and immutable after deployment.</p>
                </div>
                <div className="bg-zinc-900 p-5 rounded-lg border border-zinc-800 text-center hover:border-green-500/30 transition-colors">
                  <Layers className="mx-auto text-green-500 mb-3" size={32} />
                  <h4 className="font-bold mb-1 text-zinc-200">Oracle Agnostic</h4>
                  <p className="text-xs text-zinc-500">Protection against manipulation through decentralized oracles usage.</p>
                </div>
                <div className="bg-zinc-900 p-5 rounded-lg border border-zinc-800 text-center hover:border-green-500/30 transition-colors">
                  <Code className="mx-auto text-green-500 mb-3" size={32} />
                  <h4 className="font-bold mb-1 text-zinc-200">Verified Code</h4>
                  <p className="text-xs text-zinc-500">All contracts are verified on BaseScan.</p>
                </div>
              </div>

              <SubHeading>Security Measures</SubHeading>
              <div className="space-y-4">
                <details className="group border border-zinc-800 bg-zinc-900 rounded-lg p-4 open:border-green-500/50 transition-all">
                  <summary className="font-semibold cursor-pointer list-none flex justify-between items-center text-zinc-200 group-hover:text-green-400 transition-colors">
                    <span>Smart Contract Security</span>
                    <span className="text-zinc-600 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <div className="mt-2 space-y-2 text-sm text-zinc-500">
                    <p>• <strong>Access Control:</strong> OpenZeppelin's Ownable and AccessControl patterns</p>
                    <p>• <strong>Reentrancy Protection:</strong> Checks-Effects-Interactions pattern</p>
                    <p>• <strong>Overflow Protection:</strong> Solidity 0.8+ built-in overflow checks</p>
                    <p>• <strong>Input Validation:</strong> Comprehensive parameter validation</p>
                  </div>
                </details>

                <details className="group border border-zinc-800 bg-zinc-900 rounded-lg p-4 open:border-green-500/50 transition-all">
                  <summary className="font-semibold cursor-pointer list-none flex justify-between items-center text-zinc-200 group-hover:text-green-400 transition-colors">
                    <span>Oracle Security</span>
                    <span className="text-zinc-600 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <div className="mt-2 space-y-2 text-sm text-zinc-500">
                    <p>• <strong>Decentralized Oracles:</strong> Multiple independent data sources</p>
                    <p>• <strong>Economic Security:</strong> UMA's Optimistic Oracle with bond requirements</p>
                    <p>• <strong>Dispute Resolution:</strong> Community-verified outcomes with escalation</p>
                    <p>• <strong>Fallback Mechanisms:</strong> Multiple oracle providers for redundancy</p>
                  </div>
                </details>

                <details className="group border border-zinc-800 bg-zinc-900 rounded-lg p-4 open:border-green-500/50 transition-all">
                  <summary className="font-semibold cursor-pointer list-none flex justify-between items-center text-zinc-200 group-hover:text-green-400 transition-colors">
                    <span>Fund Security</span>
                    <span className="text-zinc-600 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <div className="mt-2 space-y-2 text-sm text-zinc-500">
                    <p>• <strong>Escrow System:</strong> Funds locked in immutable smart contracts</p>
                    <p>• <strong>Pull Payments:</strong> Users withdraw funds, preventing forced transfers</p>
                    <p>• <strong>Emergency Pause:</strong> Circuit breaker for critical issues</p>
                    <p>• <strong>Timelock Controls:</strong> Delayed execution for critical changes</p>
                  </div>
                </details>
              </div>

              <SubHeading>Risk Assessment</SubHeading>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-4 bg-red-950/20 border border-red-500/30 rounded-lg">
                  <h4 className="text-red-400 font-bold mb-2">⚠️ Smart Contract Risks</h4>
                  <ul className="text-sm text-zinc-400 space-y-1">
                    <li>• Undiscovered vulnerabilities</li>
                    <li>• Oracle manipulation attacks</li>
                    <li>• Network-level attacks</li>
                    <li>• Unexpected edge cases</li>
                  </ul>
                </div>

                <div className="p-4 bg-amber-950/20 border border-amber-500/30 rounded-lg">
                  <h4 className="text-amber-400 font-bold mb-2">🟡 Oracle Risks</h4>
                  <ul className="text-sm text-zinc-400 space-y-1">
                    <li>• Oracle downtime or failure</li>
                    <li>• Delayed outcome resolution</li>
                    <li>• Market manipulation</li>
                    <li>• Condition ambiguity</li>
                  </ul>
                </div>
              </div>

              <Note type="info">
                The current protocol version has passed internal audit. External audit by leading firms is scheduled for Q3 2025.
              </Note>

              <SubHeading>Bug Bounty</SubHeading>
              <p>
                We encourage the white-hat hacker community. If you find a vulnerability, please report it to us via security@fundif.protocol. Rewards up to $50,000 in USDC.
              </p>
            </DocSection>
          )}

          {/* Troubleshooting Section */}
          {activeSection === 'troubleshooting' && (
            <DocSection title="Troubleshooting" id="troubleshooting">
              <p>
                Common issues and their solutions when using FundIf.
              </p>

              <SubHeading>Transaction Failures</SubHeading>
              <div className="space-y-4">
                <details className="group border border-zinc-800 bg-zinc-900 rounded-lg p-4 open:border-green-500/50 transition-all">
                  <summary className="font-semibold cursor-pointer list-none flex justify-between items-center text-zinc-200 group-hover:text-green-400 transition-colors">
                    <span>"Transaction reverted" error</span>
                    <span className="text-zinc-600 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <div className="mt-2 text-sm text-zinc-500 space-y-2">
                    <p><strong>Cause:</strong> Insufficient gas, network congestion, or smart contract error</p>
                    <p><strong>Solution:</strong> Increase gas limit, try again during off-peak hours, or check contract status</p>
                  </div>
                </details>

                <details className="group border border-zinc-800 bg-zinc-900 rounded-lg p-4 open:border-green-500/50 transition-all">
                  <summary className="font-semibold cursor-pointer list-none flex justify-between items-center text-zinc-200 group-hover:text-green-400 transition-colors">
                    <span>USDC approval failed</span>
                    <span className="text-zinc-600 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <div className="mt-2 text-sm text-zinc-500 space-y-2">
                    <p><strong>Cause:</strong> Insufficient USDC balance or approval transaction failed</p>
                    <p><strong>Solution:</strong> Ensure you have enough USDC and try approving again</p>
                  </div>
                </details>
              </div>

              <SubHeading>Campaign Issues</SubHeading>
              <div className="space-y-4">
                <details className="group border border-zinc-800 bg-zinc-900 rounded-lg p-4 open:border-green-500/50 transition-all">
                  <summary className="font-semibold cursor-pointer list-none flex justify-between items-center text-zinc-200 group-hover:text-green-400 transition-colors">
                    <span>Cannot pledge to campaign</span>
                    <span className="text-zinc-600 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <div className="mt-2 text-sm text-zinc-500 space-y-2">
                    <p><strong>Cause:</strong> Campaign ended, minimum contribution not met, or wallet not connected</p>
                    <p><strong>Solution:</strong> Check campaign status and ensure minimum contribution is met</p>
                  </div>
                </details>

                <details className="group border border-zinc-800 bg-zinc-900 rounded-lg p-4 open:border-green-500/50 transition-all">
                  <summary className="font-semibold cursor-pointer list-none flex justify-between items-center text-zinc-200 group-hover:text-green-400 transition-colors">
                    <span>Funds not received after successful campaign</span>
                    <span className="text-zinc-600 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <div className="mt-2 text-sm text-zinc-500 space-y-2">
                    <p><strong>Cause:</strong> Oracle hasn't resolved the condition yet</p>
                    <p><strong>Solution:</strong> Wait for the prediction market to resolve the outcome</p>
                  </div>
                </details>
              </div>

              <SubHeading>Wallet Connection Issues</SubHeading>
              <div className="space-y-4">
                <details className="group border border-zinc-800 bg-zinc-900 rounded-lg p-4 open:border-green-500/50 transition-all">
                  <summary className="font-semibold cursor-pointer list-none flex justify-between items-center text-zinc-200 group-hover:text-green-400 transition-colors">
                    <span>Wallet not connecting</span>
                    <span className="text-zinc-600 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <div className="mt-2 text-sm text-zinc-500 space-y-2">
                    <p><strong>Cause:</strong> Network mismatch or browser extension issues</p>
                    <p><strong>Solution:</strong> Switch to Base network and refresh the page</p>
                  </div>
                </details>

                <details className="group border border-zinc-800 bg-zinc-900 rounded-lg p-4 open:border-green-500/50 transition-all">
                  <summary className="font-semibold cursor-pointer list-none flex justify-between items-center text-zinc-200 group-hover:text-green-400 transition-colors">
                    <span>Wrong network error</span>
                    <span className="text-zinc-600 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <div className="mt-2 text-sm text-zinc-500 space-y-2">
                    <p><strong>Cause:</strong> Wallet connected to wrong network</p>
                    <p><strong>Solution:</strong> Switch to Base Mainnet in your wallet</p>
                  </div>
                </details>
              </div>

              <Note type="info">
                If you're still experiencing issues, check our <a href="#faq" className="text-green-400 hover:underline">FAQ section</a> or contact support.
              </Note>
            </DocSection>
          )}

          {/* FAQ Section */}
          {activeSection === 'faq' && (
            <DocSection title="Frequently Asked Questions" id="faq">
              <p>
                Answers to the most common questions about FundIf.
              </p>

              <SubHeading>General Questions</SubHeading>
              <div className="space-y-4">
                <details className="group border border-zinc-800 bg-zinc-900 rounded-lg p-4 open:border-green-500/50 transition-all">
                  <summary className="font-semibold cursor-pointer list-none flex justify-between items-center text-zinc-200 group-hover:text-green-400 transition-colors">
                    <span>What is FundIf?</span>
                    <span className="text-zinc-600 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-2 text-sm text-zinc-500">
                    FundIf is a decentralized crowdfunding platform where funding success depends on real-world outcomes verified by prediction markets and oracles.
                  </p>
                </details>

                <details className="group border border-zinc-800 bg-zinc-900 rounded-lg p-4 open:border-green-500/50 transition-all">
                  <summary className="font-semibold cursor-pointer list-none flex justify-between items-center text-zinc-200 group-hover:text-green-400 transition-colors">
                    <span>How does it differ from traditional crowdfunding?</span>
                    <span className="text-zinc-600 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-2 text-sm text-zinc-500">
                    Unlike Kickstarter or GoFundMe, FundIf uses smart contracts and oracles to ensure objective success criteria. Funds are only released if predefined conditions are met.
                  </p>
                </details>

                <details className="group border border-zinc-800 bg-zinc-900 rounded-lg p-4 open:border-green-500/50 transition-all">
                  <summary className="font-semibold cursor-pointer list-none flex justify-between items-center text-zinc-200 group-hover:text-green-400 transition-colors">
                    <span>Is FundIf secure?</span>
                    <span className="text-zinc-600 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-2 text-sm text-zinc-500">
                    Yes, FundIf uses battle-tested smart contracts and decentralized oracles. Funds are never held by any centralized entity and can only be accessed according to predefined rules.
                  </p>
                </details>
              </div>

              <SubHeading>Funding & Campaigns</SubHeading>
              <div className="space-y-4">
                <details className="group border border-zinc-800 bg-zinc-900 rounded-lg p-4 open:border-green-500/50 transition-all">
                  <summary className="font-semibold cursor-pointer list-none flex justify-between items-center text-zinc-200 group-hover:text-green-400 transition-colors">
                    <span>What happens if a campaign fails?</span>
                    <span className="text-zinc-600 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-2 text-sm text-zinc-500">
                    If the condition is not met, all backers can automatically refund their contributions. The creator receives nothing.
                  </p>
                </details>

                <details className="group border border-zinc-800 bg-zinc-900 rounded-lg p-4 open:border-green-500/50 transition-all">
                  <summary className="font-semibold cursor-pointer list-none flex justify-between items-center text-zinc-200 group-hover:text-green-400 transition-colors">
                    <span>Can I withdraw my pledge before campaign ends?</span>
                    <span className="text-zinc-600 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-2 text-sm text-zinc-500">
                    Yes, you can withdraw your pledge at any time before the campaign deadline. After the deadline, funds are locked until the condition resolves.
                  </p>
                </details>

                <details className="group border border-zinc-800 bg-zinc-900 rounded-lg p-4 open:border-green-500/50 transition-all">
                  <summary className="font-semibold cursor-pointer list-none flex justify-between items-center text-zinc-200 group-hover:text-green-400 transition-colors">
                    <span>What currencies are supported?</span>
                    <span className="text-zinc-600 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-2 text-sm text-zinc-500">
                    Currently, FundIf supports USDC (USD Coin) on the Base network. We plan to add more stablecoins and networks in the future.
                  </p>
                </details>
              </div>

              <SubHeading>Technical Questions</SubHeading>
              <div className="space-y-4">
                <details className="group border border-zinc-800 bg-zinc-900 rounded-lg p-4 open:border-green-500/50 transition-all">
                  <summary className="font-semibold cursor-pointer list-none flex justify-between items-center text-zinc-200 group-hover:text-green-400 transition-colors">
                    <span>Which networks does FundIf support?</span>
                    <span className="text-zinc-600 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-2 text-sm text-zinc-500">
                    FundIf is currently deployed on Base Mainnet. We plan to expand to other Layer 2 networks like Optimism and Arbitrum.
                  </p>
                </details>

                <details className="group border border-zinc-800 bg-zinc-900 rounded-lg p-4 open:border-green-500/50 transition-all">
                  <summary className="font-semibold cursor-pointer list-none flex justify-between items-center text-zinc-200 group-hover:text-green-400 transition-colors">
                    <span>How are conditions verified?</span>
                    <span className="text-zinc-600 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-2 text-sm text-zinc-500">
                    Conditions are verified using decentralized oracles like UMA Optimistic Oracle and prediction markets like Polymarket.
                  </p>
                </details>

                <details className="group border border-zinc-800 bg-zinc-900 rounded-lg p-4 open:border-green-500/50 transition-all">
                  <summary className="font-semibold cursor-pointer list-none flex justify-between items-center text-zinc-200 group-hover:text-green-400 transition-colors">
                    <span>Are there any fees?</span>
                    <span className="text-zinc-600 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-2 text-sm text-zinc-500">
                    FundIf charges a small protocol fee (currently 1%) on successful campaigns. All other costs are just standard blockchain gas fees.
                  </p>
                </details>
              </div>
            </DocSection>
          )}

          {/* Roadmap Section */}
          {activeSection === 'roadmap' && (
            <DocSection title="Roadmap & Future Plans" id="roadmap">
              <p>
                Our vision for FundIf's future development and upcoming features.
              </p>

              <SubHeading>Phase 1: Core Protocol (Current)</SubHeading>
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
                  <h4 className="text-green-400 font-bold mb-2">✅ Completed</h4>
                  <ul className="text-sm text-zinc-400 space-y-1">
                    <li>• Smart contract deployment</li>
                    <li>• Basic campaign creation</li>
                    <li>• USDC funding support</li>
                    <li>• Oracle integration (UMA)</li>
                    <li>• Web interface</li>
                  </ul>
                </div>
                <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
                  <h4 className="text-amber-400 font-bold mb-2">🔄 In Progress</h4>
                  <ul className="text-sm text-zinc-400 space-y-1">
                    <li>• Security audit</li>
                    <li>• UI/UX improvements</li>
                    <li>• Documentation</li>
                    <li>• Community building</li>
                  </ul>
                </div>
              </div>

              <SubHeading>Phase 2: Enhanced Features (Q1 2025)</SubHeading>
              <div className="space-y-4">
                <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
                  <h4 className="text-blue-400 font-bold mb-2">🎯 Multi-Oracle Support</h4>
                  <p className="text-sm text-zinc-400">
                    Integration with multiple oracle providers (Chainlink, Pyth, Polymarket) for broader condition types and increased reliability.
                  </p>
                </div>

                <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
                  <h4 className="text-blue-400 font-bold mb-2">🎯 Cross-Chain Support</h4>
                  <p className="text-sm text-zinc-400">
                    Deploy FundIf on multiple Layer 2 networks (Optimism, Arbitrum, Polygon) with cross-chain campaign support.
                  </p>
                </div>

                <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
                  <h4 className="text-blue-400 font-bold mb-2">🎯 Advanced Campaign Types</h4>
                  <p className="text-sm text-zinc-400">
                    Quadratic funding, milestone-based campaigns, and recurring funding models.
                  </p>
                </div>
              </div>

              <SubHeading>Phase 3: Ecosystem Expansion (Q2-Q3 2025)</SubHeading>
              <div className="space-y-4">
                <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
                  <h4 className="text-purple-400 font-bold mb-2">🚀 Mobile App</h4>
                  <p className="text-sm text-zinc-400">
                    Native mobile applications for iOS and Android with wallet integration and push notifications.
                  </p>
                </div>

                <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
                  <h4 className="text-purple-400 font-bold mb-2">🚀 Token Launch</h4>
                  <p className="text-sm text-zinc-400">
                    Governance token for protocol improvements, fee voting, and community rewards.
                  </p>
                </div>

                <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
                  <h4 className="text-purple-400 font-bold mb-2">🚀 Advanced Analytics</h4>
                  <p className="text-sm text-zinc-400">
                    Campaign performance analytics, success prediction models, and market insights.
                  </p>
                </div>
              </div>

              <SubHeading>Phase 4: Global Adoption (2026)</SubHeading>
              <div className="space-y-4">
                <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
                  <h4 className="text-pink-400 font-bold mb-2">🌍 Institutional Support</h4>
                  <p className="text-sm text-zinc-400">
                    Integration with traditional finance, institutional-grade compliance, and enterprise solutions.
                  </p>
                </div>

                <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
                  <h4 className="text-pink-400 font-bold mb-2">🌍 Global Expansion</h4>
                  <p className="text-sm text-zinc-400">
                    Localization support, multi-language interface, and region-specific oracle networks.
                  </p>
                </div>

                <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
                  <h4 className="text-pink-400 font-bold mb-2">🌍 DeFi Integration</h4>
                  <p className="text-sm text-zinc-400">
                    Integration with lending protocols, yield farming, and other DeFi primitives.
                  </p>
                </div>
              </div>

              <Note type="info">
                This roadmap is subject to change based on community feedback and technical feasibility. Join our Discord to participate in governance decisions.
              </Note>
            </DocSection>
          )}

        </main>
      </div>
    </div>
  );
}