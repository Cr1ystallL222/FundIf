import React, { useState, useEffect } from 'react';

// --- Inline SVG Icons to prevent external dependency errors ---

const Book = ({ size = 18, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const Code = ({ size = 18, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

const Terminal = ({ size = 18, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="4 17 10 11 4 5" />
    <line x1="12" y1="19" x2="20" y2="19" />
  </svg>
);

const Layers = ({ size = 18, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);

const Shield = ({ size = 18, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const Cpu = ({ size = 18, className = "" }) => (
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

const Menu = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const CloseIcon = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ChevronRight = ({ size = 14, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const ExternalLink = ({ size = 12, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const Copy = ({ size = 14, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const Check = ({ size = 14, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// Custom Social Icons
const XIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="shrink-0">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L7.69 2H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const TelegramIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" className="shrink-0">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12.017 12.017 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>
);

const DocSection = ({ title, children, id }) => (
  <div id={id} className="mb-16 scroll-mt-24">
    <h2 className="text-3xl font-bold text-white mb-6 border-b border-zinc-800 pb-2">{title}</h2>
    <div className="text-zinc-400 leading-relaxed space-y-4">
      {children}
    </div>
  </div>
);

const SubHeading = ({ children }) => (
  <h3 className="text-xl font-semibold text-zinc-200 mt-8 mb-4 flex items-center">
    <span className="w-1.5 h-6 bg-green-500 rounded-full mr-3 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
    {children}
  </h3>
);

const CodeBlock = ({ code, language = "bash" }) => {
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

const Note = ({ type = "info", children }) => {
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

  // Navigation structure - "Deployment" removed, "Interfaces" added
  const navigation = [
    { id: 'intro', title: 'Introduction', icon: <Book size={18} /> },
    { id: 'architecture', title: 'Protocol Architecture', icon: <Layers size={18} /> },
    { id: 'smart-contracts', title: 'Smart Contracts', icon: <Code size={18} /> },
    { id: 'integration', title: 'Core Logic', icon: <Cpu size={18} /> },
    { id: 'interfaces', title: 'Interfaces', icon: <Terminal size={18} /> },
    { id: 'security', title: 'Security', icon: <Shield size={18} /> },
  ];

  // Close sidebar on section click (mobile)
  const handleNavClick = (id) => {
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
            <div className="hidden lg:flex items-center gap-2 font-bold text-2xl text-green-500 mb-10 font-mono">
              <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center text-black shadow-[0_0_15px_rgba(34,197,94,0.4)]">F</div>
              FundIf <span className="text-zinc-600 font-normal text-xs self-end mb-1 font-sans">v1.0.0</span>
            </div>

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

              <SubHeading>How it works</SubHeading>
              <ul className="list-disc pl-6 space-y-2 marker:text-green-500 text-zinc-400">
                <li><strong className="text-zinc-200">Initiation:</strong> Creator launches a campaign, tying fund release to a specific event (e.g., "Mainnet Launch by Jan 1st").</li>
                <li><strong className="text-zinc-200">Funding:</strong> Backers deposit USDC. Funds are held in escrow and generate yield via Aave protocol.</li>
                <li><strong className="text-zinc-200">Verification:</strong> Oracle verifies if the event occurred.</li>
                <li><strong className="text-zinc-200">Execution:</strong> If "YES", funds transfer to creator. If "NO", funds automatically refund to backers.</li>
              </ul>
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

              <SubHeading>Contract Stack</SubHeading>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <li className="flex items-start gap-2 text-zinc-400">
                  <Check className="text-green-500 mt-1 shrink-0" size={16} />
                  <span><strong className="text-zinc-200">Framework:</strong> Foundry v1.x</span>
                </li>
                <li className="flex items-start gap-2 text-zinc-400">
                  <Check className="text-green-500 mt-1 shrink-0" size={16} />
                  <span><strong className="text-zinc-200">Standard:</strong> ERC-20 (USDC)</span>
                </li>
                <li className="flex items-start gap-2 text-zinc-400">
                  <Check className="text-green-500 mt-1 shrink-0" size={16} />
                  <span><strong className="text-zinc-200">Network:</strong> Base Mainnet</span>
                </li>
                <li className="flex items-start gap-2 text-zinc-400">
                  <Check className="text-green-500 mt-1 shrink-0" size={16} />
                  <span><strong className="text-zinc-200">Oracle:</strong> UMA / Custom Adapters</span>
                </li>
              </ul>

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

          {/* Core Logic Section (Formerly Integration/Deployment replaced) */}
           {activeSection === 'integration' && (
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

          {/* Interfaces Section */}
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

              <Note type="info">
                The current protocol version has passed internal audit. External audit by leading firms is scheduled for Q3 2025.
              </Note>

              <SubHeading>Bug Bounty</SubHeading>
              <p>
                We encourage the white-hat hacker community. If you find a vulnerability, please report it to us via security@fundif.protocol. Rewards up to $50,000 in USDC.
              </p>
            </DocSection>
          )}

        </main>
      </div>
    </div>
  );
}