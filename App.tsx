import { useEffect } from 'react';
import { Navbar } from './components/Layout/Navbar';
import { Sidebar } from './components/Layout/Sidebar';
import { MobileNav } from './components/Layout/MobileNav';
import { Workspace } from './components/Layout/Workspace';
import { LoginScreen } from './components/Auth/LoginScreen';
import { AIGuidedOnboarding } from './components/Auth/AIGuidedOnboarding';
import { KaggleThumbnail } from './components/Marketing/KaggleThumbnail';
import { CommandPalette } from './components/Shared/CommandPalette';
import { UpgradeModal } from './components/Shared/UpgradeModal';
import { DataUsageIndicator } from './components/Shared/DataUsageIndicator';
import { OfflineIndicator } from './components/Shared/OfflineIndicator';
import { AIAssistantWidget } from './components/Shared/AIAssistantWidget';
import { LanguageSelector } from './src/components/LanguageSelector';
import { useStore } from './store/useStore';
import { offlineSyncService } from './src/services/OfflineSyncService';
import { aiAssistant } from './src/services/AIAssistantService';
import './src/styles/mobile.css';

function App() {
  const { user, showOnboarding, marketingMode, toggleMarketingMode, toggleCommandPalette, isUpgradeModalOpen, settings } = useStore();

  // Initialize backend services when user logs in
  useEffect(() => {
    if (user) {
      // Initialize offline sync service
      offlineSyncService.init().then(() => {
        console.log('✅ Offline sync service initialized');
      });

      // Initialize AI Assistant - will use free Hugging Face models if no API key
      aiAssistant.initialize(settings.apiKey).then((success) => {
        if (success) {
          console.log('✅ AI Assistant initialized');
        } else {
          console.warn('⚠️ AI Assistant initialization failed, retrying with free models...');
          // Retry without API key to use free models
          aiAssistant.initialize().then((retrySuccess) => {
            if (retrySuccess) {
              console.log('✅ AI Assistant initialized with free models');
            }
          });
        }
      });

      // Initialize other services dynamically
      import('./src/services').then(({ initializeBackendServices }) => {
        initializeBackendServices(user.id).then(() => {
          console.log('✅ All backend services initialized');
        }).catch((error) => {
          console.error('❌ Failed to initialize backend services:', error);
        });
      });

      return () => {
        offlineSyncService.destroy();
        
        // Cleanup other services
        import('./src/services').then(({ cleanupBackendServices }) => {
          cleanupBackendServices();
        });
      };
    }
  }, [user, settings.apiKey]);

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
    return (
      <>
        <LoginScreen />
        {/* Language selector visible on login screen too */}
        <div className="fixed top-4 right-4 z-[10000] flex items-center gap-2">
          <LanguageSelector compact={true} className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg px-3 py-2" />
        </div>
      </>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden text-gray-800 bg-gray-50">
      {/* Top Navbar */}
      <Navbar />
      
      {/* Main Content Area */}
      <div className="flex flex-1 pt-16 overflow-hidden">
        {/* Desktop Sidebar - Always visible on desktop */}
        <div className="sidebar-desktop hidden md:block">
          <Sidebar />
        </div>
        
        {/* Main Workspace */}
        <Workspace />
        
        {/* Mobile Navigation - Only visible on mobile */}
        <div className="md:hidden">
          <MobileNav />
        </div>
      </div>
      
      {/* Mobile Language Selector - Only on mobile */}
      <div className="md:hidden fixed top-20 right-4 z-[60]">
        <LanguageSelector compact={true} className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg px-3 py-2" />
      </div>
      
      <DataUsageIndicator />
      <OfflineIndicator />
      <AIAssistantWidget />
      <CommandPalette />
      {isUpgradeModalOpen && <UpgradeModal />}
      {showOnboarding && <AIGuidedOnboarding />}
      {marketingMode && <KaggleThumbnail onClose={toggleMarketingMode} />}
    </div>
  );
}

export default App;