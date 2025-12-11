import React from 'react';
import { Sidebar } from './components/Layout/Sidebar';
import { Workspace } from './components/Layout/Workspace';
import { LoginScreen } from './components/Auth/LoginScreen';
import { OnboardingModal } from './components/Auth/OnboardingModal';
import { useStore } from './store/useStore';

function App() {
  const { user, showOnboarding } = useStore();

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden text-gray-800">
      <Sidebar />
      <Workspace />
      {showOnboarding && <OnboardingModal />}
    </div>
  );
}

export default App;