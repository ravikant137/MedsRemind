'use client';
import { useState, useEffect } from 'react';
import { Bell, Info, AlertTriangle, CheckCircle, Clock, ArrowLeft, Trash2, ShieldAlert, ShoppingBag, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { API_URL } from '@/config';

export default function Notifications() {
  const [language, setLanguage] = useState('en');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const router = useRouter();

  const translations: any = {
    en: {
      title: 'Notifications',
      subtitle: 'Stay updated with your medication and orders.',
      markAll: 'Mark all as read',
    },
    hi: {
      title: 'सूचनाएं',
      subtitle: 'अपनी दवाओं और ऑर्डरों के साथ अपडेट रहें।',
      markAll: 'सभी को पढ़ा हुआ मान लें',
    },
    kn: {
      title: 'ಸೂಚನೆಗಳು',
      subtitle: 'ನಿಮ್ಮ ಔಷಧಿ ಮತ್ತು ಆರ್ಡರ್‌ಗಳೊಂದಿಗೆ ಅಪ್‌ಡೇಟ್ ಆಗಿರಿ.',
      markAll: 'ಎಲ್ಲವನ್ನೂ ಓದಿದಂತೆ ಗುರುತಿಸಿ',
    }
  };

  const t = translations[language];

  useEffect(() => {
    fetchNotifications();
    const savedLang = localStorage.getItem('meds_lang') || 'en';
    setLanguage(savedLang);
    
    // AUTO-READ: Clear notifications as soon as the page is viewed
    const autoRead = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          await axios.post(`${API_URL}/api/notifications/read`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
        }
      } catch (err) {}
    };
    autoRead();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const processedData = res.data.map((n: any) => ({
        ...n,
        created_at: n.created_at && n.created_at.includes(' ') && !n.created_at.includes('T') ? n.created_at + ' UTC' : (n.created_at || new Date().toISOString())
      }));
      setNotifications(processedData);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const viewOrderDetails = (notif: any) => {
    // Recognize both old numeric IDs and new ANJ-XXXX IDs
    const match = notif.message.match(/ANJ-\d+|#ORD-(\d+)/);
    if (match) {
      const orderId = match[0].startsWith('ANJ-') ? match[0] : match[1];
      router.push(`/track?id=${orderId}`);
    }
  };

  const markAllRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/notifications/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 60000); 
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff} mins ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)} hours ago`;
    return `${Math.floor(diff / 1440)} days ago`;
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-6 px-6 pb-20">
      <div className="max-w-4xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div className="flex items-center gap-6">
            <button onClick={() => router.back()} className="w-14 h-14 bg-white rounded-2xl shadow-xl shadow-slate-200/50 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all border border-slate-100">
               <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">{t.title}</h1>
              <p className="text-slate-500 font-medium">{t.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-white px-6 py-3 rounded-2xl border border-slate-100 font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200/50 focus:ring-4 focus:ring-green-500/10"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी (Hindi)</option>
              <option value="kn">ಕನ್ನಡ (Kannada)</option>
            </select>
            <button 
              onClick={markAllRead}
              className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-slate-400 hover:bg-green-600 transition-all hover:scale-105 active:scale-95"
            >
              {t.markAll}
            </button>
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
             <div className="w-20 h-20 bg-white rounded-3xl shadow-2xl flex items-center justify-center mb-6">
                <Loader2 className="w-10 h-10 animate-spin text-green-600" />
             </div>
             <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Syncing your alerts...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-[4rem] shadow-2xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-32 -mt-32"></div>
             <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 relative z-10">
                <Bell className="w-12 h-12 text-slate-200" />
             </div>
             <h2 className="text-2xl font-black text-slate-900 mb-2">All Clear!</h2>
             <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No new notifications at this moment.</p>
          </div>
        ) : (
          <div className="space-y-6">
             <AnimatePresence mode="popLayout">
               {notifications.map((notif, i) => (
                 <motion.div 
                   key={notif.id}
                   layout
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, scale: 0.95 }}
                   transition={{ delay: i * 0.05 }}
                   onClick={() => viewOrderDetails(notif)}
                   className={`p-8 rounded-[3.5rem] shadow-xl border-2 flex gap-8 transition-all cursor-pointer group hover:scale-[1.02] active:scale-[0.98] ${notif.read ? 'bg-white border-transparent opacity-80' : 'bg-white border-green-500 shadow-green-100'}`}
                 >
                    <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center shrink-0 shadow-lg ${
                      notif.type === 'emergency' ? 'bg-red-50 text-red-500' : 
                      notif.type === 'order' ? 'bg-blue-50 text-blue-500' : 
                      'bg-green-50 text-green-500'
                    }`}>
                       {notif.type === 'emergency' ? <ShieldAlert className="w-10 h-10" /> : 
                        notif.type === 'order' ? <ShoppingBag className="w-10 h-10" /> : 
                        <CheckCircle className="w-10 h-10" />}
                    </div>
                    <div className="flex-1">
                       <div className="flex justify-between items-start mb-2">
                          <h3 className="text-2xl font-black text-slate-900 group-hover:text-green-600 transition-colors">{notif.title}</h3>
                          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                             <Clock className="w-3 h-3" /> {getTimeAgo(notif.created_at)}
                          </div>
                       </div>
                       <p className="text-slate-500 font-bold leading-relaxed mb-6 text-lg">{notif.message}</p>
                       <div className="flex items-center gap-4">
                          <button className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg">
                             View Details
                          </button>
                          {!notif.read && (
                            <div className="flex items-center gap-2 text-[10px] font-black text-green-600 uppercase tracking-widest">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div> New
                            </div>
                          )}
                       </div>
                    </div>
                 </motion.div>
               ))}
             </AnimatePresence>
          </div>
        )}

        {/* Order Details Modal */}
        <AnimatePresence>
          {selectedOrder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl">
               <motion.div 
                 initial={{ opacity: 0, scale: 0.9, y: 20 }}
                 animate={{ opacity: 1, scale: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.9, y: 20 }}
                 className="bg-white w-full max-w-2xl rounded-[4rem] shadow-2xl overflow-hidden relative border border-white"
               >
                  <button 
                    onClick={() => setSelectedOrder(null)}
                    className="absolute top-10 right-10 w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all border border-slate-100"
                  >
                     <ArrowLeft className="w-6 h-6" />
                  </button>

                  <div className="p-16">
                     <div className="flex items-center gap-6 mb-12">
                        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center shadow-inner">
                           <ShoppingBag className="w-10 h-10" />
                        </div>
                        <div>
                           <h2 className="text-4xl font-black text-slate-900 tracking-tight">Order Details</h2>
                           <p className="text-slate-400 font-black uppercase tracking-widest text-xs">#ORD-{selectedOrder.id} • {selectedOrder.status}</p>
                        </div>
                     </div>

                     <div className="space-y-4 mb-12 max-h-[35vh] overflow-y-auto pr-4 custom-scrollbar">
                        {selectedOrder.items.map((item: any, i: number) => (
                           <div key={i} className="flex justify-between items-center p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100/50">
                              <div className="flex items-center gap-6">
                                 <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-slate-100">💊</div>
                                 <div>
                                    <p className="font-black text-slate-900 text-xl">{item.medicine_name}</p>
                                    <p className="text-xs text-slate-400 font-black uppercase tracking-widest">Qty: {item.quantity} × ₹{item.price_at_time}</p>
                                 </div>
                              </div>
                              <p className="font-black text-slate-900 text-2xl">₹{(item.quantity * item.price_at_time).toFixed(2)}</p>
                           </div>
                        ))}
                     </div>

                     <div className="p-10 bg-slate-900 text-white rounded-[3.5rem] mb-10 flex justify-between items-center shadow-2xl shadow-slate-300">
                        <div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Paid Amount</p>
                           <p className="text-5xl font-black text-green-500">₹{Number(selectedOrder.total_amount).toFixed(2)}</p>
                        </div>
                        <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center border border-white/10">
                           <ShieldAlert className="w-10 h-10 text-white/50" />
                        </div>
                     </div>

                     <button 
                       onClick={() => setSelectedOrder(null)}
                       className="w-full py-8 bg-slate-100 text-slate-900 rounded-[2.5rem] font-black uppercase tracking-widest text-sm hover:bg-green-600 hover:text-white transition-all shadow-xl hover:scale-105"
                     >
                        Close Details
                     </button>
                  </div>
               </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
