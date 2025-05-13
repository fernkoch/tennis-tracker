'use client';

import { useState, useRef, useEffect } from 'react';
import { useTheme } from './ThemeProvider';
import CountryFlag from './CountryFlag';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface CountryDropdownProps {
  countries: string[];
  selectedCountry: string | undefined;
  onSelect: (country: string | undefined) => void;
  playerCounts: Record<string, number>;
}

export default function CountryDropdown({ countries, selectedCountry, onSelect, playerCounts }: CountryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full px-4 py-2 text-sm rounded-lg border ${
          theme === 'dark'
            ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
        }`}
      >
        <div className="flex items-center space-x-2">
          {selectedCountry ? (
            <>
              <CountryFlag countryCode={selectedCountry} />
              <span>{selectedCountry} ({playerCounts[selectedCountry]})</span>
            </>
          ) : (
            <span>All Countries</span>
          )}
        </div>
        <ChevronDownIcon className="w-4 h-4 ml-2" />
      </button>

      {isOpen && (
        <div className={`absolute z-10 w-full mt-1 rounded-lg shadow-lg ${
          theme === 'dark' ? 'bg-gray-700 border border-gray-600' : 'bg-white border border-gray-300'
        }`}>
          <div className="py-1 max-h-60 overflow-auto">
            <button
              onClick={() => {
                onSelect(undefined);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm ${
                theme === 'dark'
                  ? 'text-white hover:bg-gray-600'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              All Countries
            </button>
            {countries.map(country => (
              <button
                key={country}
                onClick={() => {
                  onSelect(country);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-2 ${
                  theme === 'dark'
                    ? 'text-white hover:bg-gray-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <CountryFlag countryCode={country} />
                <span>{country} ({playerCounts[country]})</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 