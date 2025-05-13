'use client';

import { useState } from 'react';
import SignInForm from '../components/SignInForm';
import SignUpForm from '../components/SignUpForm';
import { BellIcon, NewspaperIcon, StarIcon, ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/outline';

const features = [
  {
    icon: BellIcon,
    title: 'Real-time Match Notifications',
    description: 'Get instant alerts for match starts, key moments, and results for your favorite players.'
  },
  {
    icon: NewspaperIcon,
    title: 'Press Conference Updates',
    description: 'Access post-match press conference transcripts and summaries, straight to your inbox.'
  },
  {
    icon: StarIcon,
    title: 'Personalized Experience',
    description: 'Follow your favorite players and receive customized notifications that matter to you.'
  },
  {
    icon: ChatBubbleBottomCenterTextIcon,
    title: 'Match Insights',
    description: 'Get AI-powered match summaries and key statistics during and after matches.'
  }
];

export default function MarketingPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Tennis Information That Matters
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Your personalized tennis companion. Get real-time updates, press conference insights, 
            and match notifications tailored just for you.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center mb-4">
                <feature.icon className="h-6 w-6 text-blue-500 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Auth Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
          <div className="flex justify-center space-x-4 mb-8">
            <button
              onClick={() => setMode('signin')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                mode === 'signin'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                mode === 'signup'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Join Beta
            </button>
          </div>

          {mode === 'signin' ? <SignInForm /> : <SignUpForm />}

          <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>
              {mode === 'signin' ? (
                <>
                  New to Tennis Tracker?{' '}
                  <button
                    onClick={() => setMode('signup')}
                    className="text-blue-600 hover:text-blue-500 font-medium"
                  >
                    Join our beta program
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    onClick={() => setMode('signin')}
                    className="text-blue-600 hover:text-blue-500 font-medium"
                  >
                    Sign in here
                  </button>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Beta Badge */}
        <div className="mt-12 text-center">
          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            🎾 Currently in Beta - Join Now for Early Access
          </span>
        </div>
      </div>
    </main>
  );
} 