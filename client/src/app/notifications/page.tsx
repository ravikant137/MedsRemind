'use client';
import { useState, useEffect } from 'react';
import { Bell, Info, AlertTriangle, CheckCircle, Clock, ArrowLeft, Trash2, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function Notifications() {
  const [language, setLanguage] = useState('en');
  
  const translations: any = {
    en: {
      title: 'Notifications',
      subtitle: 'Stay updated with your medication and orders.',
      markAll: 'Mark all as read',
      orderTitle: 'Order Dispatched',
      orderMsg: 'Your order #ORD-7721 has been dispatched and will arrive by 6 PM.',
      lowStockTitle: 'Low Stock Alert',
      lowStockMsg: 'Your Paracetamol supply is running low. Order now to avoid missing a dose.',
      pointsTitle: 'Points Earned',
      pointsMsg: 'Congratulations! You earned 10 reward points for taking your morning dose.',
      emergencyTitle: 'Emergency Service Active',
      emergencyMsg: 'Priority 10-minute delivery is now available in your area.'
    },
    hi: {
      title: 'सूचनाएं',
      subtitle: 'अपनी दवाओं और ऑर्डरों के साथ अपडेट रहें।',
      markAll: 'सभी को पढ़ा हुआ मान लें',
      orderTitle: 'ऑर्डर भेजा गया',
      orderMsg: 'आपका ऑर्डर #ORD-7721 भेज दिया गया है और शाम 6 बजे तक पहुंच जाएगा।',
      lowStockTitle: 'स्टॉक कम अलर्ट',
      lowStockMsg: 'आपकी पैरासिटामोल की आपूर्ति कम हो रही है। खुराक छूटने से बचने के लिए अभी ऑर्डर करें।',
      pointsTitle: 'अंक प्राप्त हुए',
      pointsMsg: 'बधाई हो! आपने अपनी सुबह की खुराक लेने के लिए 10 रिवॉर्ड पॉइंट अर्जित किए हैं।',
      emergencyTitle: 'आपातकालीन सेवा सक्रिय',
      emergencyMsg: 'आपके क्षेत्र में अब प्राथमिकता 10-मिनट की डिलीवरी उपलब्ध है।'
    },
    kn: {
      title: 'ಸೂಚನೆಗಳು',
      subtitle: 'ನಿಮ್ಮ ಔಷಧಿ ಮತ್ತು ಆರ್ಡರ್‌ಗಳೊಂದಿಗೆ ಅಪ್‌ಡೇಟ್ ಆಗಿರಿ.',
      markAll: 'ಎಲ್ಲವನ್ನೂ ಓದಿದಂತೆ ಗುರುತಿಸಿ',
      orderTitle: 'ಆರ್ಡರ್ ಕಳುಹಿಸಲಾಗಿದೆ',
      orderMsg: 'ನಿಮ್ಮ ಆರ್ಡರ್ #ORD-7721 ಅನ್ನು ಕಳುಹಿಸಲಾಗಿದೆ ಮತ್ತು ಸಂಜೆ 6 ಗಂಟೆಗೆ ತಲುಪಲಿದೆ.',
      lowStockTitle: 'ಕಡಿಮೆ ಸ್ಟಾಕ್ ಅಲರ್ಟ್',
      lowStockMsg: 'ನಿಮ್ಮ ಪ್ಯಾರಸಿಟಮಾಲ್ ಪೂರೈಕೆ ಕಡಿಮೆಯಾಗುತ್ತಿದೆ. ಡೋಸ್ ತಪ್ಪಿಸುವುದನ್ನು ತಡೆಯಲು ಈಗಲೇ ಆರ್ಡರ್ ಮಾಡಿ.',
      pointsTitle: 'ಪಾಯಿಂಟ್ಸ್ ಗಳಿಸಲಾಗಿದೆ',
      pointsMsg: 'ಅಭಿನಂದನೆಗಳು! ನಿಮ್ಮ ಬೆಳಗಿನ ಡೋಸ್ ತೆಗೆದುಕೊಂಡಿದ್ದಕ್ಕಾಗಿ ನೀವು 10 ರಿವಾರ್ಡ್ ಪಾಯಿಂಟ್ಸ್ ಗಳಿಸಿದ್ದೀರಿ.',
      emergencyTitle: 'ತುರ್ತು ಸೇವೆ ಸಕ್ರಿಯವಾಗಿದೆ',
      emergencyMsg: 'ನಿಮ್ಮ ಪ್ರದೇಶದಲ್ಲಿ ಈಗ ಆದ್ಯತೆಯ 10 ನಿಮಿಷಗಳ ವಿತರಣೆ ಲಭ್ಯವಿದೆ.'
    }
  };

  const t = translations[language];

  const [notifications, setNotifications] = useState([
    { 
      id: 1, 
      type: 'info', 
      titleKey: 'orderTitle', 
      msgKey: 'orderMsg', 
      time: '10 mins ago',
      read: false
    },
    { 
      id: 2, 
      type: 'warning', 
      titleKey: 'lowStockTitle', 
      msgKey: 'lowStockMsg', 
      time: '1 hour ago',
      read: false
    },
    { 
      id: 3, 
      type: 'success', 
      titleKey: 'pointsTitle', 
      msgKey: 'pointsMsg', 
      time: '3 hours ago',
      read: true
    },
    { 
      id: 4, 
      type: 'emergency', 
      titleKey: 'emergencyTitle', 
      msgKey: 'emergencyMsg', 
      time: '5 hours ago',
      read: true
    }
  ]);
  const router = useRouter();

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotif = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-6 px-6 pb-20">
      <div className="max-w-4xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2.5 bg-white rounded-xl shadow-sm hover:bg-slate-50 transition-all border border-slate-100">
               <ArrowLeft className="w-4 h-4 text-slate-400" />
            </button>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t.title}</h1>
              <p className="text-slate-500 text-sm font-medium">{t.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-white border border-slate-100 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी (Hindi)</option>
              <option value="kn">ಕನ್ನಡ (Kannada)</option>
            </select>
            <button onClick={markAllRead} className="text-[10px] font-black uppercase tracking-widest text-green-600 hover:text-green-700 transition-colors">
              {t.markAll}
            </button>
          </div>
        </header>

        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {notifications.map((notif, i) => (
              <motion.div 
                key={notif.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                className={`p-6 rounded-[2.5rem] border transition-all flex items-start gap-6 group relative overflow-hidden ${notif.read ? 'bg-white/50 border-slate-100 opacity-70' : 'bg-white border-green-100 shadow-xl shadow-slate-100'}`}
              >
                 {!notif.read && <div className="absolute top-0 left-0 w-1.5 h-full bg-green-600"></div>}
                 
                 <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                   notif.type === 'emergency' ? 'bg-red-50 text-red-600' :
                   notif.type === 'warning' ? 'bg-orange-50 text-orange-600' :
                   notif.type === 'success' ? 'bg-green-50 text-green-600' :
                   'bg-blue-50 text-blue-600'
                 }`}>
                    {notif.type === 'emergency' ? <ShieldAlert className="w-6 h-6" /> :
                     notif.type === 'warning' ? <AlertTriangle className="w-6 h-6" /> :
                     notif.type === 'success' ? <CheckCircle className="w-6 h-6" /> :
                     <Info className="w-6 h-6" />}
                 </div>

                 <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                       <h3 className="font-black text-slate-900 flex items-center gap-2">
                         {t[notif.titleKey]}
                         {notif.type === 'warning' && <span className="w-2 h-2 bg-orange-500 rounded-full animate-ping"></span>}
                       </h3>
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{notif.time}</span>
                    </div>
                    <p className="text-sm font-medium text-slate-500 leading-relaxed max-w-xl mb-4">
                       {t[notif.msgKey]}
                    </p>
                    <div className="flex gap-3">
                       {notif.type === 'warning' ? (
                         <button className="px-5 py-2 bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-orange-200">Order Refill</button>
                       ) : notif.type === 'emergency' ? (
                         <button className="px-5 py-2 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-red-200">View Map</button>
                       ) : (
                         <button className="px-5 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg">View Details</button>
                       )}
                       <button onClick={() => deleteNotif(notif.id)} className="px-5 py-2 bg-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-colors">Dismiss</button>
                    </div>
                 </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {notifications.length === 0 && (
            <div className="text-center py-24 bg-white rounded-[4rem] border-2 border-dashed border-slate-100">
               <Bell className="w-16 h-16 text-slate-100 mx-auto mb-6" />
               <p className="font-black text-slate-400 uppercase tracking-widest text-xs">All caught up!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
