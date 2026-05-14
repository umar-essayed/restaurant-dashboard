import { useState, useEffect, useRef } from 'react';
import { Clock, MapPin, Receipt, Banknote, ChevronRight, X, ChevronLeft, Package, User, Wallet, Info, Printer, Bike, CheckCircle, XCircle, Phone, ArrowLeft, FileText } from 'lucide-react';
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
  const driversSectionRef = useRef(null);
  const modalBodyRef = useRef(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderToPrint, setOrderToPrint] = useState(null);
  const [eligibleDrivers, setEligibleDrivers] = useState([]);
  const [fetchingDrivers, setFetchingDrivers] = useState(false);
  const [requestingDriverId, setRequestingDriverId] = useState(null);
  const [toast, setToast] = useState(null);
  const [shouldScrollToDrivers, setShouldScrollToDrivers] = useState(false);
  const isArabic = language === 'ar';

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

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
        if (selectedOrder && (updatedOrder.id === selectedOrder.id || updatedOrder.postgresOrderId === selectedOrder.id)) {
           try {
             const data = await orderService.getOrderById(selectedOrder.id);
             setSelectedOrder(data);
           } catch (err) {
             console.error('Failed to refresh selected order details:', err);
           }
        }
      });
      socket.on('order:driver_assigned', (data) => {
        showToast(isArabic ? 'تم قبول الطلب من قبل السائق بنجاح!' : 'Order accepted by driver successfully!');
        fetchOrders();
        // Use orderId from event to refresh the right one
        if (selectedOrder && (data.orderId === selectedOrder.id)) {
          orderService.getOrderById(selectedOrder.id).then(setSelectedOrder);
        }
      });
      return () => {
        socket.off('order:new');
        socket.off('order:status_changed');
        socket.off('order:driver_assigned');
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
    // Fetch drivers if the order is in PREPARING or READY and doesn't have a driver yet
    if (selectedOrder && (selectedOrder.status === 'PREPARING' || selectedOrder.status === 'READY' || selectedOrder.status === 'READY_FOR_PICKUP') && !selectedOrder.driver) {
      fetchEligibleDrivers(selectedOrder.id);
    } else {
      setEligibleDrivers([]);
    }
  }, [selectedOrder]);

  const handleManualRequest = async (driverId) => {
    setRequestingDriverId(driverId);
    try {
      await orderService.requestSpecificDriver(selectedOrder.id, driverId);
      showToast(isArabic ? 'تم إرسال الطلب للسائق بنجاح' : 'Request sent to driver successfully');
      fetchOrders();
      const data = await orderService.getOrderById(selectedOrder.id);
      setSelectedOrder(data);
    } catch (err) {
      console.error('Failed to request driver:', err);
      showToast(isArabic ? 'فشل إرسال الطلب' : 'Failed to send request', 'error');
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
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(prev => ({ ...prev, status: newStatus }));
    }

    try {
      await orderService.updateStatus(orderId, newStatus);
      fetchOrders();
    } catch (err) {
      console.error('Failed to update status:', err);
      fetchOrders();
    }
  };

  const TABS = [
    { id: 'all', label: translate(language, 'orders.all'), count: orders.length },
    { id: 'pending', label: translate(language, 'orders.new'), count: orders.filter(o => o.status === 'PENDING').length },
    { id: 'preparing', label: translate(language, 'orders.active'), count: orders.filter(o => o.status === 'PREPARING' || o.status === 'CONFIRMED').length },
    { id: 'ready', label: translate(language, 'orders.ready'), count: orders.filter(o => o.status === 'READY' || o.status === 'READY_FOR_PICKUP').length },
    { id: 'delivered', label: translate(language, 'orders.delivered'), count: orders.filter(o => o.status === 'DELIVERED').length },
    { id: 'cancelled', label: translate(language, 'orders.cancelled'), count: orders.filter(o => o.status === 'CANCELLED').length },
  ];

  // Auto-scroll logic when modal opens via "Assign Driver" button
  useEffect(() => {
    if (selectedOrder && shouldScrollToDrivers) {
      const timer = setTimeout(() => {
        if (driversSectionRef.current && modalBodyRef.current) {
          modalBodyRef.current.scrollTo({
            top: driversSectionRef.current.offsetTop - 20,
            behavior: 'smooth'
          });
          setShouldScrollToDrivers(false);
        }
      }, 400); // Wait for modal scale animation
      return () => clearTimeout(timer);
    }
  }, [selectedOrder, shouldScrollToDrivers]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-[#e0f2fe] text-[#0ea5e9]';
      case 'CONFIRMED': return 'bg-[#dcfce7] text-[#22c55e]';
      case 'PREPARING': return 'bg-[#ffedd5] text-[#f97316]';
      case 'READY':
      case 'READY_FOR_PICKUP': return 'bg-[#f3e8ff] text-[#a855f7]';
      case 'DELIVERED': return 'bg-gray-100 text-gray-500';
      case 'CANCELLED': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-500';
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in" key={activeTab}>
            {orders.map((order) => (
              <div
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className={`bg-white rounded-[32px] p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col gap-5 hover:shadow-md transition-shadow cursor-pointer relative group ${isArabic ? 'text-right' : 'text-left'}`}
              >
                {/* Header: Title, Order ID, Status Pill */}
                <div className={`flex justify-between items-start gap-3 ${isArabic ? 'flex-row-reverse' : ''}`}>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg sm:text-xl font-black text-[#1e293b] leading-tight mb-1">
                      {order.items?.[0] ? (isArabic ? (order.items[0].foodItem?.nameAr || order.items[0].foodItem?.name) : order.items[0].foodItem?.name) : 'Order'}
                      {order.items?.length > 1 && <span className="text-orange-500 font-bold text-sm ml-1">+{order.items.length - 1}</span>}
                    </h3>
                    <p className="text-gray-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider">Order #{order.id.split('-')[0].toUpperCase()}</p>
                  </div>
                  <span className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-black shrink-0 shadow-sm ${getStatusColor(order.status)}`}>
                    {translate(language, `status.${order.status.toLowerCase()}`)}
                  </span>
                </div>

                {/* Details Bar: Time, Address, Payment */}
                <div className={`bg-[#f8fafc] rounded-2xl p-3 sm:p-4 flex items-center justify-between text-[#64748b] gap-2 ${isArabic ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex items-center gap-1.5 shrink-0 ${isArabic ? 'flex-row-reverse' : ''}`}>
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-[10px] sm:text-[11px] font-black">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className={`flex items-center gap-1.5 flex-1 min-w-0 ${isArabic ? 'flex-row-reverse' : ''}`}>
                    <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="text-[10px] sm:text-[11px] font-black truncate">{order.deliveryAddress}</span>
                  </div>
                  <div className={`flex items-center gap-1.5 shrink-0 ${isArabic ? 'flex-row-reverse' : ''}`}>
                    <Banknote className="w-4 h-4 text-gray-400" />
                    <span className="text-[10px] sm:text-[11px] font-black">{order.paymentMethod === 'CASH' ? (isArabic ? 'كاش' : 'Cash') : order.paymentMethod}</span>
                  </div>
                </div>

                {/* Footer: Price and Actions */}
                <div className="mt-auto pt-4 border-t border-gray-50 flex flex-col gap-4">
                  {/* Price Row */}
                  <div className={`flex justify-between items-center ${isArabic ? 'flex-row-reverse' : ''}`}>
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">{isArabic ? 'الإجمالي' : 'TOTAL AMOUNT'}</p>
                    <p className="text-2xl font-black text-[#1e293b] leading-none">
                      {order.total.toFixed(2)} <span className="text-sm font-bold text-orange-500 ml-0.5">EGP</span>
                    </p>
                  </div>

                  {/* Actions Row */}
                  <div className={`flex gap-3 w-full ${isArabic ? 'flex-row-reverse' : ''}`}>
                    {order.status === 'PENDING' && (
                      <>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleUpdateStatus(order.id, 'CONFIRMED'); }}
                          className="flex-1 bg-orange-500 text-white py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-100 hover:bg-orange-600 transition-all active:scale-95"
                        >
                          <CheckCircle className="w-5 h-5" /> {isArabic ? 'قبول' : 'Accept'}
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleUpdateStatus(order.id, 'CANCELLED'); }}
                          className="flex-1 border-2 border-rose-500 text-rose-500 py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-rose-50 transition-all active:scale-95"
                        >
                          <XCircle className="w-5 h-5" /> {isArabic ? 'رفض' : 'Reject'}
                        </button>
                      </>
                    )}

                    {(order.status === 'CONFIRMED' || order.status === 'PREPARING') && (
                      <>
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            if (order.status === 'CONFIRMED') {
                              handleUpdateStatus(order.id, 'PREPARING');
                            } else {
                              handleUpdateStatus(order.id, 'READY');
                            }
                          }}
                          className="flex-1 bg-orange-500 text-white py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-100 hover:bg-orange-600 transition-all active:scale-95"
                        >
                          <CheckCircle className="w-5 h-5" /> {order.status === 'CONFIRMED' ? (isArabic ? 'بدء التحضير' : 'Start Prep') : (isArabic ? 'جاهز' : 'Mark as Ready')}
                        </button>
                        {!order.driver && (
                          <button 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              setSelectedOrder(order); 
                              setShouldScrollToDrivers(true);
                            }}
                            className="flex-1 bg-rose-500 text-white py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-100 hover:bg-rose-600 transition-all active:scale-95"
                          >
                            <Bike className="w-5 h-5" /> {isArabic ? 'تعيين سائق' : 'Assign Driver'}
                          </button>
                        )}
                      </>
                    )}

                    {(order.status === 'READY' || order.status === 'READY_FOR_PICKUP') && (
                      <>
                        <div className="flex-1 bg-orange-50 border-2 border-orange-500 text-orange-600 py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2">
                           <CheckCircle className="w-5 h-5" /> {isArabic ? 'جاهز' : 'Ready'}
                        </div>
                        {!order.driver && (
                          <button 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              setSelectedOrder(order); 
                              setShouldScrollToDrivers(true);
                            }}
                            className="flex-1 bg-teal-600 text-white py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-100 hover:bg-teal-700 transition-all active:scale-95"
                          >
                            <Bike className="w-5 h-5" /> {isArabic ? 'تعيين سائق' : 'Assign Driver'}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center h-96 text-gray-400 animate-fade-in" key={`empty-${activeTab}`}>
            <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <Package className="w-16 h-16 text-gray-200" strokeWidth={1.5} />
            </div>
            <p className="text-xl font-black text-slate-800 mb-2">{translate(language, 'orders.empty')}</p>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{isArabic ? 'بانتظار طلبات جديدة' : 'Waiting for new orders'}</p>
          </div>
        )}
      </div>

      {/* Order Detail Modal - Redesigned to match image */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300"
            onClick={() => setSelectedOrder(null)}
          />
          <div className="bg-[#f8f9fb] w-full max-w-lg h-full sm:h-auto sm:max-h-[92vh] sm:rounded-[40px] relative z-10 shadow-2xl overflow-hidden animate-scale-up flex flex-col">
            
            {/* Modal Header: Back button and Title */}
            <div className={`p-6 bg-white flex items-center gap-4 border-b border-gray-100 ${isArabic ? 'flex-row-reverse' : ''}`}>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className={`w-6 h-6 text-slate-700 ${isArabic ? 'rotate-180' : ''}`} />
              </button>
              <h2 className={`text-xl font-black text-slate-800 ${isArabic ? 'text-right' : 'text-left'}`}>
                {isArabic ? 'طلب' : 'Order'} #{selectedOrder.id.split('-')[0].toUpperCase()}
              </h2>
            </div>

            {/* Modal Body: Scrollable Cards */}
            <div ref={modalBodyRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 hide-scrollbar">
              
              {/* Card 1: Status & Basic Info */}
              <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-50">
                <div className={`flex justify-between items-start mb-6 ${isArabic ? 'flex-row-reverse' : ''}`}>
                  <div className={isArabic ? 'text-right' : 'text-left'}>
                    <p className="text-[11px] font-black text-gray-300 uppercase tracking-widest mb-1">{isArabic ? 'الحالة' : 'Status'}</p>
                    <p className={`text-2xl font-black ${selectedOrder.status === 'READY' || selectedOrder.status === 'READY_FOR_PICKUP' ? 'text-purple-600' : 'text-orange-500'}`}>
                      {translate(language, `status.${selectedOrder.status.toLowerCase()}`)}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                    <FileText className="w-8 h-8" />
                  </div>
                </div>
                
                <div className="h-px bg-gray-100 w-full mb-6"></div>

                <div className="space-y-4">
                  <div className={`flex justify-between items-center ${isArabic ? 'flex-row-reverse' : ''}`}>
                    <span className="text-xs font-black text-gray-300 uppercase tracking-widest">{isArabic ? 'وقت الطلب' : 'Placed At'}</span>
                    <span className="text-sm font-black text-slate-700">
                      {new Date(selectedOrder.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}, {new Date(selectedOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className={`flex justify-between items-center ${isArabic ? 'flex-row-reverse' : ''}`}>
                    <span className="text-xs font-black text-gray-300 uppercase tracking-widest">{isArabic ? 'طريقة الدفع' : 'Payment Method'}</span>
                    <div className={`flex items-center gap-2 font-black text-slate-700 ${isArabic ? 'flex-row-reverse' : ''}`}>
                      <Banknote className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{selectedOrder.paymentMethod === 'CASH' ? (isArabic ? 'كاش' : 'Cash') : selectedOrder.paymentMethod}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Order Summary */}
              <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-50">
                <h3 className={`text-lg font-black text-slate-800 mb-6 ${isArabic ? 'text-right' : 'text-left'}`}>
                  {isArabic ? 'ملخص الطلب' : 'Order Summary'}
                </h3>
                
                <div className="space-y-4 mb-6">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className={`flex justify-between items-center ${isArabic ? 'flex-row-reverse' : ''}`}>
                      <div className={`flex items-center gap-3 flex-1 min-w-0 ${isArabic ? 'flex-row-reverse' : ''}`}>
                        <span className="px-2 py-1 bg-orange-50 text-orange-500 text-[10px] font-black rounded-lg shrink-0">
                          {item.quantity.toFixed(1)}x
                        </span>
                        <span className="text-sm font-black text-slate-700 truncate">
                          {isArabic ? (item.foodItem?.nameAr || item.foodItem?.name) : item.foodItem?.name}
                        </span>
                      </div>
                      <span className="text-sm font-black text-slate-700 shrink-0">EGP {(item.quantity * item.unitPrice).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="h-px bg-gray-100 w-full mb-6"></div>

                <div className="space-y-4 mb-6">
                  <div className={`flex justify-between items-center ${isArabic ? 'flex-row-reverse' : ''}`}>
                    <span className="text-sm font-black text-slate-500">{isArabic ? 'المجموع الفرعي' : 'Subtotal'}</span>
                    <span className="text-sm font-black text-slate-700">EGP {selectedOrder.subtotal?.toFixed(2)}</span>
                  </div>
                  <div className={`flex justify-between items-center ${isArabic ? 'flex-row-reverse' : ''}`}>
                    <span className="text-sm font-black text-slate-500">{isArabic ? 'رسوم التوصيل' : 'Delivery Fee'}</span>
                    <span className="text-sm font-black text-slate-700">EGP {selectedOrder.deliveryFee?.toFixed(2)}</span>
                  </div>
                </div>

                <div className="h-px bg-gray-100 w-full mb-6"></div>

                <div className={`flex justify-between items-center ${isArabic ? 'flex-row-reverse' : ''}`}>
                  <span className="text-lg font-black text-slate-800">{isArabic ? 'الإجمالي' : 'Total'}</span>
                  <span className="text-lg font-black text-orange-500">EGP {selectedOrder.total?.toFixed(2)}</span>
                </div>
              </div>

              {/* Card 3: Delivery Details */}
              <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-50">
                <h3 className={`text-lg font-black text-slate-800 mb-6 ${isArabic ? 'text-right' : 'text-left'}`}>
                  {isArabic ? 'تفاصيل التوصيل' : 'Delivery Details'}
                </h3>
                
                <div className={`flex items-start gap-4 ${isArabic ? 'flex-row-reverse text-right' : 'text-left'}`}>
                  <div className="p-3 bg-gray-50 text-slate-400 rounded-2xl shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-black text-slate-700 leading-relaxed">
                      {selectedOrder.deliveryAddress}
                    </p>
                    <div className={`flex items-center gap-2 mt-2 ${isArabic ? 'flex-row-reverse' : ''}`}>
                       <span className="text-[10px] font-black text-white bg-slate-800 px-2 py-0.5 rounded-full">
                         {selectedOrder.customerDistance != null ? `${selectedOrder.customerDistance.toFixed(1)} KM` : '--'}
                       </span>
                       <span className="text-[10px] font-bold text-gray-400 uppercase">{isArabic ? 'المسافة' : 'Distance'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 4: Driver Info (If assigned) */}
              {selectedOrder.driver && (
                <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-50">
                  <h3 className={`text-lg font-black text-slate-800 mb-6 ${isArabic ? 'text-right' : 'text-left'}`}>
                    {isArabic ? 'معلومات السائق' : 'Driver Info'}
                  </h3>
                  <div className={`flex items-center gap-4 ${isArabic ? 'flex-row-reverse text-right' : 'text-left'}`}>
                    <div className="w-14 h-14 bg-gray-100 rounded-2xl overflow-hidden shrink-0">
                      {selectedOrder.driver.user?.profileImage ? (
                        <img src={selectedOrder.driver.user.profileImage} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300"><User size={24} /></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-black text-slate-800">{selectedOrder.driver.user?.name}</p>
                      <p className="text-xs font-bold text-orange-500">{selectedOrder.driver.user?.phone}</p>
                    </div>
                    <button 
                      onClick={() => window.open(`tel:${selectedOrder.driver.user?.phone}`, '_self')}
                      className="p-3 bg-slate-900 text-white rounded-2xl hover:bg-black transition-colors"
                    >
                      <Phone size={20} />
                    </button>
                  </div>
                </div>
              )}

              {/* Card 5: Available Drivers List (If no driver assigned) */}
              {!selectedOrder.driver && (selectedOrder.status === 'PREPARING' || selectedOrder.status === 'READY' || selectedOrder.status === 'READY_FOR_PICKUP') && (
                <div ref={driversSectionRef} className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-50 space-y-6">
                  <div className={`flex items-center justify-between ${isArabic ? 'flex-row-reverse' : ''}`}>
                    <h3 className={`text-lg font-black text-slate-800 ${isArabic ? 'text-right' : 'text-left'}`}>
                      {isArabic ? 'الكباتن المتاحين' : 'Available Captains'}
                    </h3>
                    {fetchingDrivers && <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>}
                  </div>

                  <div className="space-y-3">
                    {eligibleDrivers.length > 0 ? (
                      eligibleDrivers.map((driver) => (
                        <div key={driver.id} className={`p-4 rounded-3xl border border-gray-50 bg-gray-50/30 flex items-center gap-4 transition-all hover:bg-white hover:shadow-xl hover:shadow-gray-100 group ${isArabic ? 'flex-row-reverse text-right' : ''}`}>
                          <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                            {driver.user?.profileImage ? (
                              <img src={driver.user.profileImage} className="w-full h-full object-cover" alt="" />
                            ) : (
                              <User className="w-6 h-6 text-gray-300" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-black text-slate-800 truncate">{driver.user?.name || 'Captain'}</p>
                            <div className={`flex items-center gap-3 mt-1 ${isArabic ? 'flex-row-reverse' : ''}`}>
                              <span className="text-[10px] font-black text-orange-500 uppercase">{driver.distance?.toFixed(1)} KM</span>
                              <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
                              <span className="text-[10px] font-black text-slate-400 uppercase">{driver.estimatedTimeMin || '5'} MIN</span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleManualRequest(driver.id)}
                            disabled={requestingDriverId === driver.id}
                            className="px-5 h-10 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all active:scale-95 disabled:opacity-50"
                          >
                            {requestingDriverId === driver.id ? '...' : (isArabic ? 'تعيين' : 'Assign')}
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="py-10 text-center bg-gray-50 rounded-[24px] border border-dashed border-gray-200">
                        <p className="text-xs font-bold text-gray-400">{isArabic ? 'جاري البحث عن كباتن...' : 'Searching for nearby captains...'}</p>
                        <button onClick={() => fetchEligibleDrivers(selectedOrder.id)} className="mt-3 text-[10px] font-black text-orange-500 uppercase tracking-widest hover:underline">
                          {isArabic ? 'تحديث البحث' : 'Refresh Search'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Actions: Sticky at bottom */}
            <div className={`p-6 bg-white border-t border-gray-100 flex flex-col gap-3 ${isArabic ? 'flex-row-reverse' : ''}`}>
               {selectedOrder.status === 'PENDING' ? (
                 <div className="flex gap-3 w-full">
                    <button 
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'CONFIRMED')}
                      className="flex-[2] h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-orange-100"
                    >
                      {translate(language, 'orders.accept')}
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'CANCELLED')}
                      className="flex-1 h-14 border-2 border-rose-500 text-rose-500 rounded-2xl font-black text-sm uppercase tracking-widest transition-all hover:bg-rose-50 active:scale-95"
                    >
                      {translate(language, 'orders.reject')}
                    </button>
                 </div>
               ) : !selectedOrder.driver && (selectedOrder.status === 'PREPARING' || selectedOrder.status === 'READY' || selectedOrder.status === 'READY_FOR_PICKUP') ? (
                 <button 
                    onClick={() => {
                      if (driversSectionRef.current && modalBodyRef.current) {
                        modalBodyRef.current.scrollTo({
                          top: driversSectionRef.current.offsetTop - 20,
                          behavior: 'smooth'
                        });
                      }
                    }}
                    className="w-full h-14 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-teal-100"
                 >
                    <Bike className="w-5 h-5" />
                    {isArabic ? 'اختيار سائق' : 'Assign Driver'}
                 </button>
               ) : selectedOrder.status === 'CONFIRMED' ? (
                 <button 
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'PREPARING')}
                    className="w-full h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-orange-100"
                 >
                    {isArabic ? 'بدء التحضير' : 'Start Preparing'}
                 </button>
               ) : (
                 <div className="w-full h-14 bg-gray-50 text-gray-400 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 border border-gray-100">
                    <CheckCircle className="w-5 h-5" />
                    {translate(language, `status.${selectedOrder.status.toLowerCase()}`)}
                 </div>
               )}
               
               <button 
                 onClick={() => handlePrint(selectedOrder)}
                 className="w-full h-12 bg-white text-slate-400 hover:text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
               >
                 <Printer className="w-4 h-4" />
                 {isArabic ? 'طباعة الفاتورة' : 'Print Invoice'}
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] animate-bounce-in">
          <div className={`px-8 py-4 rounded-[24px] shadow-2xl flex items-center gap-4 border-2 ${
            toast.type === 'error' ? 'bg-rose-500 text-white border-rose-400' : 'bg-slate-900 text-white border-slate-800 shadow-slate-200'
          }`}>
             {toast.type === 'error' ? <XCircle className="w-6 h-6" /> : <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shadow-lg"><CheckCircle className="w-5 h-5 text-white" /></div>}
             <p className="text-sm font-black uppercase tracking-widest leading-none">{toast.message}</p>
          </div>
        </div>
      )}

      <PrintableInvoice 
        order={orderToPrint || selectedOrder} 
        restaurant={selectedRestaurant} 
        isArabic={isArabic} 
      />
    </div>
  );
}
