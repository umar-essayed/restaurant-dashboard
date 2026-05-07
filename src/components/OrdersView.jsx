import { useState, useEffect } from 'react';
import { Clock, MapPin, Receipt, Banknote, ChevronRight, X, ChevronLeft, Package, User, Wallet, Info, Printer, Bike, CheckCircle, XCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { translate } from '../locales/translations';
import { useRestaurant } from '../contexts/RestaurantContext';
import orderService from '../services/order.service';
import { useSocket } from '../contexts/SocketContext';
import PrintableInvoice from './PrintableInvoice';

export default function OrdersView() {
  const [activeTab, setActiveTab] = useState('all');
  const { language } = useLanguage();
  const { selectedRestaurant } = useRestaurant();
  const { socket } = useSocket();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderToPrint, setOrderToPrint] = useState(null);
  const [eligibleDrivers, setEligibleDrivers] = useState([]);
  const [fetchingDrivers, setFetchingDrivers] = useState(false);
  const [requestingDriverId, setRequestingDriverId] = useState(null);
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

  useEffect(() => {
    if (socket) {
      socket.on('order:new', () => {
        fetchOrders();
      });
      socket.on('order:status_changed', async (updatedOrder) => {
        fetchOrders();
        // If the updated order is the one currently selected, refresh its details
        if (selectedOrder && (updatedOrder.id === selectedOrder.id || updatedOrder.postgresOrderId === selectedOrder.id)) {
           try {
             const data = await orderService.getOrderById(selectedOrder.id);
             setSelectedOrder(data);
           } catch (err) {
             console.error('Failed to refresh selected order details:', err);
           }
        }
      });
      return () => {
        socket.off('order:new');
        socket.off('order:status_changed');
      };
    }
  }, [socket, selectedRestaurant, selectedOrder]);

  const fetchEligibleDrivers = async (orderId) => {
    setFetchingDrivers(true);
    try {
      const drivers = await orderService.getEligibleDrivers(orderId);
      setEligibleDrivers(drivers);
    } catch (err) {
      console.error('Failed to fetch eligible drivers:', err);
    } finally {
      setFetchingDrivers(false);
    }
  };

  useEffect(() => {
    if (selectedOrder && !selectedOrder.driver) {
      fetchEligibleDrivers(selectedOrder.id);
    } else {
      setEligibleDrivers([]);
    }
  }, [selectedOrder]);

  const handleManualRequest = async (driverId) => {
    setRequestingDriverId(driverId);
    try {
      await orderService.requestSpecificDriver(selectedOrder.id, driverId);
      // Refresh to see the request
      fetchOrders();
      // Also refresh the specific order if it's open
      const data = await orderService.getOrderById(selectedOrder.id);
      setSelectedOrder(data);
    } catch (err) {
      console.error('Failed to request driver:', err);
    } finally {
      setRequestingDriverId(null);
    }
  };

  const handlePrint = (order) => {
    setOrderToPrint(order);
    setTimeout(() => {
      window.print();
      setOrderToPrint(null);
    }, 100);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    // Optimistic Update: Update local state immediately
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(prev => ({ ...prev, status: newStatus }));
    }

    try {
      await orderService.updateStatus(orderId, newStatus);
      // Refresh background data to ensure sync
      fetchOrders();
    } catch (err) {
      console.error('Failed to update status:', err);
      // Revert if failed
      fetchOrders();
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
                      <div className="flex flex-col gap-1">
                        <span className={`px-2.5 py-1 text-[10px] font-black rounded-full border uppercase tracking-wider ${getStatusColor(order.status)}`}>
                           {order.status}
                        </span>
                        <p className="text-[10px] font-bold text-gray-400 font-mono">#{order.id.split('-')[0]}</p>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePrint(order);
                        }}
                        className="p-2 bg-gray-50 hover:bg-orange-50 text-gray-400 hover:text-orange-500 rounded-xl transition-all active:scale-90"
                        title={isArabic ? 'طباعة سريعة' : 'Quick Print'}
                      >
                        <Printer className="w-5 h-5" />
                      </button>
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

            {/* Actions Bar */}
            <div className={`px-6 sm:px-8 py-3 bg-white border-b border-gray-100 flex justify-end items-center gap-3 ${isArabic ? 'flex-row-reverse' : ''}`}>
               <button 
                 onClick={() => handlePrint(selectedOrder)}
                 className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-all active:scale-95"
               >
                 <Printer className="w-4 h-4" />
                 {isArabic ? 'طباعة الفاتورة' : 'Print Invoice'}
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
                            <div className="flex-1 min-w-0" style={{ textAlign: 'start' }}>
                               <p className="font-bold text-slate-800 truncate" dir="auto" style={{ unicodeBidi: 'plaintext' }}>{isArabic ? (item.foodItem?.nameAr || item.foodItem?.name) : item.foodItem?.name}</p>
                               <p className="text-xs text-gray-400">
                                  {item.quantity} x EGP {item.unitPrice}
                               </p>
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
                          <p className="text-lg font-black text-white">EGP {selectedOrder.subtotal}</p>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-gray-100">
                 {/* Customer & Delivery Info */}
                 <div className="space-y-4">
                    <h4 className={`text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2 ${isArabic ? 'flex-row-reverse' : ''}`}>
                       <MapPin className="w-4 h-4" />
                       {isArabic ? 'معلومات التوصيل' : 'Delivery Info'}
                    </h4>
                    <div className={`bg-gray-50 border border-gray-100 p-5 rounded-3xl space-y-4 ${isArabic ? 'text-right' : ''}`}>
                       <div className={`flex items-center gap-4 ${isArabic ? 'flex-row-reverse' : ''}`}>
                          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-orange-500">
                             <MapPin className="w-6 h-6" />
                          </div>
                          <div className="flex-1">
                             <p className="font-bold text-slate-800 leading-tight" dir="auto">{selectedOrder.deliveryAddress}</p>
                             <div className={`flex items-center gap-3 mt-1 ${isArabic ? 'flex-row-reverse' : ''}`}>
                                <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded-lg border border-orange-100">
                                   {selectedOrder.customerDistance != null ? `${selectedOrder.customerDistance.toFixed(2)} km` : 'N/A'}
                                </span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                   {isArabic ? 'المسافة للزبون' : 'Distance to Customer'}
                                </span>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Customer Contact */}
                 <div className="space-y-4">
                    <h4 className={`text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2 ${isArabic ? 'flex-row-reverse' : ''}`}>
                       <User className="w-4 h-4" />
                       {isArabic ? 'معلومات الزبون' : 'Customer Info'}
                    </h4>
                    <div className={`bg-gray-50 border border-gray-100 p-5 rounded-3xl flex items-center gap-4 ${isArabic ? 'flex-row-reverse text-right' : ''}`}>
                       <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-slate-400">
                          <User className="w-6 h-6" />
                       </div>
                       <div className="flex-1">
                          <p className="font-bold text-slate-800">{selectedOrder.customer?.name || 'Customer'}</p>
                          <a href={`tel:${selectedOrder.customer?.phone}`} className="text-xs font-bold text-orange-500 hover:underline">{selectedOrder.customer?.phone}</a>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Driver Dispatch Section */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className={`flex items-center justify-between ${isArabic ? 'flex-row-reverse' : ''}`}>
                  <h4 className={`text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2 ${isArabic ? 'flex-row-reverse' : ''}`}>
                      <Bike className="w-4 h-4" />
                      {selectedOrder.driver ? (isArabic ? 'السائق المعين' : 'السائقين المتاحين (الأقرب)') : (isArabic ? 'السائقين المتاحين (الأقرب)' : 'Available Drivers (Nearby)')}
                  </h4>
                  {fetchingDrivers && !selectedOrder.driver && (
                     <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                  )}
                </div>

                {selectedOrder.driver ? (
                  /* Assigned Driver Card */
                  <div className={`bg-green-50 border-2 border-green-100 p-5 rounded-[2.5rem] flex items-center gap-5 animate-fade-in ${isArabic ? 'flex-row-reverse text-right' : ''}`}>
                    <div className="relative">
                      {selectedOrder.driver.user?.profileImage ? (
                        <img src={selectedOrder.driver.user.profileImage} alt="" className="w-16 h-16 rounded-3xl object-cover border-4 border-white shadow-sm" />
                      ) : (
                        <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-green-500 shadow-sm border-4 border-white">
                          <User className="w-8 h-8" />
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-white shadow-sm">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className={`flex items-center justify-between mb-1 ${isArabic ? 'flex-row-reverse' : ''}`}>
                         <p className="text-lg font-black text-slate-800 leading-none">{selectedOrder.driver.user?.name}</p>
                         <span className="text-[10px] font-black text-green-600 bg-white px-2 py-0.5 rounded-full border border-green-100 uppercase tracking-widest">
                            {selectedOrder.status === 'PICKED_UP' || selectedOrder.status === 'ON_THE_WAY' 
                               ? (isArabic ? 'في الطريق' : 'ON THE WAY') 
                               : (isArabic ? 'معين' : 'ASSIGNED')}
                         </span>
                      </div>
                      <div className={`flex items-center gap-3 ${isArabic ? 'flex-row-reverse' : ''}`}>
                        <a href={`tel:${selectedOrder.driver.user?.phone}`} className="text-sm font-bold text-green-600 hover:underline">
                          {selectedOrder.driver.user?.phone}
                        </a>
                        <span className="w-1 h-1 bg-green-200 rounded-full" />
                        {selectedOrder.driverToCustomerDistance != null && (
                           <div className={`flex items-center gap-1.5 ${isArabic ? 'flex-row-reverse' : ''}`}>
                              <Bike className="w-3 h-3 text-green-500" />
                              <span className="text-xs font-black text-green-700">
                                 {selectedOrder.driverToCustomerDistance.toFixed(1)} km {isArabic ? 'عن الزبون' : 'to customer'}
                              </span>
                           </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Manual Selection List */
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                    {eligibleDrivers.length > 0 ? (
                      eligibleDrivers.map((driver) => {
                        const request = selectedOrder.deliveryRequests?.find(r => r.driverId === driver.id);
                        const isRequested = request?.status === 'PENDING';
                        const isRejected = request?.status === 'REJECTED' || request?.status === 'EXPIRED';
                        
                        return (
                          <div key={driver.id} className={`bg-white border border-gray-100 p-4 rounded-3xl flex items-center gap-4 transition-all hover:shadow-md hover:border-orange-100 ${isArabic ? 'flex-row-reverse text-right' : ''}`}>
                              <div className="relative">
                                {driver.user?.profileImage ? (
                                    <img src={driver.user.profileImage} alt={driver.user.name} className="w-12 h-12 rounded-2xl object-cover" />
                                ) : (
                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                                      <User className="w-6 h-6" />
                                    </div>
                                )}
                                <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${driver.isBusy ? 'bg-amber-500' : 'bg-green-500'}`}></div>
                              </div>
                              
                              <div className="flex-1 min-w-0" style={{ textAlign: isArabic ? 'right' : 'left' }}>
                                 <p className="text-sm font-black text-slate-800 truncate">{driver.user?.name || 'Unknown Driver'}</p>
                                 <div className={`flex items-center gap-2 mt-1 ${isArabic ? 'flex-row-reverse' : ''}`}>
                                    <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded-lg border border-orange-100">
                                      {driver.distance < 1 ? `${(driver.distance * 1000).toFixed(0)}m` : `${driver.distance.toFixed(1)}km`}
                                    </span>
                                    <span className="text-[10px] font-bold text-gray-400">
                                      ≈ {driver.estimatedTimeMin} {isArabic ? 'دقيقة' : 'min'}
                                    </span>
                                 </div>
                              </div>

                              <button
                                disabled={isRequested || requestingDriverId === driver.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleManualRequest(driver.id);
                                }}
                                className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase transition-all shadow-sm active:scale-95 ${
                                  isRequested 
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : isRejected
                                    ? 'bg-red-50 text-red-500 border border-red-100 hover:bg-orange-500 hover:text-white'
                                    : 'bg-orange-500 text-white hover:bg-orange-600'
                                }`}
                              >
                                {requestingDriverId === driver.id ? (
                                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                                ) : isRequested ? (
                                  isArabic ? 'جاري الطلب' : 'REQUESTED'
                                ) : isRejected ? (
                                  isArabic ? 'إعادة طلب' : 'RETRY'
                                ) : (
                                  isArabic ? 'طلب الآن' : 'REQUEST'
                                )}
                              </button>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-12 text-center bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200">
                         <p className="text-xs font-black text-gray-400 mb-2">{isArabic ? 'لا يوجد سائقين متاحين حالياً' : 'No available drivers found'}</p>
                         <button 
                           onClick={() => fetchEligibleDrivers(selectedOrder.id)}
                           className="text-[10px] font-black text-orange-500 uppercase hover:underline flex items-center gap-1 mx-auto"
                         >
                           <Clock className="w-3 h-3" />
                           {isArabic ? 'تحديث القائمة' : 'Refresh List'}
                         </button>
                      </div>
                    )}
                  </div>
                )}
              </div>


            </div>
          </div>
        </div>
      )}
      
      {/* Hidden Printable Invoice */}
      <PrintableInvoice 
        order={orderToPrint || selectedOrder} 
        restaurant={selectedRestaurant} 
        isArabic={isArabic} 
      />
    </div>
  );
}
