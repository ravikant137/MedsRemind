'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Pill, Mail, Lock, User, Phone, MapPin, ArrowRight, Loader2 } from 'lucide-react';
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-96 h-96 bg-green-200/30 rounded-full blur-[120px] -z-10 animate-pulse"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl bg-white/80 backdrop-blur-2xl p-10 rounded-[3rem] shadow-2xl border border-white"
      >
        <div className="flex flex-col items-center mb-8">
          <Logo className="w-20 h-20 mb-4" />
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Anjaneya <span className="text-green-600">Pharmacy</span></h1>
          <p className="text-slate-500 font-medium">Join our healthy community today</p>
        </div>

        <form onSubmit={handleSignup} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-2">Full Name</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-600 w-5 h-5" />
              <input 
                type="text" 
                required
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-100 border-none focus:ring-2 focus:ring-green-500/20 transition-all font-medium"
                placeholder="Ravikant"
                onChange={(e) => setForm({...form, name: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-2">Email</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-600 w-5 h-5" />
              <input 
                type="email" 
                required
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-100 border-none focus:ring-2 focus:ring-green-500/20 transition-all font-medium"
                placeholder="ravikant@example.com"
                onChange={(e) => setForm({...form, email: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-2">Phone</label>
            <div className="relative group">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-600 w-5 h-5" />
              <input 
                type="tel" 
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-100 border-none focus:ring-2 focus:ring-green-500/20 transition-all font-medium"
                placeholder="+1 234 567 890"
                onChange={(e) => setForm({...form, phone: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-2">Address</label>
            <div className="relative group">
              <MapPin className="absolute left-4 top-4 text-slate-400 group-focus-within:text-green-600 w-5 h-5" />
              <textarea 
                rows={2}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-100 border-none focus:ring-2 focus:ring-green-500/20 transition-all font-medium resize-none"
                placeholder="123 Health St, Med City"
                onChange={(e) => setForm({...form, address: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-2">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-600 w-5 h-5" />
              <input 
                type="password" 
                required
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-100 border-none focus:ring-2 focus:ring-green-500/20 transition-all font-medium"
                placeholder="••••••••"
                onChange={(e) => setForm({...form, password: e.target.value})}
              />
            </div>
          </div>

          {error && (
            <div className="md:col-span-2 text-red-500 text-sm font-bold text-center bg-red-50 py-3 rounded-xl border border-red-100">
              {error}
            </div>
          )}

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            className="md:col-span-2 bg-green-600 text-white py-5 rounded-[2rem] font-black flex items-center justify-center gap-3 shadow-2xl shadow-green-200 hover:bg-green-700 transition-all disabled:opacity-50 mt-4"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Create Account <ArrowRight className="w-5 h-5" /></>}
          </motion.button>
        </form>

        <p className="mt-8 text-center text-slate-500 font-medium">
          Already have an account? <Link href="/login" className="text-green-600 font-black hover:underline">Sign In</Link>
        </p>
      </motion.div>
    </div>
  );
}
