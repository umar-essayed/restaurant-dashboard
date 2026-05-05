import { TrendingUp } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';
import { translate } from '../locales/translations';
import { useRestaurant } from '../contexts/RestaurantContext';
import { useEffect, useState } from 'react';
import restaurantService from '../services/restaurant.service';

/* Custom tooltip */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white shadow-lg rounded-xl px-3 py-2 border border-gray-100">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-bold text-gray-800">EGP {payload[0].value.toFixed(2)}</p>
    </div>
  );
}

export default function RevenueChart() {
  const { language } = useLanguage();
  const { selectedRestaurant } = useRestaurant();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedRestaurant?.id) {
      setLoading(true);
      restaurantService.getStats(selectedRestaurant.id)
        .then(stats => {
          if (stats?.weeklyRevenue) {
            setData(stats.weeklyRevenue.map(d => ({
              ...d,
              dayLabel: translate(language, `dashboard.day.${d.dayKey}`)
            })));
          }
        })
        .finally(() => setLoading(false));
    }
  }, [selectedRestaurant, language]);

  const maxRevenue = data.length > 0 ? Math.max(...data.map((d) => d.revenue)) : 0;

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">{translate(language, 'dashboard.revenueOverview')}</h2>
        <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-600 text-xs font-semibold px-3 py-1.5 rounded-full border border-green-200">
          <TrendingUp className="w-3.5 h-3.5" />
          {translate(language, 'dashboard.thisWeek')}
        </span>
      </div>

      {/* Chart */}
      <div className="w-full flex-1 min-h-[220px]">
        {loading ? (
          <div className="h-full flex items-center justify-center">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis
                dataKey="dayLabel"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9ca3af', fontSize: 12 }}
              />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
              <Bar dataKey="revenue" radius={[8, 8, 4, 4]} maxBarSize={40}>
                {data.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={
                      entry.revenue === maxRevenue && maxRevenue > 0
                        ? 'url(#orangeGradient)'
                        : '#f97316'
                    }
                    fillOpacity={entry.revenue === maxRevenue && maxRevenue > 0 ? 1 : 0.35}
                  />
                ))}
              </Bar>
              <defs>
                <linearGradient id="orangeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fb923c" />
                  <stop offset="100%" stopColor="#ea580c" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
