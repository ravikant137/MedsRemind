'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Phone, Menu, X, ShoppingCart, LogOut, LayoutDashboard, ShieldCheck, Bell, ChevronRight } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import axios from 'axios';
import Logo from './Logo';
import { API_URL } from '@/config';

axios.defaults.headers.common['bypass-tunnel-reminder'] = 'true';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [notifCount, setNotifCount] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    const handleRefresh = () => {
      const token = localStorage.getItem('token');
      if (token) fetchNotifCount(token);
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('notif-refresh', handleRefresh);
    
    let interval: NodeJS.Timeout;
    try {
      const userData = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (userData && userData !== 'undefined') {
        setUser(JSON.parse(userData));
        fetchNotifCount(token);
        
        // Polling for accuracy
        interval = setInterval(() => fetchNotifCount(token), 20000);
      }
    } catch (e) {
      console.error('Failed to parse user data');
    }
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('notif-refresh', handleRefresh);
      if (interval) clearInterval(interval);
    };
  }, [pathname]);

  const fetchNotifCount = async (token: string | null) => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const unread = res.data.filter((n: any) => !n.read).length;
      setNotifCount(unread);
    } catch (err) {
      console.error(err);
    }
  };

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
    <header className="w-full sticky top-0 z-50 bg-white">
      {/* 1. Green Top Bar */}
      <div className="bg-[#2e7d32] text-white py-2 text-[10px] sm:text-xs font-bold tracking-wide border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-3">
          <span>🚚 Free Delivery on Orders Above ₹499 | Fast Delivery Within 60 Minutes</span>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className={`border-b border-gray-100 transition-all duration-300 ${isScrolled ? 'py-2 shadow-md' : 'py-4'}`}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 flex items-center justify-between">
          
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <Logo showText={true} size="sm" vertical={false} />
          </Link>

          {/* Desktop Nav Links (Centered) */}
          <div className="hidden xl:flex items-center justify-center gap-6 flex-1 px-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-[14px] font-bold tracking-tight whitespace-nowrap transition-all relative py-1 group ${
                  pathname === link.href ? 'text-[#2e7d32]' : 'text-gray-700 hover:text-[#2e7d32]'
                }`}
              >
                {link.name}
                <span className={`absolute -bottom-1 left-0 w-full h-[3px] rounded-full bg-[#2e7d32] transform transition-transform duration-300 ${
                  pathname === link.href ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                }`}></span>
              </Link>
            ))}
          </div>

          {/* Right side contact & actions */}
          <div className="hidden lg:flex items-center gap-6 flex-shrink-0">
            {/* Phone */}
            <a href="tel:+919876543210" className="flex items-center gap-2 group">
              <Phone className="w-6 h-6 text-[#4CAF50]" />
              <div className="flex flex-col">
                <span className="text-[15px] font-black text-[#003366] leading-none">+91 98765 43210</span>
                <span className="text-[11px] text-gray-500 font-bold uppercase tracking-wider leading-none mt-1">Call Us Anytime</span>
              </div>
            </a>

            {/* WhatsApp Button */}
            <a href="https://wa.me/919876543210" target="_blank"
               className="flex items-center gap-2 bg-[#25d366] text-white px-5 py-3 rounded-lg text-sm font-black hover:brightness-105 transition-all shadow-lg shadow-green-500/20">
              💬 Order on WhatsApp
            </a>

            {/* User Profile / Dashboard */}
            <div className="flex items-center gap-3 border-l border-gray-200 pl-6">
              {user ? (
                <>
                  <Link 
                    href="/notifications" 
                    className="relative p-2 text-gray-400 hover:text-[#003366] transition-colors"
                    onClick={async () => {
                      try {
                        const token = localStorage.getItem('token');
                        if (token) {
                          await axios.post(`${API_URL}/api/notifications/read`, {}, {
                            headers: { Authorization: `Bearer ${token}` }
                          });
                          setNotifCount(0);
                        }
                      } catch (e) {}
                    }}
                  >
                    <Bell className="w-6 h-6" />
                    {notifCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-lg animate-bounce">
                        {notifCount}
                      </span>
                    )}
                  </Link>
                  <div className="relative">
                    <button 
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="w-10 h-10 bg-[#2e7d32] text-white rounded-full flex items-center justify-center font-black shadow-md border-2 border-white ring-1 ring-gray-100 hover:scale-105 transition-all"
                    >
                      {user.name?.[0] || 'A'}
                    </button>
                    {isProfileOpen && (
                      <div className="absolute right-0 top-full mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 z-50">
                        <div className="px-5 py-3 border-b border-gray-50">
                          <p className="font-black text-gray-900 text-sm">{user.name}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{user.email}</p>
                        </div>
                        {user.role === 'ADMIN' && (
                          <Link href="/admin" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-5 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors">
                            <ShieldCheck className="w-4 h-4" /> Admin Panel
                          </Link>
                        )}
                        {user.role !== 'ADMIN' && (
                          <Link href="/orders" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-5 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                            <ShoppingCart className="w-4 h-4" /> My Orders
                          </Link>
                        )}
                        <button onClick={() => { handleLogout(); setIsProfileOpen(false); }} className="w-full flex items-center gap-3 px-5 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors">
                          <LogOut className="w-4 h-4" /> Logout
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <Link href="/login" className="text-sm font-black text-[#003366] hover:text-[#4CAF50] transition-colors">Login</Link>
                  <Link href="/signup" className="bg-[#003366] text-white px-5 py-2.5 rounded-lg text-sm font-black hover:bg-black transition-all">Sign Up</Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Actions (Notifications & Profile) - Hidden on Desktop */}
          <div className="flex xl:hidden items-center gap-3">
            {user && (
              <>
                <Link 
                  href="/notifications" 
                  className="relative p-2 text-gray-400 hover:text-[#003366] transition-colors"
                >
                  <Bell className="w-6 h-6" />
                  {notifCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                      {notifCount}
                    </span>
                  )}
                </Link>
                <Link 
                  href="/profile" 
                  className="w-9 h-9 bg-[#2e7d32] text-white rounded-full flex items-center justify-center font-black shadow-md border-2 border-white"
                >
                  {user.name?.[0] || 'A'}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

    </header>
  );
}
