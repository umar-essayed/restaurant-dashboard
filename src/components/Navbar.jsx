import { useState } from 'react';
import { Bell, Store, Menu, X } from 'lucide-react';
import { useRestaurantName } from '../contexts/ProfileLogoContext';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../locales/translations';
import NotificationCenter from './NotificationCenter';

export default function Navbar({ sidebarOpen, onToggleSidebar, currentView, onNavigate }) {
  const [hasNotification] = useState(true);
  const [restaurantName] = useRestaurantName();
  const { language } = useLanguage();
  const t = translations[language];

  const navLinks = [
    { id: 'Dashboard', label: t.sidebar.dashboard },
    { id: 'Orders', label: t.sidebar.orders },
    { id: 'Menu', label: t.sidebar.menu },
    { id: 'Analytics', label: t.sidebar.analytics },
    { id: 'Profile', label: t.sidebar.profile },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100">
      <div className="flex items-center justify-between px-4 py-3 lg:px-8 w-full">
        {/* Left: Hamburger + Logo + Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl hover:bg-gray-100 active:scale-95 transition-all duration-200"
            aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            {sidebarOpen ? (
              <X className="w-5 h-5 text-gray-700" />
            ) : (
              <Menu className="w-5 h-5 text-gray-700" />
            )}
          </button>
          
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-md hidden sm:flex">
            <Store className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight hidden md:inline">
            {restaurantName}
          </span>
        </div>

        {/* Center: Navigation Links */}
        <div className="hidden md:flex items-center gap-1 bg-gray-50/80 p-1 rounded-2xl border border-gray-100">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => onNavigate(link.id)}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                currentView === link.id
                  ? 'bg-white text-orange-500 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100/50'
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Right: Notification Center */}
        <div className="flex items-center gap-3">
          <NotificationCenter />
        </div>
      </div>
    </nav>
  );
}
