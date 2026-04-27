'use client';
import { useState, useEffect } from 'react';
import { Package, Clock, ArrowRight, Loader2, MapPin, Search, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { API_URL } from '@/config';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function MyOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchOrders(token);
  }, []);

  const fetchOrders = async (token: string) => {
    try {
      const res = await axios.get(`${API_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'ORDER_PLACED': return 'bg-blue-100 text-blue-700';
      case 'CONFIRMED': return 'bg-purple-100 text-purple-700';
      case 'PACKED': return 'bg-orange-100 text-orange-700';
      case 'OUT_FOR_DELIVERY': return 'bg-yellow-100 text-yellow-700';
      case 'DELIVERED': return 'bg-green-100 text-green-700';
      case 'CANCELLED': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const formatStatus = (status: string) => {
    return status ? status.replace(/_/g, ' ') : 'PENDING';
  };

   const groupOrders = (ordList: any[]) => {
    const groups: any = {};
    ordList.forEach(o => {
      const d = new Date(o.created_at + ' UTC').toDateString();
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      let label = d === today ? 'Today' : d === yesterday ? 'Yesterday' : new Date(o.created_at + ' UTC').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
      if (!groups[label]) groups[label] = [];
      groups[label].push(o);
    });
    return groups;
  };

  const grouped = groupOrders(orders);

  return (
    <div className="min-h-screen bg-slate-50 pt-10 px-6 pb-20">
      <div className="max-w-5xl mx-auto">
        <header className="mb-16">
          <h1 className="text-5xl font-black text-slate-900 tracking-tight">Order History</h1>
          <p className="text-slate-500 font-medium mt-2">Historically tracking your pharmacy journey</p>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="w-12 h-12 animate-spin text-green-600 mb-6" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading your order history...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-[4rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-32 -mt-32"></div>
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 relative z-10">
               <Package className="w-12 h-12 text-slate-200" />
            </div>
            <h3 className="text-3xl font-black text-slate-900 mb-2">No orders found</h3>
            <p className="text-slate-500 font-medium mb-12">You haven't placed any pharmacy orders yet.</p>
            <Link href="/shop" className="px-10 py-5 bg-green-600 text-white rounded-2xl font-black hover:bg-green-700 transition-all inline-flex items-center gap-3 shadow-xl shadow-green-200">
              Explore Pharmacy <ArrowRight className="w-6 h-6" />
            </Link>
          </div>
        ) : (
          <div className="space-y-16">
            {Object.keys(grouped).map((label) => (
              <div key={label} className="space-y-8">
                <div className="flex items-center gap-4 px-4">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400">{label}</span>
                  <div className="h-[1px] bg-slate-200 flex-1"></div>
                </div>
                {grouped[label].map((order: any, index: number) => (
                  <motion.div 
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-[3.5rem] shadow-xl hover:shadow-2xl transition-all border border-slate-100 overflow-hidden group"
                  >
                <div className="p-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 border-b border-slate-50">
                  <div className="flex items-center gap-8">
                     <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center group-hover:bg-green-50 transition-colors">
                       <Package className="w-10 h-10 text-slate-400 group-hover:text-green-600 transition-colors" />
                     </div>
                     <div>
                       <div className="flex items-center gap-4 mb-2">
                         <p className="text-xs font-black text-slate-400 tracking-[0.2em] uppercase">ORDER #{String(order.id).startsWith('ANJ-') ? order.id : `ORD-${order.id}`}</p>
                         <span className={`text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest ${getStatusColor(order.status || 'ORDER_PLACED')}`}>
                           {formatStatus(order.status || 'ORDER_PLACED')}
                         </span>
                       </div>
                       <p className="text-4xl font-black text-slate-900 tracking-tight">₹{order.total_amount.toFixed(2)}</p>
                       <div className="flex items-center gap-4 mt-3">
                         <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                           <Clock className="w-3.5 h-3.5" /> {new Date(order.created_at + ' UTC').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                         </span>
                         <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{order.items?.length || 0} {order.items?.length === 1 ? 'Item' : 'Items'}</span>
                       </div>
                     </div>
                  </div>
                  
                  <Link 
                    href={`/track?id=${order.id}`}
                    className="w-full lg:w-auto px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:bg-green-600 transition-all shadow-xl hover:scale-105"
                  >
                    Track Status <MapPin className="w-5 h-5" />
                  </Link>
                </div>

                {/* Items Summary - The requested Order Summary improvement */}
                <div className="bg-slate-50/50 p-10 flex flex-wrap gap-4">
                  {(() => {
                    let items = [];
                    try {
                      items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);
                    } catch (e) {
                      items = [];
                    }
                    return items.slice(0, 3).map((item: any, i: number) => (
                      <div key={i} className="bg-white px-6 py-4 rounded-2xl border border-slate-100 flex items-center gap-4 shadow-sm">
                         <span className="text-2xl">💊</span>
                         <div>
                            <p className="text-sm font-black text-slate-900">{item.name || item.medicine_name || 'Medicine'}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.quantity} x ₹{item.price || item.price_at_time || 0}</p>
                         </div>
                      </div>
                    ));
                  })()}
                  {(() => {
                    let items = [];
                    try {
                      items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);
                    } catch (e) {
                      items = [];
                    }
                    return items.length > 3 && (
                      <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl flex items-center justify-center font-black text-xs uppercase tracking-widest shadow-lg">
                         +{items.length - 3} more
                      </div>
                    );
                  })()}
                </div>
                  </motion.div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
