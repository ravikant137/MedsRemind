'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Pill, User, ShoppingCart, LogOut, Menu, X, Bell, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();

  if (pathname.startsWith('/admin')) return null;

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
    <nav className="fixed top-0 left-0 right-0 z-50 py-4">
      <div className="max-w-7xl mx-auto px-6">
        <div className="relative flex items-center justify-between p-4 rounded-[2.5rem] bg-white shadow-xl shadow-slate-100 border border-slate-50">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group px-2">
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center shadow-2xl shadow-green-200 group-hover:rotate-12 transition-transform">
              <Pill className="text-white w-7 h-7" />
            </div>
            <span className={`text-2xl font-black tracking-tighter uppercase transition-colors ${isScrolled ? 'text-slate-900' : 'text-slate-900'}`}>
              Meds<span className="text-green-600">Remind</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href}
                className={`text-sm font-black uppercase tracking-widest hover:text-green-600 transition-colors ${pathname === link.href ? 'text-green-600' : 'text-slate-500'}`}
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
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <Link href="/dashboard" className="hidden md:flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-600 transition-all shadow-xl shadow-slate-200">
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
                <div className="relative">
                   <button 
                     onClick={() => setIsProfileOpen(!isProfileOpen)}
                     className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all ${isProfileOpen ? 'bg-green-600 text-white border-green-600' : 'bg-green-50 text-green-600 border-green-100 hover:bg-green-100'}`}
                   >
                      <User className="w-6 h-6" />
                   </button>
                   
                   <AnimatePresence>
                     {isProfileOpen && (
                       <motion.div 
                         initial={{ opacity: 0, y: 10, scale: 0.95 }}
                         animate={{ opacity: 1, y: 0, scale: 1 }}
                         exit={{ opacity: 0, y: 10, scale: 0.95 }}
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
                <Link href="/login" className="text-sm font-black uppercase tracking-widest text-slate-500 hover:text-green-600">Login</Link>
                <Link href="/signup" className="px-8 py-4 bg-green-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-700 transition-all shadow-xl shadow-green-200">Join Now</Link>
              </div>
            )}
            
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden w-12 h-12 bg-slate-100 text-slate-900 rounded-xl flex items-center justify-center"
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
