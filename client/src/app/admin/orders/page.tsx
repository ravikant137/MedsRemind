'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { API_URL } from '@/config';
import { ShoppingBag, CheckCircle, XCircle, Package, Truck, Check, RefreshCcw, Loader2, ArrowRight, Clock, MapPin, User, Search } from 'lucide-react';

export default function AdminOrders() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [filter, setFilter] = useState('ALL');

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/orders`);
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'ADMIN') fetchOrders();
  }, [user]);

  const updateStatus = async (orderId: number, status: string) => {
    setUpdating(orderId);
    try {
      await axios.patch(`${API_URL}/api/orders/${orderId}/status`, { status });
      await fetchOrders();
    } catch (err) {
      alert('Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  const filteredOrders = orders.filter(o => filter === 'ALL' || o.status === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-orange-100 text-orange-600';
      case 'ACCEPTED': return 'bg-blue-100 text-blue-600';
      case 'PACKED': return 'bg-purple-100 text-purple-600';
      case 'OUT_FOR_DELIVERY': return 'bg-indigo-100 text-indigo-600';
      case 'DELIVERED': return 'bg-green-100 text-green-600';
      case 'REJECTED': return 'bg-red-100 text-red-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  if (loading) return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-green-600 w-12 h-12" /></div>;

  return (
    <div className="p-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div className="space-y-4">
           <h1 className="text-4xl font-black text-slate-900 tracking-tight">Order <span className="text-green-600">Management</span></h1>
           <div className="flex gap-2">
              {['ALL', 'PENDING', 'ACCEPTED', 'DELIVERED'].map((f) => (
                <button 
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${filter === f ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 border border-slate-100'}`}
                >
                  {f}
                </button>
              ))}
           </div>
        </div>
        <button onClick={fetchOrders} className="p-4 bg-white rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-3 font-bold text-slate-600 text-sm">
           <RefreshCcw className="w-4 h-4" /> Refresh Orders
        </button>
      </header>

      <div className="grid gap-8">
         <AnimatePresence>
           {filteredOrders.map((order) => (
             <motion.div 
               key={order.id}
               layout
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all flex flex-col lg:flex-row gap-8 items-start lg:items-center"
             >
                <div className="flex-1 space-y-6">
                   <div className="flex items-center gap-4">
                      <div className="bg-slate-50 px-4 py-2 rounded-xl font-black text-slate-900 text-xs border border-slate-100">#ORD-{order.id}</div>
                      <div className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest ${getStatusColor(order.status)}`}>
                         {order.status}
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                         <Clock className="w-3 h-3" /> {new Date(order.created_at).toLocaleTimeString()}
                      </div>
                   </div>
                   <div className="grid md:grid-cols-2 gap-8">
                      <div>
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Customer</p>
                         <h3 className="text-xl font-black text-slate-900 flex items-center gap-2"><User className="w-4 h-4 text-slate-400" /> {order.user_name}</h3>
                      </div>
                      <div>
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Amount Paid</p>
                         <p className="text-xl font-black text-green-600">₹{order.total_amount.toFixed(2)}</p>
                      </div>
                   </div>
                   <p className="text-sm font-bold text-slate-500 flex items-start gap-2 bg-slate-50 p-4 rounded-2xl">
                      <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-slate-400" /> {order.address}
                   </p>
                </div>

                <div className="flex flex-wrap gap-3 lg:border-l lg:border-slate-100 lg:pl-8">
                   {order.status === 'PENDING' && (
                     <>
                       <button 
                         onClick={() => updateStatus(order.id, 'ACCEPTED')}
                         disabled={updating === order.id}
                         className="flex items-center gap-2 px-6 py-4 bg-green-600 text-white rounded-2xl font-black hover:bg-green-700 transition-all shadow-lg shadow-green-200"
                       >
                          <CheckCircle className="w-4 h-4" /> Accept
                       </button>
                       <button 
                         onClick={() => updateStatus(order.id, 'REJECTED')}
                         disabled={updating === order.id}
                         className="flex items-center gap-2 px-6 py-4 bg-red-50 text-red-600 rounded-2xl font-black hover:bg-red-100 transition-all"
                       >
                          <XCircle className="w-4 h-4" /> Reject
                       </button>
                     </>
                   )}

                   {order.status === 'ACCEPTED' && (
                     <button 
                       onClick={() => updateStatus(order.id, 'PACKED')}
                       disabled={updating === order.id}
                       className="flex items-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                     >
                        <Package className="w-4 h-4" /> Mark Packed
                     </button>
                   )}

                   {order.status === 'PACKED' && (
                     <button 
                       onClick={() => updateStatus(order.id, 'OUT_FOR_DELIVERY')}
                       disabled={updating === order.id}
                       className="flex items-center gap-2 px-6 py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                     >
                        <Truck className="w-4 h-4" /> Out for Delivery
                     </button>
                   )}

                   {order.status === 'OUT_FOR_DELIVERY' && (
                     <button 
                       onClick={() => updateStatus(order.id, 'DELIVERED')}
                       disabled={updating === order.id}
                       className="flex items-center gap-2 px-6 py-4 bg-green-600 text-white rounded-2xl font-black hover:bg-green-700 transition-all shadow-lg shadow-green-200"
                     >
                        <Check className="w-4 h-4" /> Delivered
                     </button>
                   )}

                   <button 
                     onClick={() => router.push(`/track?id=${order.id}`)}
                     className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-all flex items-center gap-2 font-bold text-xs"
                   >
                      View Live Tracking <ArrowRight className="w-4 h-4" />
                   </button>
                </div>
             </motion.div>
           ))}
         </AnimatePresence>
      </div>
    </div>
  );
}
