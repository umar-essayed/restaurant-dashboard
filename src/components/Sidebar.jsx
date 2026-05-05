import { useEffect, useRef } from 'react';
import { useProfileLogo, useRestaurantName, useAddress, useOpenStatus } from '../contexts/ProfileLogoContext';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../locales/translations';
import {
  LayoutDashboard,
  ClipboardList,
  Store,
  BarChart3,
  User,
  LogOut,
  Settings,
  X,
  Tag,
  Star,
  Wallet,
  Headphones,
  Info,
  Truck,
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose, activeItem, onNavigate }) {
  const { language } = useLanguage();
  const t = translations[language];
  const sidebarRef = useRef(null);

  const navItems = [
    { id: 'Dashboard', label: t.sidebar.dashboard, icon: LayoutDashboard },
    { id: 'Orders', label: t.sidebar.orders, icon: ClipboardList },
    { id: 'Menu', label: t.sidebar.menu, icon: Store },
    { id: 'Analytics', label: t.sidebar.analytics, icon: BarChart3 },
    { id: 'Profile', label: t.sidebar.profile, icon: User },
  ];

  const bottomItems = [
    { id: 'logout', label: t.sidebar.logout, icon: LogOut },
  ];

  const extraSections = [
    {
      title: language === 'ar' ? 'التفاعل' : 'Engage',
      items: [
        { id: 'promotions', label: t.sidebar.promotions, icon: Tag },
        { id: 'reviews', label: t.sidebar.reviews, icon: Star },
      ],
    },
    {
      title: language === 'ar' ? 'المزيد' : 'More',
      items: [
        { id: 'wallet', label: t.sidebar.wallet, icon: Wallet },
        { id: 'settings', label: t.sidebar.settings, icon: Settings },
        { id: 'delivery-fees', label: language === 'ar' ? 'رسوم التوصيل' : 'Delivery Fees', icon: Truck },
        { id: 'support', label: language === 'ar' ? 'الدعم' : 'Support', icon: Headphones },
      ],
    },
  ];

  const [logoSrc] = useProfileLogo();
  const [restaurantName] = useRestaurantName();
  const [address] = useAddress();
  const [isOpenStatus] = useOpenStatus();

  const LogoSlot = () => (
    <div className="w-20 h-20 rounded-[22px] bg-white flex items-center justify-center shadow-lg overflow-hidden shrink-0">
      {logoSrc ? (
        <img
          src={logoSrc}
          alt="logo"
          className="w-[72px] h-[72px] rounded-[20px] object-cover"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = '/logo.png';
          }}
        />
      ) : (
        <div className="w-[72px] h-[72px] rounded-[20px] bg-[#111827] flex items-center justify-center text-white">
          <Store className="w-8 h-8 text-white" />
        </div>
      )}
    </div>
  );

  /* Close when clicking outside (on backdrop) */
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop — mobile & tablet overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar panel */}
      <aside
        ref={sidebarRef}
        className={`fixed top-0 z-50 h-full w-[88vw] max-w-[360px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          language === 'ar' 
            ? `right-0 border-l border-gray-100 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`
            : `left-0 border-r border-gray-100 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`
        }`}
      >
        {/* Top header like the reference drawer */}
        <div className="bg-[#ff7a45] px-5 pt-6 pb-5 text-white relative overflow-hidden">
          <button
            onClick={onClose}
            className={`absolute ${language === 'ar' ? 'left-4' : 'right-4'} top-4 p-2 rounded-full hover:bg-white/10 transition-colors`}
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <LogoSlot />
            <div className="min-w-0 flex-1">
              <h2 className="text-3xl font-extrabold tracking-tight capitalize truncate">{restaurantName}</h2>
              <div className="mt-2 flex items-start gap-2 text-white/90">
                <span className="mt-1 text-sm">📍</span>
                <p className="text-sm leading-5 line-clamp-2">
                  {address}
                </p>
              </div>
              <div className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium ${isOpenStatus ? 'border-green-200 bg-green-500/20 text-green-100' : 'border-white/20 bg-white/10 text-white'}`}>
                <span className={`w-2.5 h-2.5 rounded-full ${isOpenStatus ? 'bg-green-300' : 'bg-red-300'}`} />
                {isOpenStatus ? (language === 'ar' ? 'مفتوح' : 'Open') : (language === 'ar' ? 'مغلق' : 'Closed')}
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Navigation ── */}
        <nav className="flex-1 overflow-y-auto px-4 py-4">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-2 mb-2">
            {language === 'ar' ? 'القائمة الرئيسية' : 'Main Menu'}
          </p>

          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-sm font-medium transition-all duration-200 group ${
                      isActive
                        ? 'bg-orange-50 text-orange-600 shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 ${
                        isActive
                          ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                          : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200 group-hover:text-gray-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span>{item.label}</span>
                    {isActive && (
                      <span className={`${language === 'ar' ? 'mr-auto' : 'ml-auto'} w-1.5 h-1.5 rounded-full bg-orange-500`} />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Divider */}
          {extraSections.map((section) => (
            <div key={section.title} className="mt-5">
              <div className="my-4 border-t border-gray-200" />
              <p className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.25em] px-2 mb-3">
                {section.title}
              </p>

              <ul className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isLogout = item.id === 'logout';
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => onNavigate(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-sm font-medium transition-all duration-200 group ${
                          isLogout
                            ? 'text-red-500 hover:bg-red-50'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 ${
                            isLogout
                              ? 'bg-red-50 text-red-400 group-hover:bg-red-100'
                              : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span>{item.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          <div className="my-5 border-t border-gray-200" />

          <ul className="space-y-1">
            {bottomItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-sm font-medium transition-all duration-200 group ${
                      item.id === 'logout'
                        ? 'text-red-500 hover:bg-red-50'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 ${
                        item.id === 'logout'
                          ? 'bg-red-50 text-red-400 group-hover:bg-red-100'
                          : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* ── Bottom user card ── */}
        
      </aside>
    </>
  );
}


