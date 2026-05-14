import { useEffect, useState } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Package, X, ArrowRight, BellRing, ShoppingBag, Clock, MapPin } from 'lucide-react';

export default function NewOrderAlert({ onViewOrder }) {
  const { newOrder, clearNewOrder } = useSocket();
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (newOrder) {
      console.log('📢 NewOrderAlert: Showing alert for order:', newOrder.id);
      setVisible(true);
      
      // Play notification sound twice
      const audio = new Audio('/sounds/notification.wav');
      audio.play().then(() => {
        setTimeout(() => {
          audio.currentTime = 0;
          audio.play().catch(e => console.warn('Sound play 2 failed:', e));
        }, 1000); // 1 second interval between sounds
      }).catch(err => console.warn('Could not play notification sound:', err));

      // Auto hide after 30 seconds if not clicked
      const timer = setTimeout(() => {
        handleClose();
      }, 30000);
      return () => clearTimeout(timer);
    }
  }, [newOrder]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(clearNewOrder, 500); // Wait for exit animation
  };

  const handleViewOrder = () => {
    if (onViewOrder) {
      onViewOrder(newOrder);
    }
    handleClose();
  };


  
  if (!newOrder && !visible) return null;

  return (
    <div 
      className={`fixed top-6 right-6 left-6 sm:left-auto sm:w-[450px] z-[200] transition-all duration-500 transform ${
        visible ? 'translate-y-0 opacity-100' : '-translate-y-12 opacity-0 pointer-events-none'
      }`}
    >
      <div className="bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-orange-100 overflow-hidden relative">
        {/* Animated Background Pulse */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full -translate-y-1/2 translate-x-1/2 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/5 rounded-full translate-y-1/2 -translate-x-1/2 animate-pulse"></div>

        <div className="p-6">
          <div className={`flex items-start justify-between mb-6 ${isArabic ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center gap-4 ${isArabic ? 'flex-row-reverse text-right' : ''}`}>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200">
                  <BellRing className="w-8 h-8 text-white animate-bounce" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-ping"></div>
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  {isArabic ? 'طلب جديد وصل!' : 'New Order Received!'}
                </h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                  #{newOrder?.id?.split('-')[0] || '12345'}
                </p>
              </div>
            </div>
            <button 
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className={`space-y-4 mb-6 ${isArabic ? 'text-right' : ''}`}>
             <div className={`flex items-center gap-4 p-4 bg-orange-50 rounded-2xl border border-orange-100 ${isArabic ? 'flex-row-reverse' : ''}`}>
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-orange-500 shadow-sm">
                   <ShoppingBag className="w-5 h-5" />
                </div>
                <div className="flex-1">
                   <p className="text-[10px] font-black text-orange-400 uppercase tracking-[0.2em] mb-0.5">
                      {isArabic ? 'تفاصيل الطلب' : 'Order Details'}
                   </p>
                   <p className="font-bold text-slate-800 truncate">
                      {newOrder?.items?.length || 0} {isArabic ? 'أصناف' : 'Items'} • EGP {newOrder?.total || '0.00'}
                   </p>
                </div>
             </div>

             <div className={`flex items-center gap-3 text-slate-500 ${isArabic ? 'flex-row-reverse' : ''}`}>
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-bold">{isArabic ? 'الآن' : 'Just now'}</span>
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-bold truncate">{newOrder?.deliveryAddress || 'Address details...'}</span>
             </div>
          </div>

          <button 
            onClick={handleViewOrder}
            className={`w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-3 group shadow-xl shadow-slate-200`}
          >
            {isArabic ? 'عرض الطلب والبدء' : 'View & Process Order'}
            <ArrowRight className={`w-5 h-5 group-hover:translate-x-1 transition-transform ${isArabic ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
          </button>
        </div>

        {/* Progress bar at bottom */}
        <div className="h-1 bg-gray-100 w-full overflow-hidden">
          <div className="h-full bg-orange-500 animate-progress"></div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes progress {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-progress {
          animation: progress 30s linear forwards;
        }
      `}} />
    </div>
  );
}
