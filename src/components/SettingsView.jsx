import { useState, useEffect } from 'react';
import { Globe, Bell, Mail, Check, LogOut, Trash2, CreditCard, Loader2, Save } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useRestaurant } from '../contexts/RestaurantContext';
import { translations } from '../locales/translations';
import restaurantService from '../services/restaurant.service';

export default function SettingsView({ onNavigate }) {
  const { language, setLanguage } = useLanguage();
  const { selectedRestaurant, fetchRestaurants } = useRestaurant();
  const t = translations[language];
  const isArabic = language === 'ar';
  
  const [loading, setLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoAcceptOrders, setAutoAcceptOrders] = useState(false);

  useEffect(() => {
    if (selectedRestaurant) {
      setNotificationsEnabled(selectedRestaurant.notificationsEnabled ?? true);
      setAutoAcceptOrders(selectedRestaurant.autoAcceptOrders ?? false);
    }
  }, [selectedRestaurant]);

  const handleUpdateSetting = async (field, value) => {
    if (!selectedRestaurant) return;
    try {
      setLoading(true);
      const data = {};
      data[field] = value;
      await restaurantService.updateRestaurant(selectedRestaurant.id, data);
      await fetchRestaurants();
      
      if (field === 'notificationsEnabled') setNotificationsEnabled(value);
      if (field === 'autoAcceptOrders') setAutoAcceptOrders(value);
    } catch (error) {
      console.error("Update Setting Error:", error);
      alert(isArabic ? 'فشل تحديث الإعدادات' : 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const Toggle = ({ enabled, onChange, disabled }) => (
    <button
      onClick={() => !disabled && onChange(!enabled)}
      disabled={disabled}
      className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        enabled ? 'bg-orange-500' : 'bg-gray-300'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span
        className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          enabled
            ? (isArabic ? '-translate-x-5' : 'translate-x-5')
            : 'translate-x-0'
        }`}
      />
    </button>
  );

  const SettingRow = ({ icon: Icon, title, description, action, toggle = false, value = false, onChange = null }) => (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className={`flex items-center justify-between gap-4 py-6 border-b border-gray-100 ${
        language === 'en' ? 'flex-row-reverse' : ''
      }`}
    >
      <div className="flex-shrink-0">
        {toggle && onChange ? (
          <Toggle enabled={value} onChange={onChange} disabled={loading} />
        ) : (
          action
        )}
      </div>
      <div className={`flex flex-1 items-start gap-4 ${isArabic ? 'text-right justify-end' : ''}`} dir={isArabic ? 'rtl' : 'ltr'}>
        <div className={`w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0`}>
           {Icon && <Icon className="w-5 h-5 text-orange-500" />}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-slate-800">{title}</h3>
          {description && <p className="text-sm text-gray-500 mt-0.5 font-medium">{description}</p>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col h-full min-h-[calc(100vh-76px)] animate-fade-in space-y-8 pb-20">
      
      {/* Preferences Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 bg-gray-50/50">
          <h2 className="text-xl font-black text-slate-800">{t.settings.preferences}</h2>
        </div>
        <div className="p-6">
          <SettingRow
            icon={Globe}
            title={t.settings.changeLanguage}
            description={language === 'en' ? 'English' : 'العربية'}
            toggle={false}
            action={
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="px-4 py-2 rounded-xl border-2 border-gray-100 text-gray-800 font-bold focus:outline-none focus:border-orange-500 transition-colors"
              >
                <option value="en">English</option>
                <option value="ar">العربية</option>
              </select>
            }
          />
        </div>
      </div>

      {/* Notifications Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 bg-gray-50/50">
          <h2 className="text-xl font-black text-slate-800">{t.settings.notifications}</h2>
          <p className="text-sm text-gray-500 mt-1 font-medium">{t.settings.notificationsDesc}</p>
        </div>
        <div className="p-6 space-y-0">
          <SettingRow
            icon={Bell}
            title={t.settings.newOrderAlert}
            description={t.settings.newOrderAlertDesc}
            toggle={true}
            value={notificationsEnabled}
            onChange={(val) => handleUpdateSetting('notificationsEnabled', val)}
          />
          <SettingRow
            icon={Check}
            title={t.settings.autoAcceptOrders}
            description={t.settings.autoAcceptOrdersDesc}
            toggle={true}
            value={autoAcceptOrders}
            onChange={(val) => handleUpdateSetting('autoAcceptOrders', val)}
          />
        </div>
      </div>

      {/* Payment & Account Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 bg-gray-50/50">
          <h2 className="text-xl font-black text-slate-800">{t.settings.account}</h2>
        </div>
        <div className="p-6 space-y-0">
          <button 
            onClick={() => onNavigate && onNavigate('wallet')}
            className="w-full flex items-center justify-between py-5 border-b border-gray-50 hover:bg-gray-50 transition-colors px-4 rounded-2xl group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                <CreditCard className="w-5 h-5 text-orange-500" />
              </div>
              <div className="text-right">
                <h3 className="text-base font-bold text-slate-800">{t.settings.paymentMethods}</h3>
              </div>
            </div>
            <span className="text-gray-300 text-2xl group-hover:text-orange-500 transition-colors">›</span>
          </button>

          <button 
            onClick={() => onNavigate && onNavigate('logout')}
            className="w-full flex items-center justify-between py-5 border-b border-gray-50 hover:bg-orange-50 transition-colors px-4 rounded-2xl group"
          >
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                  <LogOut className="w-5 h-5 text-orange-500" />
               </div>
               <h3 className="text-base font-bold text-orange-600">{t.settings.logout}</h3>
            </div>
          </button>

          <button className="w-full flex items-center justify-between py-5 hover:bg-red-50 transition-colors px-4 rounded-2xl group">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                  <Trash2 className="w-5 h-5 text-red-500" />
               </div>
               <h3 className="text-base font-bold text-red-600">{t.settings.deleteAccount}</h3>
            </div>
          </button>
        </div>
      </div>
      
      {loading && (
        <div className="fixed bottom-10 right-10 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
           <Loader2 className="w-5 h-5 animate-spin" />
           <span className="font-bold text-sm">{isArabic ? 'جاري الحفظ...' : 'Saving...'}</span>
        </div>
      )}
    </div>
  );
}
