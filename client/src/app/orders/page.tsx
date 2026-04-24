'use client';
import { useState, useEffect } from 'react';
import { Package, Clock, ArrowRight, Loader2, MapPin, Search } from 'lucide-react';
import { motion } from 'framer-motion';
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

  return (
    <div className="min-h-screen bg-slate-50 pt-10 px-6 pb-20">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">My Orders</h1>
          <p className="text-slate-500 font-medium mt-2">Track and manage your past and active orders</p>
        </header>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-green-600" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[3rem] shadow-sm border border-slate-100">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
               <Package className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">No orders found</h3>
            <p className="text-slate-500 font-medium mb-8">You haven't placed any orders yet.</p>
            <Link href="/shop" className="px-8 py-4 bg-green-600 text-white rounded-full font-black hover:bg-green-700 transition-colors inline-flex items-center gap-2">
              Start Shopping <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, index) => (
              <motion.div 
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-8 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
              >
                <div className="flex items-center gap-6">
                   <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center">
                     <Package className="w-8 h-8 text-slate-400" />
                   </div>
                   <div>
                     <p className="text-sm font-black text-slate-400 tracking-widest uppercase mb-1">ORDER #ORD-{order.id}</p>
                     <p className="text-xl font-black text-slate-900">₹{order.total_amount.toFixed(2)}</p>
                     <div className="flex items-center gap-4 mt-2">
                       <span className="flex items-center gap-1 text-xs font-bold text-slate-500">
                         <Clock className="w-3 h-3" /> {new Date(order.created_at + ' UTC').toLocaleDateString()}
                       </span>
                       <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${getStatusColor(order.status || 'ORDER_PLACED')}`}>
                         {formatStatus(order.status || 'ORDER_PLACED')}
                       </span>
                     </div>
                   </div>
                </div>
                
                <Link 
                  href={`/track?id=${order.id}`}
                  className="w-full md:w-auto px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
                >
                  Track Order <MapPin className="w-4 h-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
