
import { useState, useEffect, useRef } from 'react';
import { Bell, Check, Trash2, Clock, Info, Package, AlertCircle, X, ExternalLink, Send } from 'lucide-react';
import { notificationService } from '../services/notification.service';
import { useLanguage } from '../contexts/LanguageContext';
import { useSocket } from '../contexts/SocketContext';

export default function NotificationCenter() {
  const { newOrder } = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Wait a bit for the backend to finish persisting the notification in DB
    const timer = setTimeout(() => {
      fetchUnreadCount();
      if (isOpen) {
        fetchNotifications();
      }
    }, 1500); // 1.5s delay
    return () => clearTimeout(timer);
  }, [newOrder]);

  useEffect(() => {
    fetchUnreadCount();
    // Refresh unread count every minute
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const fetchUnreadCount = async () => {
    try {
      const data = await notificationService.getUnreadCount();
      setUnreadCount(data.count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const fetchNotifications = async () => {
    console.log('📡 NotificationCenter: Fetching notifications...');
    setLoading(true);
    try {
      const response = await notificationService.getNotifications({ limit: 20 });
      console.log('✅ NotificationCenter: Received:', response);
      setNotifications(response.data || []);
    } catch (error) {
      console.error('❌ NotificationCenter: Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDropdown = () => {
    if (!isOpen) {
      fetchNotifications();
    }
    setIsOpen(!isOpen);
  };

  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
      fetchUnreadCount();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const sendTestNotification = async () => {
    try {
      console.log('🧪 Sending test notification...');
      await notificationService.testNotification();
      setTimeout(() => {
        fetchUnreadCount();
        if (isOpen) fetchNotifications();
      }, 1000);
    } catch (error) {
      console.error('Failed to send test notification:', error);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'order_new': return <Package className="w-4 h-4 text-orange-500" />;
      case 'order_status': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'admin': return <AlertCircle className="w-4 h-4 text-purple-500" />;
      default: return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="relative p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 group"
      >
        <Bell className={`w-6 h-6 ${unreadCount > 0 ? 'text-orange-500 animate-pulse' : 'text-gray-600'}`} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full border-2 border-white flex items-center justify-center shadow-sm">
            {unreadCount > 9 ? '+9' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className={`absolute top-full mt-3 ${isArabic ? 'left-0' : 'right-0'} w-80 sm:w-96 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-4 duration-300`}>
          {/* Header */}
          <div className={`p-5 border-b border-gray-50 flex items-center justify-between bg-gray-50/50 ${isArabic ? 'flex-row-reverse' : ''}`}>
            <div>
               <h3 className="font-black text-gray-900 tracking-tight">
                  {isArabic ? 'التنبيهات' : 'Notifications'}
               </h3>
               <button 
                  onClick={sendTestNotification}
                  className="text-[10px] text-gray-400 hover:text-orange-500 flex items-center gap-1 mt-1 transition-colors"
               >
                  <Send className="w-3 h-3" />
                  {isArabic ? 'إرسال تجربة' : 'Send Test'}
               </button>
            </div>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 bg-orange-50 px-3 py-1.5 rounded-full transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                {isArabic ? 'تحديد الكل' : 'Mark all'}
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="p-10 text-center">
                <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-sm font-bold text-gray-400">{isArabic ? 'جاري التحميل...' : 'Loading...'}</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-10 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-sm font-bold text-gray-500">{isArabic ? 'لا توجد تنبيهات حالياً' : 'No notifications yet'}</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50/80 transition-all duration-200 cursor-pointer relative group ${!notification.read ? 'bg-orange-50/30' : ''} ${isArabic ? 'text-right' : ''}`}
                    onClick={() => !notification.read && markAsRead(notification.id)}
                  >
                    {!notification.read && (
                      <div className={`absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-orange-500 rounded-full ${isArabic ? 'right-2' : 'left-2'}`}></div>
                    )}
                    <div className={`flex gap-4 ${isArabic ? 'flex-row-reverse' : ''} pl-4`}>
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${!notification.read ? 'bg-white' : 'bg-gray-100'}`}>
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`flex items-start justify-between gap-2 mb-1 ${isArabic ? 'flex-row-reverse' : ''}`}>
                          <p className="text-sm font-black text-gray-900 truncate">
                            {notification.title}
                          </p>
                          <span className="text-[10px] font-bold text-gray-400 shrink-0 mt-0.5">
                            {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-gray-500 line-clamp-2 leading-relaxed">
                          {notification.body}
                        </p>
                        
                        {notification.data?.orderId && (
                           <button className={`mt-3 flex items-center gap-1.5 text-[10px] font-black text-orange-600 uppercase tracking-widest bg-white border border-orange-100 px-3 py-1.5 rounded-xl shadow-sm hover:bg-orange-600 hover:text-white transition-all ${isArabic ? 'flex-row-reverse mr-auto' : 'ml-auto'}`}>
                              <ExternalLink className="w-3 h-3" />
                              {isArabic ? 'عرض الطلب' : 'View Order'}
                           </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-50 text-center bg-gray-50/30">
            <button 
               onClick={() => setIsOpen(false)}
               className="text-xs font-black text-gray-400 hover:text-gray-600 uppercase tracking-[0.2em] transition-colors"
            >
              {isArabic ? 'إغلاق' : 'Close Center'}
            </button>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f9fafb;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d1d5db;
        }
      `}} />
    </div>
  );
}
