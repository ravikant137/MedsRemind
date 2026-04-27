'use client';
import { useState, useEffect } from 'react';
import { 
  Search, ShoppingCart, ArrowRight, ShieldCheck, Truck, Clock, 
  Plus, Star, Upload, CheckCircle, Package, Headphones, Lock,
  ThermometerSun, Baby, Heart, Pill, Droplets, Leaf, Shield, UserCheck, Cross
} from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import { API_URL } from '@/config';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

axios.defaults.headers.common['bypass-tunnel-reminder'] = 'true';

const categories = [
  { name: 'Fever & Pain Relief', icon: ThermometerSun, bg: '#fef2f2', color: '#ef4444' },
  { name: 'Cold & Cough', icon: Droplets, bg: '#eff6ff', color: '#3b82f6' },
  { name: 'Baby Care', icon: Baby, bg: '#fdf2f8', color: '#ec4899' },
  { name: 'Personal Care', icon: UserCheck, bg: '#f5f3ff', color: '#8b5cf6' },
  { name: 'Diabetes Care', icon: Heart, bg: '#fff7ed', color: '#f97316' },
  { name: 'BP & Heart Care', icon: Shield, bg: '#fef2f2', color: '#dc2626' },
  { name: 'Vitamins & Supplements', icon: Leaf, bg: '#f0fdf4', color: '#22c55e' },
  { name: 'First Aid & Health Care', icon: Plus, bg: '#f0fdfa', color: '#14b8a6' },
];

const testimonials = [
  { name: 'Ramesh S.', text: '"Very fast delivery and genuine medicines. Best pharmacy in our area!"', rating: 5 },
  { name: 'Priya M.', text: '"Easy to order on WhatsApp and delivery is always on time."', rating: 5 },
  { name: 'Sandeep K.', text: '"Staff is very helpful and they guide you properly."', rating: 5 },
];

const popularSearches = ['Paracetamol', 'Crocin', 'Amoxicillin', 'Calpol', 'Dolo 650', 'Vitamin D3'];

export default function Home() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      router.push('/admin');
    }
  }, [user, router]);

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
    <div className="min-h-screen overflow-x-hidden w-full relative" style={{ background: '#f5f7fa' }}>

      {/* ═══════════════════ HERO ═══════════════════ */}
      <section style={{ background: 'linear-gradient(135deg, #eef2ff 0%, #e8f5e9 30%, #ffffff 70%)' }}
               className="py-14 md:py-20 relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Left Content */}
            <div className="flex-1 space-y-5 z-10">
              <p className="text-sm font-semibold" style={{ color: '#2e7d32' }}>Your Trusted Neighborhood Pharmacy</p>
              <h1 className="text-4xl md:text-5xl lg:text-[56px] font-black leading-[1.1]" style={{ color: '#003366' }}>
                Fast & Trusted<br />
                <span style={{ color: '#4CAF50' }}>Medicines</span> Near You
              </h1>
              <p className="text-base md:text-lg max-w-lg" style={{ color: '#64748b' }}>
                Order medicines online and get delivery within 60 minutes at your doorstep.
              </p>
              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-3 pt-2">
                <Link href="/shop" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg text-sm font-bold text-white shadow-md hover:shadow-lg transition-all"
                      style={{ background: '#003366' }}>
                  <Search className="w-4 h-4" /> Search Medicines
                </Link>
                <Link href="/prescription" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg text-sm font-bold border-2 hover:text-white transition-all bg-white"
                      style={{ borderColor: '#4CAF50', color: '#2e7d32' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#4CAF50'; e.currentTarget.style.color = 'white'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#2e7d32'; }}>
                  <Upload className="w-4 h-4" /> Upload Prescription
                </Link>
                <a href="https://wa.me/919876543210" target="_blank"
                   className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg text-sm font-bold text-white shadow-md hover:shadow-lg transition-all"
                   style={{ background: '#25d366' }}>
                  💬 Order on WhatsApp
                </a>
              </div>
              {/* Trust Badges */}
              <div className="flex flex-wrap gap-8 pt-5">
                {[
                  { icon: ShieldCheck, label: 'Genuine\nMedicines', color: '#003366' },
                  { icon: Lock, label: '100%\nSafe Packaging', color: '#003366' },
                  { icon: Truck, label: 'Fast\nDelivery', color: '#003366' },
                  { icon: Star, label: 'Best Prices\nAlways', color: '#003366' },
                ].map((b, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <b.icon className="w-6 h-6" style={{ color: b.color }} />
                    <span className="text-xs font-semibold whitespace-pre-line leading-tight" style={{ color: '#003366' }}>{b.label}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Right Image Area - Animated Bag using CSS/Framer Motion */}
            <div className="flex-1 relative hidden lg:flex justify-center h-[500px] w-full perspective-[1000px]">
              <div className="relative w-full h-full flex items-center justify-center">
                
                {/* Background Glow */}
                <div className="absolute w-[400px] h-[400px] bg-green-200/50 rounded-full blur-[80px] -z-10 animate-pulse" />

                {/* The Bag Container */}
                <div className="relative w-[280px] h-[340px] translate-y-10 group z-20">
                  {/* Pills and Bottles flying out (Animated on hover) */}
                  
                  {/* Orange Bottle */}
                  <div className="absolute -top-16 left-6 w-16 h-24 bg-orange-500 rounded-lg shadow-xl -rotate-12 transition-all duration-700 group-hover:-translate-y-12 group-hover:-rotate-45 z-10">
                    <div className="absolute -top-4 left-2 w-12 h-6 bg-white rounded-t-md border-b-4 border-gray-200"></div>
                    <div className="absolute top-6 left-2 w-12 h-10 bg-white rounded text-[8px] font-bold p-1 text-center">RX<br/>MEDS</div>
                  </div>

                  {/* Red Pill Strip */}
                  <div className="absolute -top-24 right-4 w-16 h-32 bg-gray-200 rounded-md shadow-xl rotate-12 transition-all duration-700 group-hover:-translate-y-16 group-hover:rotate-45 z-10 flex flex-wrap gap-2 p-2 overflow-hidden border border-gray-300">
                    {[1,2,3,4,5,6].map(p => <div key={p} className="w-5 h-5 rounded-full bg-red-500 shadow-inner"></div>)}
                  </div>

                  {/* Green Box */}
                  <div className="absolute -top-10 right-20 w-20 h-24 bg-teal-500 rounded-md shadow-xl rotate-[5deg] transition-all duration-700 group-hover:-translate-y-8 z-10">
                    <div className="w-full h-1/3 bg-white/20 mt-4 flex items-center justify-center"><Cross className="w-6 h-6 text-white"/></div>
                  </div>

                  {/* The Paper Bag (Front) */}
                  <div className="absolute inset-0 bg-white rounded-t-sm rounded-b-xl shadow-2xl z-20 border border-gray-100 flex flex-col items-center justify-center overflow-hidden">
                    {/* Bag fold line */}
                    <div className="absolute top-0 left-0 right-0 h-4 bg-gray-50 border-b border-gray-200"></div>
                    
                    {/* Logo on Bag */}
                    <div className="mt-8 flex flex-col items-center p-4 bg-white/90 backdrop-blur-sm rounded-xl">
                       <div className="relative flex items-center justify-center mb-2">
                          <Plus className="w-12 h-12 text-[#003366]" strokeWidth={3} />
                          <Leaf className="w-6 h-6 text-[#4CAF50] absolute -bottom-1 -right-1" fill="currentColor" />
                       </div>
                      <p className="text-xl font-black" style={{ color: '#003366' }}>ANJANEYA</p>
                      <p className="text-sm font-black tracking-widest uppercase" style={{ color: '#4CAF50' }}>PHARMACY</p>
                      <p className="text-[8px] font-bold mt-1" style={{ color: '#64748b' }}>Trusted Medicines. Genuine Care.</p>
                    </div>
                  </div>

                  {/* The Bag Depth (Left side illusion) */}
                  <div className="absolute top-4 -left-4 w-4 h-[330px] bg-gray-200 -skew-y-[45deg] origin-bottom-right shadow-inner rounded-l-sm z-10"></div>
                  
                </div>

                {/* Plant Graphic (Right side) */}
                <div className="absolute bottom-10 right-10 z-30 transition-transform duration-1000 hover:scale-110">
                  <div className="relative w-24 h-32">
                    {/* Pot */}
                    <div className="absolute bottom-0 w-16 h-12 bg-gray-800 rounded-b-lg mx-4 z-20"></div>
                    <div className="absolute bottom-12 w-20 h-4 bg-gray-700 rounded mx-2 z-20"></div>
                    {/* Leaves */}
                    <div className="absolute bottom-14 left-4 w-10 h-16 bg-[#4CAF50] rounded-t-[30px] rounded-bl-[30px] -rotate-[30deg] z-10 shadow-lg origin-bottom"></div>
                    <div className="absolute bottom-12 right-2 w-12 h-20 bg-[#2e7d32] rounded-t-[40px] rounded-br-[40px] rotate-[20deg] z-10 shadow-lg origin-bottom"></div>
                    <div className="absolute bottom-16 left-8 w-8 h-12 bg-[#81c784] rounded-t-[20px] rounded-br-[20px] z-15 shadow-lg origin-bottom"></div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ SEARCH BAR (NAVY BLUE) ═══════════════════ */}
      <section className="py-10" style={{ background: '#003366' }}>
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6">
          <div className="flex items-center bg-white rounded-lg overflow-hidden shadow-2xl p-1">
            <select className="hidden md:block bg-gray-50 px-5 py-3 text-xs font-black border-r border-gray-100 focus:outline-none cursor-pointer min-w-[140px] uppercase tracking-wider"
                    style={{ color: '#1a1a2e' }}>
              <option>All Medicines</option>
              <option>Prescription</option>
              <option>OTC</option>
              <option>Ayurvedic</option>
            </select>
            <div className="flex-1 flex items-center px-4">
              <Search className="w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search for medicines, health products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-4 text-sm font-medium focus:outline-none bg-transparent"
                style={{ color: '#1a1a2e' }}
              />
            </div>
            <Link href={`/shop?search=${searchTerm}`}
                  className="flex items-center gap-2 px-8 py-4 rounded-md text-sm font-black text-white transition-all hover:brightness-110 shadow-lg"
                  style={{ background: '#2e7d32' }}>
              <Search className="w-4 h-4" strokeWidth={3} /> SEARCH
            </Link>
          </div>
          <div className="flex flex-wrap gap-4 mt-5 px-2 items-center justify-center">
            <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#93a5cf' }}>Popular Searches:</span>
            {popularSearches.map((term) => (
              <Link key={term} href={`/shop?search=${term}`}
                    className="text-xs font-bold text-white hover:text-green-400 transition-colors underline decoration-white/20 underline-offset-4">
                {term}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ SHOP BY CATEGORIES ═══════════════════ */}
      <section className="py-14" style={{ background: '#f5f7fa' }}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-2xl font-bold" style={{ color: '#003366' }}>Shop by Categories</h2>
            <Link href="/shop" className="text-sm font-semibold flex items-center gap-1 hover:underline"
                  style={{ color: '#2e7d32' }}>
              View All Categories <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-5">
            {categories.map((cat) => (
              <Link href={`/shop?category=${cat.name}`} key={cat.name}
                    className="bg-white rounded-xl p-5 text-center border transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer group"
                    style={{ borderColor: '#e2e8f0' }}>
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 transition-all group-hover:scale-110"
                     style={{ background: cat.bg }}>
                  <cat.icon className="w-7 h-7" style={{ color: cat.color }} />
                </div>
                <p className="text-xs font-semibold leading-tight" style={{ color: '#374151' }}>{cat.name}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ 3 STEPS ═══════════════════ */}
      <section className="py-16" style={{ background: '#f8fafc' }}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row items-center gap-14">
            {/* Left text */}
            <div className="lg:w-[30%] shrink-0">
              <h2 className="text-3xl font-bold leading-tight mb-4 text-[#003366]">
                Order Medicines in<br />3 Simple Steps
              </h2>
              <p className="mb-6 text-gray-500">
                Getting your medicines is now quick, easy and reliable.
              </p>
              <Link href="/prescription" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold text-white shadow-md hover:brightness-110 transition-all"
                    style={{ background: '#2e7d32' }}>
                <Upload className="w-4 h-4" /> Upload Prescription
              </Link>
            </div>
            {/* Steps cards */}
            <div className="lg:w-[70%] grid md:grid-cols-3 gap-6">
              {[
                { step: 1, icon: Upload, title: 'Upload Prescription', desc: 'Upload prescription or search medicines', color: '#e8f5e9', iconColor: '#2e7d32' },
                { step: 2, icon: CheckCircle, title: 'We Confirm', desc: 'We check availability and confirm your order', color: '#eef2ff', iconColor: '#3b82f6' },
                { step: 3, icon: Package, title: 'Fast Delivery', desc: 'Get your medicines delivered to your doorstep', color: '#f0fdf4', iconColor: '#22c55e' },
              ].map((item) => (
                <div key={item.step} className="rounded-2xl p-7 text-center relative border shadow-sm bg-white hover:shadow-md transition-shadow group"
                     style={{ borderColor: '#e2e8f0' }}>
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center font-black text-white text-sm shadow-md"
                       style={{ background: item.iconColor }}>
                    {item.step}
                  </div>
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-transform group-hover:scale-110"
                       style={{ background: item.color }}>
                    <item.icon className="w-8 h-8" style={{ color: item.iconColor }} />
                  </div>
                  <h3 className="font-bold text-base mb-2 text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ WHY CHOOSE US ═══════════════════ */}
      <section className="py-14 bg-white border-t border-gray-100">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold mb-10 text-center" style={{ color: '#003366' }}>Why Choose Anjaneya Pharmacy?</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {[
              { icon: Truck, title: '60 Min Delivery', desc: 'On orders within our delivery range' },
              { icon: Pill, title: 'Wide Range of Medicines', desc: 'All major brands available' },
              { icon: ShieldCheck, title: 'Prescription Required', desc: 'We dispense medicines responsibly' },
              { icon: Headphones, title: 'Expert Support', desc: 'Pharmacist support via call / WhatsApp' },
              { icon: Lock, title: 'Secure & Safe', desc: '100% safe packaging and handling' },
            ].map((item, i) => (
              <div key={i} className="text-center p-6 rounded-xl border transition-all hover:shadow-md group"
                   style={{ borderColor: '#e2e8f0' }}>
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:-translate-y-2 transition-transform"
                     style={{ background: '#f8fafc' }}>
                  <item.icon className="w-7 h-7" style={{ color: '#003366' }} />
                </div>
                <h3 className="font-bold text-sm mb-1" style={{ color: '#1a1a2e' }}>{item.title}</h3>
                <p className="text-xs" style={{ color: '#94a3b8' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ TESTIMONIALS ═══════════════════ */}
      <section className="py-14 border-t border-gray-100" style={{ background: '#f8fafc' }}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
            <h2 className="text-2xl font-bold" style={{ color: '#003366' }}>Trusted by 500+ Happy Customers</h2>
            <div className="flex items-center gap-2 mt-2 md:mt-0">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />)}
              </div>
              <span className="font-bold" style={{ color: '#1a1a2e' }}>4.9/5</span>
              <span className="text-sm" style={{ color: '#94a3b8' }}>Rating on Google</span>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border shadow-sm"
                   style={{ borderColor: '#e2e8f0' }}>
                <div className="flex gap-0.5 mb-4">
                  {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-sm leading-relaxed mb-5" style={{ color: '#64748b' }}>{t.text}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center"
                       style={{ background: '#e8f5e9' }}>
                    <span className="font-bold text-sm" style={{ color: '#2e7d32' }}>{t.name[0]}</span>
                  </div>
                  <span className="font-semibold text-sm" style={{ color: '#1a1a2e' }}>{t.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ CTA BANNER ═══════════════════ */}
      <section className="py-16" style={{ background: '#003366' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Need Medicines Delivered?</h2>
          <p className="mb-8 text-lg" style={{ color: '#93a5cf' }}>Order now and get your medicines delivered within 60 minutes.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/shop" className="px-8 py-4 bg-white font-bold rounded-lg hover:bg-gray-50 transition-all shadow-lg text-sm"
                  style={{ color: '#003366' }}>
              Browse Medicines
            </Link>
            <a href="https://wa.me/919876543210" target="_blank"
               className="px-8 py-4 font-bold rounded-lg transition-all shadow-lg flex items-center gap-2 text-white text-sm"
               style={{ background: '#4CAF50' }}>
              💬 Order on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
