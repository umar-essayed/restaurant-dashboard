import StatusCard from './StatusCard';
import StatsGrid from './StatsGrid';
import RevenueChart from './RevenueChart';
import RecentOrders from './RecentOrders';
import HelpSection from './HelpSection';
import { useLanguage } from '../contexts/LanguageContext';
import { translate } from '../locales/translations';

export default function DashboardOverview() {
  const { language } = useLanguage();

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header & Status */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {translate(language, 'dashboard.overview')}
          </h1>
          <p className="text-gray-500 mt-1">
            {translate(language, 'dashboard.welcome')}
          </p>
        </div>
        <div className="w-full md:w-auto">
          <StatusCard />
        </div>
      </header>

      {/* 2x2 Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 xl:gap-8">
        {/* Row 1: Stats Grid & Revenue Chart */}
        <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <StatsGrid />
        </div>
        <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <RevenueChart />
        </div>

        {/* Row 2: Recent Orders & Help Section */}
        <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
          <RecentOrders />
        </div>
        <div className="animate-slide-up h-full" style={{ animationDelay: '400ms' }}>
          <div className="h-full">
            <HelpSection />
          </div>
        </div>
      </div>
    </div>
  );
}
