'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

/**
 * OAuth Error Page
 * 
 * This page is shown when OAuth authentication fails.
 * It displays the error and provides a link back to the login page.
 */
export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const errorParam = searchParams.get('error');
    setError(errorParam || 'Unknown error occurred');
  }, [searchParams]);

  const handleRetry = () => {
    const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:5173';
    window.location.href = frontendUrl;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Authentication Failed
          </h2>
          <p className="text-gray-600 mb-6">
            {error === 'OAuthAccountNotLinked'
              ? 'This email is already associated with another account. Please use the same login method you used previously.'
              : error === 'AccessDenied'
              ? 'You denied access to your account. Please try again and grant the necessary permissions.'
              : `An error occurred during authentication: ${error}`}
          </p>
          <button
            onClick={handleRetry}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
