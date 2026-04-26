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
    <div className="min-h-screen bg-[#f5f7fa]">
      {/* Header */}
      <section className="section-blue py-10">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-white mb-2">Search Medicines</h1>
          <p className="text-blue-200 text-sm">Browse our wide range of genuine medicines and health products.</p>
          <div className="mt-6 max-w-2xl">
            <div className="search-bar flex items-center bg-white">
              <Search className="w-5 h-5 text-gray-400 ml-5" />
              <input 
                type="text" 
                placeholder="Search by medicine name, composition..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  fetchMedicines(e.target.value);
                }}
                className="flex-1 px-4 py-4 text-sm focus:outline-none bg-transparent"
              />
              <button onClick={() => fetchMedicines(search)} className="btn-green mr-2 px-6 py-2.5 rounded-full text-sm flex items-center gap-2">
                <Search className="w-4 h-4" /> Search
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 sticky top-24">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Filter className="w-5 h-5 text-green-600" /> Categories
              </h3>
              <div className="space-y-3">
                {allCategories.map(c => (
                  <label key={c} className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={selectedCategories.includes(c)}
                      onChange={() => toggleCategory(c)}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className={`text-sm font-medium transition-colors ${
                      selectedCategories.includes(c) ? 'text-green-600 font-semibold' : 'text-gray-600 group-hover:text-gray-900'
                    }`}>
                      {c}
                    </span>
                  </label>
                ))}
              </div>
              {selectedCategories.length > 0 && (
                <button onClick={() => setSelectedCategories([])} className="mt-5 text-xs font-bold text-red-500 hover:underline">
                  Clear All Filters
                </button>
              )}
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
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
                      <span className="text-base font-black text-gray-900">₹{med.price?.toFixed(2)}</span>
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
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full px-6 max-w-lg">
          <button 
            onClick={handleCheckout}
            className="w-full bg-green-600 text-white px-8 py-5 rounded-2xl font-bold flex items-center justify-between shadow-2xl hover:bg-green-700 transition-all border-2 border-green-500"
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <ShoppingCart className="w-6 h-6" />
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-white text-green-700 rounded-full text-[10px] font-black flex items-center justify-center">{cartCount}</span>
              </div>
              <span>Items in Cart</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">Checkout</span>
              <ArrowRight className="w-5 h-5" />
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
