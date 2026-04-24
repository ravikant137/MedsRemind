'use client';
import { useState, useEffect } from 'react';
import { 
  CreditCard, Truck, ShieldCheck, ArrowRight, Loader2, 
  MapPin, Phone, User, ShoppingBag, CheckCircle, Package
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { API_URL } from '@/config';
import { useRouter } from 'next/navigation';

export default function Checkout() {
  const [cart, setCart] = useState<any[]>([]);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');
  const router = useRouter();

  useEffect(() => {
    const savedCart = localStorage.getItem('meds_cart`);
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    } else {
      router.push('/shop`);
    }
    
    const user = JSON.parse(localStorage.getItem('user') || '{}`);
    if (user.address) setAddress(user.address);
  }, []);

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token`);
      const res = await axios.post(`${API_URL}/api/orders`, {
        items: cart,
        total_amount: total,
        address: address
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setOrderId(res.data.id);
      setOrderSuccess(true);
      localStorage.removeItem('meds_cart`);
      
      // Auto redirect to track after 3 seconds
      setTimeout(() => {
        router.push(`/track`);
      }, 3000);
    } catch (err) {
      console.error(err);
      alert('Order failed. Please login first.`);
      router.push('/login`);
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-32 h-32 bg-green-600 rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-green-200"
        >
          <CheckCircle className="text-white w-16 h-16" />
        </motion.div>
        <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter">Order Confirmed!</h1>
        <p className="text-xl text-slate-500 font-medium mb-12 max-w-md">
          Your order <span className="text-green-600 font-black">#ORD-{orderId}</span> has been placed successfully.
        </p>
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <button 
            onClick={() => router.push('/track')}
            className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 shadow-xl"
          >
            Track Order <Truck className="w-6 h-6" />
          </button>
          <button 
            onClick={() => router.push('/shop')}
            className="w-full py-5 bg-slate-50 text-slate-900 rounded-[2rem] font-black text-lg"
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-6 px-6 pb-20 overflow-x-hidden">
      <div className="max-w-6xl mx-auto">
        <header className="mb-16">
          <h1 className="text-5xl font-black text-slate-900 tracking-tight">Checkout</h1>
          <p className="text-slate-500 font-medium mt-2">Complete your purchase in INR</p>
        </header>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Form Side */}
          <div className="lg:col-span-2 space-y-10">
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100"
            >
              <h3 className="text-2xl font-black mb-8 flex items-center gap-3">
                <MapPin className="text-green-600" /> Delivery Address
              </h3>
              <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-2">Shipping Details</label>
                    <textarea 
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter your full delivery address..."
                      className="w-full p-6 bg-slate-50 rounded-3xl border-none focus:ring-4 focus:ring-green-500/10 font-bold h-32 transition-all"
                    />
                 </div>
              </form>
            </motion.section>

            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100"
            >
              <h3 className="text-2xl font-black mb-8 flex items-center gap-3">
                <CreditCard className="text-green-600" /> Payment Method
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                 <div className="p-6 border-4 border-green-600 bg-green-50 rounded-3xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-green-600 text-white rounded-lg flex items-center justify-center"><Truck /></div>
                       <span className="font-black text-slate-900">Cash on Delivery</span>
                    </div>
                    <CheckCircle className="text-green-600 w-6 h-6" />
                 </div>
                 <div className="p-6 border-2 border-slate-100 rounded-3xl flex items-center justify-between opacity-50 grayscale cursor-not-allowed">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-slate-200 text-slate-400 rounded-lg flex items-center justify-center"><CreditCard /></div>
                       <span className="font-black text-slate-400">Card / UPI</span>
                    </div>
                 </div>
              </div>
            </motion.section>
          </div>

          {/* Summary Side */}
          <div className="space-y-8">
            <motion.aside 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-slate-900 text-white p-10 rounded-[4rem] shadow-2xl relative overflow-hidden"
            >
               <div className="absolute top-0 right-0 p-10 opacity-5"><ShoppingBag className="w-48 h-48" /></div>
               <h3 className="text-2xl font-black mb-10 relative z-10">Order Summary</h3>
               
               <div className="space-y-6 mb-10 relative z-10 max-h-96 overflow-y-auto pr-4 custom-scrollbar">
                  {cart.map((item, i) => (
                    <div key={i} className="flex justify-between items-center">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center font-black">
                             {item.quantity}x
                          </div>
                          <div>
                             <p className="font-bold text-sm leading-tight">{item.name}</p>
                             <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">₹{item.price}</p>
                          </div>
                       </div>
                       <span className="font-black">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
               </div>

               <div className="space-y-4 pt-8 border-t border-white/10 relative z-10">
                  <div className="flex justify-between text-slate-400 font-bold">
                    <span>Subtotal</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 font-bold">
                    <span>Delivery</span>
                    <span className="text-green-500">FREE</span>
                  </div>
                  <div className="flex justify-between text-2xl font-black pt-4">
                    <span>Total</span>
                    <span className="text-green-500">₹{total.toFixed(2)}</span>
                  </div>
               </div>

               <button 
                form="checkout-form"
                type="submit"
                disabled={loading}
                className="w-full mt-10 py-6 bg-green-600 text-white rounded-[2.5rem] font-black text-xl hover:bg-green-700 transition-all flex items-center justify-center gap-4 shadow-2xl shadow-green-500/20 disabled:opacity-50"
               >
                 {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Pay & Order <ArrowRight className="w-6 h-6" /></>}
               </button>
               
               <div className="mt-8 flex items-center justify-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                  <ShieldCheck className="w-4 h-4 text-green-500" /> Secure Checkout
               </div>
            </motion.aside>

            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 flex items-center gap-6">
               <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center"><Package /></div>
               <div>
                  <p className="font-black text-slate-900">2-Hour Delivery</p>
                  <p className="text-xs text-slate-400 font-medium">Standard for your current location</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
