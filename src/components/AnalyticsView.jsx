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
  Users,
  UserPlus,
  RefreshCw,
  Star,
  CalendarDays,
  X,
  Loader2
} from 'lucide-react';
import restaurantService from '../services/restaurant.service';
import { useRestaurant } from '../contexts/RestaurantContext';

const MOCK_DATA = {
  revenue: 'EGP 0.00', orders: '0', avgOrder: 'EGP 0.00', completion: '0.0%',
  delivered: 0, cancelled: 0, refunded: 0,
  topItem: 'N/A', topSales: '0', topRevenue: 'EGP 0.00',
  revenueTrend: [], orderVolume: [], peakHours: Array(24).fill(0)
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

  useEffect(() => {
    if (selectedRestaurant?.id && activeTab !== 'custom') {
      fetchAnalytics(activeTab);
    }
  }, [selectedRestaurant, activeTab]);

  const fetchAnalytics = async (range) => {
    try {
      setLoading(true);
      const res = await restaurantService.getAnalytics(selectedRestaurant.id, range);
      setData(res);
    } catch (error) {
      console.error('Failed to fetch analytics', error);
    } finally {
      setLoading(false);
    }
  };

  const tabKeys = ['today', 'thisWeek', 'thisMonth', 'lastMonth', 'custom'];
  const tabLabels = tabKeys.map(key => t(key));

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
    // In a real app, we'd send the range to the server
    fetchAnalytics('custom');
  };

  const currentData = data || MOCK_DATA;
  
  // Helper to calculate percentage height for CSS bars
  const getBarHeight = (val, arr) => {
    const max = Math.max(...arr, 1);
    return `${(val / max) * 100}%`;
  };

  return (
    <div dir={isArabic ? 'rtl' : 'ltr'} lang={isArabic ? 'ar' : 'en'} className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col h-full bg-[#fafafa] animate-fade-in space-y-6 sm:space-y-8 pb-20 relative">
      
      {/* Header Tabs - Centered */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 sm:gap-3 pb-2 justify-start sm:justify-center -mx-4 px-4 sm:mx-0 sm:px-0">
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
            {tabKey === 'custom' && activeTab !== 'custom' ? <CalendarDays className="w-4 h-4 text-gray-400" /> : null}
            {tabLabels[index]}
          </button>
        ))}
      </div>

      {/* Date Picker Modal/Popup for Custom */}
      {isDatePickerOpen && activeTab === 'custom' && (
        <div className={`flex justify-center animate-fade-in fade-in-up -mt-2 mb-4 z-20 ${isArabic ? 'flex-row-reverse' : ''}`}>
          <div className={`bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex flex-col sm:flex-row items-end sm:items-center gap-4 relative ${isArabic ? 'flex-row-reverse' : ''}`}>
            <button 
              onClick={() => setIsDatePickerOpen(false)}
              className={`absolute ${isArabic ? 'left-2' : 'right-2'} top-2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50`}
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex flex-col gap-1 w-full sm:w-auto">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('startDate')}</label>
              <input 
                type="date" 
                value={customRange.start}
                onChange={(e) => setCustomRange({...customRange, start: e.target.value})}
                className="px-3 py-2 border border-gray-100 rounded-xl text-sm font-bold text-gray-700 focus:border-orange-500 outline-none" 
              />
            </div>
            <div className="flex flex-col gap-1 w-full sm:w-auto">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('endDate')}</label>
              <input 
                type="date" 
                value={customRange.end}
                onChange={(e) => setCustomRange({...customRange, end: e.target.value})}
                className="px-3 py-2 border border-gray-100 rounded-xl text-sm font-bold text-gray-700 focus:border-orange-500 outline-none" 
              />
            </div>
            <button 
              onClick={handleApplyCustom}
              className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-xl text-xs uppercase tracking-wider shadow-sm transition-all"
            >
              {t('applyFilter')}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20">
           <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
           <p className="text-gray-400 font-black text-xs uppercase tracking-widest">{translate(language, 'common.loading')}</p>
        </div>
      ) : (
        <div className="w-full space-y-6 sm:space-y-8 mt-4 animate-fade-in">

          {/* KPI CARDS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#4ade80] rounded-[32px] p-6 text-white relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/20 rounded-full blur-2xl group-hover:scale-125 transition-transform"></div>
              <DollarSign className="w-5 h-5 mb-4 opacity-80" />
              <h3 className="text-2xl sm:text-3xl font-black mb-1">{currentData.revenue}</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/70">{t('totalRevenue')}</p>
            </div>
            <div className="bg-[#3b82f6] rounded-[32px] p-6 text-white relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/20 rounded-full blur-2xl group-hover:scale-125 transition-transform"></div>
              <ReceiptText className="w-5 h-5 mb-4 opacity-80" />
              <h3 className="text-2xl sm:text-3xl font-black mb-1">{currentData.orders}</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/70">{t('totalOrders')}</p>
            </div>
            <div className="bg-[#a855f7] rounded-[32px] p-6 text-white relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/20 rounded-full blur-2xl group-hover:scale-125 transition-transform"></div>
              <BarChart2 className="w-5 h-5 mb-4 opacity-80" />
              <h3 className="text-2xl sm:text-3xl font-black mb-1">{currentData.avgOrder}</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/70">{t('avgOrderValue')}</p>
            </div>
            <div className="bg-[#f59e0b] rounded-[32px] p-6 text-white relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/20 rounded-full blur-2xl group-hover:scale-125 transition-transform"></div>
              <CheckCircle2 className="w-5 h-5 mb-4 opacity-80" />
              <h3 className="text-2xl sm:text-3xl font-black mb-1">{currentData.completion}</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/70">{t('completionRate')}</p>
            </div>
          </div>

          {/* CHARTS ROW */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-sm border border-gray-50">
              <div className={`flex items-center gap-3 mb-8 ${isArabic ? 'flex-row-reverse' : ''}`}>
                <TrendingUp className="w-6 h-6 text-orange-500" />
                <h3 className="text-xl font-black text-slate-800">{t('revenueTrend')}</h3>
              </div>
              <div className="relative h-48 w-full flex items-end justify-between gap-1 sm:gap-2 px-2">
                {currentData.revenueTrend.length === 0 ? (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-300 font-bold text-sm italic">{t('noData')}</div>
                ) : (
                  currentData.revenueTrend.map((val, idx) => (
                    <div key={idx} className="flex-1 group relative">
                       <div 
                         className="w-full bg-[#4ade80]/30 group-hover:bg-[#4ade80] rounded-t-lg transition-all duration-700" 
                         style={{ height: getBarHeight(val, currentData.revenueTrend) }}
                       />
                       <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-2 py-1 rounded-lg text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {val.toFixed(0)}
                       </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-sm border border-gray-50">
              <div className={`flex items-center gap-3 mb-8 ${isArabic ? 'flex-row-reverse' : ''}`}>
                <BarChart3 className="w-6 h-6 text-orange-500" />
                <h3 className="text-xl font-black text-slate-800">{t('orderVolume')}</h3>
              </div>
              <div className="relative h-48 w-full flex items-end justify-between gap-1 sm:gap-2 px-2">
                {currentData.orderVolume.length === 0 ? (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-300 font-bold text-sm italic">{t('noData')}</div>
                ) : (
                  currentData.orderVolume.map((val, idx) => (
                    <div key={idx} className="flex-1 group relative">
                       <div 
                         className="w-full bg-[#3b82f6]/30 group-hover:bg-[#3b82f6] rounded-t-lg transition-all duration-700" 
                         style={{ height: getBarHeight(val, currentData.orderVolume) }}
                       />
                       <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-2 py-1 rounded-lg text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {val}
                       </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* LOWER GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Status Counts */}
            <div className="lg:col-span-1 grid grid-cols-3 gap-4">
                <div className="bg-white rounded-[28px] p-4 shadow-sm border border-gray-50 flex flex-col items-center justify-center gap-2 hover:-translate-y-1 transition-transform">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <span className="text-3xl font-black text-green-500">{currentData.delivered}</span>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('delivered')}</span>
                </div>
                <div className="bg-white rounded-[28px] p-4 shadow-sm border border-gray-50 flex flex-col items-center justify-center gap-2 hover:-translate-y-1 transition-transform">
                  <XCircle className="w-6 h-6 text-red-500" />
                  <span className="text-3xl font-black text-red-500">{currentData.cancelled}</span>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('cancelled')}</span>
                </div>
                <div className="bg-white rounded-[28px] p-4 shadow-sm border border-gray-50 flex flex-col items-center justify-center gap-2 hover:-translate-y-1 transition-transform">
                  <Undo2 className="w-6 h-6 text-orange-500" />
                  <span className="text-3xl font-black text-orange-500">{currentData.refunded}</span>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('refunded')}</span>
                </div>
            </div>

            {/* Peak Hours */}
            <div className="lg:col-span-2 bg-white rounded-[32px] p-6 sm:p-8 shadow-sm border border-gray-50">
                <div className={`flex items-center gap-3 mb-8 ${isArabic ? 'flex-row-reverse' : ''}`}>
                  <Clock className="w-6 h-6 text-orange-500" />
                  <h3 className="text-xl font-black text-slate-800">{t('peakHours')}</h3>
                </div>
                <div className="relative h-40 w-full flex items-end justify-between gap-1 sm:gap-2 px-1">
                   {currentData.peakHours.map((val, hour) => (
                     <div key={hour} className="flex-1 group relative">
                        <div 
                          className={`w-full ${val === Math.max(...currentData.peakHours) && val > 0 ? 'bg-orange-500' : 'bg-slate-200'} rounded-t-lg transition-all duration-1000`} 
                          style={{ height: getBarHeight(val, currentData.peakHours) }}
                        />
                        <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 text-[8px] font-bold text-gray-400 opacity-0 group-hover:opacity-100">
                           {hour}:00
                        </div>
                     </div>
                   ))}
                </div>
                <div className="flex justify-between mt-4 text-[8px] font-bold text-gray-400 uppercase tracking-[0.2em] px-1">
                   <span>00:00</span>
                   <span>06:00</span>
                   <span>12:00</span>
                   <span>18:00</span>
                   <span>23:00</span>
                </div>
            </div>

          </div>

          {/* TOP SELLING */}
          <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-sm border border-gray-50 max-w-xl">
              <div className={`flex items-center gap-3 mb-8 ${isArabic ? 'flex-row-reverse' : ''}`}>
                <Trophy className="w-6 h-6 text-orange-500" />
                <h3 className="text-xl font-black text-slate-800">{t('topSellingItems')}</h3>
              </div>
              
              <div className={`flex items-center gap-6 ${isArabic ? 'flex-row-reverse' : ''}`}>
                <div className="w-16 h-16 rounded-[24px] bg-orange-500 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-orange-200 shrink-0">
                  1
                </div>
                <div className={`flex-1 min-w-0 ${isArabic ? 'text-right' : 'text-left'}`}>
                  <div className={`flex justify-between items-end mb-3 ${isArabic ? 'flex-row-reverse' : ''}`}>
                    <span className="text-lg font-black text-slate-800 truncate pr-4">{currentData.topItem}</span>
                    <div className={`shrink-0 ${isArabic ? 'text-left' : 'text-right'}`}>
                      <div className="text-xl font-black text-slate-900">{currentData.topSales} <span className="text-xs text-gray-400 font-bold uppercase tracking-widest ml-1">{t('sold')}</span></div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-50 rounded-full h-3 overflow-hidden border border-gray-100">
                      <div className="bg-orange-500 w-[85%] h-full rounded-full transition-all duration-1000" />
                  </div>
                </div>
              </div>
          </div>

        </div>
      )}
    </div>
  );
}
