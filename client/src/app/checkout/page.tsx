'use client';
import { useState, useEffect } from 'react';
import { CreditCard, Truck, ShieldCheck, ArrowRight, Loader2, MapPin, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '@/config';
import { useRouter } from 'next/navigation';

export default function Checkout() {
  const [cart, setCart] = useState<any[]>([]);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [showUPIModal, setShowUPIModal] = useState(false);
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
        const res = await axios.get('/api/user/points', {
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

  const handleRazorpayPayment = async () => {
    const token = localStorage.getItem('token');
    if (!token) return router.push('/login');

    setLoading(true);
    try {
      const orderRes = await axios.post(`${API_URL}/api/payments/create-order`, { amount: total }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
        amount: orderRes.data.amount,
        currency: "INR",
        name: "Anjaneya Pharmacy",
        description: "Medicine Purchase",
        order_id: orderRes.data.id,
        handler: async (response: any) => {
          const verifyRes = await axios.post(`${API_URL}/api/payments/verify`, {
            ...response,
            orderDetails: { items: cart, total_amount: total, address, discount_applied: discountAmount }
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (verifyRes.data.success) {
            localStorage.removeItem('meds_cart');
            router.push(`/track?id=${verifyRes.data.orderId}`);
          }
        },
        theme: { color: "#003366" }
      };
      const rzp = (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      alert('Payment failed to initialize.');
    } finally {
      setLoading(false);
    }
  };

  const handleUPISuccess = async (finalUpiId: string) => {
    const token = localStorage.getItem('token');
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
      alert('Payment processing failed.');
    } finally {
      setPaying(false);
      setShowUPIModal(false);
    }
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return alert('Please enter your delivery address.');
    if (paymentMethod === 'COD') handleCOD();
    else setShowUPIModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-32 px-6 pb-20">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-black text-[#003366] mb-12">Checkout</h1>
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><MapPin className="text-[#4CAF50]" /> Delivery Address</h3>
              <textarea 
                required value={address} onChange={(e) => setAddress(e.target.value)}
                className="w-full p-6 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-[#4CAF50] font-bold h-32"
                placeholder="Enter full address..."
              />
            </div>

            {points > 0 && (
              <div className="bg-[#4CAF50] p-8 rounded-3xl text-white shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                   <CheckCircle className="w-24 h-24" />
                </div>
                <div className="relative z-10">
                  <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-2">Health Rewards Available</p>
                  <h3 className="text-2xl font-black mb-4">{points} Coins = ₹{(points/10*2).toFixed(2)} Discount</h3>
                  <button 
                    onClick={() => setUsePoints(!usePoints)}
                    className={`px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${usePoints ? 'bg-white text-[#4CAF50]' : 'bg-[#003366] text-white'}`}
                  >
                    {usePoints ? 'DISCOUNT APPLIED ✓' : 'USE MY COINS FOR DISCOUNT'}
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><CreditCard className="text-[#4CAF50]" /> Payment Method</h3>
              <div className="space-y-4">
                <div 
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-6 border-2 rounded-2xl flex items-center justify-between cursor-pointer transition-all ${paymentMethod === 'UPI' ? 'border-[#4CAF50] bg-green-50' : 'border-slate-100 hover:border-slate-200'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#003366] text-white rounded-lg flex items-center justify-center"><CreditCard className="w-5 h-5" /></div>
                    <span className="font-bold text-[#003366]">Online Payment (UPI/Card)</span>
                  </div>
                  {paymentMethod === 'UPI' && <CheckCircle className="text-[#4CAF50]" />}
                </div>

                <div 
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-6 border-2 rounded-2xl flex items-center justify-between cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-[#4CAF50] bg-green-50' : 'border-slate-100 hover:border-slate-200'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center"><Truck className="w-5 h-5" /></div>
                    <span className="font-bold text-[#003366]">Cash on Delivery (COD)</span>
                  </div>
                  {paymentMethod === 'COD' && <CheckCircle className="text-[#4CAF50]" />}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#003366] text-white p-10 rounded-[3rem] shadow-2xl h-fit">
            <h3 className="text-xl font-bold mb-8">Order Summary</h3>
            <div className="space-y-4 mb-8">
              {cart.map((item, i) => (
                <div key={i} className="flex justify-between text-sm opacity-80">
                  <div className="flex flex-col">
                    <span>{item.name} x {item.quantity}</span>
                    {item.discount_active && (
                      <span className="text-[10px] text-green-400 font-black uppercase tracking-[0.1em]">Sale Price Applied</span>
                    )}
                  </div>
                  <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              {cart.some(m => m.discount_active) && (
                <div className="flex justify-between text-[11px] text-green-400 font-black uppercase tracking-widest border-t border-white/5 pt-4">
                  <span>Flash Sale Savings</span>
                  <span>-₹{cart.reduce((sum, item) => sum + (item.discount_active ? (item.original_price - item.price) * item.quantity : 0), 0).toFixed(2)}</span>
                </div>
              )}
              {usePoints && (
                <div className="flex justify-between text-sm text-[#4CAF50] font-bold border-t border-white/10 pt-4">
                  <span>Health Reward Discount</span>
                  <span>-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}
            </div>
            <div className="border-t border-white/10 pt-6 space-y-4">
              <div className="flex justify-between text-2xl font-black text-[#4CAF50]">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              <button 
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full py-5 bg-[#4CAF50] hover:bg-[#388E3C] text-white rounded-2xl font-black text-lg shadow-xl transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin mx-auto" /> : paymentMethod === 'COD' ? "CONFIRM ORDER" : "PAY & PLACE ORDER"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showUPIModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !paying && setShowUPIModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            ></motion.div>
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="p-10">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-black text-slate-900">UPI Payment</h3>
                  <div className="text-green-600 font-black">₹{total.toFixed(2)}</div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-8">
                  {['PhonePe', 'GPay', 'Paytm'].map((app) => (
                    <button 
                      key={app}
                      onClick={() => handleUPISuccess(`${app.toLowerCase()}@upi`)}
                      disabled={paying}
                      className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-2xl hover:bg-green-50 transition-all border border-transparent hover:border-green-200"
                    >
                      <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center text-xs font-bold">
                        {app[0]}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{app}</span>
                    </button>
                  ))}
                </div>

                <div className="relative mb-8">
                  <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                    <span className="text-slate-400 font-bold">@</span>
                  </div>
                  <input 
                    type="text"
                    placeholder="Enter UPI ID (e.g. user@okhdfcbank)"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full pl-12 pr-6 py-5 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-green-500/20 font-bold text-sm"
                  />
                </div>

                <button 
                  onClick={() => upiId && handleUPISuccess(upiId)}
                  disabled={!upiId || paying}
                  className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-green-600 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {paying ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Verify & Pay ₹{total.toFixed(2)}</>}
                </button>
                
                <p className="text-center mt-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                  Secure encrypted payment by Anjaneya
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
