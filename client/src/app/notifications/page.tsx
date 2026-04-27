'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { API_URL } from '@/config';
import { 
  ShieldAlert, ShoppingBag, CheckCircle, Clock, ArrowLeft, 
  Bell, Loader2, Trash2, Info, ArrowRight
} from 'lucide-react';

export default function Notifications() {
  const [language, setLanguage] = useState('en');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const translations: any = {
    en: { title: 'Notifications', subtitle: 'Stay updated with your medication and orders.', markAll: 'Mark all as read' },
    hi: { title: 'सूचनाएं', subtitle: 'अपनी दवाओं और ऑर्डरों के साथ अपडेट रहें।', markAll: 'सभी को पढ़ा हुआ मान लें' },
    kn: { title: 'ಸೂಚನೆಗಳು', subtitle: 'ನಿಮ್ಮ ಔಷಧಿ ಮತ್ತು ಆರ್ಡರ್‌ಗಳೊಂದಿಗೆ ಅಪ್‌ಡೇಟ್ ಆಗಿರಿ.', markAll: 'ಎಲ್ಲವನ್ನೂ ಓದಿದಂತೆ ಗುರುತಿಸಿ' }
  };

  const t = translations[language];

  useEffect(() => {
    fetchNotifications();
    const savedLang = localStorage.getItem('meds_lang') || 'en';
    setLanguage(savedLang);
    
    const autoRead = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          await axios.post(`${API_URL}/api/notifications/read`, {}, { headers: { Authorization: `Bearer ${token}` } });
          // Notify Navbar to update count immediately
          window.dispatchEvent(new Event('notif-refresh'));
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
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/notifications/read`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      
      // Notify Navbar to update count immediately
      window.dispatchEvent(new Event('notif-refresh'));
    } catch (err) {
      console.error(err);
    }
  };

  const groupNotifications = (notifs: any[]) => {
    if (!Array.isArray(notifs)) return {};
    const groups: any = {};
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    notifs.forEach(n => {
      const d = new Date(n.created_at).toDateString();
      let label = d === today ? 'Today' : d === yesterday ? 'Yesterday' : new Date(n.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
      if (!groups[label]) groups[label] = [];
      groups[label].push(n);
    });
    return groups;
  };

  const grouped = groupNotifications(notifications);

  return (
    <div className="min-h-screen bg-slate-50 pt-12 px-6 pb-20">
      <div className="max-w-4xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-center gap-6 mb-16">
          <div className="flex items-center gap-6">
            <button onClick={() => router.back()} className="w-14 h-14 bg-white rounded-2xl shadow-xl flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all border border-slate-100">
               <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">{t.title}</h1>
              <p className="text-slate-500 font-medium">{t.subtitle}</p>
            </div>
          </div>
          <button onClick={markAllRead} className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-green-600 transition-all">
             {t.markAll}
          </button>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32"><Loader2 className="w-10 h-10 animate-spin text-green-600" /></div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-[4rem] shadow-xl border border-slate-100">
             <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8"><ShoppingBag className="w-12 h-12 text-slate-200" /></div>
             <h2 className="text-2xl font-black text-slate-900 mb-2">No History Yet</h2>
             <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Your health journey updates will appear here.</p>
          </div>
        ) : (
          <div className="space-y-12">
             {Object.keys(grouped).map((label) => (
               <div key={label} className="space-y-6">
                  <div className="flex items-center gap-4 px-4">
                     <span className="text-xs font-black uppercase tracking-widest text-slate-400">{label}</span>
                     <div className="h-[1px] bg-slate-200 flex-1"></div>
                  </div>
                  {grouped[label].map((notif: any) => {
                    // Improved regex to catch #ORD-123, ANJ-123, or just plain numbers in context
                    const orderIdMatch = notif.message.match(/(?:#ORD-|ANJ-)?(\d+)/);
                    const orderId = orderIdMatch ? orderIdMatch[1] : null;
                    const isOrder = notif.type?.toLowerCase().includes('order');

                    return (
                      <motion.div 
                        key={notif.id}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className={`p-8 rounded-[3rem] shadow-xl border-2 flex flex-col md:flex-row gap-8 transition-all relative overflow-hidden group ${
                          notif.read ? 'bg-white border-transparent' : 'bg-white border-green-500'
                        }`}
                      >
                         <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shrink-0 text-3xl ${
                           notif.type === 'REWARD' ? 'bg-yellow-50' : isOrder ? 'bg-blue-50' : 'bg-green-50'
                         }`}>
                            {notif.type === 'REWARD' ? '🪙' : isOrder ? '📦' : '💊'}
                         </div>
                         <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                               <div>
                                  <h3 className="text-xl font-black text-slate-900">{notif.title}</h3>
                                  <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1 rounded-full uppercase tracking-widest">
                                    {notif.type.replace(/_/g, ' ')}
                                  </span>
                               </div>
                               <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1 rounded-full whitespace-nowrap">
                                  {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                               </span>
                            </div>
                            <p className="text-slate-500 font-bold leading-relaxed mb-6">{notif.message}</p>
                            
                            {orderId && (
                              <button 
                                onClick={() => router.push(`/track?id=${orderId}`)}
                                className="flex items-center gap-3 px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-green-600 transition-all shadow-lg"
                              >
                                 <ShoppingBag className="w-4 h-4" /> Track Order #{orderId} <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                         </div>
                      </motion.div>
                    );
                  })}
               </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
}
