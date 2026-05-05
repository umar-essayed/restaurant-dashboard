import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useRestaurant } from '../contexts/RestaurantContext';
import reviewService from '../services/review.service';
import { 
  Star, 
  MessageSquare, 
  User, 
  Reply, 
  X, 
  Send,
  Calendar,
  Filter,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function ReviewsView() {
  const { language } = useLanguage();
  const { selectedRestaurant } = useRestaurant();
  const isArabic = language === 'ar';

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [stats, setStats] = useState({
    avgRating: 0,
    totalReviews: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });

  useEffect(() => {
    if (selectedRestaurant?.id) {
      fetchReviews();
    }
  }, [selectedRestaurant]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await reviewService.getRestaurantReviews(selectedRestaurant.id);
      setReviews(data.data);
      
      // Calculate stats
      const total = data.total;
      const avg = data.data.reduce((sum, r) => sum + r.restaurantRating, 0) / (data.data.length || 1);
      const dist = data.data.reduce((acc, r) => {
        const rating = Math.floor(r.restaurantRating);
        acc[rating] = (acc[rating] || 0) + 1;
        return acc;
      }, { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });

      setStats({
        avgRating: selectedRestaurant.rating || avg,
        totalReviews: total,
        distribution: dist
      });
    } catch (error) {
      console.error('Failed to fetch reviews', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    try {
      await reviewService.replyToReview(replyingTo.id, replyText);
      setReplyingTo(null);
      setReplyText("");
      fetchReviews();
    } catch (error) {
      console.error('Failed to reply', error);
    }
  };

  const t = {
    title: isArabic ? 'التقييمات والمراجعات' : 'Reviews & Ratings',
    desc: isArabic ? 'ماذا يقول العملاء عن مطعمك.' : 'What customers are saying about your restaurant.',
    average: isArabic ? 'المعدل العام' : 'Average Rating',
    total: isArabic ? 'إجمالي التقييمات' : 'Total Reviews',
    reply: isArabic ? 'رد' : 'Reply',
    cancel: isArabic ? 'إلغاء' : 'Cancel',
    send: isArabic ? 'إرسال الرد' : 'Send Reply',
    yourReply: isArabic ? 'ردك' : 'Your Reply',
    noReviews: isArabic ? 'لا توجد تقييمات بعد' : 'No reviews yet',
    customer: isArabic ? 'عميل' : 'Customer',
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star 
            key={s} 
            className={`w-4 h-4 ${s <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} 
          />
        ))}
      </div>
    );
  };

  return (
    <div dir={isArabic ? 'rtl' : 'ltr'} className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col h-full min-h-[calc(100vh-76px)] animate-fade-in space-y-8 pb-20">
      
      {/* Header & Stats */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-8 items-center">
          <div className="flex-1 text-center lg:text-right w-full">
            <h1 className="text-3xl font-black text-slate-800 mb-2">{t.title}</h1>
            <p className="text-gray-500 font-medium">{t.desc}</p>
            
            <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-4 sm:gap-8">
              <div className="text-center">
                <div className="text-5xl font-black text-slate-900 flex items-center justify-center gap-2">
                  {stats.avgRating.toFixed(1)}
                  <Star className="w-8 h-8 fill-yellow-400 text-yellow-400" />
                </div>
                <p className="text-sm font-bold text-gray-400 mt-2 uppercase tracking-widest">{t.average}</p>
              </div>
              <div className="w-px h-16 bg-gray-100 hidden sm:block"></div>
              <div className="text-center">
                <div className="text-5xl font-black text-slate-900">
                  {stats.totalReviews}
                </div>
                <p className="text-sm font-bold text-gray-400 mt-2 uppercase tracking-widest">{t.total}</p>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-80 space-y-3">
            {[5, 4, 3, 2, 1].map((s) => (
              <div key={s} className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-600 w-3">{s}</span>
                <Star className="w-4 h-4 fill-gray-400 text-gray-400" />
                <div className="flex-1 h-2 bg-gray-50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-400 rounded-full" 
                    style={{ width: `${(stats.distribution[s] / (stats.totalReviews || 1)) * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs font-bold text-gray-400 w-8">{stats.distribution[s]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-12 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mb-4">
            <Star className="w-10 h-10 text-yellow-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">{t.noReviews}</h3>
          <p className="text-gray-500 max-w-sm">{t.desc}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center overflow-hidden shrink-0">
                    {review.customer?.profileImage ? (
                      <img src={review.customer.profileImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800">{review.customer?.name || t.customer}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      {renderStars(review.restaurantRating)}
                      <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(review.createdAt).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US')}
                      </span>
                    </div>
                  </div>
                </div>
                
                {!review.vendorReply && !replyingTo && (
                  <button 
                    onClick={() => setReplyingTo(review)}
                    className="flex items-center gap-2 text-purple-600 font-bold hover:bg-purple-50 px-4 py-2 rounded-xl transition-colors"
                  >
                    <Reply className="w-4 h-4" />
                    {t.reply}
                  </button>
                )}
              </div>

              {review.comment && (
                <div className="bg-gray-50/50 rounded-2xl p-4 sm:p-6 mb-6">
                  <p className="text-gray-700 leading-relaxed font-medium italic">
                    "{review.comment}"
                  </p>
                </div>
              )}

              {review.vendorReply && (
                <div className="mt-4 flex gap-4">
                   <div className="w-px bg-purple-100 hidden sm:block"></div>
                   <div className="flex-1 bg-purple-50/30 border border-purple-50 rounded-2xl p-5 relative">
                      <div className="absolute -top-3 right-6 bg-white px-2 text-[10px] font-black text-purple-600 uppercase tracking-widest border border-purple-100 rounded-md">
                        {t.yourReply}
                      </div>
                      <p className="text-purple-900 font-bold text-sm leading-relaxed">
                        {review.vendorReply}
                      </p>
                   </div>
                </div>
              )}

              {replyingTo?.id === review.id && (
                <div className="mt-4 animate-scale-up">
                  <div className="bg-white border-2 border-purple-100 rounded-2xl overflow-hidden focus-within:border-purple-500 transition-colors shadow-lg">
                    <textarea
                      autoFocus
                      placeholder={isArabic ? 'اكتب ردك هنا...' : 'Write your reply here...'}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="w-full p-4 border-none outline-none resize-none min-h-[100px] text-slate-800 font-medium"
                    />
                    <div className="bg-purple-50/50 px-4 py-3 flex justify-between items-center">
                      <button 
                        onClick={() => setReplyingTo(null)}
                        className="text-gray-500 font-bold text-sm hover:text-gray-700"
                      >
                        {t.cancel}
                      </button>
                      <button 
                        onClick={handleReply}
                        disabled={!replyText.trim()}
                        className="bg-purple-600 text-white px-6 py-2 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-purple-100 disabled:opacity-50 disabled:shadow-none transition-all"
                      >
                        <Send className="w-4 h-4" />
                        {t.send}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
