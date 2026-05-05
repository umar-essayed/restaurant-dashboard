import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { translate } from '../locales/translations';
import { 
  Search, 
  Download, 
  Plus, 
  Eye, 
  PenSquare, 
  Trash2, 
  CheckCircle2, 
  XCircle,
  Check,
  X
} from 'lucide-react';
import AddItemModal from './AddItemModal';
import ImportModal from './ImportModal';
import { useRestaurant } from '../contexts/RestaurantContext';
import foodService from '../services/food.service';
import restaurantService from '../services/restaurant.service';

// Helper function to capitalize first letter only
const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const sortByEnglishName = (items) =>
  [...items].sort((left, right) =>
    String(left.name || '').localeCompare(String(right.name || ''), undefined, {
      sensitivity: 'base',
      numeric: true,
    })
  );

export default function MenuView() {
  const { language } = useLanguage();
  const { selectedRestaurant } = useRestaurant();
  const [searchQuery, setSearchQuery] = useState('');
  const [menuSections, setMenuSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isRecycleBinOpen, setIsRecycleBinOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const fetchMenu = async () => {
    if (!selectedRestaurant?.id) return;
    setLoading(true);
    try {
      const data = await restaurantService.getMenu(selectedRestaurant.id);
      setMenuSections(data);
    } catch (err) {
      console.error('Failed to fetch menu:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, [selectedRestaurant]);

  // Flatten items for filtering and display
  const allItems = menuSections.flatMap(section => 
    section.items.map(item => ({ ...item, sectionId: section.id, sectionName: section.name }))
  );

  const handleAddItem = async (newItem) => {
    try {
      // Find or create section (simpler to just use first section for now or a default)
      let sectionId = newItem.sectionId;
      if (!sectionId && menuSections.length > 0) {
        sectionId = menuSections[0].id;
      } else if (!sectionId) {
        const newSection = await foodService.createSection({ 
          name: 'Main', 
          restaurantId: selectedRestaurant.id 
        });
        sectionId = newSection.id;
      }

      await foodService.createFoodItem({
        ...newItem,
        sectionId,
        price: parseFloat(newItem.price),
      });
      fetchMenu();
    } catch (err) {
      console.error('Failed to add item:', err);
    }
  };

  const handleEditClick = (item) => {
    setEditingItem(item);
    setIsAddModalOpen(true);
  };

  const handleSaveEdit = async (updated) => {
    try {
      await foodService.updateFoodItem(updated.id, {
        ...updated,
        price: parseFloat(updated.price),
      });
      setEditingItem(null);
      setIsAddModalOpen(false);
      fetchMenu();
    } catch (err) {
      console.error('Failed to update item:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await foodService.deleteFoodItem(id);
        fetchMenu();
      } catch (err) {
        console.error('Failed to delete item:', err);
      }
    }
  };

  const toggleItemStatus = async (item) => {
    try {
      await foodService.toggleAvailability(item.id, !item.isAvailable);
      fetchMenu();
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  // Filter
  const filteredItems = sortByEnglishName(allItems.filter(item => 
    [item.name, item.nameAr]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(searchQuery.toLowerCase()))
  ));

  // Derived stats
  const statsTotal = allItems.length;
  const statsAvailable = allItems.filter(i => i.isAvailable).length;
  const statsOutOfStock = allItems.filter(i => !i.isAvailable).length;

  const totalItems = filteredItems.length;
  const isArabic = language === 'ar';
  const getItemName = (item) => (isArabic && item.nameAr ? item.nameAr : item.name);
  const getItemDescription = (item) => (isArabic && item.descriptionAr ? item.descriptionAr : item.description);
  const getItemCategory = (item) => {
    return isArabic && item.sectionNameAr ? item.sectionNameAr : item.sectionName;
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col h-full min-h-[calc(100vh-76px)] animate-fade-in space-y-6 sm:space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-0 w-full">
        <h1 className="-mt-1 text-2xl sm:text-3xl font-bold text-gray-800">{translate(language, 'menu.managerTitle')}</h1>
        <div className="flex items-start gap-3 w-full sm:w-auto">
          <button 
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-orange-200 text-orange-600 font-semibold hover:bg-orange-50 transition-colors w-full sm:w-[170px]"
          >
            <Download className="w-4 h-4" />
            {translate(language, 'menu.importExcel')}
          </button>
          <div className="flex flex-col gap-2 flex-1 sm:flex-none sm:min-w-[170px]">
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 text-white font-semibold shadow-md shadow-orange-500/20 hover:bg-orange-600 active:scale-95 transition-all"
            >
              <Plus className="w-5 h-5 -ml-1" />
              {translate(language, 'menu.addItem')}
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative w-full max-w-3xl mx-auto">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-orange-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-11 pr-4 py-3.5 bg-[#fbfbf9] border-none rounded-2xl text-gray-700 placeholder-gray-400 shadow-sm shadow-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-shadow text-base"
          placeholder={translate(language, 'menu.search')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto w-full">
        <div className="bg-white rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center shadow-sm border border-gray-100 transform hover:-translate-y-1 transition-transform">
          <span className="text-3xl font-extrabold text-orange-500">{statsTotal}</span>
          <span className="text-xs sm:text-sm text-gray-400 font-medium mt-1 text-center">{translate(language, 'menu.totalItems')}</span>
        </div>
        <div className="bg-white rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center shadow-sm border border-gray-100 transform hover:-translate-y-1 transition-transform">
          <span className="text-3xl font-extrabold text-green-500">{statsAvailable}</span>
          <span className="text-xs sm:text-sm text-gray-400 font-medium mt-1 text-center">{translate(language, 'menu.availableItems')}</span>
        </div>
        <div className="bg-white rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center shadow-sm border border-gray-100 transform hover:-translate-y-1 transition-transform">
          <span className="text-3xl font-extrabold text-red-500">{statsOutOfStock}</span>
          <span className="text-xs sm:text-sm text-gray-400 font-medium mt-1 text-center">{translate(language, 'menu.outOfStockItems')}</span>
        </div>
      </div>

      {/* Menu Items Area */}
      <div className="w-full flex-1 mt-4">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 w-full animate-fade-in pb-8">
            {filteredItems.map((item) => (
              <div 
                key={item.id} 
                dir={isArabic ? 'rtl' : 'ltr'}
                className="w-full md:w-[calc(50%-12px)] bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 hover:shadow-md transition-shadow relative group"
              >
                
                {/* Image */}
                <div className="w-full sm:w-48 h-40 sm:h-auto sm:aspect-square flex-shrink-0 rounded-2xl overflow-hidden shadow-sm">
                  <img
                    src={item.imageUrl || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=200&h=200&fit=crop'}
                    alt={getItemName(item)}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col min-w-0 pr-0 sm:pr-8">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 truncate">
                    {getItemName(item)}
                  </h3>
                  
                  <div className="inline-block px-3 py-1 bg-orange-50 border border-orange-200 text-orange-600 font-bold text-sm rounded-lg w-max mb-3 shadow-sm">
                    EGP {item.price}
                  </div>
                  
                  <p className="text-sm text-gray-500 line-clamp-2 sm:line-clamp-3 mb-3">
                    {getItemDescription(item) || translate(language, 'menu.noDescription')}
                  </p>

                  <div className="hidden sm:inline-flex px-3 py-1 bg-orange-50/50 text-orange-500 font-medium text-xs rounded-lg w-max mb-3">
                    {capitalize(getItemCategory(item) || translate(language, 'menu.uncategorized'))}
                  </div>

                  <button 
                    onClick={() => toggleItemStatus(item)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 font-semibold text-xs rounded-full w-max mt-auto transition-colors cursor-pointer outline-none ${
                      item.isAvailable 
                        ? 'bg-green-50 border border-green-200 text-green-600 hover:bg-green-100' 
                        : 'bg-red-50 border border-red-200 text-red-600 hover:bg-red-100'
                    }`}
                  >
                    {item.isAvailable ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    {item.isAvailable ? translate(language, 'menu.availableStatus') : translate(language, 'menu.outOfStockStatus')}
                  </button>
                </div>

                {/* Actions */}
                <div className={`absolute top-4 ${isArabic ? 'left-4' : 'right-4'} sm:bottom-4 flex sm:flex-col justify-end sm:justify-between items-center w-auto sm:w-8 gap-2 bg-white/80 sm:bg-transparent backdrop-blur-sm sm:backdrop-blur-none p-1 sm:p-0 rounded-lg sm:opacity-60 lg:opacity-0 group-hover:opacity-100 transition-opacity z-10`}>
                  <button onClick={() => handleEditClick(item)} className="p-1.5 text-orange-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors" title="Edit item">
                    <PenSquare className="w-5 h-5 fill-current" />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete item">
                    <Trash2 className="w-5 h-5 fill-current" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            {translate(language, 'menu.noItemsFound')}
          </div>
        )}
      </div>

      {/* Modals */}
      <AddItemModal 
        isOpen={isAddModalOpen} 
        onClose={() => { setIsAddModalOpen(false); setEditingItem(null); }} 
        onAddItem={handleAddItem} 
        onEditItem={handleSaveEdit} 
        initialData={editingItem} 
      />
      <ImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} onImport={() => {}} />
    </div>
  );
}

