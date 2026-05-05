import React, { useState, useEffect } from 'react';
import { X, ImagePlus, ChevronDown, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { translate } from '../locales/translations';
import { useRestaurant } from '../contexts/RestaurantContext';
import restaurantService from '../services/restaurant.service';
import uploadService from '../services/upload.service';

export default function AddItemModal({ isOpen, onClose, onAddItem, onEditItem, initialData }) {
  const { language } = useLanguage();
  const { selectedRestaurant } = useRestaurant();
  const isArabic = language === 'ar';
  
  const [loading, setLoading] = useState(false);
  const [sectionId, setSectionId] = useState('');
  const [sections, setSections] = useState([]);
  const [imageUrl, setImageUrl] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [descEn, setDescEn] = useState('');
  const [descAr, setDescAr] = useState('');
  const [price, setPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (isOpen && selectedRestaurant?.id) {
      restaurantService.getMenu(selectedRestaurant.id).then(setSections);
    }
  }, [isOpen, selectedRestaurant]);

  const resetForm = () => {
    setSectionId('');
    setImageUrl('');
    setNameEn('');
    setNameAr('');
    setDescEn('');
    setDescAr('');
    setPrice('');
    setSalePrice('');
    setEditingId(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setLoading(true);
        const { url } = await uploadService.uploadFile(file, 'food-items');
        setImageUrl(url);
      } catch (err) {
        console.error('Failed to upload image:', err);
        alert(isArabic ? 'فشل تحميل الصورة' : 'Failed to upload image');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async () => {
    if (!nameEn.trim() || !price || (!sectionId && sections.length > 0)) {
      alert(isArabic ? 'يرجى تعبئة الحقول المطلوبة' : 'Please fill in the required fields');
      return;
    }
    
    setLoading(true);
    try {
      const itemPayload = {
        name: nameEn.trim(),
        nameAr: nameAr.trim(),
        originalPrice: salePrice ? Number(price) : null,
        price: salePrice ? Number(salePrice) : Number(price),
        isOnSale: !!salePrice,
        description: descEn.trim(),
        descriptionAr: descAr.trim(),
        sectionId: sectionId || (sections.length > 0 ? sections[0].id : null),
        isAvailable: true,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=200&h=200&fit=crop',
      };

      if (editingId && onEditItem) {
        await onEditItem({ ...itemPayload, id: editingId });
      } else if (onAddItem) {
        await onAddItem(itemPayload);
      }
      
      resetForm();
      onClose();
    } catch (err) {
      console.error('Submit Error:', err);
      alert(isArabic ? 'فشل حفظ الصنف' : 'Failed to save item');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && initialData) {
      setEditingId(initialData.id || null);
      setSectionId(initialData.sectionId || '');
      setImageUrl(initialData.imageUrl || '');
      setNameEn(initialData.name || '');
      setNameAr(initialData.nameAr || '');
      setDescEn(initialData.description || '');
      setDescAr(initialData.descriptionAr || '');
      
      // If it's on sale, price is discountedPrice and originalPrice is the base price
      if (initialData.isOnSale) {
        setPrice(initialData.originalPrice || '');
        setSalePrice(initialData.price || '');
      } else {
        setPrice(initialData.price || '');
        setSalePrice('');
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={handleClose}></div>

      <div className="relative w-full max-w-xl mt-16 sm:mt-20 bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[calc(100vh-120px)] animate-fade-in fade-in-up">
        <div className="bg-orange-500 px-6 py-4 flex items-center justify-between z-10 shrink-0">
          <h2 className="text-xl font-bold text-white tracking-wide">{editingId ? translate(language, 'menu.editMenuItem') : translate(language, 'menu.addMenuItem')}</h2>
          <button onClick={handleClose} className="text-white/80 hover:text-white hover:bg-orange-600/50 p-1.5 rounded-full transition-colors focus:outline-none">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto w-full custom-scrollbar space-y-6">
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">{translate(language, 'menu.cuisineType')} <span className="text-red-500">*</span></label>
            <div className="relative">
              <select value={sectionId} onChange={(e) => setSectionId(e.target.value)} className="appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-10 rounded-xl leading-tight focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors cursor-pointer text-sm">
                <option value="" disabled hidden>{translate(language, 'menu.selectCuisineType')}</option>
                {sections.map(section => (
                  <option key={section.id} value={section.id}>{isArabic && section.nameAr ? section.nameAr : section.name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-orange-500">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">{translate(language, 'menu.itemImage')} <span className="text-red-500">*</span></label>
            {imageUrl && <img src={imageUrl} alt="Preview" className="w-full h-40 object-cover rounded-xl" />}
            <label className={`w-full h-40 border-2 border-dashed border-gray-200 bg-gray-50 hover:bg-gray-100 rounded-2xl flex flex-col items-center justify-center gap-2 transition-colors group cursor-pointer ${loading ? 'opacity-50' : ''}`}>
              {!imageUrl && !loading && (
                <>
                  <ImagePlus className="w-10 h-10 text-gray-300 group-hover:text-orange-400 transition-colors" />
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-500">{translate(language, 'menu.tapToUploadImage')}</p>
                  </div>
                </>
              )}
              {loading && <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />}
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={loading} />
            </label>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">{translate(language, 'menu.itemName')} <span className="text-red-500">*</span></label>
            <input type="text" value={nameEn} onChange={(e) => setNameEn(e.target.value)} placeholder="e.g., Grilled Chicken" className="w-full bg-white border border-gray-300 text-gray-900 text-sm py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors" />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">{translate(language, 'menu.itemNameAR')} <span className="text-red-500">*</span></label>
            <input dir="rtl" type="text" value={nameAr} onChange={(e) => setNameAr(e.target.value)} placeholder="مثال: دجاج مشوي" className="w-full bg-white border border-gray-300 text-gray-900 text-sm py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors text-right" />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">{translate(language, 'menu.description')} <span className="text-red-500">*</span></label>
            <textarea rows="3" value={descEn} onChange={(e) => setDescEn(e.target.value)} placeholder="Brief description of the item" className="w-full bg-white border border-gray-300 text-gray-900 text-sm py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors resize-none"></textarea>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">{translate(language, 'menu.descriptionAR')} <span className="text-red-500">*</span></label>
            <textarea dir="rtl" rows="3" value={descAr} onChange={(e) => setDescAr(e.target.value)} placeholder="وصف مختصر للصنف" className="w-full bg-white border border-gray-300 text-gray-900 text-sm py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors resize-none text-right"></textarea>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">{translate(language, 'menu.egpPrice')} <span className="text-red-500">*</span></label>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" className="w-full bg-white border border-gray-300 text-gray-900 text-sm py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors text-center" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">{translate(language, 'menu.discountedPrice')}</label>
              <input type="number" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} placeholder="Optional" className="w-full bg-white border border-gray-300 text-gray-900 text-sm py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors text-center" />
            </div>
          </div>
        </div>

        <div className="bg-white border-t border-gray-100 px-6 py-4 flex items-center justify-end gap-3 z-10 shrink-0">
          <button onClick={handleCancel} className="px-5 py-2.5 text-gray-500 font-semibold text-sm hover:bg-gray-50 rounded-xl transition-colors">
            {translate(language, 'menu.cancel')}
          </button>
          <button onClick={handleSubmit} disabled={loading} className="px-6 py-2.5 bg-orange-500 text-white font-semibold text-sm shadow-md shadow-orange-500/20 rounded-xl hover:bg-orange-600 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {editingId ? translate(language, 'menu.saveChanges') : translate(language, 'menu.createItem')}
          </button>
        </div>
      </div>
    </div>
  );
}
