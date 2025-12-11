import React from 'react';
import { Sidebar } from './components/Layout/Sidebar';
import { Workspace } from './components/Layout/Workspace';
import { LoginScreen } from './components/Auth/LoginScreen';
import { useStore } from './store/useStore';

function App() {
  const { user } = useStore();

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden text-gray-800">
      <Sidebar />
      <Workspace />
    </div>
  );
}

export default App;