'use client';
import { useState, useEffect } from 'react';
import { CreditCard, Truck, ShieldCheck, ArrowRight, Loader2, MapPin, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { API_URL } from '@/config';
import { useRouter } from 'next/navigation';

export default function Checkout() {
  const [cart, setCart] = useState<any[]>([]);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [upiId, setUpiId] = useState('');
  const [paying, setPaying] = useState(false);
  const router = useRouter();

  const [points, setPoints] = useState(0);
  const [usePoints, setUsePoints] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem('meds_cart');
    if (savedCart) setCart(JSON.parse(savedCart));
    else router.push('/shop');
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.address) setAddress(user.address);

    const fetchPoints = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/api/user/points`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPoints(res.data.points);
      } catch (err) {}
    };
    fetchPoints();
  }, [router]);

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = usePoints ? Math.min(subtotal, (points / 10) * 2) : 0;
  const total = subtotal - discountAmount;

  const handleCOD = async () => {
    const token = localStorage.getItem('token');
    if (!token) return router.push('/login');

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/orders/cod`, {
        items: cart, total_amount: total, address: address, discount_applied: discountAmount
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        localStorage.removeItem('meds_cart');
        router.push(`/track?id=${res.data.orderId}`);
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Order failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleUPISuccess = async (finalUpiId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return router.push('/login');
    
    setPaying(true);
    try {
      const res = await axios.post(`${API_URL}/api/payments/upi-success`, {
        items: cart,
        total_amount: total,
        address: address,
        discount_amount: discountAmount,
        upi_id: finalUpiId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        localStorage.removeItem('meds_cart');
        router.push(`/track?id=${res.data.orderId}`);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Payment processing failed.';
      alert(`Payment processing failed: ${errorMsg}`);
    } finally {
      setPaying(false);
    }
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return alert('Please enter your delivery address.');
    if (paymentMethod === 'COD') handleCOD();
    else if (upiId) handleUPISuccess(upiId);
    else alert('Please enter or select a UPI ID');
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-32 px-6 pb-20">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-black text-[#003366] mb-12 text-center lg:text-left">Checkout</h1>
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-[#003366]"><MapPin className="text-[#4CAF50]" /> Delivery Address</h3>
              <textarea 
                required value={address} onChange={(e) => setAddress(e.target.value)}
                className="w-full p-6 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-[#4CAF50] font-bold h-32 text-slate-700"
                placeholder="Enter full address..."
              />
            </div>

            {points > 0 && (
              <div className="bg-gradient-to-br from-[#4CAF50] to-[#388E3C] p-8 rounded-[2.5rem] text-white shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                   <ShieldCheck className="w-24 h-24" />
                </div>
                <div className="relative z-10">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">Health Rewards Available</p>
                  <h3 className="text-2xl font-black mb-4">{points} Coins = ₹{(points/10*2).toFixed(2)} Discount</h3>
                  <button 
                    onClick={() => setUsePoints(!usePoints)}
                    className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${usePoints ? 'bg-[#003366] text-white' : 'bg-white text-[#4CAF50]'}`}
                  >
                    {usePoints ? 'DISCOUNT APPLIED ✓' : 'USE MY COINS FOR DISCOUNT'}
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-[#003366]"><CreditCard className="text-[#4CAF50]" /> Payment Method</h3>
              <div className="space-y-4">
                <div 
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-6 border-2 rounded-[2rem] cursor-pointer transition-all ${paymentMethod === 'UPI' ? 'border-[#4CAF50] bg-green-50 shadow-md' : 'border-slate-100 hover:border-slate-200'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#003366] text-white rounded-lg flex items-center justify-center shadow-lg"><CreditCard className="w-5 h-5" /></div>
                      <div className="flex flex-col">
                        <span className="font-bold text-[#003366]">Online Payment</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">UPI / Cards / NetBanking</span>
                      </div>
                    </div>
                    {paymentMethod === 'UPI' && <CheckCircle className="text-[#4CAF50] w-6 h-6" />}
                  </div>

                  <AnimatePresence>
                    {paymentMethod === 'UPI' && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }} 
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="mt-8 pt-8 border-t border-green-100 space-y-8">
                          <div className="space-y-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 ml-1">Quick Pay via Apps</p>
                            <div className="grid grid-cols-3 gap-3">
                              {[
                                { name: 'PhonePe', color: '#5f259f' },
                                { name: 'GPay', color: '#4285F4' },
                                { name: 'Paytm', color: '#00BAF2' }
                              ].map((app) => (
                                <button 
                                  key={app.name}
                                  type="button"
                                  onClick={() => {
                                    setUpiId(`${app.name.toLowerCase()}@upi`);
                                    handleUPISuccess(`${app.name.toLowerCase()}@upi`);
                                  }}
                                  disabled={paying}
                                  className="flex flex-col items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 hover:border-[#4CAF50] hover:shadow-lg transition-all group active:scale-95"
                                >
                                  <div 
                                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md group-hover:scale-110 transition-transform"
                                    style={{ backgroundColor: app.color }}
                                  >
                                    {app.name[0]}
                                  </div>
                                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{app.name}</span>
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 ml-1">Or Enter UPI ID</p>
                            <div className="relative group">
                              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                                <span className="text-slate-300 font-black group-focus-within:text-[#4CAF50] transition-colors">@</span>
                              </div>
                              <input 
                                type="text"
                                placeholder="username@bankid"
                                value={upiId}
                                onChange={(e) => setUpiId(e.target.value)}
                                className="w-full pl-12 pr-6 py-5 bg-white rounded-2xl border-2 border-slate-100 focus:border-[#4CAF50] focus:ring-0 transition-all font-bold text-slate-700 placeholder:text-slate-300"
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div 
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-6 border-2 rounded-[2rem] flex items-center justify-between cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-[#4CAF50] bg-green-50 shadow-md' : 'border-slate-100 hover:border-slate-200'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 text-slate-500 rounded-lg flex items-center justify-center shadow-sm"><Truck className="w-5 h-5" /></div>
                    <div className="flex flex-col">
                      <span className="font-bold text-[#003366]">Cash on Delivery</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Pay when you receive</span>
                    </div>
                  </div>
                  {paymentMethod === 'COD' && <CheckCircle className="text-[#4CAF50] w-6 h-6" />}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#003366] text-white p-10 rounded-[3rem] shadow-2xl h-fit sticky top-32">
            <h3 className="text-xl font-bold mb-8 flex items-center gap-3"><ShieldCheck className="text-[#4CAF50]" /> Order Summary</h3>
            <div className="space-y-4 mb-10 max-h-[40vh] overflow-y-auto pr-4 custom-scrollbar">
              {cart.map((item, i) => (
                <div key={i} className="flex justify-between items-start gap-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-sm">{item.name}</span>
                    <span className="text-[10px] opacity-60 font-bold uppercase tracking-widest">Qty: {item.quantity}</span>
                    {item.discount_active && (
                      <span className="text-[9px] text-green-400 font-black uppercase tracking-widest mt-1">Special Price Applied</span>
                    )}
                  </div>
                  <span className="font-bold">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            <div className="space-y-4 mb-8 pt-6 border-t border-white/10">
              {cart.some(m => m.discount_active) && (
                <div className="flex justify-between text-[11px] text-green-400 font-black uppercase tracking-[0.2em]">
                  <span>Flash Sale Savings</span>
                  <span>-₹{cart.reduce((sum, item) => sum + (item.discount_active ? (item.original_price - item.price) * item.quantity : 0), 0).toFixed(2)}</span>
                </div>
              )}
              {usePoints && (
                <div className="flex justify-between text-sm text-[#4CAF50] font-bold">
                  <span>Health Reward Applied</span>
                  <span>-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm opacity-60 font-bold">
                <span>Delivery Charge</span>
                <span>FREE</span>
              </div>
            </div>

            <div className="border-t border-white/20 pt-8 space-y-6">
              <div className="flex justify-between items-end">
                <span className="text-xs font-black uppercase tracking-[0.3em] opacity-60">To Pay</span>
                <span className="text-4xl font-black text-white">₹{total.toFixed(2)}</span>
              </div>
              <button 
                onClick={handlePlaceOrder}
                disabled={loading || (paymentMethod === 'UPI' && !upiId && !paying)}
                className="w-full py-6 bg-[#4CAF50] hover:bg-[#388E3C] text-white rounded-2xl font-black text-lg shadow-xl shadow-green-900/20 transition-all disabled:opacity-50 active:scale-95 flex items-center justify-center gap-3 group"
              >
                {loading || paying ? <Loader2 className="animate-spin" /> : (
                  <>
                    {paymentMethod === 'COD' ? "CONFIRM ORDER" : upiId ? `PAY ₹${total.toFixed(2)}` : "ENTER UPI TO PAY"}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
