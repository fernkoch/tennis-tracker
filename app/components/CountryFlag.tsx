'use client';

import { useState } from 'react';

interface CountryFlagProps {
  countryCode: string;
  className?: string;
}

const countryCodeMap: { [key: string]: string } = {
  'SRB': 'RS',
  'ITA': 'IT',
  'ESP': 'ES',
  'RUS': 'RU',
  'GER': 'DE',
  'NOR': 'NO',
  'POL': 'PL',
  'AUS': 'AU',
  'BUL': 'BG',
  'GBR': 'GB',
  'USA': 'US',
  'FRA': 'FR',
  'GRE': 'GR',
  'CAN': 'CA',
  'DEN': 'DK',
  'ARG': 'AR',
  'CRO': 'HR',
  'SUI': 'CH',
};

const countryNames: { [key: string]: string } = {
  'SRB': 'Serbia',
  'ITA': 'Italy',
  'ESP': 'Spain',
  'RUS': 'Russia',
  'GER': 'Germany',
  'NOR': 'Norway',
  'POL': 'Poland',
  'AUS': 'Australia',
  'BUL': 'Bulgaria',
  'GBR': 'Great Britain',
  'USA': 'United States',
  'FRA': 'France',
  'GRE': 'Greece',
  'CAN': 'Canada',
  'DEN': 'Denmark',
  'ARG': 'Argentina',
  'CRO': 'Croatia',
  'SUI': 'Switzerland',
};

export default function CountryFlag({ countryCode, className = "w-4 h-3" }: CountryFlagProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const code = countryCodeMap[countryCode] || countryCode;
  const flagUrl = `https://flagcdn.com/w20/${code.toLowerCase()}.png`;
  const countryName = countryNames[countryCode] || countryCode;

  return (
    <div className="relative inline-block">
      <img
        src={flagUrl}
        alt={`${countryCode} flag`}
        className={`inline-block ${className} object-cover rounded-sm`}
        loading="lazy"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      />
      {showTooltip && (
        <div className="absolute z-10 px-2 py-1 text-xs text-white bg-gray-800 rounded-md -top-7 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
          {countryCode} - {countryName}
        </div>
      )}
    </div>
  );
} 