export const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop";

// Map your deployed campaign addresses to specific Unsplash images here
export const CAMPAIGN_IMAGES: Record<string, string> = {
  // Example: "0x123...": "https://...",
  
  // Use a Tech/Crypto image for your Dev Campaign
  "DEV_CAMPAIGN_ADDRESS_HERE": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2940&auto=format&fit=crop",
  
  // Use a Social/Impact image for your Charity/Bonus Campaign
  "CHARITY_CAMPAIGN_ADDRESS_HERE": "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?q=80&w=2940&auto=format&fit=crop",
};

export function getCampaignImage(address: string) {
  // Case-insensitive check
  const key = Object.keys(CAMPAIGN_IMAGES).find(k => k.toLowerCase() === address.toLowerCase());
  return key ? CAMPAIGN_IMAGES[key] : DEFAULT_IMAGE;
}