import { useState, useCallback } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { ProfileLogoProvider } from '../contexts/ProfileLogoContext';
import { LanguageProvider } from '../contexts/LanguageContext';

export default function Layout({ children, currentView, onNavigate }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const handleNavigate = useCallback((id) => {
    onNavigate(id);
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [onNavigate]);

  return (
    <LanguageProvider>
      <ProfileLogoProvider>
        <div className="min-h-screen bg-[#f5f5f7]">
        {/* Fixed Navbar */}
        <Navbar 
          sidebarOpen={sidebarOpen} 
          onToggleSidebar={toggleSidebar}
          currentView={currentView}
          onNavigate={handleNavigate}
        />

        {/* Sidebar (Overlay or Off-canvas depending on screen) */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={closeSidebar}
          activeItem={currentView}
          onNavigate={handleNavigate}
        />

        {/* Page content — offset for fixed navbar */}
          <div className="pt-[76px]">
            {children}
          </div>
        </div>
      </ProfileLogoProvider>
    </LanguageProvider>
  );
}
