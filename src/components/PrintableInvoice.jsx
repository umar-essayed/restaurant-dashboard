import React from 'react';

export default function PrintableInvoice({ order, restaurant, isArabic }) {
  if (!order || !restaurant) return null;

  return (
    <div id="printable-invoice" className="hidden print:block bg-white text-black" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* 
        Ultra-Modern Thermal Receipt Design
        Optimized for 58mm - 80mm
      */}
      <div className="max-w-[73mm] mx-auto p-0 font-mono text-black">
        
        {/* Top Spacer / Cut Line */}
        <div className="text-center py-2 text-[8px] opacity-20 select-none">
          - - - - - - - - - - - - - - - - - - - - - - -
        </div>

        {/* Brand Header */}
        <div className="text-center mb-6 pt-4">
          {restaurant.logoUrl && (
            <div className="mb-2">
              <img 
                src={restaurant.logoUrl} 
                alt="Logo" 
                className="w-14 h-14 mx-auto object-contain grayscale contrast-150" 
              />
            </div>
          )}
          <h1 className="text-lg font-black tracking-tighter uppercase leading-none">{restaurant.name}</h1>
          <div className="mt-1 flex items-center justify-center gap-1">
            <span className="h-px bg-black w-4"></span>
            <span className="text-[10px] font-black uppercase tracking-widest">
              {isArabic ? 'فاتورة ضريبية' : 'OFFICIAL INVOICE'}
            </span>
            <span className="h-px bg-black w-4"></span>
          </div>
        </div>

        {/* Order Identifier - Bold & Big */}
        <div className="text-center mb-6 border-y-2 border-black py-2">
          <p className="text-[10px] font-bold opacity-70 mb-0.5">{isArabic ? 'رقم الطلب' : 'ORDER NUMBER'}</p>
          <p className="text-xl font-black tracking-tighter">#{order.id.split('-')[0].toUpperCase()}</p>
        </div>

        {/* Transaction Info */}
        <div className="mb-6 space-y-1 px-1">
          <div className="flex justify-between text-[10px]">
            <span className="font-bold opacity-60">{isArabic ? 'التاريخ:' : 'DATE:'}</span>
            <span className="font-black">{new Date(order.createdAt).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US')}</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="font-bold opacity-60">{isArabic ? 'الوقت:' : 'TIME:'}</span>
            <span className="font-black">{new Date(order.createdAt).toLocaleTimeString(isArabic ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="font-bold opacity-60">{isArabic ? 'طريقة الدفع:' : 'PAYMENT:'}</span>
            <span className="font-black">{isArabic ? 'نقداً' : 'CASH'}</span>
          </div>
        </div>

        {/* Customer Detail Card */}
        <div className="mb-6 bg-black text-white p-2 rounded-sm">
          <div className="border border-white/30 p-2 border-dashed">
            <p className="text-[9px] font-black opacity-70 mb-1 uppercase tracking-widest">{isArabic ? 'العميل' : 'CUSTOMER'}</p>
            <p className="text-sm font-black mb-1">{order.customer?.name || 'Valued Customer'}</p>
            <p className="text-[10px] font-bold mb-2">{order.customer?.phoneNumber || ''}</p>
            <div className="h-px bg-white/30 mb-2"></div>
            <p className="text-[9px] font-black opacity-70 mb-1 uppercase tracking-widest">{isArabic ? 'العنوان' : 'ADDRESS'}</p>
            <p className="text-[10px] font-black leading-tight break-words" dir="auto" style={{ unicodeBidi: 'plaintext' }}>{order.deliveryAddress}</p>
          </div>
        </div>

        {/* Items Grid */}
        <div className="mb-6 px-1">
          <div className="flex justify-between text-[10px] font-black border-b-2 border-black pb-1 mb-2 uppercase">
            <span>{isArabic ? 'الصنف' : 'ITEM DESCRIPTION'}</span>
            <span>{isArabic ? 'السعر' : 'PRICE'}</span>
          </div>
          <div className="space-y-3">
            {order.items?.map((item, idx) => (
              <div key={idx} className="group">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <p className="text-xs font-black leading-none mb-1" dir="auto" style={{ unicodeBidi: 'plaintext' }}>
                      <span dir="ltr" className="bg-black text-white px-1 mr-1">{item.quantity}</span>
                      {isArabic ? (item.foodItem?.nameAr || item.foodItem?.name) : item.foodItem?.name}
                    </p>
                    {item.notes && (
                      <p className="text-[9px] font-bold opacity-60 mt-1 italic">» {item.notes}</p>
                    )}
                  </div>
                  <div className="text-right font-black text-xs">
                    {(item.quantity * item.unitPrice).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Table */}
        <div className="mb-8 px-1">
          <div className="border-t border-black pt-2 space-y-1.5">
            <div className="flex justify-between text-[10px] font-bold">
              <span>{isArabic ? 'المجموع:' : 'SUBTOTAL:'}</span>
              <span>{order.subtotal?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[10px] font-bold">
              <span>{isArabic ? 'رسوم التوصيل:' : 'DELIVERY FEE:'}</span>
              <span>{order.deliveryFee?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-black border-t-2 border-black pt-2 mt-2">
              <span>{isArabic ? 'الإجمالي:' : 'TOTAL:'}</span>
              <span className="tracking-tighter">EGP {order.total?.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* QR Placeholder / Branding */}
        <div className="text-center mb-8">
           <div className="w-20 h-20 border-2 border-black mx-auto mb-2 flex items-center justify-center p-1">
              <div className="w-full h-full border border-dashed border-black/30 flex items-center justify-center">
                 <span className="text-[8px] font-black rotate-45 opacity-20 uppercase tracking-widest">Z-SPEED</span>
              </div>
           </div>
           <p className="text-[9px] font-black tracking-[0.2em] opacity-40">VERIFIED ORDER</p>
        </div>

        {/* Final Footer */}
        <div className="text-center pb-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="h-px bg-black/10 flex-1"></span>
            <span className="text-[10px] font-black uppercase tracking-widest px-2">Thank You</span>
            <span className="h-px bg-black/10 flex-1"></span>
          </div>
          <p className="text-[8px] font-bold opacity-60 leading-tight">
            {isArabic ? 'شكراً لثقتكم في ' : 'We appreciate your business at '} {restaurant.name}
          </p>
          <p className="text-[7px] mt-4 opacity-30">PRINTED BY Z-SPEED ENGINE</p>
        </div>

        {/* Bottom Cut Line */}
        <div className="text-center py-2 text-[8px] opacity-20 select-none">
          - - - - - - - - - - - - - - - - - - - - - - -
        </div>

      </div>

      <style>{`
        @media print {
          @page {
            margin: 0;
            size: 80mm auto;
          }
          body * {
            visibility: hidden;
          }
          #printable-invoice, #printable-invoice * {
            visibility: visible;
          }
          #printable-invoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0;
            margin: 0;
            display: block !important;
            background: white !important;
          }
          /* Custom overrides for thermal high contrast */
          .bg-black { background-color: black !important; -webkit-print-color-adjust: exact; }
          .text-white { color: white !important; }
          img { filter: grayscale(100%) contrast(150%) brightness(110%); }
          * {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            font-family: 'Courier New', Courier, monospace;
            unicode-bidi: plaintext;
          }
        }
      `}</style>
    </div>
  );
}
