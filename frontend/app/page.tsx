// frontend/app/page.tsx
export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
          Welcome to{' '}
          <span className="text-[#0052FF]">FundIf</span>
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          The prediction-gated crowdfunding platform built on Base Sepolia.
          Create campaigns, make predictions, and fund the future.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <a
            href="/create"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-[#0052FF] hover:bg-[#0047E0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0052FF] transition-colors duration-200"
          >
            Create Campaign
          </a>
          <a
            href="/explore"
            className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0052FF] transition-colors duration-200"
          >
            Explore Campaigns
          </a>
        </div>
      </div>
    </div>
  );
}