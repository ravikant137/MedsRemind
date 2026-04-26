'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Phone, Menu, X, ShoppingCart, LogOut, LayoutDashboard, ShieldCheck, Bell, ChevronRight, Plus, Leaf } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import axios from 'axios';

axios.defaults.headers.common['bypass-tunnel-reminder'] = 'true';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
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
    { name: 'Home', href: '/' },
    { name: 'Medicines', href: '/shop' },
    { name: 'Upload Prescription', href: '/prescription' },
    { name: 'Categories', href: '/shop' },
    { name: 'Health Tips', href: '/about' },
    { name: 'About Us', href: '/about' },
    { name: 'Contact Us', href: '/contact' },
  ];

  if (pathname === '/login' || pathname === '/signup') return null;

  return (
    <header className="w-full sticky top-0 z-50">
      {/* 1. Green Top Bar */}
      <div className="bg-[#2e7d32] text-white py-2 text-[10px] sm:text-xs font-bold tracking-wide border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-3">
          <span>🚚 Free Delivery on Orders Above ₹499 | Fast Delivery Within 60 Minutes</span>
          <ChevronRight className="w-3 h-3" />
        </div>
      </div>

      {/* 2. Middle Main Bar (White) */}
      <div className={`bg-white border-b border-gray-100 transition-all duration-300 ${isScrolled ? 'py-2 shadow-md' : 'py-4'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          
          {/* Logo - Matching Reference Style */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center">
               <Plus className="w-10 h-10 text-[#1a237e]" strokeWidth={3} />
               <Leaf className="w-5 h-5 text-[#2e7d32] absolute -bottom-1 -right-1" fill="currentColor" />
            </div>
            <div className="leading-tight">
              <span className="text-[#1a237e] text-xl font-black tracking-tight block">ANJANEYA</span>
              <span className="text-[#2e7d32] text-lg font-black tracking-tight block -mt-1">PHARMACY</span>
              <span className="text-gray-400 text-[9px] font-medium tracking-wide">Trusted Medicines. Genuine Care.</span>
            </div>
          </Link>

          {/* Right side contact & actions */}
          <div className="hidden lg:flex items-center gap-8">
            {/* Phone */}
            <a href="tel:+919876543210" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full bg-[#f1f8e9] flex items-center justify-center border border-[#c8e6c9] group-hover:bg-[#e8f5e9] transition-colors">
                <Phone className="w-5 h-5 text-[#2e7d32]" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black text-[#1a237e]">+91 98765 43210</span>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Call Us Anytime</span>
              </div>
            </a>

            {/* WhatsApp Button */}
            <a href="https://wa.me/919876543210" target="_blank"
               className="flex items-center gap-2 bg-[#25d366] text-white px-5 py-2.5 rounded-lg text-xs font-black hover:brightness-105 transition-all shadow-lg shadow-green-500/20">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              Order on WhatsApp
            </a>

            {/* User Profile / Dashboard */}
            <div className="flex items-center gap-4 border-l border-gray-100 pl-8">
              {user ? (
                <>
                  <Link href="/notifications" className="relative p-2 text-gray-400 hover:text-[#1a237e] transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                  </Link>
                  <Link href="/dashboard" className="px-4 py-2 bg-[#1a237e] text-white text-xs font-bold rounded-lg hover:bg-[#0d144d] transition-all flex items-center gap-2 shadow-lg shadow-blue-900/20">
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Link>
                  <div className="relative">
                    <button 
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="w-10 h-10 bg-[#2e7d32] text-white rounded-full flex items-center justify-center font-black shadow-md border-2 border-white ring-1 ring-gray-100 hover:scale-105 transition-all"
                    >
                      {user.name?.[0] || 'A'}
                    </button>
                    {isProfileOpen && (
                      <div className="absolute right-0 top-full mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 z-50 animate-in fade-in zoom-in duration-200">
                        <div className="px-5 py-3 border-b border-gray-50">
                          <p className="font-black text-gray-900 text-sm">{user.name}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{user.email}</p>
                        </div>
                        {user.role === 'ADMIN' && (
                          <Link href="/admin" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-5 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors">
                            <ShieldCheck className="w-4 h-4" /> Admin Panel
                          </Link>
                        )}
                        <Link href="/orders" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-5 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                          <ShoppingCart className="w-4 h-4" /> My Orders
                        </Link>
                        <button onClick={() => { handleLogout(); setIsProfileOpen(false); }} className="w-full flex items-center gap-3 px-5 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors">
                          <LogOut className="w-4 h-4" /> Logout
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <Link href="/login" className="text-sm font-black text-[#1a237e] hover:text-[#2e7d32] transition-colors">Login</Link>
                  <Link href="/signup" className="bg-[#1a237e] text-white px-6 py-2.5 rounded-lg text-sm font-black hover:bg-black transition-all shadow-lg shadow-blue-900/20">Sign Up</Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden w-10 h-10 text-gray-600 flex items-center justify-center rounded-lg hover:bg-gray-100"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* 3. Navigation Bar (White/Light) - Centered Links */}
      <div className="bg-white border-b border-gray-100 hidden lg:block overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center gap-10 py-3.5">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-[13px] font-black tracking-tight whitespace-nowrap transition-all relative py-1 group ${
                  pathname === link.href ? 'text-[#2e7d32]' : 'text-gray-700 hover:text-[#2e7d32]'
                }`}
              >
                {link.name}
                <span className={`absolute -bottom-1 left-0 w-full h-[3px] rounded-full bg-[#2e7d32] transform transition-transform duration-300 ${
                  pathname === link.href ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                }`}></span>
              </Link>
            ))}
            {user?.role === 'ADMIN' && (
              <Link href="/admin" className="text-[13px] font-black text-yellow-600 bg-yellow-50 px-3 py-1 rounded-md hover:bg-yellow-100 transition-colors">
                Admin
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[115px] bg-white z-40 overflow-y-auto">
          <div className="px-4 py-6 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-5 py-4 text-sm font-black rounded-xl transition-colors ${
                  pathname === link.href
                    ? 'bg-[#e8f5e9] text-[#2e7d32]'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-6 mt-6 border-t border-gray-50 space-y-4">
              <a href="tel:+919876543210" className="flex items-center gap-4 px-5">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
                  <Phone className="w-5 h-5 text-[#2e7d32]" />
                </div>
                <span className="font-black text-[#1a237e]">+91 98765 43210</span>
              </a>
              <a href="https://wa.me/919876543210" target="_blank" className="block w-full text-center py-4 text-white rounded-xl font-black text-sm shadow-lg" style={{ background: '#25d366' }}>
                💬 Order on WhatsApp
              </a>
              {!user ? (
                <>
                  <Link href="/login" onClick={() => setIsMenuOpen(false)} className="block w-full text-center py-4 border-2 border-gray-100 text-[#1a237e] rounded-xl font-black text-sm">Login</Link>
                  <Link href="/signup" onClick={() => setIsMenuOpen(false)} className="block w-full text-center py-4 text-white rounded-xl font-black text-sm" style={{ background: '#1a237e' }}>Sign Up</Link>
                </>
              ) : (
                <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} className="block w-full text-center py-4 text-white rounded-xl font-black text-sm" style={{ background: '#1a237e' }}>Dashboard</Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
