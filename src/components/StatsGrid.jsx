import { DollarSign, ClipboardList, Users, Timer, TrendingUp } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { translate } from '../locales/translations';
import { useRestaurant } from '../contexts/RestaurantContext';
import { useEffect, useState } from 'react';
import restaurantService from '../services/restaurant.service';

const iconMap = {
  revenue: DollarSign,
  orders: ClipboardList,
  customers: Users,
  preptime: Timer,
};

export default function StatsGrid() {
  const { language } = useLanguage();
  const { selectedRestaurant } = useRestaurant();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (selectedRestaurant?.id) {
      restaurantService.getStats(selectedRestaurant.id).then(setStats);
    }
  }, [selectedRestaurant]);

  const displayStats = [
    {
      id: 'revenue',
      labelKey: 'dashboard.totalRevenue',
      value: `EGP ${stats?.totalRevenue || 0}`,
      trendKey: stats ? null : 'dashboard.waitingBackend',
      trendUp: true,
      gradient: 'from-green-400 to-green-600',
      iconBg: 'bg-green-300/40',
    },
    {
      id: 'orders',
      labelKey: 'dashboard.activeOrders',
      value: stats?.totalOrders || 0,
      trendKey: stats ? null : 'dashboard.waitingBackend',
      trendUp: true,
      gradient: 'from-blue-400 to-blue-600',
      iconBg: 'bg-blue-300/40',
    },
    {
      id: 'customers',
      labelKey: 'dashboard.newCustomers',
      value: stats?.totalCustomers || 0,
      trendKey: stats ? null : 'dashboard.waitingBackend',
      trendUp: true,
      gradient: 'from-purple-500 to-purple-700',
      iconBg: 'bg-purple-300/40',
    },
    {
      id: 'preptime',
      labelKey: 'dashboard.avgPrepTime',
      value: `${stats?.avgPrepTime || 0}m`,
      trendKey: stats ? null : 'dashboard.waitingBackend',
      trendUp: false,
      gradient: 'from-orange-400 to-orange-500',
      iconBg: 'bg-orange-300/40',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      {displayStats.map((stat, index) => {
        const Icon = iconMap[stat.id];
        const label = stat.labelKey ? translate(language, stat.labelKey) : stat.label;
        const trend = stat.trendKey ? translate(language, stat.trendKey) : stat.trend;
        return (
          <div
            key={stat.id}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${stat.gradient} p-4 sm:p-5 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300`}
            style={{ animationDelay: `${index * 80}ms` }}
          >
            {/* Top row — Icon + Trend Arrow */}
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className={`w-9 h-9 rounded-xl ${stat.iconBg} flex items-center justify-center`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              {stat.trendUp !== null && (
                <div className={`w-7 h-7 rounded-full ${stat.iconBg} flex items-center justify-center`}>
                  <TrendingUp className="w-3.5 h-3.5 text-white" />
                </div>
              )}
            </div>

            {/* Value */}
            <p className="text-2xl sm:text-3xl font-extrabold leading-tight">{stat.value}</p>

            {/* Label */}
            <p className="text-sm font-medium text-white/80 mt-0.5">{label}</p>

            {/* Trend */}
            <p className="text-xs text-white/60 mt-1">{trend}</p>

            {/* Decorative circle */}
            <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-white/5" />
          </div>
        );
      })}
    </div>
  );
}

