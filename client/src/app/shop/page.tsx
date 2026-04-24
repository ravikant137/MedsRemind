'use client';
import { useState, useEffect } from 'react';
import { Search, Filter, ShoppingCart, Plus, Minus, Loader2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { API_URL } from '@/config';
import { useRouter } from 'next/navigation';

export default function Shop() {
  const [cart, setCart] = useState<{ [key: number]: number }>({});
  const [medicines, setMedicines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const router = useRouter();
  
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

  return (
    <div className="min-h-screen bg-slate-50 pt-6 px-6 pb-20 overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12"
        >
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                Find <span className="text-green-600">Medicines</span>
              </h1>
              <p className="text-slate-500 text-sm font-medium">Order verified health products.</p>
           </div>
           <div className="relative w-full md:w-96 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-600 transition-colors w-6 h-6" />
              <input 
                type="text" 
                placeholder="Search name or description..." 
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  fetchMedicines(e.target.value);
                }}
                className="w-full pl-14 pr-6 py-5 rounded-3xl glass-card focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all border-none shadow-xl hover:shadow-2xl font-medium"
              />
           </div>
        </motion.header>

        <div className="flex flex-col lg:flex-row gap-10">
           {/* Sidebar Filters */}
           <aside className="w-full lg:w-72 space-y-8">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-card p-8 rounded-[2.5rem] border border-white shadow-xl shadow-green-100/20"
              >
                 <h3 className="font-black text-slate-900 mb-6 flex items-center gap-2 text-lg">
                   <Filter className="w-5 h-5 text-green-600" /> Categories
                 </h3>
                 <div className="space-y-4">
                    {['Fever', 'Antibiotic', 'Pain Relief', 'Allergy', 'Vitamins'].map(c => (
                      <label key={c} className="flex items-center gap-4 cursor-pointer group">
                         <div className="relative">
                            <input 
                              type="checkbox" 
                              checked={selectedCategories.includes(c)}
                              onChange={() => toggleCategory(c)}
                              className="peer hidden" 
                            />
                            <div className="w-6 h-6 border-2 border-slate-200 rounded-lg peer-checked:bg-green-600 peer-checked:border-green-600 transition-all flex items-center justify-center">
                               <div className="w-2 h-2 bg-white rounded-full opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                            </div>
                         </div>
                         <span className={`font-bold transition-colors ${selectedCategories.includes(c) ? 'text-green-600' : 'text-slate-500 group-hover:text-slate-900'}`}>
                           {c}
                         </span>
                      </label>
                    ))}
                 </div>
                 
                 {selectedCategories.length > 0 && (
                   <button 
                     onClick={() => setSelectedCategories([])}
                     className="mt-8 text-xs font-black uppercase tracking-widest text-red-500 hover:underline"
                   >
                     Clear Filters
                   </button>
                 )}
              </motion.div>
           </aside>

           {/* Product Grid */}
           <div className="flex-1">
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[1,2,3,4,5,6,7,8].map(i => (
                    <div key={i} className="h-64 bg-slate-100 rounded-3xl animate-pulse"></div>
                  ))}
                </div>
              ) : medicines.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-96 text-center">
                   <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                      <Search className="w-10 h-10 text-slate-300" />
                   </div>
                   <h3 className="text-2xl font-bold text-slate-800">No Medicines Found</h3>
                   <p className="text-slate-500 mt-2 font-medium">Try adjusting your filters or search terms</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <AnimatePresence mode="popLayout">
                    {medicines.map((med, idx) => (
                      <motion.div 
                        key={med.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ y: -5 }}
                        className="bg-white p-4 rounded-3xl border border-slate-100 shadow-md hover:shadow-xl transition-all group relative"
                      >
                         <div className="w-full aspect-square bg-slate-50 rounded-2xl mb-4 flex items-center justify-center text-4xl group-hover:scale-105 transition-transform overflow-hidden relative">
                            💊
                            {(!med.stock || med.stock < 1) && (
                              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center">
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">Out of Stock</span>
                              </div>
                            )}
                         </div>
                         <div className="space-y-2">
                            <span className="text-[8px] font-black uppercase tracking-widest text-green-600 bg-green-50 px-2 py-1 rounded-full">{med.category}</span>
                            <h3 className="text-sm font-black text-slate-900 leading-tight line-clamp-1">{med.name}</h3>
                            <div className="flex justify-between items-center pt-2">
                               <span className="text-lg font-black text-slate-900">₹{med.price.toFixed(2)}</span>
                               <div className="flex items-center gap-2">
                                  <button 
                                    onClick={() => updateCart(med.id, -1)}
                                    className="w-8 h-8 bg-slate-100 text-slate-400 rounded-lg flex items-center justify-center hover:bg-slate-200"
                                  >
                                     <Minus className="w-4 h-4" />
                                  </button>
                                  <span className="font-black text-sm w-4 text-center">{cart[med.id] || 0}</span>
                                  <button 
                                    onClick={() => updateCart(med.id, 1)}
                                    disabled={med.stock < 1}
                                    className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center hover:bg-green-600 disabled:opacity-50"
                                  >
                                     <Plus className="w-4 h-4" />
                                  </button>
                               </div>
                            </div>
                         </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
           </div>
        </div>
      </div>

      {/* Floating Cart Button */}
      <AnimatePresence>
        {cartCount > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 w-full px-6 max-w-lg"
          >
             <button 
               onClick={handleCheckout}
               className="w-full bg-green-600 text-white px-10 py-6 rounded-[2.5rem] font-black flex items-center justify-between shadow-2xl shadow-green-400 animate-green-pulse border-4 border-white/20"
             >
                <div className="flex items-center gap-5">
                   <div className="relative">
                      <ShoppingCart className="w-7 h-7" />
                      <span className="absolute -top-3 -right-3 w-6 h-6 bg-slate-900 text-white rounded-full text-[10px] flex items-center justify-center border-2 border-green-600">{cartCount}</span>
                   </div>
                   <span className="text-lg">Items Selected</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm opacity-80 uppercase tracking-widest">Checkout</span>
                  <ArrowRight className="w-6 h-6" />
                </div>
             </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
