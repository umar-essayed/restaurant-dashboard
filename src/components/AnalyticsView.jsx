import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { translate } from '../locales/translations';
import { 
  DollarSign, 
  ReceiptText, 
  BarChart2, 
  CheckCircle2, 
  TrendingUp,
  BarChart3,
  CheckCircle,
  XCircle,
  Undo2,
  Trophy,
  Clock,
  RefreshCw,
  CalendarDays,
  X
} from 'lucide-react';
import restaurantService from '../services/restaurant.service';
import { useRestaurant } from '../contexts/RestaurantContext';

const DEFAULT_DATA = {
  revenue: 'EGP 0.00', 
  orders: '0', 
  avgOrder: 'EGP 0.00', 
  completion: '0.0%',
  delivered: 0, 
  cancelled: 0, 
  refunded: 0,
  topItems: [],
  revenueTrend: [], 
  orderVolume: [], 
  peakHours: Array(24).fill(0)
};

export default function AnalyticsView() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const t = (key) => translate(language, `analytics.${key}`);

  const { selectedRestaurant } = useRestaurant();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('thisWeek');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [error, setError] = useState(null);

  const fetchAnalytics = async (range) => {
    if (!selectedRestaurant?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      const res = await restaurantService.getAnalytics(selectedRestaurant.id, range);
      
      const raw = res?.data || res || {};
      console.log('Analytics Data Received:', raw);
      
      const formattedData = {
        ...DEFAULT_DATA,
        ...raw,
        revenue: raw.revenue || DEFAULT_DATA.revenue,
        orders: raw.orders?.toString() || DEFAULT_DATA.orders,
        avgOrder: raw.avgOrder || DEFAULT_DATA.avgOrder,
        completion: raw.completion || DEFAULT_DATA.completion,
        revenueTrend: Array.isArray(raw.revenueTrend) ? raw.revenueTrend : DEFAULT_DATA.revenueTrend,
        orderVolume: Array.isArray(raw.orderVolume) ? raw.orderVolume : DEFAULT_DATA.orderVolume,
        peakHours: Array.isArray(raw.peakHours) ? raw.peakHours : DEFAULT_DATA.peakHours,
        topItems: Array.isArray(raw.topItems) ? raw.topItems : 
                  (raw.topItem ? [{ name: raw.topItem, sales: raw.topSales }] : [])
      };
      
      setData(formattedData);
    } catch (err) {
      console.error('Failed to fetch analytics', err);
      setError(err.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedRestaurant?.id && activeTab !== 'custom') {
      fetchAnalytics(activeTab);
    }
  }, [selectedRestaurant, activeTab]);

  const handleTabClick = (tabKey) => {
    setActiveTab(tabKey);
    if (tabKey === 'custom') {
      setIsDatePickerOpen(true);
    } else {
      setIsDatePickerOpen(false);
    }
  };

  const handleApplyCustom = () => {
    setIsDatePickerOpen(false);
    fetchAnalytics('custom');
  };

  const currentData = data || DEFAULT_DATA;
  
  const getBarHeight = (val, arr) => {
    if (!Array.isArray(arr) || arr.length === 0) return '0%';
    const numericArr = arr.map(n => Number(n) || 0);
    const max = Math.max(...numericArr, 1);
    const height = (Number(val) / max) * 100;
    return `${Math.max(height, 5)}%`; // Min 5% height
  };

  const tabKeys = ['today', 'thisWeek', 'thisMonth', 'lastMonth', 'custom'];
  const tabLabels = tabKeys.map(key => t(key));

  return (
    <div dir={isArabic ? 'rtl' : 'ltr'} className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col h-full bg-[#fafafa] animate-fade-in space-y-6 sm:space-y-8 pb-20 relative">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h2 className="text-xl font-black text-slate-800 hidden sm:block">{t('title')}</h2>
        
        <div className="flex overflow-x-auto hide-scrollbar gap-2 sm:gap-3 pb-2 justify-start sm:justify-center -mx-4 px-4 sm:mx-0 sm:px-0 w-full sm:w-auto">
          {tabKeys.map((tabKey, index) => (
            <button
              key={tabKey}
              onClick={() => handleTabClick(tabKey)}
              className={`whitespace-nowrap px-4 sm:px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all focus:outline-none flex items-center justify-center gap-2 ${
                activeTab === tabKey 
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' 
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {activeTab === tabKey ? <CheckCircle2 className="w-4 h-4" /> : null}
              {tabLabels[index]}
            </button>
          ))}
          
          <button 
            onClick={() => fetchAnalytics(activeTab)}
            disabled={loading}
            className="p-2.5 bg-white text-gray-400 border border-gray-200 rounded-xl hover:text-orange-500 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Custom Picker */}
      {isDatePickerOpen && activeTab === 'custom' && (
        <div className="flex justify-center animate-fade-in">
          <div className="bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex flex-col sm:flex-row items-center gap-4 relative">
            <button onClick={() => setIsDatePickerOpen(false)} className="absolute right-2 top-2 p-1 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
            <input type="date" value={customRange.start} onChange={(e) => setCustomRange({...customRange, start: e.target.value})} className="px-3 py-2 border rounded-xl text-sm" />
            <input type="date" value={customRange.end} onChange={(e) => setCustomRange({...customRange, end: e.target.value})} className="px-3 py-2 border rounded-xl text-sm" />
            <button onClick={handleApplyCustom} className="px-6 py-2 bg-orange-500 text-white font-black rounded-xl text-xs uppercase tracking-wider">
              {t('applyFilter')}
            </button>
          </div>
        </div>
      )}

      {loading && !data ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20">
           <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        </div>
      ) : error ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 bg-white rounded-[32px] border border-dashed border-gray-200">
           <XCircle className="w-16 h-16 text-rose-500 mb-6" />
           <p className="text-xl font-black text-slate-800 mb-2">{isArabic ? 'فشل تحميل البيانات' : 'Failed to load analytics'}</p>
           <button onClick={() => fetchAnalytics(activeTab)} className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2">
             <RefreshCw className="w-4 h-4" /> {isArabic ? 'إعادة المحاولة' : 'Try Again'}
           </button>
        </div>
      ) : (
        <div className="w-full space-y-8 animate-fade-in">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#4ade80] rounded-[32px] p-6 text-white shadow-lg">
              <DollarSign className="w-5 h-5 mb-4 opacity-80" />
              <h3 className="text-2xl sm:text-3xl font-black mb-1">{currentData.revenue}</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/70">{t('totalRevenue')}</p>
            </div>
            <div className="bg-[#3b82f6] rounded-[32px] p-6 text-white shadow-lg">
              <ReceiptText className="w-5 h-5 mb-4 opacity-80" />
              <h3 className="text-2xl sm:text-3xl font-black mb-1">{currentData.orders}</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/70">{t('totalOrders')}</p>
            </div>
            <div className="bg-[#a855f7] rounded-[32px] p-6 text-white shadow-lg">
              <BarChart2 className="w-5 h-5 mb-4 opacity-80" />
              <h3 className="text-2xl sm:text-3xl font-black mb-1">{currentData.avgOrder}</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/70">{t('avgOrderValue')}</p>
            </div>
            <div className="bg-[#f59e0b] rounded-[32px] p-6 text-white shadow-lg">
              <CheckCircle2 className="w-5 h-5 mb-4 opacity-80" />
              <h3 className="text-2xl sm:text-3xl font-black mb-1">{currentData.completion}</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/70">{t('completionRate')}</p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-sm border border-gray-50">
              <div className={`flex items-center gap-3 mb-8 ${isArabic ? 'flex-row-reverse' : ''}`}>
                <TrendingUp className="w-6 h-6 text-[#4ade80]" />
                <h3 className="text-xl font-black text-slate-800">{t('revenueTrend')}</h3>
              </div>
              <div className="h-48 flex items-end justify-between gap-2">
                {currentData.revenueTrend.length > 0 ? currentData.revenueTrend.map((val, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                    <div className="w-full bg-gradient-to-t from-[#4ade80]/40 to-[#4ade80] rounded-t-xl transition-all duration-700" style={{ height: getBarHeight(val, currentData.revenueTrend) }} />
                    <span className="mt-2 text-[8px] font-black text-gray-400">{isArabic ? `يوم ${idx + 1}` : `D${idx + 1}`}</span>
                    <div className="absolute bottom-full mb-2 bg-slate-900 text-white px-2 py-1 rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity z-10">{val}</div>
                  </div>
                )) : (
                  <div className="flex-1 flex items-center justify-center text-gray-300 font-bold text-xs uppercase">{t('noData')}</div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-sm border border-gray-50">
              <div className={`flex items-center gap-3 mb-8 ${isArabic ? 'flex-row-reverse' : ''}`}>
                <BarChart3 className="w-6 h-6 text-[#3b82f6]" />
                <h3 className="text-xl font-black text-slate-800">{t('orderVolume')}</h3>
              </div>
              <div className="h-48 flex items-end justify-between gap-2">
                {currentData.orderVolume.length > 0 ? currentData.orderVolume.map((val, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                    <div className="w-full bg-gradient-to-t from-[#3b82f6]/40 to-[#3b82f6] rounded-t-xl transition-all duration-700" style={{ height: getBarHeight(val, currentData.orderVolume) }} />
                    <span className="mt-2 text-[8px] font-black text-gray-400">{isArabic ? `يوم ${idx + 1}` : `D${idx + 1}`}</span>
                    <div className="absolute bottom-full mb-2 bg-slate-900 text-white px-2 py-1 rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity z-10">{val}</div>
                  </div>
                )) : (
                  <div className="flex-1 flex items-center justify-center text-gray-300 font-bold text-xs uppercase">{t('noData')}</div>
                )}
              </div>
            </div>
          </div>

          {/* Status Counts & Peak Hours */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-[28px] p-4 shadow-sm border border-gray-50 flex flex-col items-center justify-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <span className="text-2xl font-black text-slate-800">{currentData.delivered}</span>
                <span className="text-[10px] font-black text-gray-400 uppercase">{t('delivered')}</span>
              </div>
              <div className="bg-white rounded-[28px] p-4 shadow-sm border border-gray-50 flex flex-col items-center justify-center gap-2">
                <XCircle className="w-6 h-6 text-red-500" />
                <span className="text-2xl font-black text-slate-800">{currentData.cancelled}</span>
                <span className="text-[10px] font-black text-gray-400 uppercase">{t('cancelled')}</span>
              </div>
              <div className="bg-white rounded-[28px] p-4 shadow-sm border border-gray-50 flex flex-col items-center justify-center gap-2">
                <Undo2 className="w-6 h-6 text-orange-500" />
                <span className="text-2xl font-black text-slate-800">{currentData.refunded}</span>
                <span className="text-[10px] font-black text-gray-400 uppercase">{t('refunded')}</span>
              </div>
            </div>

            <div className="lg:col-span-2 bg-white rounded-[32px] p-6 sm:p-8 shadow-sm border border-gray-50">
              <div className={`flex items-center gap-3 mb-8 ${isArabic ? 'flex-row-reverse' : ''}`}>
                <Clock className="w-6 h-6 text-orange-500" />
                <h3 className="text-xl font-black text-slate-800">{t('peakHours')}</h3>
              </div>
              <div className="h-32 flex items-end justify-between gap-1">
                {currentData.peakHours.map((val, hour) => (
                  <div key={hour} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                    <div className={`w-full ${val > 0 ? 'bg-orange-500' : 'bg-slate-100'} rounded-t-sm transition-all duration-1000`} style={{ height: getBarHeight(val, currentData.peakHours) }} />
                    <div className="absolute bottom-full mb-1 bg-slate-900 text-white px-1 py-0.5 rounded text-[8px] opacity-0 group-hover:opacity-100 z-10">{val}</div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-4 text-[8px] font-bold text-gray-400 px-1">
                <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>23:00</span>
              </div>
            </div>
          </div>

          {/* Top Selling Items */}
          <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-sm border border-gray-50">
            <div className={`flex items-center gap-3 mb-8 ${isArabic ? 'flex-row-reverse' : ''}`}>
              <Trophy className="w-6 h-6 text-orange-500" />
              <h3 className="text-xl font-black text-slate-800">{t('topSellingItems')}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentData.topItems.length > 0 ? currentData.topItems.map((item, idx) => (
                <div key={idx} className={`flex items-center gap-4 p-4 rounded-2xl bg-gray-50/50 ${isArabic ? 'flex-row-reverse' : ''}`}>
                  <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center font-black text-lg shadow-md shrink-0">{idx + 1}</div>
                  <div className={`flex-1 min-w-0 ${isArabic ? 'text-right' : 'text-left'}`}>
                    <h4 className="text-sm font-black text-slate-800 truncate">{item.name}</h4>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">{item.sales} {t('sold')}</p>
                  </div>
                </div>
              )) : (
                <div className="col-span-full py-10 flex flex-col items-center justify-center text-gray-300 gap-2">
                  <Trophy className="w-8 h-8 opacity-20" />
                  <span className="text-xs font-bold uppercase tracking-widest">{t('noData')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
