export const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop";

export const CAMPAIGN_IMAGES: Record<string, string> = {  
  // Tech/Crypto image for Dev Campaign
  "DEV_CAMPAIGN_ADDRESS_HERE": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2940&auto=format&fit=crop",
  
  // Social/Impact image for Charity/Bonus Campaign
  "CHARITY_CAMPAIGN_ADDRESS_HERE": "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?q=80&w=2940&auto=format&fit=crop",
};

export function getCampaignImage(address: string) {
  // Case-insensitive check
  const key = Object.keys(CAMPAIGN_IMAGES).find(k => k.toLowerCase() === address.toLowerCase());
  return key ? CAMPAIGN_IMAGES[key] : DEFAULT_IMAGE;
}