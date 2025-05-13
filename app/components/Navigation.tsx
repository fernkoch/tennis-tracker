'use client';

import Link from 'next/link';
import { useTheme } from './ThemeProvider';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const { theme } = useTheme();
  const pathname = usePathname();
  
  return (
    <nav className={`shadow transition-colors ${theme === 'dark' ? 'bg-gray-800 border-b border-gray-700' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link 
                href="/" 
                className={`text-xl font-bold ${
                  theme === 'dark' ? 'text-white hover:text-gray-200' : 'text-gray-800 hover:text-gray-600'
                }`}
              >
                Tennis Tracker
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                  pathname === '/'
                    ? theme === 'dark'
                      ? 'text-white border-blue-500'
                      : 'text-gray-900 border-blue-500'
                    : theme === 'dark'
                    ? 'text-gray-100 border-transparent hover:border-gray-300 hover:text-gray-300'
                    : 'text-gray-900 border-transparent hover:border-gray-300'
                }`}
              >
                Matches
              </Link>
              <Link
                href="/rankings"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                  pathname === '/rankings'
                    ? theme === 'dark'
                      ? 'text-white border-blue-500'
                      : 'text-gray-900 border-blue-500'
                    : theme === 'dark'
                    ? 'text-gray-100 border-transparent hover:border-gray-300 hover:text-gray-300'
                    : 'text-gray-900 border-transparent hover:border-gray-300'
                }`}
              >
                Rankings
              </Link>
              <Link
                href="/marketing"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                  pathname === '/marketing'
                    ? theme === 'dark'
                      ? 'text-white border-blue-500'
                      : 'text-gray-900 border-blue-500'
                    : theme === 'dark'
                    ? 'text-gray-100 border-transparent hover:border-gray-300 hover:text-gray-300'
                    : 'text-gray-900 border-transparent hover:border-gray-300'
                }`}
              >
                Join Beta
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 