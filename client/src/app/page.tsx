'use client';
import { useState, useEffect } from 'react';
import { 
  Search, ShoppingCart, ArrowRight, ShieldCheck, Truck, Clock, 
  Plus, Star, Upload, CheckCircle, Package, Headphones, Lock,
  ThermometerSun, Baby, Heart, Pill, Droplets, Leaf, Shield, UserCheck
} from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import { API_URL } from '@/config';

// Bypass localtunnel anti-phishing screen for all API requests
axios.defaults.headers.common['bypass-tunnel-reminder'] = 'true';

const categories = [
  { name: 'Fever & Pain Relief', icon: ThermometerSun, color: 'text-red-500' },
  { name: 'Cold & Cough', icon: Droplets, color: 'text-blue-500' },
  { name: 'Baby Care', icon: Baby, color: 'text-pink-500' },
  { name: 'Personal Care', icon: UserCheck, color: 'text-purple-500' },
  { name: 'Diabetes Care', icon: Heart, color: 'text-orange-500' },
  { name: 'BP & Heart Care', icon: Shield, color: 'text-red-600' },
  { name: 'Vitamins & Supplements', icon: Leaf, color: 'text-green-500' },
  { name: 'First Aid', icon: Plus, color: 'text-teal-500' },
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
    <div className="min-h-screen bg-[#f5f7fa]">

      {/* =================== HERO SECTION =================== */}
      <section className="hero-gradient py-12 md:py-16 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-10">
            {/* Left content */}
            <div className="flex-1 space-y-6 z-10">
              <p className="text-green-700 font-semibold text-sm">Your Trusted Neighborhood Pharmacy</p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-tight">
                Fast & Trusted<br />
                <span className="text-green-600">Medicines</span> Near You
              </h1>
              <p className="text-gray-500 text-lg max-w-lg">
                Order medicines online and get delivery within 60 minutes at your doorstep.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link href="/shop" className="btn-green flex items-center gap-2 px-6 py-3 rounded-lg text-sm">
                  <Search className="w-4 h-4" /> Search Medicines
                </Link>
                <Link href="/prescription" className="btn-outline-green flex items-center gap-2 px-6 py-3 rounded-lg text-sm">
                  <Upload className="w-4 h-4" /> Upload Prescription
                </Link>
                <a href="https://wa.me/919876543210" target="_blank" className="btn-whatsapp flex items-center gap-2 px-6 py-3 rounded-lg text-sm">
                  💬 Order on WhatsApp
                </a>
              </div>
              {/* Trust badges row */}
              <div className="flex flex-wrap gap-6 pt-4">
                <div className="trust-badge"><ShieldCheck className="w-5 h-5 text-green-600" /> Genuine Medicines</div>
                <div className="trust-badge"><Lock className="w-5 h-5 text-blue-600" /> 100% Safe Packaging</div>
                <div className="trust-badge"><Truck className="w-5 h-5 text-orange-500" /> Fast Delivery</div>
                <div className="trust-badge"><Star className="w-5 h-5 text-yellow-500" /> Best Prices Always</div>
              </div>
            </div>
            {/* Right image area */}
            <div className="flex-1 relative hidden lg:block">
              <div className="w-full aspect-[4/3] bg-gradient-to-br from-green-50 to-blue-50 rounded-3xl flex items-center justify-center relative overflow-hidden shadow-xl border border-white">
                <div className="text-center space-y-4">
                  <div className="text-8xl animate-float">🏥</div>
                  <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-xl shadow-lg inline-block">
                    <p className="text-xl font-black text-gray-900">ANJANEYA<span className="text-green-600"> PHARMACY</span></p>
                    <p className="text-xs text-gray-500 font-medium">Trusted Medicines. Genuine Care.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =================== SEARCH BAR =================== */}
      <section className="py-8 -mt-6 relative z-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="search-bar flex items-center">
            <select className="bg-transparent px-5 py-4 text-sm font-semibold text-gray-700 border-r border-gray-200 focus:outline-none cursor-pointer min-w-[140px]">
              <option>All Medicines</option>
              <option>Prescription</option>
              <option>OTC</option>
              <option>Ayurvedic</option>
            </select>
            <input 
              type="text" 
              placeholder="Search for medicines, health products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-5 py-4 text-sm focus:outline-none bg-transparent"
            />
            <Link 
              href={`/shop?search=${searchTerm}`}
              className="btn-green mr-2 flex items-center gap-2 px-6 py-3 rounded-full text-sm"
            >
              <Search className="w-4 h-4" /> Search
            </Link>
          </div>
          <div className="flex flex-wrap gap-2 mt-4 px-1">
            <span className="text-xs text-gray-400 font-medium">Popular Searches:</span>
            {popularSearches.map((term) => (
              <Link 
                key={term} 
                href={`/shop?search=${term}`}
                className="text-xs text-blue-700 font-semibold hover:text-green-600 hover:underline transition-colors"
              >
                {term}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* =================== SHOP BY CATEGORIES =================== */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Shop by Categories</h2>
            <Link href="/shop" className="text-green-600 font-semibold text-sm hover:underline flex items-center gap-1">
              View All Categories <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {categories.map((cat) => (
              <Link href={`/shop?category=${cat.name}`} key={cat.name} className="category-card">
                <div className="icon-wrap">
                  <cat.icon className={`w-6 h-6 ${cat.color}`} />
                </div>
                <p className="text-xs font-semibold text-gray-700 leading-tight">{cat.name}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* =================== ORDER IN 3 STEPS =================== */}
      <section className="section-blue py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/3">
              <h2 className="text-3xl font-bold text-white leading-tight mb-4">
                Order Medicines in<br /><span className="text-green-400">3 Simple Steps</span>
              </h2>
              <p className="text-blue-200 mb-6">
                Getting your medicines is now quick, easy and reliable.
              </p>
              <Link href="/prescription" className="btn-green inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm">
                <Upload className="w-4 h-4" /> Upload Prescription
              </Link>
            </div>
            <div className="lg:w-2/3 grid md:grid-cols-3 gap-6">
              {[
                { step: 1, icon: Upload, title: 'Upload Prescription', desc: 'Upload prescription or search medicines' },
                { step: 2, icon: CheckCircle, title: 'We Confirm', desc: 'We check availability and confirm your order' },
                { step: 3, icon: Package, title: 'Fast Delivery', desc: 'Get your medicines delivered to your doorstep' },
              ].map((item) => (
                <div key={item.step} className="step-card relative">
                  <div className="absolute -top-4 -right-2 w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-black text-lg shadow-lg">
                    {item.step}
                  </div>
                  <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-white font-bold mb-2">{item.title}</h3>
                  <p className="text-blue-200 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =================== POPULAR MEDICINES =================== */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Popular Medicines</h2>
            <Link href="/shop" className="text-green-600 font-semibold text-sm hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {loading ? (
              [1,2,3,4].map(i => <div key={i} className="h-64 bg-white rounded-xl animate-pulse border border-gray-100"></div>)
            ) : (
              medicines.map((med: any) => (
                <div key={med.id} className="card p-5 rounded-xl group">
                  <div className="w-full aspect-square bg-gray-50 rounded-lg mb-4 flex items-center justify-center text-5xl group-hover:scale-105 transition-transform relative overflow-hidden">
                    💊
                    {(!med.stock || med.stock < 1) && (
                      <div className="absolute inset-0 bg-gray-900/60 flex items-center justify-center">
                        <span className="text-xs font-bold text-white bg-red-500 px-3 py-1 rounded-full">Out of Stock</span>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-full uppercase">{med.category}</span>
                  <h3 className="text-sm font-bold text-gray-900 mt-2 line-clamp-1">{med.name}</h3>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-1">{med.composition || med.description || 'Health product'}</p>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                    <span className="text-lg font-black text-gray-900">₹{med.price?.toFixed(2)}</span>
                    <Link 
                      href="/shop" 
                      className="w-9 h-9 bg-green-600 text-white rounded-lg flex items-center justify-center hover:bg-green-700 transition-all shadow-md"
                    >
                      <Plus className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* =================== WHY CHOOSE US =================== */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Why Choose Anjaneya Pharmacy?</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {[
              { icon: Truck, title: '60 Min Delivery', desc: 'On orders within our delivery range' },
              { icon: Pill, title: 'Wide Range of Medicines', desc: 'All major brands available' },
              { icon: ShieldCheck, title: 'Prescription Required', desc: 'We dispense medicines responsibly' },
              { icon: Headphones, title: 'Expert Support', desc: 'Pharmacist support via call / WhatsApp' },
              { icon: Lock, title: 'Secure & Safe', desc: '100% safe packaging and handling' },
            ].map((item, i) => (
              <div key={i} className="feature-card">
                <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <item.icon className="w-7 h-7 text-blue-800" />
                </div>
                <h3 className="font-bold text-sm text-gray-900 mb-1">{item.title}</h3>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =================== TESTIMONIALS =================== */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Trusted by 500+ Happy Customers</h2>
            <div className="flex items-center gap-2 mt-2 md:mt-0">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />)}
              </div>
              <span className="font-bold text-gray-900">4.9/5</span>
              <span className="text-sm text-gray-400">Rating on Google</span>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="testimonial-card">
                <div className="flex gap-0.5 mb-3">
                  {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">{t.text}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-700 font-bold text-sm">{t.name[0]}</span>
                  </div>
                  <span className="font-semibold text-gray-900 text-sm">{t.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =================== CTA BANNER =================== */}
      <section className="section-green py-14">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Need Medicines Delivered?</h2>
          <p className="text-green-100 mb-8 text-lg">Order now and get your medicines delivered within 60 minutes.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/shop" className="px-8 py-4 bg-white text-green-700 font-bold rounded-lg hover:bg-green-50 transition-all shadow-lg">
              Browse Medicines
            </Link>
            <a 
              href="https://wa.me/919876543210" 
              target="_blank" 
              className="px-8 py-4 bg-green-800 text-white font-bold rounded-lg hover:bg-green-900 transition-all shadow-lg flex items-center gap-2"
            >
              💬 Order on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
