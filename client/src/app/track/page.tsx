'use client';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Truck, Package, MapPin, CheckCircle, Clock, Search, ArrowRight, ShieldCheck, Box, Loader2, Zap, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { API_URL } from '@/config';

function OrderTrackingContent() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState('');
  const [trackingData, setTrackingData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isLive, setIsLive] = useState(false);

  const fetchTrackingInfo = useCallback(async (id: string, isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/orders/${id}`);
      const order = res.data;
      
      // Handle SQLite date format safely for local time display
      const parseDate = (dateStr: string) => {
        if (!dateStr) return new Date();
        // If it lacks 'T', it's likely 'YYYY-MM-DD HH:MM:SS'
        if (!dateStr.includes('T') && dateStr.includes(' ')) {
          return new Date(dateStr.replace(' ', 'T') + 'Z'); // Assume UTC from server
        }
        return new Date(dateStr);
      };

      const createdAt = parseDate(order.created_at);
      const estDelivery = new Date(createdAt);
      estDelivery.setHours(estDelivery.getHours() + 2);

      const allSteps = ['ORDER_PLACED', 'CONFIRMED', 'PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
      const historyMap: Record<string, Date> = {};
      if (order.statusHistory) {
         order.statusHistory.forEach((h: any) => {
             historyMap[h.status] = parseDate(h.timestamp);
         });
      }

      let currentStatus = order.status || 'ORDER_PLACED';
      if (currentStatus === 'PENDING') currentStatus = 'ORDER_PLACED'; // Fallback
      
      let currentStepIndex = allSteps.indexOf(currentStatus);
      if (currentStepIndex === -1) currentStepIndex = 0; // Default to first step
      
      let mappedSteps = [];
      if (order.status === 'CANCELLED') {
        mappedSteps = [
          { status: 'ORDER PLACED', time: historyMap['ORDER_PLACED'] ? historyMap['ORDER_PLACED'].toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Success', completed: true, isCurrent: false },
          { status: 'CANCELLED', time: historyMap['CANCELLED'] ? historyMap['CANCELLED'].toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Cancelled', completed: false, isCurrent: true }
        ];
      } else {
        mappedSteps = allSteps.map((step, index) => {
           const isCompleted = index <= currentStepIndex;
           const isCurrent = index === currentStepIndex && order.status !== 'DELIVERED';
           const time = historyMap[step] 
              ? historyMap[step].toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
              : (isCompleted ? 'Success' : 'Pending');
           const label = step.replace(/_/g, ' ');
           return { status: label, time, completed: isCompleted, isCurrent };
        });
      }

      setTrackingData({
        id: `#ORD-${order.id}`,
        rawId: order.id,
        status: order.status === 'PENDING' ? 'PROCESSING' : (order.status || 'ORDER_PLACED').replace(/_/g, ' '),
        customer: order.user_name,
        address: order.address,
        total_amount: order.total_amount,
        items: order.items || [],
        estimated_delivery: estDelivery.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        steps: mappedSteps,
        isDelivered: order.status === 'DELIVERED'
      });
      setIsLive(order.status !== 'DELIVERED' && order.status !== 'CANCELLED');
    } catch (err: any) {
      if (!isSilent) alert('Order not found or could not fetch details.');
      setIsLive(false);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      setOrderId(id);
      fetchTrackingInfo(id);
    }
  }, [searchParams, fetchTrackingInfo]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLive && trackingData?.rawId) {
      interval = setInterval(() => {
        fetchTrackingInfo(trackingData.rawId, true);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isLive, trackingData?.rawId, fetchTrackingInfo]);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const id = orderId.trim();
    if (id) fetchTrackingInfo(id);
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-6 px-6 pb-20 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-green-200/40 rounded-full blur-[100px] -z-10"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-100/40 rounded-full blur-[100px] -z-10"></div>
      
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-16 space-y-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-20 h-20 bg-green-600 text-white rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-green-200"
          >
            <Truck className="w-10 h-10" />
          </motion.div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight">
            Live <span className="text-green-600">Tracking</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg">Real-time updates on your pharmacy delivery.</p>
          
          {isLive && (
             <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="flex items-center justify-center gap-2 text-green-600 font-black text-xs uppercase tracking-[0.2em] bg-green-50 w-fit mx-auto px-6 py-2 rounded-full border border-green-100"
             >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Live Tracking Active
             </motion.div>
          )}
        </header>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-10 rounded-[3.5rem] border border-white shadow-2xl shadow-slate-200/50 mb-12 relative overflow-hidden"
        >
          <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-6 relative z-10">
            <div className="flex-1 relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-600 w-6 h-6 transition-colors" />
              <input 
                type="text" 
                placeholder="Enter Order ID (e.g. #ORD-7)" 
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
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Track Order <ArrowRight className="w-6 h-6" /></>}
            </button>
          </form>
        </motion.div>

        <AnimatePresence mode="wait">
          {trackingData && (
            <motion.div 
              key={trackingData.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-10"
            >
               <div className="grid md:grid-cols-3 gap-8">
                  {[
                    { label: 'Status', value: trackingData.status, icon: Package, color: 'text-green-600', bg: 'bg-green-50', live: isLive },
                    { label: 'Estimated Arrival', value: trackingData.estimated_delivery, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Shipping To', value: trackingData.address, icon: MapPin, color: 'text-purple-600', bg: 'bg-purple-50' }
                  ].map((stat, i) => (
                    <div key={i} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-100/50 relative overflow-hidden group">
                       {stat.live && (
                         <div className="absolute top-0 right-0 p-4">
                           <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                         </div>
                       )}
                       <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform`}>
                          <stat.icon className="w-6 h-6" />
                       </div>
                       <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">{stat.label}</p>
                       <p className="font-black text-slate-900 leading-tight">{stat.value}</p>
                    </div>
                  ))}
               </div>

               <div className="grid lg:grid-cols-2 gap-10">
                  <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-2xl relative overflow-hidden">
                     <div className="flex justify-between items-center mb-12">
                        <h3 className="text-2xl font-black text-slate-900">Journey Details</h3>
                        <div className="flex items-center gap-4">
                           {isLive && <span className="text-[10px] font-black text-green-600 bg-green-50 px-3 py-1 rounded-full animate-pulse">LIVE UPDATES</span>}
                           <button 
                             onClick={async () => {
                               try {
                                 await axios.get(`${API_URL}/api/simulate/${trackingData.rawId}`);
                                 fetchTrackingInfo(trackingData.rawId, true);
                               } catch (err) {
                                 console.error(err);
                               }
                             }}
                             className="text-[10px] font-black text-white bg-slate-900 px-4 py-2 rounded-xl hover:bg-green-600 transition-all shadow-lg"
                           >
                              SIMULATE
                           </button>
                        </div>
                     </div>
                     <div className="relative space-y-12">
                        <div className="absolute left-6 top-2 bottom-2 w-1 bg-slate-100 rounded-full"></div>
                        {trackingData.steps.map((step: any, i: number) => (
                          <div key={i} className="flex gap-10 relative z-10">
                             <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg border-4 border-white transition-all duration-500 ${
                               step.completed ? 'bg-green-600 text-white' : 
                               step.isCurrent ? 'bg-green-500 text-white animate-pulse shadow-green-200' :
                               'bg-slate-200 text-slate-400'
                             }`}>
                                {step.completed ? <CheckCircle className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                             </div>
                             <div>
                                <h4 className={`text-xl font-black transition-colors duration-500 ${step.completed || step.isCurrent ? 'text-slate-900' : 'text-slate-400'}`}>
                                  {step.status}
                                  {step.isCurrent && <Zap className="inline-block w-4 h-4 ml-2 text-yellow-500 fill-yellow-500 animate-bounce" />}
                                </h4>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{step.time}</p>
                             </div>
                          </div>
                        ))}
                     </div>
                  </div>

                  <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-2xl flex flex-col">
                     <h3 className="text-2xl font-black text-slate-900 mb-12">Order Summary</h3>
                     <div className="space-y-6 mb-10 flex-1 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
                        {trackingData.items && trackingData.items.length > 0 ? (
                          trackingData.items.map((item: any, i: number) => (
                            <div key={i} className="flex justify-between items-center p-6 bg-slate-50 rounded-[2.5rem] border border-transparent">
                               <div className="flex items-center gap-5">
                                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-sm">💊</div>
                                  <div>
                                     <p className="font-black text-slate-900">{item.medicine_name}</p>
                                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Qty: {item.quantity} × ₹{item.price_at_time}</p>
                                  </div>
                               </div>
                               <p className="font-black text-slate-900 text-lg">₹{(item.quantity * item.price_at_time).toFixed(2)}</p>
                            </div>
                          ))
                        ) : (
                          <div className="flex flex-col items-center justify-center py-20 opacity-20">
                             <Box className="w-16 h-16 mb-4 text-slate-900" />
                             <p className="font-black text-slate-900 uppercase tracking-widest text-xs">No items found</p>
                          </div>
                        )}
                     </div>
                     <div className="p-8 bg-slate-900 text-white rounded-[3rem] shadow-2xl mt-6">
                        <div className="flex justify-between items-end">
                           <div>
                              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Grand Total</p>
                              <p className="text-5xl font-black text-green-500">₹{Number(trackingData.total_amount).toFixed(2)}</p>
                           </div>
                           <ShieldCheck className="w-12 h-12 text-white/20" />
                        </div>
                     </div>
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function OrderTracking() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-12 h-12 animate-spin text-green-600" /></div>}>
      <OrderTrackingContent />
    </Suspense>
  );
}
