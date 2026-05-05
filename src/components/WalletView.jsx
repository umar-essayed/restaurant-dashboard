import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useRestaurant } from '../contexts/RestaurantContext';
import walletService from '../services/wallet.service';
import { 
  Wallet, 
  Plus, 
  History, 
  CreditCard, 
  X, 
  ChevronDown,
  Landmark,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  ShieldCheck,
  MoreVertical
} from 'lucide-react';

export default function WalletView() {
  const { language } = useLanguage();
  const { selectedRestaurant } = useRestaurant();
  const isArabic = language === 'ar';

  const [showModal, setShowModal] = useState(false);
  const [confirmPhone, setConfirmPhone] = useState("");
  const [method, setMethod] = useState("InstaPay");
  const [phone, setPhone] = useState("");
  const [dropdown, setDropdown] = useState(false);
  const [summary, setSummary] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutLoading, setPayoutLoading] = useState(false);

  useEffect(() => {
    fetchWalletData();
  }, [selectedRestaurant]);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const [summaryData, ledgerData] = await Promise.all([
        walletService.getSummary(),
        walletService.getLedger()
      ]);
      setSummary(summaryData);
      setLedger(ledgerData.data);
    } catch (error) {
      console.error('Failed to fetch wallet data', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayout = async (e) => {
    e.preventDefault();
    if (!payoutAmount || parseFloat(payoutAmount) <= 0) return;
    if (phone !== confirmPhone) {
      alert(isArabic ? 'أرقام الحساب غير متطابقة' : 'Account numbers do not match');
      return;
    }
    
    try {
      setPayoutLoading(true);
      const idempotencyKey = `payout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const mfaToken = "development-mfa-token"; 
      
      const payoutData = {
        amount: parseFloat(payoutAmount),
        payoutMethod: method.toUpperCase().replace(' ', '_'), // e.g. INSTAPAY, VODAFONE_CASH
        accountNumber: phone,
        confirmAccountNumber: confirmPhone
      };

      await walletService.requestPayout(payoutData, idempotencyKey, mfaToken);
      alert(isArabic ? 'تم تقديم طلب السحب بنجاح وهو قيد المراجعة الآن' : 'Payout request submitted successfully and is now under review');
      setShowModal(false);
      setPayoutAmount("");
      setPhone("");
      setConfirmPhone("");
      fetchWalletData();
    } catch (error) {
      alert(error.response?.data?.message || 'Payout failed');
    } finally {
      setPayoutLoading(false);
    }
  };

  const methods = [
    { id: 'InstaPay', label: isArabic ? 'إنستاباي' : 'InstaPay', icon: Smartphone },
    { id: 'Vodafone Cash', label: isArabic ? 'فودافون كاش' : 'Vodafone Cash', icon: Smartphone },
    { id: 'Bank Transfer', label: isArabic ? 'تحويل بنكي' : 'Bank Transfer', icon: Landmark }
  ];

  const t = {
    title: isArabic ? 'المحفظة' : 'Wallet',
    desc: isArabic ? 'إدارة أرباحك وحسابات السحب الخاصة بك.' : 'Manage your earnings and payout accounts.',
    availableBalance: isArabic ? 'الرصيد المتاح' : 'Available Balance',
    pendingBalance: isArabic ? 'رصيد معلق' : 'Pending Balance',
    totalEarnings: isArabic ? 'إجمالي الأرباح' : 'Total Earnings',
    currency: isArabic ? 'ج.م' : 'EGP',
    requestPayout: isArabic ? 'طلب سحب' : 'Request Payout',
    history: isArabic ? 'سجل المعاملات' : 'Transaction History',
    noTransactions: isArabic ? 'لا توجد معاملات حتى الآن' : 'No transactions yet',
    payoutInfo: isArabic ? 'بيانات السحب' : 'Payout Info',
    accountNumber: isArabic ? 'رقم الهاتف / الحساب' : 'Phone / Account number',
    confirmAccountNumber: isArabic ? 'تأكيد رقم الهاتف / الحساب' : 'Confirm Phone / Account number',
    amount: isArabic ? 'المبلغ' : 'Amount',
    cancel: isArabic ? 'إلغاء' : 'Cancel',
    confirm: isArabic ? 'تأكيد السحب' : 'Confirm Payout',
    selectMethod: isArabic ? 'طريقة السحب' : 'Payout Method',
    status: {
      completed: isArabic ? 'مكتمل' : 'Completed',
      pending: isArabic ? 'قيد الانتظار' : 'Pending',
      failed: isArabic ? 'فشل' : 'Failed'
    },
    types: {
      EARNING: isArabic ? 'أرباح' : 'Earning',
      PAYOUT: isArabic ? 'سحب' : 'Payout',
      REFUND: isArabic ? 'استرداد' : 'Refund',
      FEE: isArabic ? 'رسوم' : 'Fee'
    }
  };

  const activeMethodLabel = methods.find(m => m.id === method)?.label || method;

  return (
    <div dir={isArabic ? 'rtl' : 'ltr'} className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col h-full min-h-[calc(100vh-76px)] animate-fade-in space-y-6 pb-20">
      
      {/* Header Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-[32px] p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          <div className="flex-1">
             <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10">
                   <Wallet className="w-6 h-6 text-orange-400" />
                </div>
                <h1 className="text-3xl font-black tracking-tight">{t.title}</h1>
             </div>
             
             <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-8 lg:gap-12">
                <div>
                   <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] mb-2">{t.availableBalance}</p>
                   <div className="flex items-baseline gap-2">
                     <span className="text-4xl sm:text-5xl font-black text-white">{summary?.availableBalance.toFixed(2) || "0.00"}</span>
                     <span className="text-orange-400 font-bold">{t.currency}</span>
                   </div>
                </div>
                <div>
                   <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] mb-2">{t.pendingBalance}</p>
                   <div className="flex items-baseline gap-2">
                     <span className="text-2xl sm:text-3xl font-black text-slate-300">{summary?.pendingBalance.toFixed(2) || "0.00"}</span>
                     <span className="text-slate-500 font-bold">{t.currency}</span>
                   </div>
                </div>
             </div>
          </div>

          <div className="w-full lg:w-auto flex flex-col gap-4">
             <button 
               onClick={() => setShowModal(true)}
               className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-orange-900/20 transition-all flex items-center justify-center gap-3 group"
             >
               <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
               {t.requestPayout}
             </button>
             <div className="bg-white/5 backdrop-blur-sm border border-white/5 rounded-2xl p-4 flex items-center justify-between gap-6">
                <div>
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">{t.totalEarnings}</p>
                   <p className="text-lg font-black text-white">{summary?.totalEarnings.toFixed(2) || "0.00"} <span className="text-[10px] text-slate-400">{t.currency}</span></p>
                </div>
                <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                   <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Transaction History */}
        <div className="xl:col-span-2 bg-white rounded-[28px] border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                 <History className="w-5 h-5 text-slate-400" />
              </div>
              <h3 className="text-lg font-black text-slate-800">{t.history}</h3>
            </div>
          </div>

          {loading ? (
             <div className="flex-1 flex items-center justify-center py-20">
               <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
             </div>
          ) : ledger.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 opacity-60">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                 <AlertCircle className="w-10 h-10 text-gray-200" />
              </div>
              <p className="text-gray-500 font-bold text-lg">{t.noTransactions}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right" dir={isArabic ? 'rtl' : 'ltr'}>
                <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50">
                  <tr>
                    <th className="px-6 py-4 font-bold">{isArabic ? 'المعاملة' : 'Transaction'}</th>
                    <th className="px-6 py-4 font-bold">{isArabic ? 'الحالة' : 'Status'}</th>
                    <th className="px-6 py-4 font-bold">{isArabic ? 'التاريخ' : 'Date'}</th>
                    <th className="px-6 py-4 font-bold">{isArabic ? 'المبلغ' : 'Amount'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {ledger.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                           <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${entry.amount > 0 ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                              {entry.type === 'EARNING' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                           </div>
                           <div>
                             <p className="font-bold text-slate-800">{entry.description || t.types[entry.type] || entry.type}</p>
                             <p className="text-[10px] text-gray-400 font-medium font-mono">#{entry.id.split('-')[0]}</p>
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                         <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 w-fit ${
                           entry.status.startsWith('completed') ? 'bg-green-100 text-green-700' : 
                           entry.status.startsWith('pending') ? 'bg-amber-100 text-amber-700' : 
                           'bg-red-100 text-red-700'
                         }`}>
                           {entry.status.startsWith('pending') ? <Clock className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                           {entry.status.split(':')[0] === 'pending' ? t.status.pending : (t.status[entry.status] || entry.status)}
                         </span>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-bold text-slate-500">{new Date(entry.createdAt).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US')}</p>
                        <p className="text-[10px] text-gray-400 font-medium">{new Date(entry.createdAt).toLocaleTimeString(isArabic ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`text-lg font-black ${entry.amount > 0 ? 'text-green-600' : 'text-slate-900'}`}>
                          {entry.amount > 0 ? '+' : ''}{entry.amount.toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info Cards */}
        <div className="space-y-6">
           {/* Security Banner */}
           <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                 <ShieldCheck className="w-24 h-24" />
              </div>
              <h4 className="text-xl font-black mb-2 flex items-center gap-2">
                 <ShieldCheck className="w-6 h-6 text-blue-200" />
                 {isArabic ? 'محفظة مؤمنة' : 'Secure Wallet'}
              </h4>
              <p className="text-blue-100 text-sm font-medium leading-relaxed opacity-90">
                 {isArabic 
                   ? 'يتم تشفير جميع معاملاتك وتأمينها باستخدام توقيعات رقمية لمنع التلاعب.' 
                   : 'All your transactions are encrypted and secured with digital signatures to prevent tampering.'}
              </p>
           </div>

           {/* Payout Methods */}
           <div className="bg-white rounded-[28px] border border-gray-100 p-6 shadow-sm">
              <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                 <Landmark className="w-5 h-5 text-gray-400" />
                 {t.payoutInfo}
              </h3>
              
              <div className="space-y-4">
                 {methods.map((m) => (
                    <button 
                      key={m.id}
                      onClick={() => setMethod(m.id)}
                      className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between group ${method === m.id ? 'border-orange-500 bg-orange-50/50' : 'border-gray-50 hover:border-gray-200 bg-white'}`}
                    >
                       <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${method === m.id ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                             <m.icon className="w-6 h-6" />
                          </div>
                          <div className="text-right">
                             <p className={`font-black text-sm ${method === m.id ? 'text-orange-900' : 'text-slate-700'}`}>{m.label}</p>
                             <p className="text-[10px] font-bold text-gray-400">{isArabic ? 'مفعل' : 'Active'}</p>
                          </div>
                       </div>
                       {method === m.id && <CheckCircle2 className="w-5 h-5 text-orange-500" />}
                    </button>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* Payout Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity"
            onClick={() => setShowModal(false)}
          />
          <div className="bg-white rounded-[40px] w-full max-w-md relative z-10 shadow-2xl overflow-hidden animate-scale-up">
            
            <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-2xl font-black text-slate-800">{t.requestPayout}</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handlePayout} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              
              <div>
                 <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">{t.selectMethod}</label>
                 <div className="relative">
                   <button
                     type="button"
                     onClick={() => setDropdown(!dropdown)}
                     className={`w-full px-5 py-4 bg-gray-50 border-2 ${dropdown ? 'border-orange-500' : 'border-gray-50'} rounded-2xl flex items-center justify-between text-slate-800 font-bold focus:outline-none transition-all`}
                   >
                     <div className="flex items-center gap-4">
                       <Smartphone className="w-5 h-5 text-orange-500" />
                       {activeMethodLabel}
                     </div>
                     <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${dropdown ? 'rotate-180 text-orange-500' : ''}`} />
                   </button>

                   {dropdown && (
                     <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-gray-100 rounded-3xl shadow-2xl overflow-hidden z-20 animate-fade-in py-2">
                       {methods.map((m) => (
                         <button
                           key={m.id}
                           type="button"
                           onClick={() => {
                             setMethod(m.id);
                             setDropdown(false);
                           }}
                           className={`w-full px-6 py-4 text-right flex items-center gap-4 hover:bg-orange-50 transition-colors ${method === m.id ? 'text-orange-600' : 'text-slate-700'}`}
                         >
                           <m.icon className={`w-5 h-5 ${method === m.id ? 'text-orange-500' : 'text-gray-400'}`} />
                           <span className="font-black text-sm">{m.label}</span>
                           {method === m.id && <CheckCircle2 className="w-4 h-4 text-orange-500 mr-auto" />}
                         </button>
                       ))}
                     </div>
                   )}
                 </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">{t.accountNumber}</label>
                <input
                  type="text"
                  required
                  placeholder={isArabic ? 'أدخل الرقم هنا' : 'Enter number here'}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-50 rounded-2xl focus:border-orange-500 outline-none transition-all text-slate-800 font-bold placeholder:text-gray-300"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">{t.confirmAccountNumber}</label>
                <input
                  type="text"
                  required
                  placeholder={isArabic ? 'أعد إدخال الرقم للتأكيد' : 'Re-enter number to confirm'}
                  value={confirmPhone}
                  onChange={(e) => setConfirmPhone(e.target.value)}
                  className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-50 rounded-2xl focus:border-orange-500 outline-none transition-all text-slate-800 font-bold placeholder:text-gray-300"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">{t.amount}</label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    max={summary?.availableBalance || 0}
                    placeholder="0.00"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-50 rounded-2xl focus:border-orange-500 outline-none transition-all text-slate-800 font-bold placeholder:text-gray-300"
                  />
                  <div className={`absolute ${isArabic ? 'left-5' : 'right-5'} top-1/2 -translate-y-1/2 font-black text-orange-500`}>
                    {t.currency}
                  </div>
                </div>
                <div className="mt-3 flex justify-between text-[10px] font-black uppercase tracking-widest">
                   <span className="text-gray-400">{isArabic ? 'الحد الأقصى للسحب' : 'Max Available'}</span>
                   <span className="text-slate-900">{summary?.availableBalance.toFixed(2)} {t.currency}</span>
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-4 text-gray-400 font-black rounded-2xl hover:bg-gray-100 transition-colors"
                >
                  {t.cancel}
                </button>
                <button 
                  type="submit"
                  disabled={!payoutAmount || !phone || !confirmPhone || payoutLoading}
                  className={`flex-[2] py-4 rounded-2xl font-black flex items-center justify-center transition-all shadow-xl ${(!payoutAmount || !phone || !confirmPhone || payoutLoading) ? 'bg-gray-100 text-gray-300 cursor-not-allowed shadow-none' : 'bg-orange-500 text-white shadow-orange-200 hover:bg-orange-600'}`}
                >
                  {payoutLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : t.confirm}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
