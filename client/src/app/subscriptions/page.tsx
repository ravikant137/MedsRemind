'use client';
import { useState, useEffect } from 'react';
import { Package, RefreshCcw, Calendar, ArrowRight, Loader2, Pill } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import Link from 'next/link';

export default function Subscriptions() {
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/subscriptions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-32 px-6 pb-20">
      <div className="max-w-5xl mx-auto">
        <header className="mb-16">
           <h1 className="text-4xl font-black text-slate-900 tracking-tight">Manage <span className="text-green-600">Subscriptions</span></h1>
           <p className="text-slate-500 mt-2 font-medium">Automatic refills and deliveries scheduled for you.</p>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-green-600" />
            <p className="font-bold uppercase tracking-widest text-xs">Loading Subscriptions...</p>
          </div>
        ) : subs.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-16 rounded-[4rem] text-center bg-white/40 border-dashed border-2 border-slate-200"
          >
             <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                <RefreshCcw className="w-10 h-10 text-green-600" />
             </div>
             <h3 className="text-3xl font-black text-slate-900 mb-4">No Active Subscriptions</h3>
             <p className="text-slate-600 mb-10 font-medium max-w-sm mx-auto">Set up automatic refills for your regular medicines and never run out of stock.</p>
             <Link href="/shop" className="px-10 py-5 bg-slate-900 text-white rounded-[2rem] font-black inline-flex items-center gap-3 hover:bg-green-600 transition-all shadow-xl shadow-slate-200">
               Go to Shop <ArrowRight className="w-5 h-5" />
             </Link>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {subs.map((sub, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="glass-card p-10 rounded-[3rem] group hover:green-glow transition-all"
              >
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-20 h-20 bg-green-100 rounded-3xl flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                    <Pill className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">{sub.medicine_name}</h3>
                    <span className="text-xs font-bold uppercase tracking-widest text-green-600 bg-green-50 px-3 py-1 rounded-full mt-2 inline-block">Active Refill</span>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                   <div className="flex items-center justify-between text-slate-500 font-medium">
                      <span className="flex items-center gap-2"><RefreshCcw className="w-4 h-4" /> Frequency</span>
                      <span className="text-slate-900 font-bold">Every {sub.frequency_days} Days</span>
                   </div>
                   <div className="flex items-center justify-between text-slate-500 font-medium">
                      <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Next Delivery</span>
                      <span className="text-slate-900 font-bold">{new Date(sub.next_refill_date).toLocaleDateString()}</span>
                   </div>
                </div>

                <div className="flex gap-4">
                  <button className="flex-1 py-4 bg-slate-100 text-slate-900 rounded-2xl font-bold hover:bg-red-50 hover:text-red-600 transition-all">Pause</button>
                  <button className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-green-600 transition-all">Update Plan</button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
