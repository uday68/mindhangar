
import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Icons } from '../Icons';
import { AuthProvider } from '../../types';

export const LoginScreen: React.FC = () => {
  const { login, isLoadingAuth } = useStore();
  const [activeProvider, setActiveProvider] = useState<AuthProvider | null>(null);

  const handleLogin = async (provider: AuthProvider) => {
    setActiveProvider(provider);
    await login(provider);
    setActiveProvider(null);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-white">
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-600/20 rounded-full blur-[100px] animate-pulse delay-700"></div>
      </div>

      <div className="relative z-10 w-full max-w-md p-1">
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-tr from-teal-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <span className="text-3xl font-bold text-white">M</span>
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
            <p className="text-slate-400 text-sm">Sign in to your intelligent workspace</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => handleLogin('google')}
              disabled={isLoadingAuth}
              className={`w-full flex items-center justify-center gap-3 bg-white text-slate-900 font-bold py-3.5 rounded-xl hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden ${activeProvider === 'google' ? 'cursor-wait' : ''}`}
            >
              {activeProvider === 'google' ? (
                <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Icons.Google />
                  <span>Continue with Google</span>
                  <Icons.ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <button
              onClick={() => handleLogin('github')}
              disabled={isLoadingAuth}
              className={`w-full flex items-center justify-center gap-3 bg-slate-800 text-white font-bold py-3.5 rounded-xl border border-slate-700 hover:bg-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${activeProvider === 'github' ? 'cursor-wait' : ''}`}
            >
              {activeProvider === 'github' ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Icons.Github className="w-5 h-5" />
                  <span>Continue with GitHub</span>
                </>
              )}
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-xs text-slate-500">
              By continuing, you agree to our <span className="text-indigo-400 cursor-pointer hover:underline">Terms</span> and <span className="text-indigo-400 cursor-pointer hover:underline">Privacy Policy</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
