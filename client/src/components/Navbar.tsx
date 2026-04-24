'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Pill, User, ShoppingCart, LogOut, Menu, X, Bell, LayoutDashboard, ShieldCheck, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import axios from 'axios';

// Bypass localtunnel anti-phishing screen for all API requests
axios.defaults.headers.common['bypass-tunnel-reminder'] = 'true';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);



  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  const navLinks = [
    { name: 'Shop', href: '/shop' },
    { name: 'Scan RX', href: '/prescription' },
    { name: 'Reminders', href: '/reminders' },
    { name: 'Track', href: '/track' },
    { name: 'Discounts', href: '/discounts' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 py-1">
      <div className="max-w-7xl mx-auto px-4">
          <div className={`relative flex items-center justify-between px-5 py-1.5 rounded-2xl glass-card bg-gradient-to-r from-primary to-secondary ${isScrolled ? 'bg-opacity-70' : 'bg-opacity-30'} backdrop-blur-lg shadow-xl`}>
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-500 rounded-lg flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                <Pill className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-black tracking-tighter uppercase text-slate-900">
                Meds<span className="text-green-600">Remind</span>
              </span>
            </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-3">
            {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-[10px] font-black uppercase tracking-widest transition-colors whitespace-nowrap border-b-2 ${pathname === link.href ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-primary'}`}
                >
                  {link.name}
                </Link>
            ))}
            {user?.role === 'ADMIN' && (
              <Link 
                href="/admin"
                className={`text-sm font-black uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors ${pathname === '/admin' ? 'underline' : ''}`}
              >
                Admin Panel
              </Link>
            )}
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-2.5">
            <Link href="/notifications" className="p-2 bg-slate-50 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all relative">
               <Bell className="w-5 h-5" />
               <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
            </Link>
            
            <Link href="/emergency" className="hidden md:flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:from-red-600 hover:to-pink-600 transform hover:scale-105 transition-all shadow-lg">
               <ShieldAlert className="w-3.5 h-3.5" /> Emergency
            </Link>

            {user ? (
              <div className="flex items-center gap-3">
                <Link href="/dashboard" className="hidden md:flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-green-600 transition-all shadow-lg">
                  <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
                </Link>
                <div className="relative">
                   <button 
                     onClick={() => setIsProfileOpen(!isProfileOpen)}
                     className={`w-9 h-9 rounded-lg flex items-center justify-center border transition-all ${isProfileOpen ? 'bg-green-600 text-white border-green-600' : 'bg-green-50 text-green-600 border-green-100 hover:bg-green-100'}`}
                   >
                      <User className="w-4 h-4" />
                   </button>
                   
                   <AnimatePresence>
                     {isProfileOpen && (
                       <motion.div 
                         initial={{ opacity: 0, y: 10, scale: 0.95 }}
                         animate={{ opacity: 1, y: 0, scale: 1 }}
                         exit={{ opacity: 0, y: 10, scale: 0.95 }}
                         onClick={(e) => e.stopPropagation()}
                         className="absolute right-0 top-full mt-4 w-72 bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100 p-8 z-50"
                       >
                          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-50">
                             <div className="w-12 h-12 bg-green-600 text-white rounded-xl flex items-center justify-center font-black text-xl">
                                {user.name[0]}
                             </div>
                             <div className="truncate">
                                <p className="font-black text-slate-900 truncate">{user.name}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Premium Member</p>
                             </div>
                          </div>
                          <div className="space-y-2">
                            {user.role === 'ADMIN' && (
                              <Link href="/admin" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 p-3 bg-red-50 hover:bg-red-100 rounded-xl transition-all font-bold text-red-600">
                                 <ShieldCheck className="w-5 h-5" /> Admin Panel
                              </Link>
                            )}
                            <Link href="/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-all font-bold text-slate-600 hover:text-green-600">
                               <User className="w-5 h-5" /> My Profile
                            </Link>
                            <Link href="/orders" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-all font-bold text-slate-600 hover:text-green-600">
                               <ShoppingCart className="w-5 h-5" /> My Orders
                            </Link>
                            <Link href="/dashboard" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-all font-bold text-slate-600 hover:text-green-600">
                               <LayoutDashboard className="w-5 h-5" /> Dashboard
                            </Link>
                            <button 
                              onClick={() => { handleLogout(); setIsProfileOpen(false); }}
                              className="w-full flex items-center gap-3 p-3 hover:bg-red-50 rounded-xl transition-all font-bold text-red-500"
                            >
                               <LogOut className="w-5 h-5" /> Logout
                            </button>
                          </div>
                       </motion.div>
                     )}
                   </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/login" className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-green-600">Login</Link>
                <Link href="/signup" className="px-5 py-2.5 bg-green-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-green-700 transition-all shadow-lg">Join Now</Link>
              </div>
            )}
            
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden w-9 h-9 bg-slate-100 text-slate-900 rounded-lg flex items-center justify-center"
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden fixed inset-x-6 top-28 bg-white rounded-[3rem] shadow-2xl border border-slate-100 p-10 z-40"
          >
            <div className="flex flex-col gap-6">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-2xl font-black text-slate-900 hover:text-green-600 transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-6 border-t border-slate-50 flex flex-col gap-4">
                {!user ? (
                   <>
                    <Link href="/login" onClick={() => setIsMenuOpen(false)} className="w-full py-5 text-center font-black text-slate-400">Login</Link>
                    <Link href="/signup" onClick={() => setIsMenuOpen(false)} className="w-full py-5 bg-green-600 text-white rounded-2xl font-black text-center shadow-xl shadow-green-200">Get Started</Link>
                   </>
                ) : (
                  <button onClick={handleLogout} className="w-full py-5 bg-red-50 text-red-600 rounded-2xl font-black">Logout</button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
