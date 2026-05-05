import { useOpenStatus } from '../contexts/ProfileLogoContext';
import { useLanguage } from '../contexts/LanguageContext';
import { translate } from '../locales/translations';
import { Store } from 'lucide-react';

export default function StatusCard() {
  const [isOpen, setIsOpen] = useOpenStatus();
  const { language } = useLanguage();

  return (
    <div
      className={`rounded-2xl p-4 flex items-center justify-between transition-all duration-300 shadow-sm border ${
        isOpen
          ? 'bg-green-50 border-green-200'
          : 'bg-red-50 border-red-200'
      }`}
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isOpen ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'
          }`}
        >
          <Store className="w-5 h-5" />
        </div>
        <div>
          <p className={`font-semibold text-sm ${isOpen ? 'text-green-800' : 'text-red-800'}`}>
            {isOpen ? translate(language, 'dashboard.restaurantOpen') : translate(language, 'dashboard.restaurantClosed')}
          </p>
          <p className={`text-xs ${isOpen ? 'text-green-600' : 'text-red-500'}`}>
            {isOpen ? translate(language, 'dashboard.openDescription') : translate(language, 'dashboard.closedDescription')}
          </p>
        </div>
      </div>

      {/* Toggle */}
      <div
        className={`toggle-track ${isOpen ? 'active' : 'inactive'}`}
        onClick={() => setIsOpen(!isOpen)}
        role="switch"
        aria-checked={isOpen}
        aria-label="Toggle restaurant status"
      >
        <div className="toggle-thumb" />
      </div>
    </div>
  );
}
