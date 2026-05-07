import { useState, useEffect } from 'react';
import { Bike, Phone, Star, MapPin, Search, RefreshCw, ChevronRight, User } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { translate } from '../locales/translations';
import driverService from '../services/driver.service';

export default function DriversView() {
  const { language } = useLanguage();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const isArabic = language === 'ar';

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const data = await driverService.getAvailableDrivers();
      setDrivers(data || []);
    } catch (err) {
      console.error('Failed to fetch drivers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
    // Auto refresh every 30 seconds
    const interval = setInterval(fetchDrivers, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredDrivers = drivers.filter(d => 
    d.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.user?.phone?.includes(searchTerm)
  );

  return (
    <div dir={isArabic ? 'rtl' : 'ltr'} className="w-full max-w-6xl mx-auto px-4 py-6 animate-fade-in">
      {/* Header Area */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 ${isArabic ? 'md:flex-row-reverse' : ''}`}>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {isArabic ? 'السائقين المتاحين' : 'Available Drivers'}
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            {isArabic ? 'تتبع السائقين المتصلين حالياً في منطقتك' : 'Track active drivers currently online in your area'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="relative group">
              <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-orange-500 transition-colors ${isArabic ? 'right-4' : 'left-4'}`} />
              <input 
                type="text"
                placeholder={isArabic ? 'بحث عن سائق...' : 'Search driver...'}
                className={`bg-white border-2 border-slate-100 rounded-2xl py-3 px-11 text-sm font-bold focus:outline-none focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/5 transition-all w-full md:w-64 ${isArabic ? 'pr-11 pl-4' : 'pl-11 pr-4'}`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <button 
             onClick={fetchDrivers}
             disabled={loading}
             className="p-3 bg-white border-2 border-slate-100 rounded-2xl text-slate-400 hover:text-orange-500 hover:border-orange-500/20 transition-all active:scale-95 disabled:opacity-50"
           >
             <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
           </button>
        </div>
      </div>

      {/* Drivers Grid */}
      {loading && drivers.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-64 bg-white/50 animate-pulse rounded-[2.5rem] border-2 border-slate-50"></div>
          ))}
        </div>
      ) : filteredDrivers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDrivers.map((driver) => (
            <div 
              key={driver.id}
              className="group bg-white rounded-[2.5rem] p-6 border-2 border-transparent hover:border-orange-500/20 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col relative overflow-hidden"
            >
              {/* Decorative Background Element */}
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-orange-500/5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
              
              <div className={`flex items-start gap-4 mb-6 relative z-10 ${isArabic ? 'flex-row-reverse' : ''}`}>
                 <div className="relative">
                    {driver.user?.profileImage ? (
                      <img src={driver.user.profileImage} alt={driver.user.name} className="w-16 h-16 rounded-[1.5rem] object-cover border-4 border-slate-50 group-hover:border-orange-100 transition-colors" />
                    ) : (
                      <div className="w-16 h-16 bg-slate-100 rounded-[1.5rem] flex items-center justify-center text-slate-400 border-4 border-slate-50">
                        <User className="w-8 h-8" />
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-4 border-white"></div>
                 </div>
                 
                 <div className={`flex-1 ${isArabic ? 'text-right' : 'text-left'}`}>
                    <h3 className="text-lg font-black text-slate-900 leading-tight group-hover:text-orange-600 transition-colors">{driver.user?.name}</h3>
                    <div className={`flex items-center gap-2 mt-1 ${isArabic ? 'flex-row-reverse' : ''}`}>
                       <div className="flex items-center text-amber-500">
                          <Star className="w-3 h-3 fill-current" />
                          <span className="text-xs font-black ml-1">{driver.rating?.toFixed(1) || '5.0'}</span>
                       </div>
                       <span className="text-slate-300 text-[10px]">•</span>
                       <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{driver.totalTrips || 0} {isArabic ? 'رحلة' : 'Trips'}</span>
                    </div>
                 </div>
              </div>

              {/* Stats & Info */}
              <div className="space-y-3 mb-6 relative z-10">
                 <div className={`flex items-center gap-3 p-3 bg-slate-50 rounded-2xl group-hover:bg-orange-50 transition-colors ${isArabic ? 'flex-row-reverse text-right' : ''}`}>
                    <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-slate-400 group-hover:text-orange-500 shadow-sm">
                       <Bike className="w-4 h-4" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{isArabic ? 'نوع المركبة' : 'Vehicle'}</p>
                       <p className="text-xs font-black text-slate-700 capitalize">{driver.vehicle?.type || (isArabic ? 'غير محدد' : 'Standard')}</p>
                    </div>
                 </div>

                 <div className={`flex items-center gap-3 p-3 bg-slate-50 rounded-2xl group-hover:bg-orange-50 transition-colors ${isArabic ? 'flex-row-reverse text-right' : ''}`}>
                    <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-slate-400 group-hover:text-orange-500 shadow-sm">
                       <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{isArabic ? 'الموقع الحالي' : 'Current Location'}</p>
                       <p className="text-xs font-black text-slate-700 truncate max-w-[150px]">
                         {driver.currentLat?.toFixed(4)}, {driver.currentLng?.toFixed(4)}
                       </p>
                    </div>
                 </div>
              </div>

              {/* Contact Button */}
              <a 
                href={`tel:${driver.user?.phone}`}
                className="mt-auto flex items-center justify-center gap-2 py-4 bg-slate-900 hover:bg-orange-500 text-white rounded-2xl font-black text-sm transition-all active:scale-95 shadow-lg hover:shadow-orange-500/40 group/btn"
              >
                <Phone className="w-4 h-4 group-hover/btn:animate-bounce" />
                {isArabic ? 'اتصال بالسائق' : 'Contact Driver'}
                {isArabic ? <ChevronRight className="w-4 h-4 rotate-180" /> : <ChevronRight className="w-4 h-4" />}
              </a>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
           <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <Bike className="w-12 h-12 text-slate-200" />
           </div>
           <h3 className="text-xl font-black text-slate-900">{isArabic ? 'لا يوجد سائقين متاحين' : 'No drivers available'}</h3>
           <p className="text-slate-400 font-medium mt-2">{isArabic ? 'سيظهر السائقون المتصلون هنا بمجرد توفرهم' : 'Connected drivers will appear here once they are online'}</p>
           <button 
             onClick={fetchDrivers}
             className="mt-8 px-8 py-3 bg-orange-500 text-white rounded-2xl font-black text-sm hover:shadow-xl hover:shadow-orange-500/30 transition-all active:scale-95"
           >
             {isArabic ? 'تحديث الحالة' : 'Refresh Status'}
           </button>
        </div>
      )}
    </div>
  );
}
