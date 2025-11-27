import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { HomeView } from './views/HomeView';
import { FindTeachersView } from './views/FindTeachersView';
import { MySkillsView } from './views/MySkillsView';
import { ProfileView } from './views/ProfileView';

function AppContent() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentView, setCurrentView] = useState('home');
  const { user } = useAuth();

  const handleNavigate = (view: string) => {
    if (!user && view !== 'home') {
      setShowAuthModal(true);
      return;
    }
    setCurrentView(view);
  };

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return (
          <HomeView
            onNavigate={handleNavigate}
            onAuthClick={() => setShowAuthModal(true)}
            isAuthenticated={!!user}
          />
        );
      case 'find':
        return <FindTeachersView />;
      case 'skills':
        return <MySkillsView />;
      case 'profile':
        return <ProfileView />;
      case 'sessions':
        return (
          <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-7xl mx-auto text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Sessions</h1>
              <p className="text-lg text-gray-600">Manage your upcoming and past sessions</p>
              <div className="mt-8 text-gray-500">Coming soon...</div>
            </div>
          </div>
        );
      case 'marketplace':
        return (
          <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-7xl mx-auto text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Marketplace</h1>
              <p className="text-lg text-gray-600">Buy and sell courses, notes, and resources</p>
              <div className="mt-8 text-gray-500">Coming soon...</div>
            </div>
          </div>
        );
      case 'community':
        return (
          <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-7xl mx-auto text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Community Rooms</h1>
              <p className="text-lg text-gray-600">Join skill-based learning communities</p>
              <div className="mt-8 text-gray-500">Coming soon...</div>
            </div>
          </div>
        );
      case 'notifications':
        return (
          <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-7xl mx-auto text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Notifications</h1>
              <p className="text-lg text-gray-600">Stay updated with your latest activities</p>
              <div className="mt-8 text-gray-500">No new notifications</div>
            </div>
          </div>
        );
      default:
        return (
          <HomeView
            onNavigate={handleNavigate}
            onAuthClick={() => setShowAuthModal(true)}
            isAuthenticated={!!user}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        onAuthClick={() => setShowAuthModal(true)}
        onNavigate={handleNavigate}
        currentView={currentView}
      />
      {renderView()}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
