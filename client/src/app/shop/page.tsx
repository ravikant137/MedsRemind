'use client';
import { useState, useEffect } from 'react';
import { Search, Filter, ShoppingCart, Plus, Minus, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '@/config';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ShopContent() {
  const [cart, setCart] = useState<{ [key: number]: number }>({});
  const [medicines, setMedicines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const q = searchParams.get('search') || '';
    const cat = searchParams.get('category') || '';
    if (q) setSearch(q);
    if (cat) setSelectedCategories([cat]);
  }, [searchParams]);

  useEffect(() => {
    fetchMedicines();
  }, [selectedCategories]);

  const fetchMedicines = async (searchTerm = search) => {
    setLoading(true);
    try {
      const categoryQuery = selectedCategories.length > 0 ? `&category=${selectedCategories.join(',')}` : '';
      const res = await axios.get(`${API_URL}/api/medicines?search=${searchTerm}${categoryQuery}`);
      setMedicines(res.data);
    } catch (err) {
      console.error('Error fetching medicines:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category) 
        : [...prev, category]
    );
  };

  const updateCart = (id: number, delta: number) => {
    setCart(prev => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + delta)
    }));
  };

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);

  const handleCheckout = () => {
    const cartItems = medicines
      .filter(m => cart[m.id] > 0)
      .map(m => ({ ...m, quantity: cart[m.id] }));
    localStorage.setItem('meds_cart', JSON.stringify(cartItems));
    router.push('/checkout');
  };

  const allCategories = ['Fever', 'Antibiotic', 'Pain Relief', 'Allergy', 'Vitamins', 'Cold & Cough', 'Diabetes Care', 'Baby Care'];

  return (
    <div className="min-h-screen" style={{ background: '#f5f7fa' }}>
      {/* Header */}
      <section className="py-6 md:py-10 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-white mb-1">Search Medicines</h1>
              <p className="text-[10px] md:text-sm font-bold text-slate-400 uppercase tracking-widest">Genuine medicines • Fast delivery</p>
            </div>
          </div>
          <div className="mt-6 max-w-2xl relative">
            <div className="flex items-center bg-white rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-100">
              <Search className="w-5 h-5 ml-4 md:ml-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search medicines..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  fetchMedicines(e.target.value);
                }}
                className="flex-1 px-4 py-4 md:py-5 text-sm md:text-base focus:outline-none bg-transparent font-bold text-slate-900"
              />
              <button onClick={() => fetchMedicines(search)} className="hidden md:flex mr-2 px-6 py-3 rounded-xl text-sm items-center gap-2 font-black text-white bg-green-600 hover:bg-green-700 transition-all">
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          {/* Categories - Horizontal on Mobile, Sidebar on Desktop */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="bg-white p-4 md:p-6 rounded-2xl shadow-md border border-gray-100 md:sticky md:top-24">
              <h3 className="font-black text-slate-900 text-xs md:text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                <Filter className="w-4 h-4 text-green-600" /> Categories
              </h3>
              <div className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                {allCategories.map(c => (
                  <button 
                    key={c}
                    onClick={() => toggleCategory(c)}
                    className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-xs font-black border transition-all ${
                      selectedCategories.includes(c) 
                        ? 'bg-green-600 text-white border-green-600 shadow-lg shadow-green-200' 
                        : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              {selectedCategories.length > 0 && (
                <button onClick={() => setSelectedCategories([])} className="mt-4 text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline">
                  Clear All
                </button>
              )}
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {medicines.some(m => m.discount_active) && (
              <div className="mb-8 p-6 bg-green-600 text-white rounded-3xl shadow-xl shadow-green-100 flex items-center justify-between overflow-hidden relative group">
                 <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1">Limited Time Offer</p>
                    <h3 className="text-2xl font-black">{medicines.find(m => m.discount_active)?.discount_message || 'Flash Sale Active!'}</h3>
                 </div>
                 <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center text-4xl group-hover:rotate-12 transition-transform">🏷️</div>
                 <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
              </div>
            )}
            
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-gray-500">{medicines.length} products found</p>
            </div>
            
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {[1,2,3,4,5,6,7,8].map(i => (
                  <div key={i} className="h-64 bg-white rounded-xl animate-pulse border border-gray-100"></div>
                ))}
              </div>
            ) : medicines.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">No Medicines Found</h3>
                <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {medicines.map((med) => (
                  <div key={med.id} className="card p-4 rounded-xl group">
                    <div className="w-full aspect-square bg-gray-50 rounded-lg mb-3 flex items-center justify-center text-4xl group-hover:scale-105 transition-transform relative overflow-hidden">
                      💊
                      {med.discount_active && (
                        <div className="absolute top-2 right-2 bg-green-600 text-white text-[9px] font-black px-2 py-1 rounded-lg shadow-lg animate-pulse">
                          SAVE {med.discount_percentage}%
                        </div>
                      )}
                      {(!med.stock || med.stock < 1) && (
                        <div className="absolute inset-0 bg-gray-900/60 flex items-center justify-center">
                          <span className="text-xs font-bold text-white bg-red-500 px-2 py-1 rounded-full">Out of Stock</span>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full uppercase">{med.category}</span>
                    <h3 className="text-sm font-bold text-gray-900 mt-1.5 line-clamp-1">{med.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{med.composition || 'Health product'}</p>
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                      <div>
                        {med.discount_active && (
                          <span className="text-[10px] font-bold text-gray-400 line-through block">₹{med.original_price?.toFixed(2)}</span>
                        )}
                        <span className="text-base font-black text-gray-900">₹{med.price?.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={() => updateCart(med.id, -1)}
                          className="w-7 h-7 bg-gray-100 text-gray-400 rounded flex items-center justify-center hover:bg-gray-200 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-bold text-sm w-5 text-center">{cart[med.id] || 0}</span>
                        <button 
                          onClick={() => updateCart(med.id, 1)}
                          disabled={med.stock < 1}
                          className="w-7 h-7 bg-green-600 text-white rounded flex items-center justify-center hover:bg-green-700 disabled:opacity-50 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Floating Cart Button */}
      {cartCount > 0 && (
        <div className="fixed bottom-20 md:bottom-10 left-1/2 -translate-x-1/2 z-50 w-full px-4 md:px-6 max-w-lg">
          <button 
            onClick={handleCheckout}
            className="w-full bg-slate-900 text-white px-6 py-4 rounded-2xl font-black flex items-center justify-between shadow-2xl hover:bg-green-600 transition-all border border-slate-800"
          >
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-5 h-5" />
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white text-slate-900 rounded-full text-[10px] font-black flex items-center justify-center shadow-lg">{cartCount}</span>
              </div>
              <span className="text-xs uppercase tracking-widest">Cart Total</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-widest">Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}
    </div>
  );
}

export default function Shop() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div></div>}>
      <ShopContent />
    </Suspense>
  );
}
