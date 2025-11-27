import { useState } from 'react';
import { GraduationCap, Menu, X, Bell, Coins } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  onAuthClick: () => void;
  onNavigate: (view: string) => void;
  currentView: string;
}

export const Navbar = ({ onAuthClick, onNavigate, currentView }: NavbarProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuth();

  const navigation = [
    { name: 'Home', view: 'home' },
    { name: 'Find Teachers', view: 'find' },
    { name: 'My Skills', view: 'skills' },
    { name: 'Sessions', view: 'sessions' },
    { name: 'Marketplace', view: 'marketplace' },
    { name: 'Community', view: 'community' },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center space-x-2"
            >
              <GraduationCap className="text-blue-600" size={32} />
              <span className="text-2xl font-bold text-gray-900">SkillLink</span>
            </button>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => onNavigate(item.view)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  currentView === item.view
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-amber-50 rounded-lg">
                  <Coins className="text-amber-600" size={20} />
                  <span className="font-semibold text-amber-900">
                    {profile?.skill_coins || 0}
                  </span>
                </div>

                <button
                  onClick={() => onNavigate('notifications')}
                  className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <Bell size={20} />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                <button
                  onClick={() => onNavigate('profile')}
                  className="flex items-center space-x-2 px-3 py-1.5 hover:bg-gray-100 rounded-lg"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {profile?.full_name?.[0] || 'U'}
                  </div>
                  <span className="font-medium text-gray-700">
                    {profile?.full_name?.split(' ')[0] || 'User'}
                  </span>
                </button>

                <button
                  onClick={signOut}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={onAuthClick}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Sign In
              </button>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 space-y-2">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  onNavigate(item.view);
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-4 py-2 rounded-lg font-medium ${
                  currentView === item.view
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {item.name}
              </button>
            ))}
            {user ? (
              <button
                onClick={signOut}
                className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium"
              >
                Sign Out
              </button>
            ) : (
              <button
                onClick={() => {
                  onAuthClick();
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
