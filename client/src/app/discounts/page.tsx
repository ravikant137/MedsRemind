'use client';
import { useState, useEffect } from 'react';
import { Ticket, Percent, Zap, Gift, ArrowRight, Sparkles, ShoppingBag, Clock, RefreshCcw, Award, ShieldCheck, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import axios from 'axios';
import { API_URL } from '@/config';

export default function Discounts() {
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPoints();
  }, []);

  const fetchPoints = async () => {
    try {
      const token = localStorage.getItem('token`);
      const res = await axios.get(`${API_URL}/api/user/points`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPoints(res.data.points);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const redeemCoupon = (pts: number, code: string) => {
    if (points < pts) {
      alert(`You need ${pts - points} more points to redeem this! Keep taking your meds! 💪`);
      return;
    }
    // Mock redemption logic
    setPoints(prev => prev - pts);
    alert(`Success! Coupon ${code} has been added to your account. Your new balance: ${points - pts} pts.`);
  };

  const offers = [
    { 
      id: 1, 
      title: "Medication Adherence Bonus", 
      code: "TAKEN100", 
      discount: "₹100 OFF", 
      desc: "Reward for consistent medicine intake. Use on any order.",
      color: "from-green-400 to-green-600",
      icon: Sparkles,
      pointsRequired: 50
    },
    { 
      id: 2, 
      title: "Gold Health Voucher", 
      code: "GOLD500", 
      discount: "₹500 OFF", 
      desc: "Premium reward for our most consistent patients.",
      color: "from-blue-400 to-blue-600",
      icon: Award,
      pointsRequired: 200
    },
    { 
      id: 3, 
      title: "Refill Specialist", 
      code: "REFILLFREE", 
      discount: "FREE SHIP", 
      desc: "Redeem for free express delivery on your next refill.",
      color: "from-purple-400 to-purple-600",
      icon: RefreshCcw,
      pointsRequired: 30
    }
  ];

  const flashDeals = [
    { name: 'Omega 3 Fish Oil', original: 250.00, discounted: 150.00, time: '02:45:12', img: '🐟' },
    { name: 'Multivitamin Pack', original: 400.00, discounted: 280.00, time: '01:20:05', img: '💊' },
    { name: 'Aloe Vera Gel', original: 150.00, discounted: 90.00, time: '05:10:45', img: '🌿' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-6 px-6 pb-20 overflow-hidden relative">
      {/* Decorative Blur */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-200/40 rounded-full blur-[150px] -z-10 animate-pulse"></div>
      
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-20 relative">
          <div className="flex justify-center mb-10">
             <div className="px-10 py-6 bg-slate-900 rounded-[3rem] text-white flex items-center gap-6 shadow-2xl shadow-slate-300">
                <div className="w-14 h-14 bg-green-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-green-500/20">
                   <Award className="w-8 h-8" />
                </div>
                <div className="text-left">
                   <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Your Reward Balance</p>
                   <p className="text-4xl font-black">{points} <span className="text-lg text-green-500 font-medium">PTS</span></p>
                </div>
             </div>
          </div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-green-600 text-white text-sm font-black mb-8 shadow-2xl shadow-green-200"
          >
            <Percent className="w-4 h-4" /> EXCLUSIVE DEALS
          </motion.div>
          <h1 className="text-6xl lg:text-8xl font-black text-slate-900 tracking-tighter leading-[0.8] mb-6">
            Save Big, <br/>
            <span className="text-green-600">Live Better.</span>
          </h1>
          <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
            Unlock premium health at half the price. Browse our latest offers and redeem your adherence points.
          </p>
        </header>

        {/* Coupon Grid */}
        <div className="grid md:grid-cols-3 gap-10 mb-32">
          {offers.map((offer, i) => (
            <motion.div 
              key={offer.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -10, rotateZ: i % 2 === 0 ? 1 : -1 }}
              className={`p-10 rounded-[3.5rem] bg-gradient-to-br ${offer.color} text-white shadow-2xl shadow-slate-200 relative overflow-hidden group`}
            >
               <div className="relative z-10">
                  <offer.icon className="w-12 h-12 mb-8 opacity-80 group-hover:scale-110 transition-transform" />
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold opacity-80">{offer.title}</h3>
                    <div className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest">
                      {offer.pointsRequired} PTS
                    </div>
                  </div>
                  <div className="text-5xl font-black mb-6 tracking-tighter">{offer.discount}</div>
                  <p className="text-sm font-medium mb-8 opacity-70 leading-relaxed">{offer.desc}</p>
                  
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-2xl font-black text-lg border border-white/20 flex-1 text-center">
                      {offer.code}
                    </div>
                    <button 
                      onClick={() => redeemCoupon(offer.pointsRequired, offer.code)}
                      className="p-5 bg-white text-slate-900 rounded-2xl hover:bg-green-100 transition-all shadow-xl font-black text-xs uppercase tracking-widest"
                    >
                      Redeem
                    </button>
                  </div>
               </div>
               
               <div className="absolute top-1/2 -left-4 w-8 h-8 bg-slate-50 rounded-full -translate-y-1/2"></div>
               <div className="absolute top-1/2 -right-4 w-8 h-8 bg-slate-50 rounded-full -translate-y-1/2"></div>
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -z-0"></div>
            </motion.div>
          ))}
        </div>

        {/* Flash Deals Section */}
        <section className="bg-white rounded-[5rem] p-16 shadow-2xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 animate-pulse"></div>
           
           <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
              <div>
                 <div className="flex items-center gap-3 text-orange-600 font-black mb-2 uppercase tracking-widest text-sm">
                    <Zap className="w-5 h-5" /> Flash Deals
                 </div>
                 <h2 className="text-4xl font-black text-slate-900 tracking-tight">Ends in <span className="text-orange-600 font-mono">02:45:12</span></h2>
              </div>
              <Link href="/shop" className="px-10 py-5 bg-slate-900 text-white rounded-[2rem] font-black flex items-center gap-3 hover:bg-green-600 transition-all">
                Shop the Sale <ArrowRight className="w-5 h-5" />
              </Link>
           </div>

           <div className="grid md:grid-cols-3 gap-10">
              {flashDeals.map((deal, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ y: -10 }}
                  className="glass-card p-8 rounded-[3rem] border border-slate-50 group hover:shadow-2xl transition-all"
                >
                   <div className="relative w-full h-48 bg-slate-50 rounded-[2.5rem] mb-6 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform">
                      {deal.img}
                      <div className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full animate-bounce">
                        SAVE ₹{(deal.original - deal.discounted).toFixed(2)}
                      </div>
                   </div>
                   <h3 className="text-xl font-bold text-slate-800 mb-2">{deal.name}</h3>
                   <div className="flex items-center gap-4 mb-6">
                      <span className="text-3xl font-black text-slate-900">₹{deal.discounted.toFixed(2)}</span>
                      <span className="text-slate-400 line-through font-bold">₹{deal.original.toFixed(2)}</span>
                   </div>
                   <button className="w-full py-4 bg-slate-100 text-slate-900 rounded-2xl font-black hover:bg-green-600 hover:text-white transition-all flex items-center justify-center gap-2">
                     <ShoppingBag className="w-5 h-5" /> Add to Cart
                   </button>
                </motion.div>
              ))}
           </div>
        </section>

        {/* Loyalty Program Teaser */}
        <div className="mt-32 flex flex-col lg:flex-row items-center gap-20 p-10 bg-slate-900 rounded-[4rem] text-white overflow-hidden relative shadow-2xl">
           <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/10 blur-[100px] -z-0"></div>
           <div className="flex-1 space-y-8 relative z-10">
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center shadow-xl shadow-green-500/20">
                 <Gift className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-4xl font-black tracking-tight leading-tight">Join our <span className="text-green-500">Loyalty Program</span> & get permanent discounts.</h2>
              <p className="text-slate-400 font-medium text-lg leading-relaxed">Earn points for every ₹100 spent and redeem them for free medicines, priority shipping, and health consultations.</p>
              <button className="px-12 py-5 bg-green-600 text-white rounded-[2rem] font-black shadow-xl hover:bg-green-700 transition-all flex items-center gap-3">
                Join Now <ArrowRight className="w-5 h-5" />
              </button>
           </div>
           <div className="flex-1 relative">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-[400px] h-[400px] border-2 border-dashed border-white/10 rounded-full flex items-center justify-center"
              >
                <div className="w-[300px] h-[300px] border-2 border-dashed border-white/20 rounded-full flex items-center justify-center">
                   <div className="w-24 h-24 bg-green-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-green-500/50">
                      <Sparkles className="w-12 h-12" />
                   </div>
                </div>
              </motion.div>
              {/* Floating Icons */}
              <motion.div animate={{ y: [0, 20, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="absolute top-10 left-10 text-4xl">💎</motion.div>
              <motion.div animate={{ y: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 5 }} className="absolute bottom-10 right-10 text-4xl">⭐</motion.div>
           </div>
        </div>
      </div>
    </div>
  );
}
