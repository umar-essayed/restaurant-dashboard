import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import DashboardOverview from './components/DashboardOverview';
import OrdersView from './components/OrdersView';
import MenuView from './components/MenuView';
import AnalyticsView from './components/AnalyticsView';
import ProfileView from './components/ProfileView';
import SettingsView from './components/SettingsView';
import SupportView from './components/SupportView';
import DeliveryFeesView from './components/DeliveryFeesView';
import WalletView from './components/WalletView';
import PromotionsView from './components/PromotionsView';
import ReviewsView from './components/ReviewsView';
import LoginView from './components/LoginView';
import DriversView from './components/DriversView';
import { RestaurantProvider } from './contexts/RestaurantContext';
import { SocketProvider } from './contexts/SocketContext';
import NewOrderAlert from './components/NewOrderAlert';
import authService from './services/auth.service';

export default function App() {
  const [currentView, setCurrentView] = useState('Dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      authService.getProfile().then(setUser).catch(() => {
        setIsAuthenticated(false);
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('token');
      });
    }
  }, [isAuthenticated]);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  const handleNavigate = (view) => {
    if (view === 'logout') {
      authService.logout();
      setIsAuthenticated(false);
      setUser(null);
      setCurrentView('Dashboard');
    } else {
      setCurrentView(view);
    }
  };

  return (
    <RestaurantProvider>
      <SocketProvider>
        <Layout currentView={currentView} onNavigate={handleNavigate} user={user}>
          <NewOrderAlert />
          {currentView === 'Dashboard' && <DashboardOverview />}
          {currentView === 'Orders' && <OrdersView />}
          {currentView === 'Menu' && <MenuView />}
          {currentView === 'Analytics' && <AnalyticsView />}
          {currentView === 'Profile' && <ProfileView />}
          {currentView === 'settings' && <SettingsView onNavigate={handleNavigate} />}
          {currentView === 'support' && <SupportView />}
          {currentView === 'delivery-fees' && <DeliveryFeesView />}
          {currentView === 'wallet' && <WalletView />}
          {currentView === 'promotions' && <PromotionsView />}
          {currentView === 'reviews' && <ReviewsView />}
          {currentView === 'Drivers' && <DriversView />}
          
          {!['Dashboard', 'Orders', 'Menu', 'Analytics', 'Profile', 'settings', 'support', 'delivery-fees', 'wallet', 'promotions', 'reviews', 'Drivers'].includes(currentView) && (
            <div className="flex items-center justify-center h-full min-h-[50vh]">
              <p className="text-xl text-gray-500 font-medium">
                <span className="text-orange-500 font-bold">{currentView}</span> view is coming soon!
              </p>
            </div>
          )}
        </Layout>
      </SocketProvider>
    </RestaurantProvider>
  );
}

