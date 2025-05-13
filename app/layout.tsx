import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from './components/Navigation'
import ThemeProvider from './components/ThemeProvider'
import ThemeToggle from './components/ThemeToggle'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Tennis Tracker - Live Matches & Rankings',
  description: 'Track live tennis matches and ATP rankings',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider>
          <div className="min-h-screen transition-colors duration-200">
            <Navigation />
            <div className="relative">
              <div className="absolute right-4 top-4">
                <ThemeToggle />
              </div>
              {children}
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
} 