'use client';
import { useState, useEffect } from 'react';
import { Bell, Clock, Pill, Plus, Trash2, CheckCircle, Calendar, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function Reminders() {
  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/reminders', {
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

  const deleteReminder = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/reminders/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReminders(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      alert('Failed to delete reminder');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-32 px-6 pb-20">
      <div className="max-w-4xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16">
          <div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tight">Medication <span className="text-green-600">Schedule</span></h1>
            <p className="text-slate-500 mt-2 font-medium">Your personalized smart reminders and dosage tracking.</p>
          </div>
          <button onClick={() => router.push('/prescription')} className="px-8 py-4 bg-green-600 text-white rounded-2xl font-black flex items-center gap-3 shadow-xl shadow-green-200 hover:bg-green-700 transition-all">
            <Plus className="w-5 h-5" /> Scan New RX
          </button>
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
                    className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-100/50 group hover:border-green-200 transition-all flex flex-wrap items-center justify-between gap-8"
                  >
                     <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-green-50 text-green-600 rounded-[1.5rem] flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
                           💊
                        </div>
                        <div>
                           <h4 className="text-2xl font-black text-slate-900">{reminder.medicine_name}</h4>
                           <div className="flex gap-6 mt-2">
                              <span className="flex items-center gap-2 text-sm font-bold text-slate-400">
                                 <Clock className="w-4 h-4 text-green-600" /> {reminder.time}
                              </span>
                              <span className="flex items-center gap-2 text-sm font-bold text-slate-400">
                                 <Calendar className="w-4 h-4 text-blue-600" /> {reminder.frequency}
                              </span>
                              <span className="flex items-center gap-2 text-sm font-bold text-slate-400">
                                 <CheckCircle className="w-4 h-4 text-purple-600" /> {reminder.dosage}
                              </span>
                           </div>
                        </div>
                     </div>
                     <div className="flex items-center gap-4">
                        <div className="text-right mr-4 hidden md:block">
                           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-green-600 bg-green-50 px-3 py-1 rounded-full">Active Status</span>
                           <p className="text-xs text-slate-400 font-bold mt-1">Next dose in 4h 20m</p>
                        </div>
                        <button 
                          onClick={() => deleteReminder(reminder.id)}
                          className="p-5 bg-slate-50 text-slate-300 rounded-2xl hover:bg-red-50 hover:text-red-600 transition-all"
                        >
                           <Trash2 className="w-6 h-6" />
                        </button>
                     </div>
                  </motion.div>
                ))}
             </AnimatePresence>

             <div className="mt-20 p-10 bg-slate-900 rounded-[4rem] text-white overflow-hidden relative shadow-2xl">
                <div className="absolute top-0 right-0 p-10 opacity-10"><Bell className="w-48 h-48" /></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10 text-center md:text-left">
                   <div className="space-y-4">
                      <h3 className="text-3xl font-black">Need a Refill?</h3>
                      <p className="text-slate-400 font-medium max-w-md">Our AI system detects when your medication is running low and can automatically order more for you.</p>
                   </div>
                   <button onClick={() => router.push('/shop')} className="px-10 py-5 bg-green-600 text-white rounded-[2rem] font-black hover:bg-green-700 transition-all shadow-xl shadow-green-500/20 flex items-center gap-3">
                      Go to Shop <ArrowRight className="w-5 h-5" />
                   </button>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
