'use client';
import { useState, useEffect } from 'react';
import { 
  Clock, CheckCircle2, XCircle, TrendingUp, Calendar, Pill, 
  Activity, ArrowRight, Loader2, User, ShieldCheck, 
  Heart, ShoppingBag, Bell, History, Settings, HeartPulse, Award, Volume2, ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { API_URL } from '@/config';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [points, setPoints] = useState(0);
  const [language, setLanguage] = useState('en');
  const router = useRouter();

  useEffect(() => {
    const savedLang = localStorage.getItem('meds_lang') || 'en';
    setLanguage(savedLang);
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
    fetchData();
    fetchPoints();
  }, []);

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

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/reminders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReminders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const completeReminder = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_URL}/api/reminders/${id}/complete`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPoints(prev => prev + res.data.pointsEarned);
      alert('Dose taken! You earned 10 Rewards Points! 🏆');
    } catch (err) {
      alert('Failed to complete reminder');
    }
  };

  const playVoiceReminder = (reminder: any) => {
    const text = language === 'en' 
      ? `Time for ${reminder.medicine_name}. ${reminder.suggestion || ''}`
      : language === 'hi' 
        ? `${reminder.medicine_name} लेने का समय हो गया है।` 
        : `${reminder.medicine_name} ತೆಗೆದುಕೊಳ್ಳುವ ಸಮಯವಾಗಿದೆ.`;
        
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang.includes(language === 'hi' ? 'hi-IN' : language === 'kn' ? 'kn-IN' : 'en-IN')) || voices[0];
    if (voice) utterance.voice = voice;
    window.speechSynthesis.speak(utterance);
  };

  const stats = [
    { label: 'Health Points', value: points.toString(), unit: 'pts', icon: Award, color: 'text-orange-500 bg-orange-50' },
    { label: 'Adherence', value: '94', unit: '%', icon: Activity, color: 'text-green-500 bg-green-50' },
    { label: 'Orders', value: '12', unit: 'total', icon: ShoppingBag, color: 'text-blue-500 bg-blue-50' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-6 px-6 pb-24 overflow-x-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-green-100/30 rounded-full blur-[120px] -z-10 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-blue-100/20 rounded-full blur-[100px] -z-10"></div>

      <div className="max-w-7xl mx-auto">
        {/* Profile Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 md:p-10 rounded-[3rem] shadow-xl shadow-slate-200/50 mb-8 relative overflow-hidden group border border-white"
        >
           <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform duration-700">
              <Pill className="w-64 h-64 text-slate-900" />
           </div>
           <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
              <div className="relative">
                 <div className="w-32 h-32 md:w-40 md:h-40 bg-gradient-to-tr from-green-600 to-green-400 rounded-[3rem] flex items-center justify-center text-white text-5xl font-black shadow-2xl shadow-green-200">
                    {user?.name?.[0]}
                 </div>
                 <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center border-4 border-white">
                    <ShieldCheck className="w-6 h-6" />
                 </div>
              </div>
              <div className="text-center md:text-left flex-1">
                  <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                       Welcome, <span className="text-green-600">{user?.name}</span>
                    </h1>
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-green-100">
                       <Award className="w-3.5 h-3.5" /> {points} Rewards
                    </span>
                 </div>
                 <p className="text-slate-500 font-medium text-lg mb-8 max-w-2xl leading-relaxed">
                    Track your dosage and earn points for being consistent. You have <span className="text-slate-900 font-black">{reminders.length} medications</span> scheduled for today.
                 </p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-4">
                    <Link href="/reminders" className="px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-xs flex items-center gap-2 hover:bg-green-600 transition-all shadow-lg">
                       <Calendar className="w-4 h-4" /> Schedule
                    </Link>
                    <Link href="/discounts" className="px-6 py-3 bg-slate-50 text-slate-900 rounded-xl font-black text-xs flex items-center gap-2 hover:bg-slate-100 transition-all border border-slate-100">
                       <TrendingUp className="w-4 h-4 text-green-600" /> Rewards
                    </Link>
                 </div>
              </div>
           </div>
        </motion.div>

        {/* Quick Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
           {stats.map((stat, i) => (
             <motion.div 
               key={i}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               whileHover={{ y: -5 }}
               className="bg-white p-8 rounded-[3rem] shadow-xl shadow-slate-100/50 border border-slate-50 flex items-center gap-6"
             >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${stat.color}`}>
                   <stat.icon className="w-8 h-8" />
                </div>
                <div>
                   <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                   <p className="text-3xl font-black text-slate-900">{stat.value}<span className="text-lg text-slate-400 font-medium ml-1">{stat.unit}</span></p>
                </div>
             </motion.div>
           ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
           {/* Timeline & Reminders */}
           <div className="lg:col-span-2 space-y-10">
              <section className="bg-white p-10 rounded-[4rem] shadow-2xl shadow-slate-100/50 border border-slate-50">
                 <div className="flex justify-between items-center mb-10">
                    <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                       <Clock className="w-7 h-7 text-green-600" /> Today's Meds
                    </h3>
                    <Link href="/reminders" className="text-sm font-black text-green-600 hover:underline">See full schedule</Link>
                 </div>

                 {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                       <Loader2 className="w-12 h-12 animate-spin text-green-600 mb-4" />
                       <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading Schedule...</p>
                    </div>
                 ) : reminders.length === 0 ? (
                    <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                       <p className="text-slate-400 font-bold mb-4">No active reminders found for today.</p>
                       <Link href="/prescription" className="px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg">Scan Prescription</Link>
                    </div>
                 ) : (
                    <div className="space-y-6">
                       {reminders.map((rem, i) => (
                         <div key={i} className="flex items-center gap-6 p-6 bg-slate-50 rounded-[2.5rem] hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-green-100 group">
                            <div className="w-16 h-16 bg-white rounded-2xl flex flex-col items-center justify-center font-black text-slate-900 shadow-sm group-hover:bg-green-600 group-hover:text-white transition-all">
                               <Clock className="w-5 h-5 mb-1 opacity-50 group-hover:opacity-100" />
                               <span className="text-xs">{rem.time}</span>
                            </div>
                            <div className="flex-1">
                               <h4 className="text-xl font-black text-slate-900">{rem.medicine_name}</h4>
                               <p className="text-sm text-slate-400 font-bold">{rem.dosage} • {rem.frequency}</p>
                            </div>
                            <div className="flex items-center gap-3">
                               <button 
                                 onClick={() => playVoiceReminder(rem)}
                                 className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center hover:bg-blue-100"
                               >
                                  <Volume2 className="w-5 h-5" />
                               </button>
                               <button 
                                 onClick={() => completeReminder(rem.id)}
                                 className="px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-green-600 transition-colors shadow-lg"
                               >
                                  Take Dose
                               </button>
                            </div>
                         </div>
                       ))}
                    </div>
                 )}
              </section>

              {/* Recent Activity */}
              <section className="bg-white p-10 rounded-[4rem] shadow-2xl shadow-slate-100/50 border border-slate-50">
                 <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                    <History className="w-7 h-7 text-blue-600" /> Recent Activity
                 </h3>
                 <div className="space-y-8">
                    {[
                      { action: 'Prescription Uploaded', time: '2 hours ago', icon: ShieldCheck, color: 'text-green-600' },
                      { action: 'Ordered Paracetamol', time: '1 day ago', icon: ShoppingBag, color: 'text-blue-600' },
                      { action: 'Subscription Renewed', time: '3 days ago', icon: CheckCircle2, color: 'text-purple-600' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-6">
                         <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                            <item.icon className={`w-6 h-6 ${item.color}`} />
                         </div>
                         <div>
                            <p className="font-black text-slate-900">{item.action}</p>
                            <p className="text-xs text-slate-400 font-bold">{item.time}</p>
                         </div>
                      </div>
                    ))}
                 </div>
              </section>
           </div>

           {/* Sidebar Actions */}
           <div className="space-y-10">
              <div className="bg-slate-900 text-white p-10 rounded-[3.5rem] relative overflow-hidden shadow-2xl shadow-slate-300">
                 <div className="absolute -top-10 -right-10 w-48 h-48 bg-green-500/20 rounded-full blur-3xl"></div>
                 <h4 className="text-xl font-black mb-6 relative z-10">Rewards Member</h4>
                 <div className="mb-8 p-6 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Available Points</p>
                    <p className="text-4xl font-black text-green-500">{points} <span className="text-sm text-slate-400">pts</span></p>
                 </div>
                 <button onClick={() => router.push('/discounts')} className="w-full py-4 bg-green-600 text-white rounded-2xl font-black hover:bg-green-700 transition-all shadow-xl shadow-green-900/50">
                    Redeem Points
                 </button>
              </div>

              <div className="bg-white p-10 rounded-[3.5rem] border border-slate-50 shadow-xl shadow-slate-100/50">
                 <h4 className="text-xl font-black text-slate-900 mb-8">Settings & Safety</h4>
                 <div className="space-y-4">
                    <button onClick={() => router.push('/profile')} className="w-full flex items-center justify-between p-5 bg-slate-50 rounded-2xl group hover:bg-slate-100 transition-all">
                       <span className="font-black text-slate-600 flex items-center gap-3"><User className="w-5 h-5" /> Profile Edit</span>
                       <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-900" />
                    </button>
                    <button onClick={() => router.push('/track')} className="w-full flex items-center justify-between p-5 bg-slate-50 rounded-2xl group hover:bg-slate-100 transition-all">
                       <span className="font-black text-slate-600 flex items-center gap-3"><History className="w-5 h-5" /> Order History</span>
                       <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-900" />
                    </button>
                    <button className="w-full flex items-center justify-between p-5 bg-slate-50 rounded-2xl group hover:bg-slate-100 transition-all">
                       <span className="font-black text-slate-600 flex items-center gap-3"><Settings className="w-5 h-5" /> Safety Settings</span>
                       <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-900" />
                    </button>
                 </div>
              </div>

              <div className="p-10 bg-red-50 rounded-[3.5rem] border border-red-100 mb-10">
                 <ShieldAlert className="w-10 h-10 text-red-600 mb-4 animate-pulse" />
                 <h4 className="text-lg font-black text-slate-900 mb-2">Emergency Mode</h4>
                 <p className="text-sm text-slate-500 font-medium mb-6">Need medicines in 10 minutes? Activate SOS mode.</p>
                 <button onClick={() => router.push('/emergency')} className="w-full py-4 bg-red-600 text-white rounded-2xl font-black shadow-lg hover:bg-red-700 transition-all flex items-center justify-center gap-2">
                    Open SOS Center
                 </button>
              </div>

              <div className="p-10 bg-green-50 rounded-[3.5rem] border border-green-100">
                 <HeartPulse className="w-10 h-10 text-green-600 mb-4 animate-pulse" />
                 <h4 className="text-lg font-black text-slate-900 mb-2">Need Help?</h4>
                 <p className="text-sm text-slate-500 font-medium mb-6">Our pharmacists are available 24/7 for your medical queries.</p>
                 <button className="text-sm font-black text-green-600 hover:underline flex items-center gap-2">
                    Contact Support <ArrowRight className="w-4 h-4" />
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
