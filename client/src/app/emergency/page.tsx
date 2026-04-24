'use client';
import { useState } from 'react';
import { ShieldAlert, Phone, MapPin, Zap, Clock, AlertCircle, ArrowRight, Ambulance, HeartPulse, LifeBuoy, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

import axios from 'axios';
import { API_URL } from '@/config';

export default function Emergency() {
  const [sosActive, setSosActive] = useState(false);
  const router = useRouter();

  const helplines = [
    { name: 'National Medical Hotline', number: '102', desc: 'General medical emergencies' },
    { name: 'Ambulance Service', number: '108', desc: 'Immediate trauma support' },
    { name: 'Poison Control', number: '1800-222-1222', desc: 'Ingestion of toxic substances' },
    { name: 'Women Helpline', number: '1091', desc: 'Safety and medical assistance' },
    { name: 'MedsRemind Priority', number: '1800-MEDS-SOS', desc: 'Priority order support' }
  ];

  const activateSOS = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_URL}/api/orders`, {
        items: [{ id: 1, name: 'Emergency Kit', quantity: 1, price: 199 }], // Mock item
        total_amount: 199,
        address: 'Current Location (GPS)',
        is_emergency: true
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSosActive(true);
      alert('EMERGENCY ORDER PLACED! Priority drone/bike dispatched. Arriving in 10 mins.');
    } catch (err) {
      console.error(err);
      alert('Failed to place emergency order');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-6 px-6 pb-20">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-16">
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-red-600 text-white text-sm font-black mb-6 animate-pulse">
            <ShieldAlert className="w-4 h-4" /> EMERGENCY CENTER
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-4">Immediate <span className="text-red-600">Assistance</span></h1>
          <p className="text-slate-500 font-medium max-w-2xl mx-auto">Access local helplines, activate priority delivery, or contact our medical team instantly.</p>
        </header>

        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          {/* Priority SOS Mode */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`p-10 md:p-14 rounded-[4rem] border-4 transition-all relative overflow-hidden ${sosActive ? 'bg-red-600 border-red-200 text-white shadow-2xl shadow-red-200' : 'bg-white border-slate-100 shadow-xl shadow-slate-100'}`}
          >
             <div className="relative z-10">
                <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl transition-all ${sosActive ? 'bg-white text-red-600' : 'bg-red-600 text-white'}`}>
                   <Zap className="w-10 h-10" />
                </div>
                <h2 className="text-4xl font-black mb-4">Emergency <span className={sosActive ? 'text-red-200' : 'text-red-600'}>SOS Mode</span></h2>
                <p className={`font-medium mb-10 text-lg leading-relaxed ${sosActive ? 'text-red-100' : 'text-slate-500'}`}>
                  Activate this mode to prioritize your order. Our nearest partner pharmacy will dispatch your medication within **10-15 minutes**.
                </p>
                
                <button 
                  onClick={() => sosActive ? setSosActive(false) : activateSOS()}
                  className={`w-full py-6 rounded-[2.5rem] font-black text-xl transition-all shadow-2xl flex items-center justify-center gap-4 ${sosActive ? 'bg-white text-red-600 hover:bg-slate-50' : 'bg-red-600 text-white hover:bg-red-700 shadow-red-200'}`}
                >
                  {sosActive ? 'DEACTIVATE SOS' : 'ACTIVATE SOS NOW'}
                  <ShieldAlert className="w-6 h-6" />
                </button>
             </div>
             {sosActive && (
               <motion.div 
                 animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
                 transition={{ repeat: Infinity, duration: 2 }}
                 className="absolute inset-0 bg-white rounded-full blur-3xl"
               ></motion.div>
             )}
          </motion.div>

          {/* Quick Helplines */}
          <div className="space-y-6">
            <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
               <Phone className="w-7 h-7 text-red-600" /> Local Medical Helplines
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-1 gap-4">
               {helplines.map((h, i) => (
                 <motion.div 
                   key={i}
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: i * 0.1 }}
                   className="bg-white p-6 rounded-3xl border border-slate-100 shadow-lg shadow-slate-100/50 flex items-center justify-between group hover:border-red-200 transition-all"
                 >
                    <div className="flex items-center gap-5">
                       <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center font-black group-hover:bg-red-600 group-hover:text-white transition-colors">
                          <Phone className="w-5 h-5" />
                       </div>
                       <div>
                          <p className="font-black text-slate-900">{h.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{h.desc}</p>
                       </div>
                    </div>
                    <a href={`tel:${h.number}`} className="text-xl font-black text-red-600 hover:underline">{h.number}</a>
                 </motion.div>
               ))}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
           {[
             { icon: Ambulance, title: 'Ambulance Support', desc: 'Real-time tracking of nearest medical transport.', color: 'text-blue-600 bg-blue-50' },
             { icon: HeartPulse, title: 'Virtual First-Aid', desc: 'Step-by-step AI guided first-aid instructions.', color: 'text-green-600 bg-green-50' },
             { icon: LifeBuoy, title: '24/7 Consultation', desc: 'Talk to a licensed pharmacist within 2 minutes.', color: 'text-purple-600 bg-purple-50' }
           ].map((item, i) => (
             <motion.div 
               key={i}
               whileHover={{ y: -5 }}
               className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-100/50 border border-slate-50"
             >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${item.color}`}>
                   <item.icon className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-black text-slate-900 mb-2">{item.title}</h4>
                <p className="text-sm font-medium text-slate-500 leading-relaxed mb-6">{item.desc}</p>
                <button className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors flex items-center gap-2">
                   Access Feature <ArrowRight className="w-4 h-4" />
                </button>
             </motion.div>
           ))}
        </div>

        <div className="mt-20 p-12 bg-slate-900 rounded-[4rem] text-white flex flex-col md:flex-row items-center justify-between gap-10">
           <div className="flex-1">
              <h3 className="text-3xl font-black mb-4 flex items-center gap-4"><Volume2 className="w-8 h-8 text-red-500" /> Need Immediate Voice Help?</h3>
              <p className="text-slate-400 font-medium">Click below to start an instant voice call with our emergency medical team.</p>
           </div>
           <button className="px-12 py-6 bg-red-600 text-white rounded-[2rem] font-black shadow-xl shadow-red-900/50 hover:bg-red-700 transition-all flex items-center gap-3 text-lg">
              <Phone className="w-6 h-6" /> START CALL
           </button>
        </div>
      </div>
    </div>
  );
}
