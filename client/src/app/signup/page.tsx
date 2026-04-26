'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, User, Phone, MapPin, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { API_URL } from '@/config';
import Logo from '@/components/Logo';
import { useRouter } from 'next/navigation';

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_URL}/api/auth/signup`, form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Blur */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-green-200/20 rounded-full blur-[120px] -z-10"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-200/20 rounded-full blur-[120px] -z-10"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[540px] bg-white p-12 rounded-[4rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] border border-slate-100 relative"
      >
        <div className="flex flex-col items-center mb-10">
          <Logo className="w-16 h-16 mb-6" />
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Join <span className="text-green-600">Anjaneya</span>
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-3 text-center">Start your journey to better health today</p>
        </div>

        <form onSubmit={handleSignup} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Full Name</label>
            <div className="relative group">
              <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-600 w-5 h-5 transition-colors" />
              <input 
                type="text" 
                required
                className="w-full pl-16 pr-6 py-5 rounded-3xl bg-slate-50 border-none focus:ring-2 focus:ring-green-500/20 transition-all font-bold text-slate-700"
                placeholder="Ravikant"
                onChange={(e) => setForm({...form, name: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Email</label>
            <div className="relative group">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-600 w-5 h-5 transition-colors" />
              <input 
                type="email" 
                required
                className="w-full pl-16 pr-6 py-5 rounded-3xl bg-slate-50 border-none focus:ring-2 focus:ring-green-500/20 transition-all font-bold text-slate-700"
                placeholder="ravikant@example.com"
                onChange={(e) => setForm({...form, email: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Phone</label>
            <div className="relative group">
              <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-600 w-5 h-5 transition-colors" />
              <input 
                type="tel" 
                className="w-full pl-16 pr-6 py-5 rounded-3xl bg-slate-50 border-none focus:ring-2 focus:ring-green-500/20 transition-all font-bold text-slate-700"
                placeholder="+91 98765 43210"
                onChange={(e) => setForm({...form, phone: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Delivery Address</label>
            <div className="relative group">
              <MapPin className="absolute left-6 top-5 text-slate-400 group-focus-within:text-green-600 w-5 h-5 transition-colors" />
              <textarea 
                rows={2}
                className="w-full pl-16 pr-6 py-5 rounded-3xl bg-slate-50 border-none focus:ring-2 focus:ring-green-500/20 transition-all font-bold text-slate-700 resize-none"
                placeholder="123 Health St, Med City"
                onChange={(e) => setForm({...form, address: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Secure Password</label>
            <div className="relative group">
              <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-600 w-5 h-5 transition-colors" />
              <input 
                type="password" 
                required
                className="w-full pl-16 pr-6 py-5 rounded-3xl bg-slate-50 border-none focus:ring-2 focus:ring-green-500/20 transition-all font-bold text-slate-700"
                placeholder="••••••••"
                onChange={(e) => setForm({...form, password: e.target.value})}
              />
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="md:col-span-2 text-red-500 text-xs font-black text-center bg-red-50 py-4 rounded-2xl border border-red-100"
            >
              {error}
            </motion.div>
          )}

          <motion.button 
            whileHover={{ y: -4, shadow: '0 20px 40px -12px rgba(22,163,74,0.3)' }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            className="md:col-span-2 bg-green-600 text-white py-5 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 shadow-xl shadow-green-100 transition-all disabled:opacity-50 mt-4"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Create Account <ArrowRight className="w-6 h-6" /></>}
          </motion.button>
        </form>

        <div className="mt-10 text-center space-y-6">
          <p className="text-slate-500 font-bold text-sm">
            Already a member? <Link href="/login" className="text-green-600 font-black hover:underline ml-1">Sign In</Link>
          </p>
          <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-300">
            <ShieldCheck className="w-4 h-4" /> Professional Medical Privacy
          </div>
        </div>
      </motion.div>
    </div>
  );
}

