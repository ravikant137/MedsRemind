'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Phone, Menu, X, ShoppingCart, User, LogOut, ChevronDown, LayoutDashboard, ShieldCheck, Bell } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import axios from 'axios';

// Bypass localtunnel anti-phishing screen for all API requests
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
    { name: 'About Us', href: '/about' },
    { name: 'Contact Us', href: '/contact' },
  ];

  if (pathname === '/login' || pathname === '/signup') return null;

  return (
    <>
      {/* Top Green Announcement Bar */}
      <div className="top-bar text-white text-center py-2 text-xs sm:text-sm font-medium relative z-50">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-2">
          <span>🚚</span>
          <span>Free Delivery on Orders Above ₹499 | Fast Delivery Within 60 Minutes</span>
          <span>🚚</span>
        </div>
      </div>

      {/* Main Navy Blue Navbar */}
      <nav className={`nav-blue sticky top-0 z-50 transition-shadow ${isScrolled ? 'shadow-lg' : ''}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <span className="text-white text-xl font-black">M</span>
              </div>
              <div className="leading-tight">
                <span className="text-white text-xl font-black tracking-tight block">
                  MEDS<span className="text-green-400">REMIND</span>
                </span>
                <span className="text-blue-200 text-[10px] font-medium tracking-wide">Trusted Medicines. Genuine Care.</span>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors ${
                    pathname === link.href 
                      ? 'text-green-400 bg-white/10' 
                      : 'text-blue-100 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              {user?.role === 'ADMIN' && (
                <Link href="/admin" className="px-3 py-2 text-sm font-bold text-yellow-400 hover:bg-white/10 rounded-md transition-colors">
                  Admin
                </Link>
              )}
            </div>

            {/* Right side — phone + actions */}
            <div className="hidden lg:flex items-center gap-4">
              <a href="tel:+919876543210" className="flex items-center gap-2 text-white text-sm font-semibold">
                <Phone className="w-4 h-4 text-green-400" />
                +91 98765 43210
              </a>

              {user ? (
                <div className="flex items-center gap-3">
                  <Link href="/notifications" className="relative p-2 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  </Link>
                  <Link href="/dashboard" className="px-4 py-2 bg-white/10 text-white text-sm font-bold rounded-lg hover:bg-white/20 transition-all flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Link>
                  <div className="relative">
                    <button 
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="w-9 h-9 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm hover:bg-green-600 transition-all"
                    >
                      {user.name?.[0] || 'U'}
                    </button>
                    {isProfileOpen && (
                      <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="font-bold text-gray-900 text-sm">{user.name}</p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                        {user.role === 'ADMIN' && (
                          <Link href="/admin" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors">
                            <ShieldCheck className="w-4 h-4" /> Admin Panel
                          </Link>
                        )}
                        <Link href="/orders" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                          <ShoppingCart className="w-4 h-4" /> My Orders
                        </Link>
                        <Link href="/dashboard" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                          <LayoutDashboard className="w-4 h-4" /> Dashboard
                        </Link>
                        <button onClick={() => { handleLogout(); setIsProfileOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors">
                          <LogOut className="w-4 h-4" /> Logout
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link href="/login" className="text-sm font-semibold text-blue-200 hover:text-white transition-colors">Login</Link>
                  <Link href="/signup" className="btn-green text-sm px-5 py-2.5 rounded-lg">Sign Up</Link>
                </div>
              )}

              <a 
                href="https://wa.me/919876543210" 
                target="_blank"
                className="btn-whatsapp text-sm px-4 py-2.5 rounded-lg flex items-center gap-2"
              >
                💬 Order on WhatsApp
              </a>
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden w-10 h-10 text-white flex items-center justify-center rounded-lg hover:bg-white/10"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[106px] bg-white z-40 overflow-y-auto">
          <div className="px-4 py-6 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-3 text-base font-semibold text-gray-800 hover:bg-green-50 hover:text-green-700 rounded-lg transition-colors"
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4 border-t border-gray-100 space-y-3">
              {!user ? (
                <>
                  <Link href="/login" onClick={() => setIsMenuOpen(false)} className="block w-full text-center py-3 border-2 border-gray-200 text-gray-700 rounded-lg font-bold">Login</Link>
                  <Link href="/signup" onClick={() => setIsMenuOpen(false)} className="block w-full text-center py-3 bg-green-600 text-white rounded-lg font-bold">Sign Up</Link>
                </>
              ) : (
                <>
                  <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} className="block w-full text-center py-3 bg-blue-900 text-white rounded-lg font-bold">Dashboard</Link>
                  <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="w-full py-3 text-center bg-red-50 text-red-600 rounded-lg font-bold">Logout</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
