import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useRestaurant } from '../contexts/RestaurantContext';
import promotionService from '../services/promotion.service';
import { 
  Tag, 
  Plus, 
  Calendar, 
  Trash2, 
  Edit2, 
  CheckCircle2, 
  XCircle,
  Percent,
  CircleDollarSign,
  Search,
  X,
  AlertCircle
} from 'lucide-react';

export default function PromotionsView() {
  const { language } = useLanguage();
  const { selectedRestaurant } = useRestaurant();
  const isArabic = language === 'ar';

  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    maxDiscount: '',
    minOrderAmount: '',
    startDate: '',
    endDate: '',
    usageLimit: '',
    userUsageLimit: 1,
    isActive: true
  });

  useEffect(() => {
    if (selectedRestaurant?.id) {
      fetchPromotions();
    }
  }, [selectedRestaurant]);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const data = await promotionService.getPromotions(selectedRestaurant.id);
      setPromotions(data);
    } catch (error) {
      console.error('Failed to fetch promotions', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (promo = null) => {
    if (promo) {
      setEditingPromo(promo);
      setFormData({
        ...promo,
        startDate: promo.startDate.split('T')[0],
        endDate: promo.endDate.split('T')[0]
      });
    } else {
      setEditingPromo(null);
      setFormData({
        code: '',
        description: '',
        discountType: 'PERCENTAGE',
        discountValue: '',
        maxDiscount: '',
        minOrderAmount: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        usageLimit: '',
        userUsageLimit: 1,
        isActive: true
      });
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        discountValue: parseFloat(formData.discountValue),
        maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
        minOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : 0,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
        userUsageLimit: parseInt(formData.userUsageLimit)
      };

      if (editingPromo) {
        await promotionService.updatePromotion(selectedRestaurant.id, editingPromo.id, data);
      } else {
        await promotionService.createPromotion(selectedRestaurant.id, data);
      }
      fetchPromotions();
      setShowModal(false);
    } catch (error) {
      alert(error.response?.data?.message || 'Something went wrong');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(isArabic ? 'هل أنت متأكد من حذف هذا العرض؟' : 'Are you sure you want to delete this promotion?')) {
      try {
        await promotionService.deletePromotion(selectedRestaurant.id, id);
        fetchPromotions();
      } catch (error) {
        console.error('Failed to delete promotion', error);
      }
    }
  };

  const t = {
    title: isArabic ? 'العروض الترويجية' : 'Promotions',
    desc: isArabic ? 'إدارة أكواد الخصم والعروض لعملائك.' : 'Manage discount codes and offers for your customers.',
    addPromo: isArabic ? 'إضافة عرض جديد' : 'Add New Promo',
    editPromo: isArabic ? 'تعديل العرض' : 'Edit Promo',
    code: isArabic ? 'كود الخصم' : 'Promo Code',
    description: isArabic ? 'الوصف' : 'Description',
    discountType: isArabic ? 'نوع الخصم' : 'Discount Type',
    value: isArabic ? 'القيمة' : 'Value',
    percentage: isArabic ? 'نسبة مئوية' : 'Percentage',
    fixed: isArabic ? 'مبلغ ثابت' : 'Fixed Amount',
    maxDiscount: isArabic ? 'الحد الأقصى للخصم' : 'Max Discount',
    minOrder: isArabic ? 'الحد الأدنى للطلب' : 'Min Order Amount',
    startDate: isArabic ? 'تاريخ البدء' : 'Start Date',
    endDate: isArabic ? 'تاريخ الانتهاء' : 'End Date',
    usageLimit: isArabic ? 'حد الاستخدام الكلي' : 'Total Usage Limit',
    userLimit: isArabic ? 'حد استخدام المستخدم' : 'User Usage Limit',
    status: isArabic ? 'الحالة' : 'Status',
    active: isArabic ? 'نشط' : 'Active',
    inactive: isArabic ? 'غير نشط' : 'Inactive',
    save: isArabic ? 'حفظ' : 'Save',
    cancel: isArabic ? 'إلغاء' : 'Cancel',
    noPromos: isArabic ? 'لا توجد عروض حالياً' : 'No promotions found',
    usage: isArabic ? 'استخدام' : 'usages'
  };

  return (
    <div dir={isArabic ? 'rtl' : 'ltr'} className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col h-full min-h-[calc(100vh-76px)] animate-fade-in space-y-6 pb-20">
      
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <Tag className="w-8 h-8 text-purple-200" />
            <h1 className="text-3xl font-bold">{t.title}</h1>
          </div>
          <p className="text-purple-100 font-medium opacity-90">{t.desc}</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="mt-6 sm:mt-0 relative z-10 bg-white text-purple-700 px-6 py-3 rounded-2xl font-bold shadow-xl hover:bg-purple-50 transition-all flex items-center gap-2 group"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          {t.addPromo}
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : promotions.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-12 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mb-4">
            <Tag className="w-10 h-10 text-purple-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">{t.noPromos}</h3>
          <p className="text-gray-500 max-w-sm mb-6">{t.desc}</p>
          <button 
            onClick={() => handleOpenModal()}
            className="text-purple-600 font-bold hover:underline"
          >
            {t.addPromo}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promotions.map((promo) => (
            <div key={promo.id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
              <div className={`absolute top-0 right-0 w-1.5 h-full ${promo.isActive ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              
              <div className="flex justify-between items-start mb-4">
                <div className="bg-purple-50 text-purple-700 px-4 py-1.5 rounded-lg font-black text-lg tracking-wider">
                  {promo.code}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleOpenModal(promo)}
                    className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(promo.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h4 className="font-bold text-gray-800 mb-1">{promo.description || (isArabic ? 'خصم رائع' : 'Great Discount')}</h4>
              
              <div className="space-y-3 mt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-1">
                    {promo.discountType === 'PERCENTAGE' ? <Percent className="w-3.5 h-3.5" /> : <CircleDollarSign className="w-3.5 h-3.5" />}
                    {t.value}
                  </span>
                  <span className="font-bold text-gray-800">
                    {promo.discountValue}{promo.discountType === 'PERCENTAGE' ? '%' : ' EGP'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {t.endDate}
                  </span>
                  <span className="font-medium text-gray-700">
                    {new Date(promo.endDate).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US')}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{t.usage}</span>
                  <div className="flex flex-col items-end">
                    <span className="font-bold text-purple-600">
                      {promo.usageCount} {promo.usageLimit ? `/ ${promo.usageLimit}` : ''}
                    </span>
                    <div className="w-24 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                      <div 
                        className="h-full bg-purple-500 rounded-full" 
                        style={{ width: promo.usageLimit ? `${(promo.usageCount / promo.usageLimit) * 100}%` : '100%' }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                <div className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${promo.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                  {promo.isActive ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  {promo.isActive ? t.active : t.inactive}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity"
            onClick={() => setShowModal(false)}
          />
          <div className="bg-white rounded-3xl w-full max-w-2xl relative z-10 shadow-2xl overflow-hidden animate-scale-up">
            
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-purple-50/50">
              <h2 className="text-2xl font-black text-purple-800">{editingPromo ? t.editPromo : t.addPromo}</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-8 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="md:col-span-1">
                  <label className="block text-sm font-bold text-gray-700 mb-2">{t.code}</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. SUMMER50"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all font-bold tracking-widest"
                  />
                </div>

                <div className="md:col-span-1">
                  <label className="block text-sm font-bold text-gray-700 mb-2">{t.discountType}</label>
                  <div className="flex p-1 bg-gray-100 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, discountType: 'PERCENTAGE'})}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${formData.discountType === 'PERCENTAGE' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500'}`}
                    >
                      {t.percentage}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, discountType: 'FIXED_AMOUNT'})}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${formData.discountType === 'FIXED_AMOUNT' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500'}`}
                    >
                      {t.fixed}
                    </button>
                  </div>
                </div>

                <div className="md:col-span-1">
                  <label className="block text-sm font-bold text-gray-700 mb-2">{t.value}</label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      value={formData.discountValue}
                      onChange={(e) => setFormData({...formData, discountValue: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                    />
                    <div className={`absolute ${isArabic ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-gray-400 font-bold`}>
                      {formData.discountType === 'PERCENTAGE' ? '%' : 'EGP'}
                    </div>
                  </div>
                </div>

                <div className="md:col-span-1">
                  <label className="block text-sm font-bold text-gray-700 mb-2">{t.maxDiscount}</label>
                  <input
                    type="number"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({...formData, maxDiscount: e.target.value})}
                    placeholder={formData.discountType === 'PERCENTAGE' ? 'Optional' : 'N/A'}
                    disabled={formData.discountType === 'FIXED_AMOUNT'}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all disabled:opacity-50"
                  />
                </div>

                <div className="md:col-span-1">
                  <label className="block text-sm font-bold text-gray-700 mb-2">{t.startDate}</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                  />
                </div>

                <div className="md:col-span-1">
                  <label className="block text-sm font-bold text-gray-700 mb-2">{t.endDate}</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                  />
                </div>

                <div className="md:col-span-1">
                  <label className="block text-sm font-bold text-gray-700 mb-2">{t.minOrder}</label>
                  <input
                    type="number"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({...formData, minOrderAmount: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                  />
                </div>

                <div className="md:col-span-1">
                  <label className="block text-sm font-bold text-gray-700 mb-2">{t.usageLimit}</label>
                  <input
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({...formData, usageLimit: e.target.value})}
                    placeholder="Unlimited if empty"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">{t.description}</label>
                  <textarea
                    rows="2"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all resize-none"
                  />
                </div>

                <div className="md:col-span-2 flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="isActive" className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                    {t.active}
                  </label>
                </div>

              </div>

              <div className="mt-10 flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-4 text-gray-500 font-bold rounded-2xl hover:bg-gray-100 transition-colors"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-4 bg-purple-600 text-white font-black rounded-2xl hover:bg-purple-700 shadow-xl shadow-purple-200 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
