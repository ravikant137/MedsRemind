'use client';
import { useState, useEffect } from 'react';
import { Truck, Package, MapPin, CheckCircle, Clock, Search, ArrowRight, ShieldCheck, Box, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { API_URL } from '@/config';

export default function OrderTracking() {
  const [orderId, setOrderId] = useState('');
  const [trackingData, setTrackingData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTrackingData(null);
    try {
      // Use the new public tracking endpoint which doesn't require authentication
      const res = await axios.get(`${API_URL}/api/track/${orderId}`);
      
      const order = res.data;
      const createdAt = new Date(order.created_at.includes(' ') && !order.created_at.includes('T') ? order.created_at + ' UTC' : order.created_at);
      const estDelivery = new Date(createdAt);
      estDelivery.setHours(estDelivery.getHours() + 2);

      const allSteps = ['ORDER_PLACED', 'CONFIRMED', 'PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
      const historyMap: Record<string, Date> = {};
      if (order.statusHistory) {
         order.statusHistory.forEach((h: any) => {
             historyMap[h.status] = new Date(h.timestamp.includes(' ') && !h.timestamp.includes('T') ? h.timestamp + ' UTC' : h.timestamp);
         });
      }

      let currentStepIndex = allSteps.indexOf(order.status || 'ORDER_PLACED');
      
      let mappedSteps = [];
      if (order.status === 'CANCELLED') {
        mappedSteps = [
          { status: 'ORDER PLACED', time: historyMap['ORDER_PLACED'] ? historyMap['ORDER_PLACED'].toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Done', completed: true },
          { status: 'CANCELLED', time: historyMap['CANCELLED'] ? historyMap['CANCELLED'].toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Cancelled', completed: false }
        ];
      } else {
        mappedSteps = allSteps.map((step, index) => {
           const isCompleted = index <= currentStepIndex;
           const time = historyMap[step] ? historyMap[step].toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (isCompleted ? 'Done' : 'Pending');
           const label = step.replace(/_/g, ' ');
           return { status: label, time, completed: isCompleted };
        });
      }

      setTrackingData({
        id: `#ORD-${order.id}`,
        status: order.status === 'PENDING' ? 'PROCESSING' : (order.status || 'ORDER_PLACED').replace(/_/g, ' '),
        customer: order.user_name,
        address: order.address,
        total_amount: order.total_amount,
        items: order.items,
        estimated_delivery: estDelivery.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        steps: mappedSteps
      });
    } catch (err: any) {
      alert(err.response?.data?.error || 'Order not found or unauthorized');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-6 px-6 pb-20 overflow-hidden relative">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-green-200/40 rounded-full blur-[100px] -z-10"></div>
      
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-16 space-y-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-20 h-20 bg-green-600 text-white rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-green-200"
          >
            <Truck className="w-10 h-10" />
          </motion.div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight">Track Your <span className="text-green-600">Order</span></h1>
          <p className="text-slate-500 font-medium text-lg">Enter your order ID to see real-time delivery status.</p>
        </header>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-10 rounded-[3.5rem] border border-white shadow-2xl shadow-slate-200/50 mb-12"
        >
          <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-600 w-6 h-6 transition-colors" />
              <input 
                type="text" 
                placeholder="Enter Order ID (e.g. #ORD-7721)" 
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="w-full pl-16 pr-8 py-6 rounded-[2.5rem] bg-slate-50 border-none focus:ring-4 focus:ring-green-500/10 font-bold text-lg transition-all"
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="px-12 py-6 bg-slate-900 text-white rounded-[2.5rem] font-black text-lg hover:bg-green-600 transition-all flex items-center justify-center gap-3 shadow-xl disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Track Now <ArrowRight className="w-6 h-6" /></>}
            </button>
          </form>
        </motion.div>

        <AnimatePresence>
          {trackingData && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-10"
            >
               {/* Summary Card */}
               <div className="grid md:grid-cols-3 gap-8">
                  {[
                    { label: 'Status', value: trackingData.status, icon: Package, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Estimated Arrival', value: trackingData.estimated_delivery, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Shipping To', value: trackingData.address, icon: MapPin, color: 'text-purple-600', bg: 'bg-purple-50' }
                  ].map((stat, i) => (
                    <div key={i} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-100/50">
                       <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-6 shadow-inner`}>
                          <stat.icon className="w-6 h-6" />
                       </div>
                       <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">{stat.label}</p>
                       <p className="font-black text-slate-900 leading-tight">{stat.value}</p>
                    </div>
                  ))}
               </div>

               {/* Timeline and Items */}
               <div className="grid lg:grid-cols-2 gap-10">
                  <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-2xl relative overflow-hidden">
                     <h3 className="text-2xl font-black text-slate-900 mb-12">Journey Details</h3>
                     <div className="relative space-y-12">
                        <div className="absolute left-6 top-2 bottom-2 w-1 bg-slate-100 rounded-full"></div>
                        {trackingData.steps.map((step: any, i: number) => (
                          <div key={i} className="flex gap-10 relative z-10">
                             <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg border-4 border-white ${step.completed ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                {step.completed ? <CheckCircle className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                             </div>
                             <div>
                                <h4 className={`text-xl font-black ${step.completed ? 'text-slate-900' : 'text-slate-400'}`}>{step.status}</h4>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{step.time}</p>
                             </div>
                          </div>
                        ))}
                     </div>
                  </div>

                  <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-2xl">
                     <div className="flex justify-between items-center mb-12">
                        <h3 className="text-2xl font-black text-slate-900">Order Summary</h3>
                        <button 
                           onClick={() => window.print()}
                           className="p-3 bg-slate-50 text-slate-900 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm flex items-center gap-2 text-xs font-black uppercase tracking-widest"
                        >
                           <Search className="w-4 h-4" /> Print Receipt
                        </button>
                     </div>
                     <div className="space-y-6 mb-10">
                        {trackingData.items?.map((item: any, i: number) => (
                           <div key={i} className="flex justify-between items-center p-6 bg-slate-50 rounded-[2.5rem] group hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-green-100">
                              <div className="flex items-center gap-5">
                                 <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-sm">💊</div>
                                 <div>
                                    <p className="font-black text-slate-900">{item.medicine_name}</p>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Qty: {item.quantity} × ₹{item.price_at_time}</p>
                                 </div>
                              </div>
                              <p className="font-black text-slate-900 text-lg">₹{(item.quantity * item.price_at_time).toFixed(2)}</p>
                           </div>
                        ))}
                     </div>
                     <div className="p-8 bg-slate-900 text-white rounded-[3rem] shadow-2xl shadow-slate-300">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Grand Total</p>
                        <p className="text-5xl font-black text-green-500">₹{Number(trackingData.total_amount).toFixed(2)}</p>
                     </div>
                  </div>
               </div>

               <div className="bg-slate-900 p-10 rounded-[4rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl"></div>
                  <div className="flex items-center gap-6 text-left relative z-10">
                     <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-3xl">🙋‍♂️</div>
                     <div>
                        <h4 className="text-xl font-black text-white">Need assistance?</h4>
                        <p className="text-slate-400 font-medium text-sm">Our support team is active 24/7 for you.</p>
                     </div>
                  </div>
                  <button className="px-10 py-5 bg-green-600 text-white rounded-2xl font-black hover:bg-green-700 transition-all shadow-xl shadow-green-500/20 relative z-10">
                     Contact Support
                  </button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
