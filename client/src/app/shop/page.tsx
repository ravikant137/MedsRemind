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
    router.push('/checkout`);
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
              <h1 className="text-5xl font-black text-slate-900 tracking-tight">
                Find <span className="text-green-600">Medicines</span>
              </h1>
              <p className="text-slate-500 mt-2 font-medium">Order from over 10,000+ verified health products in INR</p>
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
                <div className="flex flex-col items-center justify-center h-96 text-slate-400 gap-6">
                  <Loader2 className="w-16 h-16 animate-spin text-green-600" />
                  <p className="font-black uppercase tracking-widest text-xs">Scanning Inventory...</p>
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
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-10">
                  <AnimatePresence mode="popLayout">
                    {medicines.map((med, idx) => (
                      <motion.div 
                        key={med.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ 
                          rotateY: 8, 
                          rotateX: -8,
                          y: -10,
                        }}
                        className="glass-card p-8 rounded-[3rem] group hover:green-glow perspective-1000 preserve-3d cursor-pointer bg-white border border-white shadow-xl shadow-slate-100"
                      >
                        <div className="relative w-full h-56 bg-gradient-to-br from-green-50 to-blue-50 rounded-[2.5rem] mb-6 flex items-center justify-center text-6xl transition-all duration-500 group-hover:scale-110 overflow-hidden shadow-inner">
                           <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse"></div>
                           <motion.span 
                             animate={{ y: [0, -8, 0] }}
                             transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                             className="relative z-10 filter drop-shadow-2xl"
                           >
                            💊
                           </motion.span>
                        </div>
                        <div className="flex justify-between items-start mb-4">
                           <span className="text-[10px] uppercase tracking-widest font-black text-green-700 bg-green-50 px-4 py-2 rounded-full border border-green-100">{med.category}</span>
                           <span className="text-xs font-bold text-slate-400">STOCK: {med.stock}</span>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2 group-hover:text-green-600 transition-colors leading-tight">{med.name}</h3>
                        <p className="text-sm text-slate-500 mb-8 line-clamp-2 font-medium leading-relaxed">{med.description}</p>
                        <div className="flex justify-between items-center">
                           <div className="text-3xl font-black text-slate-900 tracking-tighter">₹{med.price.toFixed(2)}</div>
                           
                           {cart[med.id] ? (
                             <motion.div 
                               initial={{ scale: 0.8 }} 
                               animate={{ scale: 1 }}
                               className="flex items-center gap-4 bg-slate-900 text-white rounded-2xl px-4 py-3 shadow-2xl"
                             >
                                <button onClick={() => updateCart(med.id, -1)} className="p-1 hover:text-green-500 transition-colors"><Minus className="w-5 h-5" /></button>
                                <span className="font-black min-w-[20px] text-center text-lg">{cart[med.id]}</span>
                                <button onClick={() => updateCart(med.id, 1)} className="p-1 hover:text-green-500 transition-colors"><Plus className="w-5 h-5" /></button>
                             </motion.div>
                           ) : (
                             <motion.button 
                               whileTap={{ scale: 0.9 }}
                               onClick={() => updateCart(med.id, 1)}
                               className="bg-slate-900 text-white p-5 rounded-[1.5rem] hover:bg-green-600 transition-all shadow-xl hover:shadow-green-200"
                             >
                                <Plus className="w-7 h-7" />
                             </motion.button>
                           )}
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
