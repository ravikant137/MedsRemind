'use client';
import { useState, useEffect } from 'react';
import { CreditCard, Truck, ShieldCheck, ArrowRight, Loader2, MapPin, CheckCircle, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { API_URL } from '@/config';
import { useRouter } from 'next/navigation';

export default function Checkout() {
  const [cart, setCart] = useState<any[]>([]);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const savedCart = localStorage.getItem('meds_cart');
    if (savedCart) setCart(JSON.parse(savedCart));
    else router.push('/shop');
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.address) setAddress(user.address);
  }, [router]);

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleRazorpayPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) return alert('Please login to place order');

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
            orderDetails: { items: cart, total_amount: total, address }
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
    } catch (err) {
      alert('Payment failed to initialize');
    } finally {
      setLoading(false);
    }
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
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-6 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-[#4CAF50] font-bold h-32"
                placeholder="Enter full address..."
              />
            </div>
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><CreditCard className="text-[#4CAF50]" /> Payment Method</h3>
              <div className="p-6 border-2 border-[#4CAF50] bg-green-50 rounded-2xl flex items-center justify-between">
                <span className="font-bold text-[#003366]">Pay via UPI / Card / NetBanking</span>
                <CheckCircle className="text-[#4CAF50]" />
              </div>
            </div>
          </div>
          <div className="bg-[#003366] text-white p-10 rounded-[3rem] shadow-2xl h-fit">
            <h3 className="text-xl font-bold mb-8">Order Summary</h3>
            <div className="space-y-4 mb-8">
              {cart.map((item, i) => (
                <div key={i} className="flex justify-between text-sm opacity-80">
                  <span>{item.name} x {item.quantity}</span>
                  <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-white/10 pt-6 space-y-4">
              <div className="flex justify-between text-2xl font-black text-[#4CAF50]">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              <button 
                onClick={handleRazorpayPayment}
                disabled={loading}
                className="w-full py-5 bg-[#4CAF50] hover:bg-[#388E3C] text-white rounded-2xl font-black text-lg shadow-xl transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin mx-auto" /> : "PAY & PLACE ORDER"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
