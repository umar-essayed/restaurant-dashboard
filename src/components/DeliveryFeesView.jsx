import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useRestaurant } from '../contexts/RestaurantContext';
import restaurantService from '../services/restaurant.service';
import { Truck, MapPin, DollarSign, Plus, Trash2, Save, Info, Clock, ShoppingBag } from 'lucide-react';

export default function DeliveryFeesView() {
  const { language } = useLanguage();
  const { selectedRestaurant, fetchRestaurants } = useRestaurant();
  const isArabic = language === 'ar';

  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("fixed"); // fixed | distance
  const [subMode, setSubMode] = useState("per_km"); // per_km | tiered
  const [fixedFee, setFixedFee] = useState(0);
  const [baseFee, setBaseFee] = useState(0);
  const [perKmRate, setPerKmRate] = useState(0);
  const [tiers, setTiers] = useState([]);
  const [radius, setRadius] = useState(10);
  const [deliveryTimeMin, setDeliveryTimeMin] = useState(30);
  const [deliveryTimeMax, setDeliveryTimeMax] = useState(60);
  const [minimumOrder, setMinimumOrder] = useState(0);
  const [serviceFeeType, setServiceFeeType] = useState("fixed"); // fixed | percentage
  const [serviceFeeValue, setServiceFeeValue] = useState(0);

  useEffect(() => {
    if (selectedRestaurant) {
      setMode(selectedRestaurant.deliveryFeeMode || 'fixed');
      setFixedFee(selectedRestaurant.deliveryFee || 0);
      setRadius(selectedRestaurant.deliveryRadiusKm || 10);
      setDeliveryTimeMin(selectedRestaurant.deliveryTimeMin || 30);
      setDeliveryTimeMax(selectedRestaurant.deliveryTimeMax || 60);
      setMinimumOrder(selectedRestaurant.minimumOrder || 0);
      
      const formula = selectedRestaurant.deliveryFeeFormula;
      if (formula) {
        setSubMode(formula.sub_mode || 'per_km');
        setBaseFee(formula.base_fee || 0);
        setPerKmRate(formula.per_km_rate || 0);
        if (formula.tiers) setTiers(formula.tiers);
      }
      
      setServiceFeeType(selectedRestaurant.serviceFeeType || 'fixed');
      setServiceFeeValue(selectedRestaurant.serviceFeeValue || 0);
    }
  }, [selectedRestaurant]);

  const addTier = () => {
    setTiers([...tiers, { from: '', to: '', price: '' }]);
  };

  const updateTier = (index, field, value) => {
    const newTiers = [...tiers];
    newTiers[index][field] = value;
    setTiers(newTiers);
  };

  const removeTier = (index) => {
    const newTiers = tiers.filter((_, i) => i !== index);
    setTiers(newTiers);
  };

  const handleSave = async () => {
    if (!selectedRestaurant) return;
    
    try {
      setLoading(true);
      const data = {
        deliveryFeeMode: mode,
        deliveryFee: mode === 'fixed' ? Number(fixedFee) : 0,
        deliveryRadiusKm: Number(radius),
        deliveryTimeMin: Number(deliveryTimeMin),
        deliveryTimeMax: Number(deliveryTimeMax),
        minimumOrder: Number(minimumOrder),
        deliveryFeeFormula: mode === 'distance' ? {
          sub_mode: subMode,
          base_fee: Number(baseFee),
          per_km_rate: Number(perKmRate),
          tiers: tiers.map(t => ({ 
            from: Number(t.from), 
            to: Number(t.to), 
            price: Number(t.price) 
          }))
        } : null,
        serviceFeeType: serviceFeeType,
        serviceFeeValue: Number(serviceFeeValue)
      };

      await restaurantService.updateDeliverySettings(selectedRestaurant.id, data);
      await fetchRestaurants(); // Refresh data
      alert(isArabic ? 'تم حفظ الإعدادات بنجاح' : 'Settings saved successfully');
    } catch (error) {
      console.error("Save Error:", error);
      alert(isArabic ? 'فشل حفظ الإعدادات' : 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const t = {
    title: isArabic ? 'رسوم التوصيل' : 'Delivery Fees',
    desc: isArabic ? 'قم بإعداد كيفية حساب رسوم التوصيل للعملاء.' : 'Configure how delivery fees are calculated for your customers.',
    modeTitle: isArabic ? 'نظام التسعير' : 'Pricing Mode',
    fixed: isArabic ? 'سعر ثابت' : 'Fixed Fee',
    distance: isArabic ? 'حسب المسافة' : 'Distance-Based',
    fixedFeeTitle: isArabic ? 'رسوم التوصيل الثابتة' : 'Fixed Delivery Fee',
    currency: isArabic ? 'ج.م' : 'EGP',
    distanceConfig: isArabic ? 'إعدادات المسافة' : 'Distance Configuration',
    perKm: isArabic ? 'لكل كيلومتر' : 'Per Kilometer',
    tiered: isArabic ? 'نظام الشرائح' : 'Tiered Pricing',
    baseFee: isArabic ? 'الرسوم الأساسية' : 'Base Fee',
    perKmRate: isArabic ? 'التكلفة لكل كم' : 'Per KM Rate',
    addTier: isArabic ? 'إضافة شريحة' : 'Add Tier',
    from: isArabic ? 'من (كم)' : 'From (km)',
    to: isArabic ? 'إلى (كم)' : 'To (km)',
    price: isArabic ? 'السعر' : 'Price',
    radiusTitle: isArabic ? 'نطاق التوصيل الأقصى' : 'Maximum Delivery Radius',
    radiusDesc: isArabic ? 'لن يظهر المطعم للعملاء خارج هذا النطاق.' : 'Restaurant will not appear to customers outside this radius.',
    saveBtn: isArabic ? 'حفظ التغييرات' : 'Save Changes',
    deliveryTimeTitle: isArabic ? 'وقت التوصيل المتوقع' : 'Expected Delivery Time',
    minOrderTitle: isArabic ? 'الحد الأدنى للطلب' : 'Minimum Order',
    min: isArabic ? 'دقيقة' : 'min',
    minLabel: isArabic ? 'الأقل' : 'Min',
    maxLabel: isArabic ? 'الأقصى' : 'Max',
    serviceFeeTitle: isArabic ? 'رسوم التطبيق (العمولة)' : 'App Service Fee (Commission)',
    serviceFeeDesc: isArabic ? 'هذه هي الرسوم التي يتقاضاها النظام من كل أوردر.' : 'This is the fee the system takes from each order.',
    fixedAmount: isArabic ? 'مبلغ ثابت' : 'Fixed Amount',
    percentage: isArabic ? 'نسبة مئوية' : 'Percentage',
  };

  return (
    <div dir={isArabic ? 'rtl' : 'ltr'} className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col h-full min-h-[calc(100vh-76px)] animate-fade-in space-y-6 pb-20">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-400 to-orange-500 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col items-start relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/20 rounded-full blur-3xl pointer-events-none"></div>
        <Truck className="w-12 h-12 mb-4 text-orange-100" />
        <h1 className="text-3xl font-bold mb-2">{t.title}</h1>
        <p className="text-orange-50 font-medium">{t.desc}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Main Settings) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Pricing Mode */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-4">{t.modeTitle}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => setMode('fixed')}
                className={`p-4 rounded-xl border-2 text-left ${isArabic ? 'text-right' : ''} transition-all focus:outline-none ${
                  mode === 'fixed' 
                  ? 'border-orange-500 bg-orange-50' 
                  : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${mode === 'fixed' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <span className={`font-semibold ${mode === 'fixed' ? 'text-orange-700' : 'text-gray-700'}`}>{t.fixed}</span>
                </div>
              </button>

              <button
                onClick={() => setMode('distance')}
                className={`p-4 rounded-xl border-2 text-left ${isArabic ? 'text-right' : ''} transition-all focus:outline-none ${
                  mode === 'distance' 
                  ? 'border-orange-500 bg-orange-50' 
                  : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${mode === 'distance' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    <MapPin className="w-5 h-5" />
                  </div>
                  <span className={`font-semibold ${mode === 'distance' ? 'text-orange-700' : 'text-gray-700'}`}>{t.distance}</span>
                </div>
              </button>
            </div>
          </div>

          {/* Conditional Configuration Section */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm animate-fade-in">
            {mode === 'fixed' ? (
              <div>
                <h2 className="text-lg font-bold text-slate-800 mb-4">{t.fixedFeeTitle}</h2>
                <div className="relative max-w-sm">
                  <div className={`absolute inset-y-0 ${isArabic ? 'right-0 pr-4' : 'left-0 pl-4'} flex items-center pointer-events-none`}>
                    <span className="text-gray-500 font-medium">{t.currency}</span>
                  </div>
                  <input
                    type="number"
                    value={fixedFee}
                    onChange={(e) => setFixedFee(e.target.value)}
                    className={`w-full py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all ${isArabic ? 'pr-14 pl-4' : 'pl-14 pr-4'}`}
                  />
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-lg font-bold text-slate-800 mb-4">{t.distanceConfig}</h2>
                
                <div className="flex bg-gray-100 p-1 rounded-xl mb-6 inline-flex">
                  <button
                    onClick={() => setSubMode('per_km')}
                    className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all focus:outline-none ${
                      subMode === 'per_km' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {t.perKm}
                  </button>
                  <button
                    onClick={() => setSubMode('tiered')}
                    className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all focus:outline-none ${
                      subMode === 'tiered' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {t.tiered}
                  </button>
                </div>

                {subMode === 'per_km' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">{t.baseFee}</label>
                      <input
                        type="number"
                        value={baseFee}
                        onChange={(e) => setBaseFee(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">{t.perKmRate}</label>
                      <input
                        type="number"
                        value={perKmRate}
                        onChange={(e) => setPerKmRate(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                      />
                    </div>
                  </div>
                )}

                {subMode === 'tiered' && (
                  <div className="animate-fade-in">
                    <div className="space-y-3 mb-4">
                      {tiers.map((tier, index) => (
                        <div key={index} className="flex items-center gap-2 sm:gap-3 bg-gray-50 p-2 sm:p-3 rounded-xl border border-gray-200">
                          <div className="flex-1">
                            <input
                              type="number"
                              placeholder={t.from}
                              value={tier.from}
                              onChange={(e) => updateTier(index, "from", e.target.value)}
                              className="w-full px-2 sm:px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-orange-500"
                            />
                          </div>
                          <div className="flex-1">
                            <input
                              type="number"
                              placeholder={t.to}
                              value={tier.to}
                              onChange={(e) => updateTier(index, "to", e.target.value)}
                              className="w-full px-2 sm:px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-orange-500"
                            />
                          </div>
                          <div className="flex-1 relative">
                            <input
                              type="number"
                              placeholder={t.price}
                              value={tier.price}
                              onChange={(e) => updateTier(index, "price", e.target.value)}
                              className={`w-full px-2 sm:px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-orange-500 ${isArabic ? 'pl-8' : 'pr-8'}`}
                            />
                             <div className={`absolute inset-y-0 ${isArabic ? 'left-0 pl-2' : 'right-0 pr-2'} flex items-center pointer-events-none`}>
                               <span className="text-xs text-gray-400 font-bold">{t.currency}</span>
                             </div>
                          </div>
                          <button 
                            onClick={() => removeTier(index)}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors focus:outline-none"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button 
                      onClick={addTier}
                      className="flex items-center gap-2 text-orange-500 font-semibold hover:text-orange-600 px-3 py-2 rounded-lg hover:bg-orange-50 transition-colors focus:outline-none"
                    >
                      <Plus className="w-4 h-4" />
                      {t.addTier}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* App Service Fee Settings */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
               <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                  <DollarSign className="w-5 h-5" />
               </div>
               <div>
                  <h2 className="text-lg font-bold text-slate-800">{t.serviceFeeTitle}</h2>
                  <p className="text-xs text-gray-400 font-medium">{t.serviceFeeDesc}</p>
               </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <div className="space-y-3">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest block">{isArabic ? 'نوع الرسوم' : 'Fee Type'}</label>
                  <div className="flex bg-gray-100 p-1 rounded-xl">
                     <button
                        onClick={() => setServiceFeeType('fixed')}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                           serviceFeeType === 'fixed' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'
                        }`}
                     >
                        {t.fixedAmount}
                     </button>
                     <button
                        onClick={() => setServiceFeeType('percentage')}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                           serviceFeeType === 'percentage' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'
                        }`}
                     >
                        {t.percentage}
                     </button>
                  </div>
               </div>

               <div className="space-y-3">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest block">{isArabic ? 'القيمة' : 'Value'}</label>
                  <div className="relative">
                     <input
                        type="number"
                        value={serviceFeeValue}
                        onChange={(e) => setServiceFeeValue(e.target.value)}
                        placeholder="0.00"
                        className={`w-full py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-black ${isArabic ? 'pl-10' : 'pr-10'}`}
                     />
                     <div className={`absolute inset-y-0 ${isArabic ? 'left-0 pl-4' : 'right-0 pr-4'} flex items-center pointer-events-none`}>
                        <span className="text-gray-500 font-black">{serviceFeeType === 'fixed' ? t.currency : '%'}</span>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Right Column (Radius, Time, Min Order & Save) */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-4">{t.deliveryTimeTitle}</h2>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">{t.minLabel}</label>
                  <input
                    type="number"
                    value={deliveryTimeMin}
                    onChange={(e) => setDeliveryTimeMin(e.target.value)}
                    className="w-full py-3 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                  />
               </div>
               <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">{t.maxLabel}</label>
                  <input
                    type="number"
                    value={deliveryTimeMax}
                    onChange={(e) => setDeliveryTimeMax(e.target.value)}
                    className="w-full py-3 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                  />
               </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-4">{t.minOrderTitle}</h2>
            <div className="relative">
              <div className={`absolute inset-y-0 ${isArabic ? 'right-0 pr-4' : 'left-0 pl-4'} flex items-center pointer-events-none`}>
                <ShoppingBag className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="number"
                value={minimumOrder}
                onChange={(e) => setMinimumOrder(e.target.value)}
                className={`w-full py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all ${isArabic ? 'pr-12 pl-12' : 'pl-12 pr-12'}`}
              />
              <div className={`absolute inset-y-0 ${isArabic ? 'left-0 pl-4' : 'right-0 pr-4'} flex items-center pointer-events-none`}>
                <span className="text-gray-500 font-medium text-sm">{t.currency}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-2">{t.radiusTitle}</h2>
            <p className="text-sm text-gray-500 mb-4">{t.radiusDesc}</p>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="50"
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="w-full accent-orange-500 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="w-16 h-10 flex items-center justify-center bg-orange-50 text-orange-700 font-bold rounded-xl shrink-0">
                {radius} km
              </div>
            </div>
          </div>

          <button 
            onClick={handleSave}
            disabled={loading}
            className="w-full py-4 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md shadow-orange-200 disabled:opacity-50"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save className="w-5 h-5" />}
            {t.saveBtn}
          </button>
        </div>
      </div>
    </div>
  );
}
