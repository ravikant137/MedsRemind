'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { API_URL } from '@/config';
import Logo from '@/components/Logo';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [pendingUser, setPendingUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (showOtp) {
        if (otp === "123456") { // Mock verification
          localStorage.setItem('token', pendingUser.token);
          localStorage.setItem('user', JSON.stringify(pendingUser.user));
          router.push('/admin');
        } else {
          setError('Invalid OTP code. Please try again.');
        }
        return;
      }

      const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      
      if (res.data.requiresOtp) {
        setShowOtp(true);
        setPendingUser(res.data);
        return;
      }

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      if (res.data.user.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Blur */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-200/20 rounded-full blur-[120px] -z-10"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-200/20 rounded-full blur-[120px] -z-10"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[480px] bg-white p-12 rounded-[4rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] border border-slate-100 relative"
      >
        <div className="flex flex-col items-center mb-12">
          <Logo showText={true} size="lg" />
        </div>

        <form onSubmit={handleLogin} className="space-y-8">
          {!showOtp ? (
            <>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Email Address</label>
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-600 transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-16 pr-6 py-6 rounded-[2rem] bg-slate-50 border-none focus:ring-2 focus:ring-green-500/20 transition-all font-bold text-slate-700 placeholder:text-slate-300"
                    placeholder="ravikant@example.com"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Password</label>
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-600 transition-colors">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-16 pr-6 py-6 rounded-[2rem] bg-slate-50 border-none focus:ring-2 focus:ring-green-500/20 transition-all font-bold text-slate-700 placeholder:text-slate-300"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 text-center block w-full">Verification Code</label>
              <input 
                type="text" 
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                className="w-full py-8 rounded-[2.5rem] bg-slate-50 border-none focus:ring-2 focus:ring-green-500/20 transition-all font-black text-4xl text-center tracking-[1rem] text-green-600 placeholder:text-slate-200"
                placeholder="000000"
                autoFocus
              />
              <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">Demo Code: 123456</p>
            </div>
          )}

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-red-500 text-xs font-black text-center bg-red-50 py-4 rounded-2xl border border-red-100"
            >
              {error}
            </motion.div>
          )}

          <motion.button 
            whileHover={{ y: -4, shadow: '0 20px 40px -12px rgba(22,163,74,0.3)' }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            className="w-full bg-green-600 text-white py-6 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 shadow-xl shadow-green-100 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>{showOtp ? 'Verify & Access' : 'Sign In'} <ArrowRight className="w-6 h-6" /></>}
          </motion.button>

          {showOtp && (
            <button 
              type="button"
              onClick={() => setShowOtp(false)}
              className="w-full text-center text-slate-400 font-bold text-xs hover:text-slate-600 transition-colors"
            >
              Back to Login
            </button>
          )}
        </form>

        <div className="mt-12 text-center space-y-6">
          <p className="text-slate-500 font-bold text-sm">
            Don't have an account? <Link href="/signup" className="text-green-600 font-black hover:underline ml-1">Create One</Link>
          </p>
          <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-300">
            <ShieldCheck className="w-4 h-4" /> Secure SSL Encryption
          </div>
        </div>
      </motion.div>
    </div>
  );
}

