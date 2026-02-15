'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * OAuth Callback Page
 * 
 * This page is shown briefly after OAuth authentication completes.
 * It redirects the user back to the frontend application.
 */
export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to frontend after successful authentication
    const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:5173';
    window.location.href = frontendUrl;
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Authentication Successful
        </h2>
        <p className="text-gray-600">
          Redirecting you back to the app...
        </p>
      </div>
    </div>
  );
}
