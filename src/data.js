/* ── Dummy data for the restaurant dashboard ── */

export const statsData = [
  {
    id: 'revenue',
    labelKey: 'dashboard.totalRevenue',
    value: 'EGP 0',
    trendKey: 'dashboard.waitingBackend',
    trendUp: null,
    gradient: 'from-green-400 to-green-600',
    iconBg: 'bg-green-300/40',
  },
  {
    id: 'orders',
    labelKey: 'dashboard.activeOrders',
    value: '0',
    trendKey: 'dashboard.waitingBackend',
    trendUp: null,
    gradient: 'from-blue-400 to-blue-600',
    iconBg: 'bg-blue-300/40',
  },
  {
    id: 'customers',
    labelKey: 'dashboard.newCustomers',
    value: '0',
    trendKey: 'dashboard.waitingBackend',
    trendUp: null,
    gradient: 'from-purple-500 to-purple-700',
    iconBg: 'bg-purple-300/40',
  },
  {
    id: 'preptime',
    labelKey: 'dashboard.avgPrepTime',
    value: '0m',
    trendKey: 'dashboard.waitingBackend',
    trendUp: null,
    gradient: 'from-orange-400 to-orange-500',
    iconBg: 'bg-orange-300/40',
  },
];

export const revenueData = [
  { dayKey: 'sun', revenue: 0 },
  { dayKey: 'sat', revenue: 0 },
  { dayKey: 'fri', revenue: 0 },
  { dayKey: 'thu', revenue: 0 },
  { dayKey: 'wed', revenue: 0 },
  { dayKey: 'tue', revenue: 0 },
  { dayKey: 'mon', revenue: 0 },
];

export const recentOrders = [];
