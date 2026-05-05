import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { translate } from '../locales/translations';
import { useRestaurant } from '../contexts/RestaurantContext';
import restaurantService from '../services/restaurant.service';
import uploadService from '../services/upload.service';
import { 
  Camera, 
  Pencil, 
  Store, 
  Building2, 
  MapPin, 
  Truck, 
  Clock, 
  Star, 
  Palette,
  Utensils,
  FileText,
  UtensilsCrossed,
  Phone,
  Map,
  Crosshair,
  Navigation,
  DollarSign,
  ShoppingBag,
  Target,
  Sliders,
  CheckCircle2,
  MessageSquare,
  Calendar,
  History,
  Upload,
  XCircle,
  Loader2,
  Plus,
  Trash2,
  Check
} from 'lucide-react';

export default function ProfileView() {
  const { language } = useLanguage();
  const { selectedRestaurant, fetchRestaurants } = useRestaurant();
  const isArabic = language === 'ar';
  const t = (key) => translate(language, `profile.${key}`);
  
  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState({ logo: false, cover: false });

  const startEdit = (field, currentValue) => {
    setEditingField(field);
    setTempValue(currentValue || '');
  };

  const saveEdit = async (field) => {
    if (!selectedRestaurant?.id) return;
    setLoading(true);
    try {
      const updateData = {};
      updateData[field] = tempValue;
      await restaurantService.updateRestaurant(selectedRestaurant.id, updateData);
      await fetchRestaurants();
      setEditingField(null);
    } catch (err) {
      console.error('Failed to update restaurant:', err);
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditingField(null);
    setTempValue('');
  };

  const updateLocationFromDevice = async () => {
    if (!navigator.geolocation) {
      alert(isArabic ? 'متصفحك لا يدعم تحديد الموقع' : 'Geolocation is not supported by your browser');
      return;
    }

    try {
      setLoading(true);
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 0
        });
      });

      const { latitude, longitude } = position.coords;
      
      await restaurantService.updateRestaurant(selectedRestaurant.id, {
        latitude,
        longitude
      });
      
      await fetchRestaurants();
      alert(isArabic ? 'تم تحديث الموقع الجغرافي بنجاح' : 'Location coordinates updated successfully');
    } catch (err) {
      console.error('Location Error:', err);
      let errorMsg = isArabic ? 'فشل تحديد الموقع' : 'Failed to get location';
      if (err.code === 1) errorMsg = isArabic ? 'يرجى السماح بالوصول للموقع' : 'Please allow location access';
      if (err.code === 3) errorMsg = isArabic ? 'انتهت مهلة البحث عن الموقع' : 'Location request timed out';
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleOpen = async () => {
    if (!selectedRestaurant?.id) return;
    try {
      await restaurantService.toggleOpen(selectedRestaurant.id, !selectedRestaurant.isOpen);
      await fetchRestaurants();
    } catch (err) {
      console.error('Failed to toggle open status:', err);
    }
  };

  const handleImageChange = async (e, type) => {
    const file = e.target.files?.[0];
    if (file && selectedRestaurant?.id) {
      try {
        setImageLoading(prev => ({ ...prev, [type]: true }));
        console.log(`[DEBUG] Starting upload for ${type}...`);
        
        // 1. Upload to Cloudinary via backend
        const folder = type === 'logo' ? 'restaurants/logos' : 'restaurants/banners';
        const { url } = await uploadService.uploadFile(file, folder);
        console.log(`[DEBUG] Uploaded to Cloudinary. URL:`, url);
        
        // 2. Update restaurant URL
        const updateData = {};
        if (type === 'logo') updateData.logoUrl = url;
        if (type === 'cover') updateData.coverImageUrl = url;
        
        await restaurantService.updateRestaurant(selectedRestaurant.id, updateData);
        console.log(`[DEBUG] Updated restaurant record in DB.`);
        
        // 3. Force refresh context data
        if (fetchRestaurants) {
          await fetchRestaurants();
          console.log(`[DEBUG] Context refreshed with new data.`);
        } else {
          console.warn(`[DEBUG] fetchRestaurants not found in context!`);
        }
        
        alert(isArabic ? 'تم تحديث الصورة بنجاح' : 'Image updated successfully');
      } catch (err) {
        console.error(`[DEBUG] Failed to upload ${type}:`, err);
        alert(isArabic ? 'فشل تحميل الصورة' : 'Failed to upload image');
      } finally {
        setImageLoading(prev => ({ ...prev, [type]: false }));
      }
    }
  };

  const SectionCard = ({ icon: Icon, title, children, headerAction }) => (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 flex flex-col gap-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl">
            <Icon className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        </div>
        {headerAction}
      </div>
      {children}
    </div>
  );

  const InfoRow = ({ icon: Icon, label, value, fieldName, isEditable = true, children }) => {
    const isEditing = editingField === fieldName;

    return (
      <div className={`flex items-start gap-4 py-3`}>
        {Icon && <Icon className={`w-5 h-5 text-gray-400 mt-1 shrink-0`} />}
        <div className={`flex-1 min-w-0`}>
          <p className="text-xs font-medium text-gray-400 mb-1">{label}</p>
          {isEditing ? (
            <input
              type="text"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className={`w-full px-2 py-1 text-sm font-medium text-gray-800 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500`}
              autoFocus
            />
          ) : (
            <>
              {children ? children : <p className="text-sm font-medium text-gray-800">{value || 'N/A'}</p>}
            </>
          )}
        </div>
        <div className={`flex items-center gap-1`}>
          {isEditing ? (
            <>
              <button
                onClick={() => saveEdit(fieldName)}
                disabled={loading}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Save"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              </button>
              <button
                onClick={cancelEdit}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Cancel"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </>
          ) : (
            isEditable && (
              <button
                onClick={() => startEdit(fieldName, value)}
                className="p-2 -mr-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
              >
                <Pencil className="w-4 h-4" />
              </button>
            )
          )}
        </div>
      </div>
    );
  };

  if (!selectedRestaurant) {
    return <div className="p-8 text-center text-gray-500">No restaurant selected.</div>;
  }

  const hours = selectedRestaurant.workingHours || [];

  return (
    <div dir={isArabic ? 'rtl' : 'ltr'} className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col h-full min-h-[calc(100vh-76px)] animate-fade-in space-y-6 sm:space-y-8 pb-20">
      
      {/* Top Banner & Profile Info */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="relative h-48 sm:h-56 bg-gray-100 group">
          <img 
            src={selectedRestaurant.coverImageUrl || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80'} 
            alt="Cover" 
            className={`w-full h-full object-cover transition-opacity ${imageLoading.cover ? 'opacity-50' : 'opacity-100'}`}
          />
          {imageLoading.cover && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            </div>
          )}
          <label className={`absolute top-4 p-3 bg-white/90 backdrop-blur text-orange-600 rounded-full shadow-xl hover:bg-white transition-all cursor-pointer transform hover:scale-110 active:scale-95 ${isArabic ? 'left-4' : 'right-4'}`}>
            <Camera className="w-6 h-6" />
            <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, 'cover')} className="hidden" disabled={imageLoading.cover} />
          </label>
        </div>

        <div className="px-5 pb-6">
          <div className={`relative flex justify-start -mt-12 mb-4`}>
            <div className="relative group">
              <div className={`w-28 h-28 rounded-3xl bg-white p-1.5 shadow-xl border-4 border-white overflow-hidden ${imageLoading.logo ? 'opacity-50' : 'opacity-100'}`}>
                <img 
                  src={selectedRestaurant.logoUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80'} 
                  alt="Logo" 
                  className="w-full h-full rounded-2xl object-cover"
                />
              </div>
              {imageLoading.logo && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
                </div>
              )}
              <label className={`absolute -bottom-2 p-2 bg-orange-500 text-white rounded-full shadow-lg hover:bg-orange-600 transition-all border-4 border-white cursor-pointer transform hover:scale-110 active:scale-95 ${isArabic ? '-left-2' : '-right-2'}`}>
                <Pencil className="w-4 h-4" />
                <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, 'logo')} className="hidden" disabled={imageLoading.logo} />
              </label>
            </div>
          </div>
          
          <div className="mt-2">
            <h1 className="text-3xl font-black text-slate-900 mb-1">
               {isArabic ? (selectedRestaurant.nameAr || selectedRestaurant.name) : selectedRestaurant.name}
            </h1>
            <p className={`text-sm text-gray-500 font-medium flex items-center gap-1.5`}>
               <MapPin className="w-4 h-4 text-orange-400" />
               {selectedRestaurant.address}
            </p>
          </div>
        </div>
      </div>

      {/* Currently Open Toggle */}
      <div className={`bg-white rounded-[28px] shadow-sm border border-gray-100 p-6 flex items-center justify-between transition-all ${selectedRestaurant.isOpen ? 'border-green-100 bg-green-50/10' : 'border-red-100 bg-red-50/10'}`}>
        <div className={`flex items-center gap-5`}>
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${selectedRestaurant.isOpen ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
            <Store className={`w-7 h-7 ${selectedRestaurant.isOpen ? 'animate-pulse' : ''}`} />
          </div>
          <div>
            <h3 className={`text-xl font-black ${selectedRestaurant.isOpen ? 'text-green-700' : 'text-red-700'}`}>{selectedRestaurant.isOpen ? t('currentlyOpen') : t('currentlyClosed')}</h3>
            <p className="text-sm text-gray-500 font-medium mt-0.5">{selectedRestaurant.isOpen ? t('customersCanOrder') : t('customersCannotOrder')}</p>
          </div>
        </div>
        <button 
          onClick={handleToggleOpen}
          className={`relative inline-flex h-9 w-16 flex-shrink-0 cursor-pointer rounded-full border-4 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${selectedRestaurant.isOpen ? 'bg-green-500' : 'bg-slate-200'}`}
        >
          <span className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-xl ring-0 transition duration-200 ease-in-out ${selectedRestaurant.isOpen ? (isArabic ? '-translate-x-7' : 'translate-x-7') : 'translate-x-0'}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Business Information */}
        <SectionCard icon={Building2} title={t('businessInfo')}>
          <div className="space-y-4">
            <InfoRow icon={Utensils} label={t('restaurantName')} fieldName="name" value={selectedRestaurant.name} />
            <InfoRow icon={FileText} label={t('description')} fieldName="description" value={selectedRestaurant.description} />
            <InfoRow icon={UtensilsCrossed} label={t('cuisineTypes')} fieldName="vendorType" value={selectedRestaurant.vendorType} />
            <InfoRow icon={Phone} label={t('phone')} fieldName="payoutPhoneNumber" value={selectedRestaurant.payoutPhoneNumber} />
          </div>
        </SectionCard>

        {/* Location */}
        <SectionCard 
          icon={MapPin} 
          title={t('location')}
          headerAction={
            <button 
              onClick={updateLocationFromDevice}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-600 rounded-lg text-xs font-bold hover:bg-orange-100 transition-colors disabled:opacity-50"
            >
              <Navigation className="w-3 h-3" />
              {isArabic ? 'تحديث من جهازي' : 'Update from Device'}
            </button>
          }
        >
          <div className="space-y-4">
            <InfoRow icon={Map} label={t('address')} fieldName="address" value={selectedRestaurant.address} />
            <InfoRow icon={Crosshair} label={t('coordinates')} isEditable={false}>
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
                <p className="text-sm font-bold text-slate-800 font-mono">
                  {selectedRestaurant.latitude?.toFixed(6)}, {selectedRestaurant.longitude?.toFixed(6)}
                </p>
                <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                   <Navigation className="w-3 h-3" />
                   {selectedRestaurant.city || 'Cairo'}
                </div>
              </div>
            </InfoRow>
          </div>
        </SectionCard>

        {/* Delivery Settings Summary */}
        <SectionCard icon={Truck} title={t('deliverySettings')}>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('deliveryFee')}</p>
               <p className="text-lg font-black text-slate-900">{selectedRestaurant.deliveryFeeMode === 'fixed' ? `${selectedRestaurant.deliveryFee} ${isArabic ? 'ج.م' : 'EGP'}` : (isArabic ? 'متغير' : 'Variable')}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('deliveryTime')}</p>
               <p className="text-lg font-black text-slate-900">{selectedRestaurant.deliveryTimeMin}—{selectedRestaurant.deliveryTimeMax} <span className="text-xs">{t('min')}</span></p>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('minimumOrder')}</p>
               <p className="text-lg font-black text-slate-900">{selectedRestaurant.minimumOrder} <span className="text-xs">{isArabic ? 'ج.م' : 'EGP'}</span></p>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('deliveryRadius')}</p>
               <p className="text-lg font-black text-slate-900">{selectedRestaurant.deliveryRadiusKm} <span className="text-xs">{isArabic ? 'كم' : 'km'}</span></p>
            </div>
          </div>
        </SectionCard>

        {/* Operating Hours */}
        <SectionCard icon={Clock} title={t('operatingHours')}>
          <div className="space-y-4">
            {hours.length > 0 ? hours.map((schedule, idx) => (
              <div key={idx} className={`flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors`}>
                <span className="text-sm font-black text-slate-800">{schedule.day}</span>
                <div className="flex items-center gap-3">
                   <span className={`text-xs font-bold text-gray-500 bg-white px-3 py-1 rounded-lg border border-gray-100 shadow-sm`}>{schedule.open} — {schedule.close}</span>
                   <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                </div>
              </div>
            )) : (
              <div className="text-center py-10 opacity-50">
                 <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                 <p className="text-sm font-bold">{isArabic ? 'لم يتم ضبط المواعيد' : 'No hours set.'}</p>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Ratings & Stats */}
        <SectionCard icon={Star} title={t('ratingsStats')}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <div className="bg-orange-50 border border-orange-100 rounded-3xl p-6 flex flex-col items-center justify-center">
                <div className="flex items-center gap-2 mb-2">
                   <span className="text-4xl font-black text-orange-600">{selectedRestaurant.rating}</span>
                   <Star className="w-8 h-8 fill-orange-500 text-orange-500" />
                </div>
                <p className="text-xs font-bold text-orange-400 uppercase tracking-widest">{t('rating')}</p>
             </div>
             <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-slate-800 mb-2">{selectedRestaurant.ratingCount}</span>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('totalReviews')}</p>
             </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
