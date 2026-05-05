import { CircleHelp } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { translate } from '../locales/translations';

export default function HelpSection() {
  const { language } = useLanguage();

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-50 via-orange-100/60 to-amber-50 p-5 sm:p-6 shadow-sm border border-orange-100">
      {/* Decorative blob */}
      <div className="absolute -top-10 -right-10 w-36 h-36 bg-orange-200/30 rounded-full blur-2xl" />

      <div className="relative flex flex-col sm:flex-row items-start gap-4">
        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-white/80 border border-orange-200 flex items-center justify-center flex-shrink-0 shadow-sm">
          <CircleHelp className="w-6 h-6 text-orange-500" />
        </div>

        {/* Text + Buttons */}
        <div className="flex-1">
          <h3 className="text-lg font-bold text-orange-600">{translate(language, 'dashboard.needHelp')}</h3>
          <p className="text-sm text-gray-600 mt-1 leading-relaxed">
            {translate(language, 'dashboard.helpDescription')}
          </p>

          <div className="flex flex-wrap gap-3 mt-4">
            <button className="px-5 py-2.5 bg-gradient-to-r from-orange-400 to-orange-600 text-white text-sm font-semibold rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
              {translate(language, 'dashboard.supportCenter')}
            </button>
            <button className="px-5 py-2.5 bg-transparent border-2 border-orange-400 text-orange-500 text-sm font-semibold rounded-full hover:bg-orange-50 hover:-translate-y-0.5 transition-all duration-200">
              {translate(language, 'dashboard.documentation')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
