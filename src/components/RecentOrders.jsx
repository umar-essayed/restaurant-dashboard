import { useState, useEffect } from 'react';
import { CheckCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { translate } from '../locales/translations';
import { useRestaurant } from '../contexts/RestaurantContext';
import orderService from '../services/order.service';

export default function RecentOrders() {
  const [currentPage, setCurrentPage] = useState(0);
  const { language } = useLanguage();
  const { selectedRestaurant } = useRestaurant();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 3;

  useEffect(() => {
    if (selectedRestaurant?.id) {
      setLoading(true);
      orderService.getVendorOrders(selectedRestaurant.id, { limit: 10 })
        .then(res => setOrders(res.data || []))
        .finally(() => setLoading(false));
    }
  }, [selectedRestaurant]);

  const totalPages = Math.ceil(orders.length / itemsPerPage);

  const handlePrev = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  const displayedOrders = orders.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 flex flex-col h-full min-h-[300px]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">{translate(language, 'dashboard.recentOrders')}</h2>
        
        {/* Pagination Arrows */}
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              disabled={currentPage === 0}
              className="p-1 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              aria-label="Previous orders"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages - 1}
              className="p-1 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              aria-label="Next orders"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      ) : displayedOrders.length > 0 ? (
        <div className="space-y-3 flex-1 flex flex-col justify-center">
          <div className="space-y-4 w-full animate-fade-in" key={currentPage}>
            {displayedOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200 group"
              >
                {/* Icon */}
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                  <CheckCheck className="w-5 h-5 text-green-500" />
                </div>

                {/* Order info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    Order #{order.id.split('-')[0]}
                  </p>
                  <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleTimeString()}</p>
                </div>

                {/* Amount + Status */}
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-gray-800">EGP {order.total}</p>
                  <span className={`inline-block mt-0.5 text-xs font-medium px-2 py-0.5 rounded-full ${
                    order.status === 'CANCELLED' ? 'text-red-600 bg-red-50 border-red-200' : 'text-green-600 bg-green-50 border-green-200'
                  } border`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-center py-10">
          <div>
            <CheckCheck className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-500">{translate(language, 'dashboard.noRecentOrders')}</p>
            <p className="text-xs text-gray-400 mt-1">{translate(language, 'dashboard.newOrdersWillAppearHere')}</p>
          </div>
        </div>
      )}
    </div>
  );
}

