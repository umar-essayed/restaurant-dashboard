import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  Headset, 
  Mail, 
  Phone, 
  MessageSquare, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';

export default function SupportView() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const contactMethods = [
    {
      id: 'email',
      icon: Mail,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-500',
      title: 'Email Support',
      description: 'support@zspeed.app',
      titleAr: 'دعم البريد الإلكتروني',
      descAr: 'support@zspeed.app'
    },
    {
      id: 'phone',
      icon: Phone,
      iconBg: 'bg-green-50',
      iconColor: 'text-green-500',
      title: 'Phone Support',
      description: '+20 100 000 0000',
      titleAr: 'الدعم الهاتفي',
      descAr: '+20 100 000 0000'
    },
    {
      id: 'chat',
      icon: MessageSquare,
      iconBg: 'bg-orange-50',
      iconColor: 'text-orange-500',
      title: 'Live Chat',
      description: 'Available 9 AM - 9 PM',
      titleAr: 'المحادثة المباشرة',
      descAr: 'متاح 9 صباحاً - 9 مساءً'
    }
  ];

  const faqs = [
    {
      question: 'How do I update my menu?',
      answer: 'Go to the Menu page from the sidebar. You can add, edit, or remove items and sections. Changes are reflected to customers in real-time.',
      qAr: 'كيف أقوم بتحديث قائمة الطعام؟',
      aAr: 'اذهب إلى صفحة القائمة من الشريط الجانبي. يمكنك إضافة، تعديل أو إزالة العناصر والأقسام. التغييرات تظهر للعملاء في الوقت الفعلي.'
    },
    {
      question: 'How do I change my operating hours?',
      answer: 'Go to your Profile page and scroll to the Operating Hours section. Tap the edit icon next to any day to update your hours.',
      qAr: 'كيف أغير ساعات العمل؟',
      aAr: 'اذهب إلى صفحة الملف الشخصي وانتقل إلى قسم ساعات العمل. اضغط على أيقونة التعديل بجوار أي يوم لتحديث الساعات.'
    },
    {
      question: 'How are delivery fees calculated?',
      answer: 'Go to Delivery Fees in the sidebar. You can set a fixed fee or distance-based pricing with tiers.',
      qAr: 'كيف يتم حساب رسوم التوصيل؟',
      aAr: 'اذهب إلى رسوم التوصيل في الشريط الجانبي. يمكنك تعيين رسوم ثابتة أو تسعير بناءً على المسافة مع مستويات مختلفة.'
    },
    {
      question: 'How do I handle a rejected order?',
      answer: 'When you reject an order, select a reason. The customer will be notified and refunded automatically.',
      qAr: 'كيف أتعامل مع طلب مرفوض؟',
      aAr: 'عند رفض طلب، اختر السبب. سيتم إبلاغ العميل وإرجاع المبلغ تلقائياً.'
    },
    {
      question: 'How do I contact a driver?',
      answer: "On the Orders page, assigned orders show the driver's name and phone number. Tap to call directly.",
      qAr: 'كيف أتواصل مع السائق؟',
      aAr: 'في صفحة الطلبات، الطلبات المعينة تظهر اسم السائق ورقم هاتفه. اضغط للاتصال به مباشرة.'
    }
  ];

  return (
    <div dir={isArabic ? 'rtl' : 'ltr'} className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col h-full min-h-[calc(100vh-76px)] animate-fade-in space-y-8 pb-20 max-w-3xl mx-auto">
      
      {/* Banner */}
      <div className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl p-6 sm:p-8 text-white shadow-sm flex flex-col items-start relative overflow-hidden">
        <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <Headset className="w-10 h-10 mb-4 opacity-90" />
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 tracking-tight">
          {isArabic ? 'كيف يمكننا المساعدة؟' : 'How can we help?'}
        </h1>
        <p className="text-white/90 text-sm sm:text-base font-medium">
          {isArabic ? 'فريق الدعم لدينا هنا لمساعدتك.' : 'Our support team is here to assist you.'}
        </p>
      </div>

      {/* Contact Us */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-700 mb-4">
          {isArabic ? 'تواصل معنا' : 'Contact Us'}
        </h2>
        <div className="space-y-3">
          {contactMethods.map((method) => (
            <button 
              key={method.id}
              className={`w-full bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between shadow-sm hover:shadow-md hover:border-orange-100 transition-all active:scale-[0.99] group`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${method.iconBg}`}>
                  <method.icon className={`w-6 h-6 ${method.iconColor}`} />
                </div>
                <div className={isArabic ? 'text-right' : 'text-left'}>
                  <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
                    {isArabic ? method.titleAr : method.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5 font-medium">
                    {isArabic ? method.descAr : method.description}
                  </p>
                </div>
              </div>
              <ChevronRight className={`w-5 h-5 text-gray-300 group-hover:text-orange-400 transition-colors ${isArabic ? 'rotate-180' : ''}`} />
            </button>
          ))}
        </div>
      </div>

      {/* FAQs */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-700 mb-4">
          {isArabic ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
        </h2>
        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div 
                key={index}
                className={`bg-white rounded-2xl border transition-all overflow-hidden shadow-sm ${isOpen ? 'border-orange-200 shadow-orange-100/50' : 'border-gray-100 hover:border-gray-200'}`}
              >
                <button 
                  onClick={() => toggleFaq(index)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between focus:outline-none"
                >
                  <span className={`font-semibold text-left ${isArabic ? 'text-right' : ''} ${isOpen ? 'text-orange-600' : 'text-gray-800'}`}>
                    {isArabic ? faq.qAr : faq.question}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-orange-400 shrink-0 ms-4" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 shrink-0 ms-4" />
                  )}
                </button>
                <div 
                  className={`px-4 sm:px-5 pb-4 sm:pb-5 text-sm sm:text-base text-gray-500 leading-relaxed font-medium transition-all duration-300 ${isOpen ? 'block animate-fade-in' : 'hidden'}`}
                >
                  {isArabic ? faq.aAr : faq.answer}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
