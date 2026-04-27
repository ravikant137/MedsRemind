'use client';
import { useState, useEffect } from 'react';
import { Bell, Clock, Pill, Plus, Trash2, CheckCircle, Calendar, AlertCircle, Loader2, ArrowRight, Volume2, Mic, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { API_URL } from '@/config';
import { useRouter } from 'next/navigation';

export default function Reminders() {
  const [language, setLanguage] = useState('en');
  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [points, setPoints] = useState(0);
  const router = useRouter();

  const translations: any = {
    en: {
      title: 'Medication Schedule',
      subtitle: 'Your personalized smart reminders and dosage tracking.',
      rewards: 'Total Rewards',
      takeDose: 'Take Dose',
      listen: 'Listen',
      insight: 'Smart Adherence Insight',
      scanNew: 'Scan New RX',
      noReminders: 'No Reminders Yet',
      getStarted: 'Get Started with AI Scan',
      syncing: 'Syncing your schedule...',
      takeMedMsg: (med: string) => `It's time to take ${med}.`
    },
    hi: {
      title: 'दवा अनुसूची',
      subtitle: 'आपके व्यक्तिगत स्मार्ट रिमाइंडर और खुराक ट्रैकिंग।',
      rewards: 'कुल पुरस्कार',
      takeDose: 'खुराक लें',
      listen: 'सुनें',
      insight: 'स्मार्ट अनुपालन अंतर्दृष्टि',
      scanNew: 'नया पर्चा स्कैन करें',
      noReminders: 'अभी तक कोई रिमाइंडर नहीं है',
      getStarted: 'AI स्कैन के साथ शुरू करें',
      syncing: 'आपकी अनुसूची सिंक हो रही है...',
      takeMedMsg: (med: string) => `${med} लेने का समय हो गया है।`
    },
    kn: {
      title: 'ಔಷಧಿ ವೇಳಾಪಟ್ಟಿ',
      subtitle: 'ನಿಮ್ಮ ವೈಯಕ್ತಿಕಗೊಳಿಸಿದ ಸ್ಮಾರ್ಟ್ ರಿಮೈಂಡರ್‌ಗಳು ಮತ್ತು ಡೋಸೇಜ್ ಟ್ರ್ಯಾಕಿಂಗ್.',
      rewards: 'ಒಟ್ಟು ಪ್ರತಿಫಲಗಳು',
      takeDose: 'ಡೋಸ್ ತೆಗೆದುಕೊಳ್ಳಿ',
      listen: 'ಕೇಳಿ',
      insight: 'ಸ್ಮಾರ್ಟ್ ಅಡೆರೆನ್ಸ್ ಒಳನೋಟ',
      scanNew: 'ಹೊಸ RX ಸ್ಕ್ಯಾನ್ ಮಾಡಿ',
      noReminders: 'ಇನ್ನೂ ಯಾವುದೇ ರಿಮೈಂಡರ್‌ಗಳಿಲ್ಲ',
      getStarted: 'AI ಸ್ಕ್ಯಾನ್‌ನೊಂದಿಗೆ ಪ್ರಾರಂಭಿಸಿ',
      syncing: 'ನಿಮ್ಮ ವೇಳಾಪಟ್ಟಿಯನ್ನು ಸಿಂಕ್ ಮಾಡಲಾಗುತ್ತಿದೆ...',
      takeMedMsg: (med: string) => `${med} ತೆಗೆದುಕೊಳ್ಳುವ ಸಮಯವಾಗಿದೆ.`
    }
  };

  const t = translations[language];

  useEffect(() => {
    const savedLang = localStorage.getItem('meds_lang') || 'en';
    setLanguage(savedLang);
    fetchReminders();
    fetchPoints();
  }, []);

  const changeLanguage = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem('meds_lang', lang);
  };

  const fetchPoints = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/user/points`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPoints(res.data.points);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReminders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/reminders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReminders(res.data);
    } catch (err) {
      console.error(err);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const completeReminder = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`/api/reminders/${id}/complete`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPoints(prev => prev + (res.data.pointsEarned || 0));
      alert(`Amazing! You earned ${res.data.pointsEarned} Reward Points! 🏆`);
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Unknown error';
      alert(`Completion Failed: ${errorMsg}`);
    }
  };

  const playVoiceReminder = (reminder: any) => {
    let text = '';
    if (language === 'hi') {
      text = `${reminder.medicine_name} लेने का समय हो गया है। डोज़: ${reminder.dosage}। ${reminder.timing || ''}।`;
    } else if (language === 'kn') {
      text = `${reminder.medicine_name} ತೆಗೆದುಕೊಳ್ಳುವ ಸಮಯವಾಗಿದೆ. ಡೋಸೇಜ್: ${reminder.dosage}. ${reminder.timing || ''}.`;
    } else {
      text = `It is time to take ${reminder.medicine_name}. Dosage is ${reminder.dosage}. ${reminder.timing || ''}.`;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => {
      const l = v.lang.toLowerCase();
      if (language === 'hi') return l.includes('hi-in');
      if (language === 'kn') return l.includes('kn-in');
      return l.includes('en-in') || l.includes('en-gb');
    }) || voices[0];
    if (voice) utterance.voice = voice;
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const deleteReminder = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/reminders/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReminders(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      alert('Failed to delete reminder');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-4 md:pt-6 px-4 md:px-6 pb-24 overflow-x-hidden">
      <div className="max-w-4xl mx-auto">
        <header className="flex flex-col gap-6 mb-8">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">{t.title}</h1>
              <p className="text-slate-500 mt-1 text-xs md:text-sm font-medium">{t.subtitle}</p>
            </div>
            <div className="md:hidden">
              <select 
                value={language} 
                onChange={(e) => changeLanguage(e.target.value)}
                className="bg-white border border-slate-100 rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
              >
                <option value="en">EN</option>
                <option value="hi">HI</option>
                <option value="kn">KN</option>
              </select>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex-1 min-w-[150px] px-4 py-3 bg-slate-900 text-white rounded-2xl flex items-center gap-3 shadow-lg">
               <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white shrink-0">
                  <Award className="w-4 h-4" />
               </div>
               <div>
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 leading-tight">{t.rewards}</p>
                  <p className="text-base font-black text-white">{points} <span className="text-[10px] text-green-500">PTS</span></p>
               </div>
            </div>
            <div className="hidden md:block">
              <select 
                value={language} 
                onChange={(e) => changeLanguage(e.target.value)}
                className="bg-white border border-slate-100 rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी (Hindi)</option>
                <option value="kn">ಕನ್ನಡ (Kannada)</option>
              </select>
            </div>
            <button onClick={() => router.push('/prescription')} className="flex-1 md:flex-none px-6 py-4 bg-green-600 text-white rounded-2xl font-black text-[10px] flex items-center justify-center gap-2 shadow-lg shadow-green-200 hover:bg-green-700 transition-all uppercase tracking-widest">
              <Plus className="w-4 h-4" /> {t.scanNew}
            </button>
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-96 gap-4 text-slate-400">
             <Loader2 className="w-12 h-12 animate-spin text-green-600" />
             <p className="font-black uppercase tracking-widest text-xs">Syncing your schedule...</p>
          </div>
        ) : reminders.length === 0 ? (
          <div className="bg-white p-20 rounded-[4rem] text-center border border-slate-100 shadow-2xl shadow-slate-200/50">
             <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 text-4xl">⏰</div>
             <h3 className="text-3xl font-black text-slate-900 mb-4">No Reminders Yet</h3>
             <p className="text-slate-500 font-medium mb-10 max-w-sm mx-auto">Upload a prescription or add a manual reminder to start tracking your health journey.</p>
             <button onClick={() => router.push('/prescription')} className="px-10 py-5 bg-slate-900 text-white rounded-[2rem] font-black hover:bg-green-600 transition-all shadow-xl">
                Get Started with AI Scan
             </button>
          </div>
        ) : (
          <div className="space-y-6">
             <AnimatePresence mode="popLayout">
                 {reminders.map((reminder, i) => (
                    <motion.div 
                      key={reminder.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-white p-5 md:p-8 rounded-2xl md:rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-100/50 group hover:border-green-200 transition-all"
                    >
                       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 sm:gap-8">
                         <div className="flex items-center gap-4 md:gap-6">
                            <div className="w-12 h-12 md:w-16 md:h-16 bg-green-50 text-green-600 rounded-xl md:rounded-[1.5rem] flex items-center justify-center text-2xl md:text-3xl shadow-inner group-hover:scale-110 transition-transform">
                               💊
                            </div>
                            <div className="flex-1">
                               <h4 className="text-lg md:text-2xl font-black text-slate-900">{reminder.medicine_name}</h4>
                               <div className="flex flex-wrap gap-4 md:gap-6 mt-1 md:mt-2">
                                  <span className="flex items-center gap-1.5 text-[10px] md:text-sm font-bold text-slate-400">
                                     <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-600" /> {reminder.time}
                                  </span>
                                  <span className="flex items-center gap-1.5 text-[10px] md:text-sm font-bold text-slate-400">
                                     <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-600" /> {reminder.frequency}
                                  </span>
                                  <span className="flex items-center gap-1.5 text-[10px] md:text-sm font-bold text-slate-400">
                                     <CheckCircle className="w-3.5 h-3.5 md:w-4 md:h-4 text-purple-600" /> {reminder.dosage}
                                  </span>
                               </div>
                            </div>
                         </div>

                         <div className="flex items-center gap-3">
                            <button 
                              onClick={() => playVoiceReminder(reminder)}
                              className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center hover:bg-blue-100 transition-colors shrink-0"
                              title={t.listen}
                            >
                               <Volume2 className="w-5 h-5" />
                            </button>
                             <button 
                               onClick={() => completeReminder(reminder.id)}
                               disabled={reminder.status === 'TAKEN'}
                               className={`flex-1 sm:flex-none h-12 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                                 reminder.status === 'TAKEN' 
                                 ? 'bg-green-100 text-green-600 cursor-not-allowed' 
                                 : 'bg-slate-900 text-white hover:bg-green-600'
                               }`}
                             >
                                {reminder.status === 'TAKEN' ? (
                                  <><CheckCircle className="w-4 h-4 shrink-0" /> Taken ✓</>
                                ) : (
                                  <><CheckCircle className="w-4 h-4 shrink-0" /> {t.takeDose}</>
                                )}
                             </button>
                            <button 
                              onClick={() => deleteReminder(reminder.id)}
                              className="w-12 h-12 bg-slate-50 text-slate-300 rounded-xl flex items-center justify-center hover:bg-red-50 hover:text-red-600 transition-all shrink-0"
                            >
                               <Trash2 className="w-4 h-4" />
                            </button>
                         </div>
                       </div>

                      {reminder.suggestion && (
                        <div className="mt-8 p-6 bg-blue-50/30 rounded-[2rem] border border-blue-100/50 flex gap-4 items-start relative overflow-hidden group">
                           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                              <Mic className="w-12 h-12 text-blue-600" />
                           </div>
                           <AlertCircle className="w-6 h-6 text-blue-600 shrink-0 mt-1" />
                           <div>
                              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 mb-2">Smart Adherence Insight</p>
                              <p className="text-lg font-bold text-blue-900 leading-relaxed italic">
                                "{reminder.suggestion}"
                              </p>
                           </div>
                        </div>
                      )}
                   </motion.div>
                ))}
             </AnimatePresence>

             <div className="mt-20 p-10 bg-slate-900 rounded-[4rem] text-white overflow-hidden relative shadow-2xl">
                <div className="absolute top-0 right-0 p-10 opacity-10"><Bell className="w-48 h-48" /></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10 text-center md:text-left">
                   <div className="space-y-4">
                      <h3 className="text-3xl font-black">Turn Points into <span className="text-green-500">Savings</span></h3>
                      <p className="text-slate-400 font-medium max-w-md">Every dose you take earns you points. Redeem them for exclusive discounts on your next medicine refill.</p>
                   </div>
                   <button onClick={() => router.push('/discounts')} className="px-10 py-5 bg-green-600 text-white rounded-[2rem] font-black hover:bg-green-700 transition-all shadow-xl shadow-green-500/20 flex items-center gap-3">
                      View Rewards <ArrowRight className="w-5 h-5" />
                   </button>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
