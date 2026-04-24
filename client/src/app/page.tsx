'use client';
import { useState, useEffect, useRef } from 'react';
import { 
  Search, ShoppingBag, Bell, Activity, ArrowRight, ShieldCheck, 
  Truck, Zap, Plus, Heart, HeartPulse, Dna, Microscope, Stethoscope 
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import axios from 'axios';
import { API_URL } from '@/config';

const FloatingIcon = ({ icon: Icon, delay, x, y, size = 24 }: any) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ 
      opacity: [0.4, 0.8, 0.4],
      y: [y, y - 20, y],
      x: [x, x + 10, x],
      rotate: [0, 10, 0]
    }}
    transition={{ duration: 5, delay, repeat: Infinity, ease: "easeInOut" }}
    className="absolute text-green-500/20"
    style={{ left: x, top: y }}
  >
    <Icon size={size} />
  </motion.div>
);

export default function Home() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 200]);

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/medicines`);
        setMedicines(res.data.slice(0, 8));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMedicines();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#FDFDFF] overflow-x-hidden selection:bg-green-100 selection:text-green-900">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <FloatingIcon icon={HeartPulse} delay={0} x="10%" y="20%" size={120} />
        <FloatingIcon icon={Dna} delay={2} x="85%" y="15%" size={150} />
        <FloatingIcon icon={Microscope} delay={4} x="75%" y="70%" size={100} />
        <FloatingIcon icon={Stethoscope} delay={1} x="5%" y="80%" size={80} />
        <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-green-400/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-blue-400/5 rounded-full blur-[120px]"></div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-8 pb-12 px-6">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <motion.div 
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-[1.2] space-y-8"
            >

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white shadow-xl shadow-green-100/50 border border-green-50"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                <span className="text-green-700 text-xs font-black tracking-widest uppercase">Live Pharmacy Network</span>
              </motion.div>
              
              <h1 className="text-[5.5rem] lg:text-[8.5rem] font-black text-slate-900 leading-[0.8] tracking-tighter">
                Smart <br />
                <span className="bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">Wellness.</span>
              </h1>
              
              <p className="text-2xl text-slate-500 font-medium max-w-2xl leading-relaxed">
                The pulse of modern healthcare. AI-powered tracking, instant prescriptions, and 2-hour delivery across India.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-8 pt-4">
                <Link href="/shop" className="group relative px-12 py-7 bg-slate-900 text-white rounded-[2.5rem] font-black text-xl overflow-hidden shadow-2xl shadow-slate-200 transition-all hover:scale-105 active:scale-95">
                  <div className="absolute inset-0 bg-green-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                  <span className="relative z-10 flex items-center gap-4">Start Shopping <ArrowRight className="w-7 h-7" /></span>
                </Link>
                <div className="flex items-center gap-5">
                   <div className="flex -space-x-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="w-14 h-14 rounded-full border-4 border-white bg-slate-200 shadow-xl relative overflow-hidden">
                          <img src={`https://i.pravatar.cc/150?u=${i+10}`} alt="user" />
                        </div>
                      ))}
                   </div>
                   <div>
                      <p className="text-slate-900 font-black text-lg leading-none">12,400+</p>
                      <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Users Online</p>
                   </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              style={{ y: y1 }}
              initial={{ opacity: 0, scale: 0.8, rotateY: 30 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              className="flex-1 relative perspective-2000"
            >
              <div className="relative w-full aspect-[4/5] rounded-[5rem] bg-gradient-to-br from-white to-green-50 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] border-8 border-white overflow-hidden group">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                
                {/* 3D Floating Pill Container */}
                <motion.div 
                  animate={{ 
                    y: [0, -30, 0],
                    rotateZ: [0, 5, 0]
                  }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                   <div className="relative">
                      <div className="text-[14rem] filter drop-shadow-[0_35px_35px_rgba(0,0,0,0.25)]">💊</div>
                      <motion.div 
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-green-400 rounded-full blur-[80px] -z-10"
                      ></motion.div>
                   </div>
                </motion.div>

                {/* Live Stats Overlay */}
                <div className="absolute bottom-12 left-12 right-12 space-y-4">
                   <div className="glass-card p-6 rounded-3xl flex items-center gap-5 border border-white/50 shadow-2xl backdrop-blur-xl">
                      <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
                         <HeartPulse className="w-7 h-7 text-white" />
                      </div>
                      <div>
                         <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Live Heart Rate</p>
                         <p className="text-xl font-black text-slate-900 tracking-tighter">72 BPM</p>
                      </div>
                   </div>
                </div>
              </div>

              {/* Orbital Elements */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-20 border-2 border-dashed border-green-200/50 rounded-full pointer-events-none"
              >
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-green-500 rounded-full shadow-2xl shadow-green-400"></div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features with Scroll Parallax */}
      <section className="py-20 px-6 relative z-10 bg-slate-900 rounded-[6rem] -mt-20 text-white overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,#22c55e20,transparent)]"></div>
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12">
            {[
              { icon: Zap, title: 'Speed', val: '2Hr', sub: 'FASTEST DELIVERY' },
              { icon: ShieldCheck, title: 'Quality', val: '100%', sub: 'VERIFIED MEDS' },
              { icon: Activity, title: 'Smart', val: 'AI', sub: 'DOSAGE TRACKING' },
              { icon: Heart, title: 'Care', val: '24/7', sub: 'EXPERT SUPPORT' }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="text-center group"
              >
                <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-white/10 group-hover:bg-green-600 group-hover:border-green-500 transition-all duration-500 group-hover:-translate-y-4">
                  <feature.icon className="w-10 h-10 text-green-500 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-5xl font-black mb-2 tracking-tighter">{feature.val}</h3>
                <p className="text-green-500 text-[10px] font-black uppercase tracking-widest">{feature.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic Products Slider Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <header className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <div className="text-green-600 font-black text-sm uppercase tracking-[0.3em] mb-4">Trending Now</div>
              <h2 className="text-5xl font-black text-slate-900 tracking-tighter">Your Health <br/><span className="text-green-600 underline decoration-green-100 underline-offset-8">Essentials.</span></h2>
            </div>
            <Link href="/shop" className="px-10 py-5 bg-white border border-slate-100 rounded-full font-black flex items-center gap-4 hover:shadow-2xl transition-all shadow-xl shadow-slate-100/50">
              EXPLORE PHARMACY <ArrowRight className="w-5 h-5 text-green-600" />
            </Link>
          </header>

          <div className="grid md:grid-cols-4 gap-8">
            {loading ? (
              [1, 2, 3].map(i => <div key={i} className="h-[500px] bg-slate-100 rounded-[4rem] animate-pulse"></div>)
            ) : (
              medicines.map((med: any, i: number) => (
                <motion.div 
                  key={med.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -20 }}
                  className="bg-white p-6 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-100/30 relative group"
                >
                  <div className="w-full aspect-square bg-slate-50 rounded-[2.5rem] mb-8 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform duration-500 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    💊
                  </div>
                  <div className="space-y-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-green-600 bg-green-50 px-4 py-2 rounded-full">{med.category}</span>
                    <h3 className="text-xl font-black text-slate-900 leading-tight">{med.name}</h3>
                    <div className="flex justify-between items-center pt-6">
                      <span className="text-xl font-black text-slate-900 tracking-tighter">₹{med.price.toFixed(2)}</span>
                      <button className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-green-600 transition-all shadow-lg">
                        <Plus className="w-8 h-8" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Live Health Banner */}
      <section className="py-20 bg-green-600 overflow-hidden whitespace-nowrap relative">
         <motion.div 
            animate={{ x: [0, -1000] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="flex gap-20 text-white text-4xl font-black uppercase tracking-tighter italic opacity-30"
         >
            <span>• SMART REMINDERS • INSTANT REFILLS • 24/7 SUPPORT • PREMIUM HEALTHCARE • DIGITAL PHARMACY • SMART REMINDERS • INSTANT REFILLS • 24/7 SUPPORT • PREMIUM HEALTHCARE • DIGITAL PHARMACY </span>
         </motion.div>
      </section>

      {/* Footer / CTA */}
      <footer className="py-40 px-6 bg-white text-center">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="w-24 h-24 bg-green-600 text-white rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-green-200">
            <HeartPulse className="w-12 h-12" />
          </div>
          <h2 className="text-6xl font-black text-slate-900 tracking-tighter leading-none">The Future of Health <br/> is <span className="text-green-600 underline underline-offset-[12px]">Now.</span></h2>
          <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">Join the movement. Transform your medication management into a seamless, high-performance experience.</p>
          <div className="pt-8 flex justify-center gap-8">
            <Link href="/signup" className="px-16 py-7 bg-slate-900 text-white rounded-[3rem] font-black text-xl hover:bg-green-600 transition-all shadow-2xl">
              GET STARTED FREE
            </Link>
          </div>
          <div className="pt-20 text-slate-400 font-black text-xs uppercase tracking-[0.5em]">
            © 2026 MEDSREMIND AI • BENGALURU, INDIA
          </div>
        </div>
      </footer>
    </div>
  );
}
