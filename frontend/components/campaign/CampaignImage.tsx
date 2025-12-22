'use client';

import React, { useMemo } from 'react';

interface CampaignImageProps {
  title: string;
  description: string;
  address: string;
  className?: string;
}

export function CampaignImage({ title, description, address, className }: CampaignImageProps) {
  // Generate unique gradient based on campaign address
  const gradientColors = useMemo(() => {
    const hash = address.slice(2, 10); // Take first 8 chars after 0x
    const hue1 = parseInt(hash.slice(0, 4), 16) % 360;
    const hue2 = parseInt(hash.slice(4, 8), 16) % 360;
    
    return {
      from: `hsl(${hue1}, 70%, 25%)`,
      to: `hsl(${hue2}, 70%, 15%)`
    };
  }, [address]);

  // Generate pattern based on title
  const patternType = useMemo(() => {
    const titleHash = title.length % 4;
    return ['dots', 'lines', 'grid', 'waves'][titleHash];
  }, [title]);

  const renderPattern = () => {
    switch (patternType) {
      case 'dots':
        return (
          <pattern id={`dots-${address}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="1.5" fill="rgba(255,255,255,0.1)" />
          </pattern>
        );
      case 'lines':
        return (
          <pattern id={`lines-${address}`} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <line x1="0" y1="20" x2="40" y2="20" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          </pattern>
        );
      case 'grid':
        return (
          <pattern id={`grid-${address}`} x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
            <rect width="30" height="30" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          </pattern>
        );
      case 'waves':
        return (
          <pattern id={`waves-${address}`} x="0" y="0" width="60" height="30" patternUnits="userSpaceOnUse">
            <path d="M0,15 Q15,5 30,15 T60,15" stroke="rgba(255,255,255,0.1)" strokeWidth="2" fill="none" />
          </pattern>
        );
      default:
        return null;
    }
  };

  // Extract keywords for display
  const keywords = useMemo(() => {
    const words = title.toLowerCase().split(' ').filter(word => word.length > 3);
    return words.slice(0, 3);
  }, [title]);

  return (
    <div className={`w-full h-full ${className}`}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 400 200"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id={`gradient-${address}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={gradientColors.from} />
            <stop offset="100%" stopColor={gradientColors.to} />
          </linearGradient>
          {renderPattern()}
          <filter id={`blur-${address}`}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" />
          </filter>
        </defs>
        
        {/* Background gradient */}
        <rect width="400" height="200" fill={`url(#gradient-${address})`} />
        
        {/* Pattern overlay */}
        <rect width="400" height="200" fill={`url(#${patternType}-${address})`} opacity="0.5" />
        
        {/* Abstract shapes */}
        <circle cx="320" cy="50" r="40" fill="rgba(255,255,255,0.05)" filter={`url(#blur-${address})`} />
        <circle cx="80" cy="150" r="30" fill="rgba(255,255,255,0.03)" filter={`url(#blur-${address})`} />
        
        {/* Keywords text */}
        <text x="200" y="180" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontFamily="system-ui, sans-serif" fontSize="12" fontWeight="500">
          {keywords.join(' • ')}
        </text>
        
        {/* Campaign icon */}
        <g transform="translate(200, 100)">
          <rect x="-20" y="-20" width="40" height="40" rx="8" fill="rgba(255,255,255,0.1)" />
          <path d="M-10,-5 L0,-10 L10,-5 L10,5 L0,10 L-10,5 Z" fill="rgba(255,255,255,0.2)" />
        </g>
      </svg>
    </div>
  );
}
