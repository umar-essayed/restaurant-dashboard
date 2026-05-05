import React, { useState, useRef } from 'react';
import { X, Table, Download, UploadCloud, ArrowDown } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useLanguage } from '../contexts/LanguageContext';
import { translate } from '../locales/translations';

const SECTIONS = [
  "American", "Arabic", "Arabic Sweets", "Asian", "Bakery & Pastry", 
  "Beverages", "Breakfast", "Burgers", "Cakes", "Chicken", "Chinese", 
  "Chocolate", "Coffee & Tea", "Crepes", "Desserts", "Donuts", "Egyptian", 
  "Fast Food", "Fish & Seafood", "Foul & Falafel", "Koshari", "Fried Chicken", 
  "Grills", "Healthy", "Ice Cream", "International", "Italian", "Japanese", 
  "Juices", "Lebanese", "Pasta", "Pies", "Pizza", "Salad", "Sandwiches", 
  "Shawerma", "Sushi", "Syrian", "Waffles"
];

const downloadTemplate = () => {
  const templateData = [
    {
      "Name (EN)": "Example Item",
      "Name (AR)": "مثال على العنصر",
      "Description (EN)": "English description here",
      "Description (AR)": "الوصف بالعربية هنا",
      "Price (EGP)": "150.00",
      "Discounted Price": "120.00",
      "Section": "Fast Food",
      "Available": "Yes",
      "Image URL": "https://example.com/image.jpg",
      "Stock": "100",
      "Warning Limit": "10"
    }
  ];

  const ws = XLSX.utils.json_to_sheet(templateData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Menu Items");
  XLSX.writeFile(wb, "menu_template.xlsx");
};

export default function ImportModal({ isOpen, onClose, onImport }) {
  const { language } = useLanguage();
  const [previewRows, setPreviewRows] = useState([]);
  const [uploadError, setUploadError] = useState('');
  const [previewLimit, setPreviewLimit] = useState(8);
  const previewContainerRef = useRef(null);

  const normalizeHeader = (value) =>
    String(value || '')
      .toLowerCase()
      .replace(/\*/g, '')
      .replace(/\s+/g, ' ')
      .trim();

  const normalizeAvailability = (value) => {
    const v = String(value || '').trim().toLowerCase();
    return v === 'yes' || v === 'true' || v === '1' ? 'Available' : 'Out of Stock';
  };

  const toPriceText = (value) => {
    if (value === null || value === undefined || value === '') return '0 EGP';
    const num = Number(value);
    if (!Number.isNaN(num)) return `${num} EGP`;
    return `${String(value).trim()} EGP`;
  };

  const getByAliases = (headers, row, aliases) => {
    for (const alias of aliases) {
      const idx = headers.indexOf(alias);
      if (idx >= 0) return row[idx];
    }
    return '';
  };

  const getHeaderIndexByAliases = (headers, aliases) => {
    for (const alias of aliases) {
      const idx = headers.indexOf(alias);
      if (idx >= 0) return idx;
    }
    return -1;
  };

  const normalizeImageUrl = (value) => {
    let raw = String(value || '').trim();
    if (!raw) return '';

    raw = raw.replace(/^<|>$/g, '').trim();
    if (raw.startsWith('//')) return `https:${raw}`;

    if (/^https?:\/\//i.test(raw) || raw.includes('drive.google.com') || raw.includes('dropbox.com') || raw.includes('youtu.be')) {
      if (raw.includes('drive.google.com')) {
        const idMatch = raw.match(/(?:file\/d\/|open\?id=|uc\?id=)([a-zA-Z0-9_-]+)/);
        if (idMatch?.[1]) return `https://drive.google.com/uc?export=view&id=${idMatch[1]}`;
      }

      const imageFnMatch = raw.match(/IMAGE\((?:"|')([^"']+)(?:"|')/i);
      if (imageFnMatch?.[1]) return encodeURI(imageFnMatch[1]);

      if (raw.includes('dropbox.com')) {
        return raw.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('?dl=0', '').replace('&dl=0', '');
      }

      return encodeURI(raw);
    }

    return '';
  };

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        setUploadError('');
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
          defval: '',
          blankrows: false,
        });

        const requiredHeaderKeys = ['name (en)', 'description (en)', 'price (egp)'];

        const headerRowIndex = rows.findIndex((row) => {
          const normalized = row.map(normalizeHeader);
          return requiredHeaderKeys.every((key) => normalized.includes(key));
        });

        if (headerRowIndex === -1) {
          setPreviewRows([]);
          setUploadError(language === 'ar' ? 'تعذر العثور على صف عناوين صالح. استخدم أعمدة النموذج.' : 'Could not find a valid header row. Please use the template columns.');
          return;
        }

        const headers = rows[headerRowIndex].map(normalizeHeader);
        const dataRows = rows.slice(headerRowIndex + 1).filter((row) =>
          row.some((cell) => String(cell || '').trim() !== '')
        );

        const mappedRows = dataRows.map((row, dataRowOffset) => {
          const nameEn = getByAliases(headers, row, ['name (en)', 'name en', 'name']);
          const nameAr = getByAliases(headers, row, ['name (ar)', 'name ar']);
          const descriptionEn = getByAliases(headers, row, ['description (en)', 'description en', 'description']);
          const descriptionAr = getByAliases(headers, row, ['description (ar)', 'description ar']);
          const price = getByAliases(headers, row, ['price (egp)', 'price egp', 'price']);
          const discountedPrice = getByAliases(headers, row, ['discounted price', 'sale price', 'discount price']);
          const section = getByAliases(headers, row, ['section', 'category', 'menu section']);
          const available = getByAliases(headers, row, ['available', 'availability', 'in stock']);
          const imageAliases = ['image url', 'image', 'image link', 'image-url', 'img url'];
          const imageColIdx = getHeaderIndexByAliases(headers, imageAliases);
          const sheetRowIdx = headerRowIndex + 1 + dataRowOffset;
          const imageCellAddress = imageColIdx >= 0 ? XLSX.utils.encode_cell({ r: sheetRowIdx, c: imageColIdx }) : '';
          const imageCell = imageCellAddress ? sheet[imageCellAddress] : null;
          // Attempt to extract hyperlink from cell object (explicit hyperlink or HYPERLINK formula)
          let imageHyperlink = '';
          if (imageCell) {
            imageHyperlink = imageCell.l?.Target || '';
            if (!imageHyperlink && typeof imageCell.f === 'string') {
              // Extract URL from HYPERLINK formulas like =HYPERLINK("url","text")
              const m = imageCell.f.match(/HYPERLINK\((?:"|')([^"']+)(?:"|')/i);
              if (m && m[1]) imageHyperlink = m[1];
            }
          }
          const imageUrl = getByAliases(headers, row, imageAliases) || imageHyperlink;
          const rawImageCellInfo = imageCell ? { v: imageCell.v, f: imageCell.f, l: imageCell.l } : '';
          const stock = getByAliases(headers, row, ['stock', 'qty', 'quantity']);
          const warningLimit = getByAliases(headers, row, ['warning limit', 'warning', 'low stock limit']);

          return {
            'Name (EN)': String(nameEn).trim(),
            'Name (AR)': String(nameAr).trim(),
            'Description (EN)': String(descriptionEn).trim(),
            'Description (AR)': String(descriptionAr).trim(),
            'Price (EGP)': price,
            'Discounted Price': discountedPrice,
            Section: String(section).trim(),
            Available: available,
            'Image URL': normalizeImageUrl(imageUrl),
            'Raw Image Cell': rawImageCellInfo,
            'Image URL Resolved': normalizeImageUrl(imageUrl),
            Stock: stock,
            'Warning Limit': warningLimit,
          };
        });

        // If none of the rows resolved to an image URL, show a non-blocking warning
        const anyResolved = mappedRows.some(r => r['Image URL']);
        if (!anyResolved) {
          setUploadError(language === 'ar' ? 'لم يتم العثور على روابط صور — قد تحتوي الخلايا على صور مضمنة أو قيم ليست روابط. أضف مثالًا إذا لزم الأمر.' : 'No image URLs were resolved — the sheet cells may contain embedded images or non-URL values. Paste a sample cell here if unsure.');
        } else {
          setUploadError('');
        }

        // Keep all parsed rows (do not limit to 50). The preview table renders only the first 6 rows,
        // but import will include all parsed rows.
        setPreviewRows(mappedRows);
      } catch (error) {
        setPreviewRows([]);
        setUploadError(language === 'ar' ? 'فشل قراءة ملف Excel. تحقق من التنسيق وحاول مرة أخرى.' : 'Failed to read this Excel file. Please check format and try again.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImport = () => {
    if (previewRows.length === 0) return;
    // Call parent callback with imported items
    const items = previewRows.map((r, idx) => ({
      id: Math.random() * 10000 + idx, // Temporary ID
      name: r["Name (EN)"] || r.Name || 'Unnamed',
      nameAr: r["Name (AR)"] || '',
      description: r["Description (EN)"] || r.Description || '',
      descriptionAr: r["Description (AR)"] || '',
      price: toPriceText(r["Price (EGP)"]),
      discountedPrice: r["Discounted Price"] !== '' && r["Discounted Price"] !== null && r["Discounted Price"] !== undefined ? toPriceText(r["Discounted Price"]) : '',
      category: r.Section || 'Uncategorized',
      status: normalizeAvailability(r.Available),
      image: r["Image URL"] || '',
      stock: r.Stock || '0',
      warningLimit: r["Warning Limit"] || '5'
    }));
    onImport(items);
    setPreviewRows([]);
    setUploadError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl mt-16 sm:mt-20 bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[calc(100vh-120px)] animate-fade-in fade-in-up">
        
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-50 rounded-xl">
              <Table className="w-5 h-5 text-orange-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">{language === 'ar' ? 'استيراد جماعي من Excel' : 'Bulk Import from Excel'}</h2>
          </div>

          {/* header right area intentionally minimal */}
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-1.5 rounded-full transition-colors focus:outline-none"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto w-full custom-scrollbar space-y-6">
          {/* Preview placed in body for better layout */}
          {previewRows.length > 0 && (
            <div className="space-y-3 w-full">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-50 rounded-xl">
                  <Table className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-800">{language === 'ar' ? 'معاينة الاستيراد الجماعي' : 'Bulk Import Preview'}</div>
                  <div className="text-xs text-gray-400">{language === 'ar' ? 'اسحب الملف هنا واعرض المعاينة' : 'Drop your file below and preview the sheet'}</div>
                </div>
              </div>

              <div>
                <div className="flex items-baseline justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-600">{language === 'ar' ? 'معاينة' : 'Preview'} ({previewRows.length} {language === 'ar' ? 'صف' : 'rows'})</h3>
                  <p className="text-xs text-gray-400">{language === 'ar' ? `عرض أول ${Math.min(previewLimit, previewRows.length)} صف — وسيشمل الاستيراد كل ${previewRows.length} صف` : `Showing first ${Math.min(previewLimit, previewRows.length)} rows — import will include all ${previewRows.length} rows`}</p>
                </div>

                <div className="overflow-x-auto bg-white rounded-lg border border-gray-100">
                  <div ref={previewContainerRef} className="max-h-72 overflow-y-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          {Object.keys(previewRows[0]).map((h) => (
                            <th key={h} className="px-3 py-2 text-left text-xs text-gray-500 whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewRows.slice(0, previewLimit).map((row, i) => (
                          <tr key={i} className="border-t odd:bg-white even:bg-gray-50">
                            {Object.keys(previewRows[0]).map((h) => {
                              const cell = row[h] ?? '';
                              const normalizedH = String(h).toLowerCase();
                              const isImageCol = normalizedH.includes('image');
                              if (isImageCol && String(cell).startsWith('http')) {
                                return (
                                  <td key={h} className="px-3 py-2 text-gray-700 align-middle">
                                    <img src={cell} alt="preview" className="w-24 h-14 object-cover rounded-md border" onError={(e)=>{
                                      const orig = e.currentTarget.getAttribute('src') || '';
                                      const ibbMatch = orig.match(/^https?:\/\/ibb\.co\/(?:.+)$/i);
                                      if (ibbMatch && e.currentTarget.dataset.tried !== 'jpg') {
                                        const id = orig.split('/').pop();
                                        e.currentTarget.dataset.tried = 'jpg';
                                        e.currentTarget.src = `https://i.ibb.co/${id}.jpg`;
                                        return;
                                      }
                                      if (ibbMatch && e.currentTarget.dataset.tried === 'jpg') {
                                        const id = orig.split('/').pop();
                                        e.currentTarget.dataset.tried = 'png';
                                        e.currentTarget.src = `https://i.ibb.co/${id}.png`;
                                        return;
                                      }
                                      e.currentTarget.onerror=null; e.currentTarget.src='https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=200&h=200&fit=crop';
                                    }} />
                                  </td>
                                );
                              }
                              return (
                                <td key={h} className="px-3 py-2 text-gray-700 whitespace-nowrap align-middle">{String(cell)}</td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {previewLimit < previewRows.length && (
                  <div className="flex justify-center mt-2">
                    <button onClick={() => setPreviewLimit((p) => Math.min(previewRows.length, p + 50))} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
                      <ArrowDown className="w-4 h-4 text-gray-600" />
                      Show more rows
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          {uploadError && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
              {uploadError}
            </div>
          )}
          
          {/* Instructions */}
          <div className="bg-[#fff9f0] border border-orange-100 rounded-2xl p-5 text-sm text-gray-700 space-y-3 shadow-inner">
            <p>{language === 'ar' ? '1. حمّل ملف النموذج من الأسفل.' : '1. Download the template Excel file below.'}</p>
            <p>{language === 'ar' ? '2. املأ العناصر — عمودا القسم والمتاح يحتويان على قوائم اختيار.' : '2. Fill in your items — Section and Available columns have dropdowns.'}</p>
            <p>{language === 'ar' ? '3. ارفع الملف بعد الانتهاء وعاين البيانات قبل الاستيراد.' : '3. Upload the filled file and preview before importing.'}</p>
            <p>{language === 'ar' ? '4. يمكنك إضافة صور العناصر بعد الاستيراد من زر التعديل لكل عنصر.' : '4. Add item images after import using the edit button on each item.'}</p>
          </div>

          {/* Sections List */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-600">{language === 'ar' ? 'الأقسام الخاصة بالمطعم' : 'Sections for Restaurant'}</h3>
            <div className="flex flex-wrap gap-2">
              {SECTIONS.map((section) => (
                <div 
                  key={section} 
                  className="px-3 py-1.5 bg-[#fffdfa] border border-orange-200 text-gray-600 rounded-xl text-sm whitespace-nowrap shadow-sm"
                >
                  {section}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-white border-t border-gray-100 px-6 py-5 flex flex-col gap-3 z-10 shrink-0">
          <button 
            onClick={downloadTemplate}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 border-2 border-orange-500 text-orange-600 font-bold rounded-xl hover:bg-orange-50 active:scale-[0.98] transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1"
          >
            <Download className="w-5 h-5" />
            Download Template
          </button>
          <div className="flex gap-2">
            <label className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#e85d04] text-white font-bold rounded-xl shadow-md shadow-orange-500/20 hover:bg-[#d05303] active:scale-[0.98] transition-all cursor-pointer">
              <UploadCloud className="w-5 h-5" />
              <span>Upload Excel File (.xlsx)</span>
              <input type="file" accept=".xls,.xlsx" onChange={handleUpload} className="hidden" />
            </label>
            <button onClick={handleImport} disabled={previewRows.length===0} className="w-40 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 disabled:opacity-50">
              Import
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
