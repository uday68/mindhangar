import React, { useEffect } from 'react';
import { Sidebar } from './components/Layout/Sidebar';
import { Workspace } from './components/Layout/Workspace';
import { LoginScreen } from './components/Auth/LoginScreen';
import { OnboardingModal } from './components/Auth/OnboardingModal';
import { KaggleThumbnail } from './components/Marketing/KaggleThumbnail';
import { CommandPalette } from './components/Shared/CommandPalette';
import { useStore } from './store/useStore';

function App() {
  const { user, showOnboarding, marketingMode, toggleMarketingMode, toggleCommandPalette } = useStore();

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle Command Palette (Cmd+K or Ctrl+K)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggleCommandPalette();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleCommandPalette]);

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden text-gray-800">
      <Sidebar />
      <Workspace />
      <CommandPalette />
      {showOnboarding && <OnboardingModal />}
      {marketingMode && <KaggleThumbnail onClose={toggleMarketingMode} />}
    </div>
  );
}

export default App;