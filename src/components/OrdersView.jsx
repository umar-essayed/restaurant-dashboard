import { useState, useEffect } from 'react';
import { Clock, MapPin, Receipt, Banknote, ChevronRight, X, ChevronLeft, Package, User, Wallet, Info } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { translate } from '../locales/translations';
import { useRestaurant } from '../contexts/RestaurantContext';
import orderService from '../services/order.service';

export default function OrdersView() {
  const [activeTab, setActiveTab] = useState('all');
  const { language } = useLanguage();
  const { selectedRestaurant } = useRestaurant();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const isArabic = language === 'ar';

  const fetchOrders = async () => {
    if (!selectedRestaurant?.id) return;
    setLoading(true);
    try {
      const statusFilter = activeTab === 'all' ? undefined : activeTab.toUpperCase();
      const data = await orderService.getVendorOrders(selectedRestaurant.id, { status: statusFilter });
      setOrders(data.data || []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedRestaurant, activeTab]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await orderService.updateStatus(orderId, newStatus);
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
      fetchOrders();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const TABS = [
    { id: 'all', label: translate(language, 'orders.all'), count: orders.length },
    { id: 'pending', label: translate(language, 'orders.new'), count: orders.filter(o => o.status === 'PENDING').length },
    { id: 'preparing', label: translate(language, 'orders.active'), count: orders.filter(o => o.status === 'PREPARING').length },
    { id: 'ready', label: translate(language, 'orders.ready'), count: orders.filter(o => o.status === 'READY').length },
    { id: 'delivered', label: translate(language, 'orders.delivered'), count: orders.filter(o => o.status === 'DELIVERED').length },
    { id: 'cancelled', label: translate(language, 'orders.cancelled'), count: orders.filter(o => o.status === 'CANCELLED').length },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-orange-100 text-orange-600 border-orange-200';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'PREPARING': return 'bg-indigo-100 text-indigo-600 border-indigo-200';
      case 'READY': return 'bg-green-100 text-green-600 border-green-200';
      case 'DELIVERED': return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'CANCELLED': return 'bg-red-100 text-red-600 border-red-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <div dir={isArabic ? 'rtl' : 'ltr'} className="w-full max-w-5xl mx-auto px-4 py-6 pb-24 sm:pb-8 flex flex-col h-full min-h-[calc(100vh-76px)]">
      {/* Header / Tabs */}
      <div className="border-b border-gray-200 mb-6 sticky top-[76px] bg-[#f5f5f7] z-10 pt-2 -mt-2">
        <nav className={`flex space-x-6 overflow-x-auto hide-scrollbar ${isArabic ? 'flex-row-reverse space-x-reverse' : ''}`} aria-label="Tabs">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-black text-xs uppercase tracking-wider transition-all ${
                  isActive
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab.label} <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${isActive ? 'bg-orange-100' : 'bg-gray-100'}`}>{tab.count}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : orders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in" key={activeTab}>
            {orders.map((order) => (
              <div
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group flex flex-col justify-between h-full"
              >
                <div>
                  {/* Status & ID */}
                  <div className={`flex justify-between items-start mb-4 ${isArabic ? 'flex-row-reverse' : ''}`}>
                     <span className={`px-2.5 py-1 text-[10px] font-black rounded-full border uppercase tracking-wider ${getStatusColor(order.status)}`}>
                        {order.status}
                     </span>
                     <p className="text-[10px] font-bold text-gray-400 font-mono">#{order.id.split('-')[0]}</p>
                  </div>

                  {/* Customer Info */}
                  <div className={`flex items-center gap-3 mb-4 ${isArabic ? 'flex-row-reverse text-right' : 'text-left'}`}>
                     <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400">
                        <User className="w-5 h-5" />
                     </div>
                     <div className="flex-1 truncate">
                        <h3 className="font-black text-gray-900 truncate">{order.customer?.name || 'Customer'}</h3>
                        <p className="text-xs text-gray-400 truncate">{order.deliveryAddress}</p>
                     </div>
                  </div>

                  {/* Item Preview */}
                  <div className="space-y-2 mb-4">
                     {order.items?.slice(0, 2).map((item, idx) => (
                       <div key={idx} className={`flex items-center gap-2 text-xs font-bold text-gray-600 ${isArabic ? 'flex-row-reverse' : ''}`}>
                          <div className="w-6 h-6 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center text-[10px] shrink-0">
                             {item.quantity}x
                          </div>
                          <span className="truncate">{isArabic ? (item.foodItem?.nameAr || item.foodItem?.name) : item.foodItem?.name}</span>
                       </div>
                     ))}
                     {order.items?.length > 2 && (
                       <p className="text-[10px] text-gray-400 italic">+{order.items.length - 2} {isArabic ? 'أصناف أخرى' : 'more items'}</p>
                     )}
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                   <div className="text-right">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{translate(language, 'orders.total')}</p>
                      <p className="text-lg font-black text-orange-500">EGP {order.total}</p>
                   </div>
                   <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-orange-500 group-hover:text-white transition-all">
                      {isArabic ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                   </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center h-64 text-gray-400 animate-fade-in" key={`empty-${activeTab}`}>
            <Package className="w-20 h-20 mb-4 text-gray-200" strokeWidth={1.5} />
            <p className="text-lg font-black text-gray-400">{translate(language, 'orders.empty')}</p>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity"
            onClick={() => setSelectedOrder(null)}
          />
          <div className="bg-white rounded-[40px] w-full max-w-2xl max-h-[90vh] relative z-10 shadow-2xl overflow-hidden animate-scale-up flex flex-col">
            
            {/* Modal Header */}
            <div className={`p-6 sm:p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50 ${isArabic ? 'flex-row-reverse' : ''}`}>
              <div className={isArabic ? 'text-right' : 'text-left'}>
                <h2 className="text-2xl font-black text-slate-800">{translate(language, 'orders.orderDetails')}</h2>
                <p className="text-xs font-bold text-gray-400 font-mono tracking-widest mt-1">ID: {selectedOrder.id}</p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 hide-scrollbar">
              
              {/* Status Banner */}
              <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-3xl bg-gray-50 border border-gray-100 ${isArabic ? 'flex-row-reverse text-right' : ''}`}>
                 <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${getStatusColor(selectedOrder.status)}`}>
                       <Clock className="w-6 h-6" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{translate(language, 'orders.status')}</p>
                       <p className="text-lg font-black text-slate-800">{selectedOrder.status}</p>
                    </div>
                 </div>
                 
                 <div className="flex gap-2">
                    {selectedOrder.status === 'PENDING' && (
                      <button 
                        onClick={() => handleUpdateStatus(selectedOrder.id, 'CONFIRMED')}
                        className="bg-orange-500 text-white px-6 py-2.5 rounded-2xl font-black text-sm hover:bg-orange-600 shadow-lg shadow-orange-200 transition-all"
                      >
                        {translate(language, 'orders.confirmed')}
                      </button>
                    )}
                    {selectedOrder.status === 'CONFIRMED' && (
                      <button 
                        onClick={() => handleUpdateStatus(selectedOrder.id, 'PREPARING')}
                        className="bg-blue-500 text-white px-6 py-2.5 rounded-2xl font-black text-sm hover:bg-blue-600 shadow-lg shadow-blue-200 transition-all"
                      >
                        {translate(language, 'orders.preparing')}
                      </button>
                    )}
                    {selectedOrder.status === 'PREPARING' && (
                      <button 
                        onClick={() => handleUpdateStatus(selectedOrder.id, 'READY')}
                        className="bg-green-500 text-white px-6 py-2.5 rounded-2xl font-black text-sm hover:bg-green-600 shadow-lg shadow-green-200 transition-all"
                      >
                        {translate(language, 'orders.readyForPickup')}
                      </button>
                    )}
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {/* Items List */}
                 <div className="space-y-4">
                    <h4 className={`text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2 ${isArabic ? 'flex-row-reverse' : ''}`}>
                       <Package className="w-4 h-4" />
                       {translate(language, 'orders.items')}
                    </h4>
                    <div className="space-y-3">
                       {selectedOrder.items?.map((item, idx) => (
                         <div key={idx} className={`bg-white border border-gray-100 p-3 rounded-2xl flex items-center gap-3 ${isArabic ? 'flex-row-reverse text-right' : ''}`}>
                            {item.foodItem?.imageUrl && (
                              <img src={item.foodItem.imageUrl} className="w-12 h-12 rounded-xl object-cover" alt="" />
                            )}
                            <div className="flex-1 min-w-0">
                               <p className="font-bold text-slate-800 truncate">{isArabic ? (item.foodItem?.nameAr || item.foodItem?.name) : item.foodItem?.name}</p>
                               <p className="text-xs text-gray-400">{item.quantity} x EGP {item.unitPrice}</p>
                            </div>
                            <p className="font-black text-slate-900">EGP {item.quantity * item.unitPrice}</p>
                         </div>
                       ))}
                    </div>
                 </div>

                 {/* Financial Breakdown */}
                 <div className="space-y-4">
                    <h4 className={`text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2 ${isArabic ? 'flex-row-reverse' : ''}`}>
                       <Banknote className="w-4 h-4" />
                       {translate(language, 'orders.paymentInfo')}
                    </h4>
                    <div className="bg-slate-900 text-white rounded-3xl p-6 space-y-4 shadow-xl">
                       <div className="flex justify-between text-slate-400 text-sm font-bold">
                          <span>{translate(language, 'orders.subtotal')}</span>
                          <span>EGP {selectedOrder.subtotal}</span>
                       </div>
                       <div className="flex justify-between text-slate-400 text-sm font-bold">
                          <span>{translate(language, 'orders.deliveryFee')}</span>
                          <span>EGP {selectedOrder.deliveryFee}</span>
                       </div>
                       <div className="flex justify-between text-slate-400 text-sm font-bold">
                          <span>{translate(language, 'orders.serviceFee')}</span>
                          <span>EGP {selectedOrder.serviceFee}</span>
                       </div>
                       <div className="h-px bg-white/10 my-2"></div>
                       <div className="flex justify-between text-xl font-black">
                          <span>{translate(language, 'orders.totalAmount')}</span>
                          <span className="text-orange-400">EGP {selectedOrder.total}</span>
                       </div>
                       
                       <div className="bg-white/10 rounded-2xl p-4 mt-6 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400">
                                <Wallet className="w-4 h-4" />
                             </div>
                             <p className="text-xs font-bold text-slate-300">{translate(language, 'orders.yourShare')}</p>
                          </div>
                          <p className="text-lg font-black text-white">EGP {selectedOrder.restaurantShare}</p>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Delivery Info */}
              <div className="space-y-4">
                 <h4 className={`text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2 ${isArabic ? 'flex-row-reverse' : ''}`}>
                    <MapPin className="w-4 h-4" />
                    {translate(language, 'orders.deliveryAddress')}
                 </h4>
                 <div className={`bg-gray-50 border border-gray-100 p-5 rounded-3xl flex items-center gap-4 ${isArabic ? 'flex-row-reverse text-right' : ''}`}>
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-orange-500">
                       <MapPin className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                       <p className="font-bold text-slate-800">{selectedOrder.deliveryAddress}</p>
                       <p className="text-xs text-gray-400 font-medium">Cairo, Egypt • {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                    </div>
                 </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
