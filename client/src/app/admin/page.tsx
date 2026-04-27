'use client';
import { useState, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, Package, ShoppingBag, Users, TrendingUp, 
  AlertTriangle, Search, Plus, ExternalLink, Trash2, 
  Edit3, CheckCircle, Clock, XCircle, ChevronRight, ChevronLeft, Loader2, X, Menu,
  BarChart3, PieChart, Activity, DollarSign, Calendar, ArrowLeft, LogOut, Camera, ShieldAlert, Bell, ChevronDown, MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { API_URL } from '@/config';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [timeRange, setTimeRange] = useState('ALL');
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState({ 
    revenue: 0, 
    orders: 0, 
    users: 0, 
    medicines: 0, 
    categoryDistribution: {} as any,
    engagement: 0,
    retention: 0
  });
  const [medicines, setMedicines] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [discountConfig, setDiscountConfig] = useState({ enabled: false, percentage: 0, message: '' });
  const [savingDiscount, setSavingDiscount] = useState(false);
  const [search, setSearch] = useState('');
  const [notifCount, setNotifCount] = useState(0);
  const [newMed, setNewMed] = useState({
    name: '', composition: '', price: '', stock: '', category: 'Fever', description: ''
  });
  const [mounted, setMounted] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const checkAuth = async () => {
      const userData = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (!userData || !token) {
        router.push('/login');
        return;
      }
      
      try {
        const user = JSON.parse(userData);
        if (user.role !== 'ADMIN') {
          router.push('/dashboard');
          return;
        }
        setAuthorized(true);
      } catch (e) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        router.push('/login');
      }
    };
    
    checkAuth();
  }, [router]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      // Fetch notifications
      const notifRes = await axios.get(`${API_URL}/api/notifications`, config);
      if (Array.isArray(notifRes.data)) {
        setNotifications(notifRes.data);
        const unread = notifRes.data.filter((n: any) => !n.read).length;
        setNotifCount(unread);
      }

      if (activeTab === 'Dashboard' || activeTab === 'Analytics') {
        const statsRange = activeTab === 'Dashboard' ? 'ALL' : timeRange;
        const [statsRes, ordersRes] = await Promise.all([
          axios.get(`${API_URL}/api/admin/stats?range=${statsRange}`, config),
          axios.get(`${API_URL}/api/admin/orders`, config)
        ]);
        setStats(statsRes.data || { revenue: 0, orders: 0, users: 0, medicines: 0, categoryDistribution: {}, totalDiscounts: 0 });
        setOrders(ordersRes.data || []);
      } else if (activeTab === 'Inventory') {
        const res = await axios.get(`${API_URL}/api/medicines`);
        setMedicines(res.data || []);
      } else if (activeTab === 'Orders') {
        const res = await axios.get(`${API_URL}/api/admin/orders`, config);
        setOrders(res.data || []);
      } else if (activeTab === 'Customers') {
        const res = await axios.get(`${API_URL}/api/admin/users`, config);
        setCustomers(res.data || []);
      } else if (activeTab === 'Discounts') {
        const res = await axios.get(`${API_URL}/api/admin/discounts`, config);
        setDiscountConfig(res.data);
      }
    } catch (err: any) {
      console.error('Error fetching admin data:', err);
      setFetchError(err.response?.data?.error || err.message || 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  }, [activeTab, timeRange]);

  useEffect(() => {
    if (authorized) {
      fetchData();
      
      const handleRefresh = () => fetchData();
      window.addEventListener('notif-refresh', handleRefresh);
      
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchData, 30000);
      return () => {
        clearInterval(interval);
        window.removeEventListener('notif-refresh', handleRefresh);
      };
    }
  }, [authorized, fetchData]);

  const deleteMedicine = async (id: number) => {
    if (!confirm('Are you sure you want to delete this medicine?')) return;
    try {
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
      await axios.delete(`${API_URL}/api/medicines/${id}`, config);
      setMedicines(prev => prev.filter((m: any) => m.id !== id));
    } catch (err) {
      alert('Failed to delete medicine');
    }
  };

  const handleAddMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
      await axios.post(`${API_URL}/api/medicines`, newMed, config);
      setShowAddModal(false);
      setNewMed({ name: '', composition: '', price: '', stock: '', category: 'Fever', description: '' });
      fetchData();
    } catch (err) {
      alert('Failed to add medicine');
    }
  };

  const updateOrderStatus = async (id: string, status: string) => {
    try {
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
      await axios.patch(`${API_URL}/api/orders/${id}/status`, { status }, config);
      
      const order = orders.find((o: any) => o.id === id);
      if (order && order.user_id) {
        await axios.post(`${API_URL}/api/notifications`, {
          user_id: order.user_id,
          title: `Order Update: ${status.replace(/_/g, ' ')}`,
          message: `Your order ${id} status has been updated to ${status.replace(/_/g, ' ')}.`,
          type: 'order'
        }, config);
      }

      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to update order status');
    }
  };

  const renderContent = () => {
    if (loading) return (
      <div className="flex flex-col items-center justify-center h-96 gap-4 text-slate-400">
        <Loader2 className="w-12 h-12 animate-spin text-green-600" />
        <p className="font-black uppercase tracking-widest text-xs">Syncing Data...</p>
      </div>
    );

    switch (activeTab) {
      case 'Dashboard':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
            <div className="grid md:grid-cols-4 gap-8">
               {[
                 { label: 'Total Revenue', value: `₹${stats.revenue.toLocaleString()}`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
                 { label: 'Total Orders', value: stats.orders, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
                 { label: 'Active Users', value: stats.users, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
                 { label: 'Products', value: stats.medicines, icon: Package, color: 'text-orange-600', bg: 'bg-orange-50' }
               ].map((stat, i) => (
                 <motion.div key={i} whileHover={{ y: -5 }} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100/50 group">
                    <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform`}>
                       <stat.icon className="w-7 h-7" />
                    </div>
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">{stat.label}</p>
                    <h3 className="text-3xl font-black text-slate-900 mt-2 tracking-tighter">{stat.value}</h3>
                 </motion.div>
               ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl shadow-slate-100/50">
                 <h3 className="text-xl font-black mb-8 flex items-center gap-3">
                   <Clock className="w-6 h-6 text-green-600" /> Recent Activity
                 </h3>
                 <div className="space-y-6">
                    {orders.slice(0, 5).map((order: any) => (
                      <div key={order.id} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-colors">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-2xl">📦</div>
                           <div>
                              <p className="font-black text-slate-900">Order {order.id}</p>
                              <p className="text-xs text-slate-400 font-bold">{order.user_name}</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="font-black text-green-600">₹{order.total_amount}</p>
                           <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">{new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                 </div>
              </div>
              <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden">
                 <h3 className="text-xl font-black mb-6 relative z-10">Quick Actions</h3>
                 <div className="space-y-4 relative z-10">
                    <button onClick={async () => {
                       const commonMeds = [
                         { name: 'Paracetamol', composition: 'Acetaminophen 500mg', price: '40', stock: '100', category: 'Fever', description: 'Common pain reliever and fever reducer.' },
                         { name: 'Amoxicillin', composition: 'Amoxicillin 250mg', price: '120', stock: '50', category: 'Antibiotic', description: 'Used to treat bacterial infections.' },
                         { name: 'Crocin Pain Relief', composition: 'Paracetamol & Caffeine', price: '65', stock: '80', category: 'Pain Relief', description: 'Fast acting pain relief for headaches.' },
                         { name: 'Cetirizine', composition: 'Cetirizine Hydrochloride', price: '35', stock: '120', category: 'Allergy', description: 'Relieves allergy symptoms like sneezing.' }
                       ];
                       const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
                       for (const med of commonMeds) {
                         await axios.post(`${API_URL}/api/medicines`, med, config);
                       }
                       alert('Inventory seeded successfully!');
                       fetchData();
                    }} className="w-full p-4 bg-green-600/20 hover:bg-green-600/30 rounded-2xl flex items-center justify-between group transition-all">
                       <span className="font-bold text-green-500">Seed Demo Inventory</span>
                       <CheckCircle className="w-5 h-5" />
                    </button>
                    <button onClick={() => { setActiveTab('Inventory'); setShowAddModal(true); }} className="w-full p-4 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-between group transition-all">
                       <span className="font-bold">Add New Product</span>
                       <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                    </button>
                    <button onClick={() => setActiveTab('Orders')} className="w-full p-4 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-between group transition-all">
                       <span className="font-bold">Process Pending Orders</span>
                       <ChevronRight className="w-5 h-5" />
                    </button>
                 </div>
                 <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-green-500/10 rounded-full blur-3xl"></div>
              </div>
            </div>
          </motion.div>
        );

      case 'Inventory':
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
             <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl overflow-hidden">
                <div className="flex justify-between items-center mb-10">
                   <h3 className="text-2xl font-black">Stock Management</h3>
                   <button onClick={() => setShowAddModal(true)} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3">
                      <Plus className="w-5 h-5" /> Add New Medicine
                   </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {medicines.map((med: any) => (
                     <div key={med.id} className="p-6 border border-slate-100 rounded-3xl hover:border-green-200 hover:shadow-lg transition-all group">
                        <div className="flex justify-between items-start mb-4">
                           <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">💊</div>
                           <div className="flex gap-2">
                              <button className="p-2 text-slate-400 hover:text-green-600"><Edit3 className="w-4 h-4" /></button>
                              <button onClick={() => deleteMedicine(med.id)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                           </div>
                        </div>
                        <h4 className="font-black text-slate-900 text-lg mb-1">{med.name}</h4>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-4">{med.category}</p>
                        <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                           <span className="text-xl font-black text-green-600">₹{med.price}</span>
                           <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${med.stock < 10 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                             {med.stock} in stock
                           </span>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </motion.div>
        );

      case 'Orders':
        return (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
             <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl overflow-hidden">
                <h3 className="text-2xl font-black mb-10">Order Registry</h3>
                
                {/* Status Tabs */}
                <div className="flex flex-wrap gap-4 mb-10 pb-4 border-b border-slate-50">
                   {['ALL', 'ORDER_PLACED', 'CONFIRMED', 'PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].map((s) => (
                     <button 
                       key={s}
                       onClick={() => setSearch(s === 'ALL' ? '' : s)}
                       className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                         (search === s || (s === 'ALL' && search === '')) 
                         ? 'bg-green-600 text-white shadow-lg' 
                         : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                       }`}
                     >
                       {s.replace(/_/g, ' ')}
                     </button>
                   ))}
                </div>

                <div className="space-y-4">
                   {orders
                     .filter((o: any) => {
                       if (!search || search === 'ALL') return true;
                        const s = search.toLowerCase();
                        return o.status === search || 
                               o.id.toString().toLowerCase() === s || 
                               o.id.toString().toLowerCase().includes(s) ||
                               `ORD-${o.id}`.toLowerCase() === s || 
                               o.user_name?.toLowerCase().includes(s);
                      })
                      .map((order: any) => (
                      <motion.div 
                        key={order.id} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`group p-8 border rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8 hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] transition-all duration-500 relative overflow-hidden ${
                          order.is_emergency ? 'bg-gradient-to-br from-red-50 to-white border-red-100' : 'bg-white border-slate-100'
                        }`}
                      >
                         {/* Order Identifier */}
                         <div className="flex items-center gap-6 w-full md:w-auto">
                            <div className="relative">
                               <div className={`w-20 h-20 rounded-[1.8rem] flex flex-col items-center justify-center shadow-lg transition-transform group-hover:scale-105 duration-300 ${
                                 order.is_emergency ? 'bg-red-600 text-white shadow-red-200' : 'bg-slate-900 text-white shadow-slate-200'
                               }`}>
                                  <span className="text-[10px] font-black opacity-60 uppercase tracking-tighter">Order</span>
                                  <span className="text-xl font-black">#{order.id.toString().replace('ANJ-', '')}</span>
                               </div>
                               {order.is_emergency === 1 && (
                                 <div className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
                                    <AlertTriangle className="w-5 h-5 text-red-600 animate-pulse" />
                                 </div>
                               )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                               <div className="flex items-center gap-3 mb-1">
                                 <h4 className="font-black text-xl text-slate-900 truncate">{order.user_name || 'Anonymous Guest'}</h4>
                                 {order.is_emergency === 1 && (
                                   <span className="px-4 py-1.5 bg-red-600 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg shadow-red-100 flex items-center gap-2">
                                     <ShieldAlert className="w-3 h-3" /> Emergency
                                   </span>
                                 )}
                               </div>
                               <div className="flex items-center gap-2 text-slate-400">
                                 <MapPin className="w-4 h-4 shrink-0" />
                                 <p className="text-xs font-bold truncate max-w-[200px]">{order.address}</p>
                               </div>
                               <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-2">
                                 Placed on {new Date(order.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                               </p>
                            </div>
                         </div>

                         {/* Financials & Status */}
                         <div className="flex flex-wrap items-center justify-end gap-12 w-full md:w-auto">
                            <div className="text-right">
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Amount</p>
                               <div className="flex items-baseline gap-1">
                                 <span className="text-sm font-black text-green-600">₹</span>
                                 <span className="text-3xl font-black text-slate-900 tracking-tight">{order.total_amount}</span>
                               </div>
                            </div>

                            <div className="min-w-[120px]">
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Payment Status</p>
                               <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                                 order.payment_status === 'PAID' 
                                   ? 'bg-green-50 text-green-600 border border-green-100' 
                                   : 'bg-orange-50 text-orange-600 border border-orange-100'
                               }`}>
                                 <div className={`w-1.5 h-1.5 rounded-full ${order.payment_status === 'PAID' ? 'bg-green-600' : 'bg-orange-600'}`}></div>
                                 {order.payment_status || 'COD PENDING'}
                               </div>
                               {order.payment_id && <p className="text-[9px] text-slate-300 font-mono mt-2 truncate max-w-[120px]">{order.payment_id}</p>}
                            </div>

                            <div className="min-w-[180px]">
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Delivery Progress</p>
                               <div className="relative group/select">
                                 <select 
                                   value={order.status || 'ORDER_PLACED'} 
                                   onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                   className={`w-full appearance-none pl-5 pr-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest border-none transition-all cursor-pointer shadow-sm hover:shadow-md ${
                                     order.status === 'DELIVERED' ? 'bg-green-600 text-white' :
                                     order.status === 'CANCELLED' ? 'bg-red-500 text-white' :
                                     order.status === 'OUT_FOR_DELIVERY' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                                   }`}
                                 >
                                   <option value="ORDER_PLACED">Order Placed</option>
                                   <option value="CONFIRMED">Confirmed</option>
                                   <option value="PACKED">Order Packed</option>
                                   <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                                   <option value="DELIVERED">Delivered</option>
                                   <option value="CANCELLED">Cancelled</option>
                                 </select>
                                 <div className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${
                                   ['DELIVERED', 'CANCELLED', 'OUT_FOR_DELIVERY'].includes(order.status) ? 'text-white' : 'text-slate-400'
                                 }`}>
                                   <ChevronDown className="w-4 h-4" />
                                 </div>
                               </div>
                            </div>

                            <div className="flex gap-3">
                               <Link 
                                 href={`/track?id=${order.id}`} 
                                 target="_blank" 
                                 className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-green-600 hover:text-white transition-all duration-300 shadow-sm border border-slate-100"
                               >
                                  <ExternalLink className="w-5 h-5" />
                               </Link>
                            </div>
                         </div>
                      </motion.div>
                    ))}
                </div>
             </div>
          </motion.div>
        );

      case 'Customers':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
             <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl overflow-hidden">
                <h3 className="text-2xl font-black mb-10">User Directory</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {customers.map((user: any) => (
                     <div key={user.id} className="p-6 bg-slate-50 rounded-3xl flex items-center justify-between border border-transparent hover:border-green-200 transition-all">
                        <div className="flex items-center gap-5">
                           <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm text-2xl">👤</div>
                           <div>
                              <p className="font-black text-slate-900">{user.name}</p>
                              <p className="text-xs text-slate-500 font-medium">{user.email}</p>
                              <p className="text-[10px] text-green-600 font-black uppercase tracking-widest mt-1">{user.role}</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Joined</p>
                           <p className="font-bold text-slate-600">{new Date(user.created_at).toLocaleDateString()}</p>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </motion.div>
        );

      case 'Analytics':
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
             <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Reporting Period</h3>
                <div className="flex gap-2">
                   {['DAY', 'WEEK', 'MONTH', 'QUARTER', 'YEAR', 'ALL'].map((r) => (
                     <button 
                       key={r}
                       onClick={() => setTimeRange(r)}
                       className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${timeRange === r ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                     >
                       {r}
                     </button>
                   ))}
                </div>
             </div>

             <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl">
                   <div className="flex items-center justify-between mb-8">
                      <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center"><DollarSign /></div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-green-500 bg-green-50 px-3 py-1 rounded-full">+12.5%</span>
                   </div>
                   <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Revenue Growth</p>
                   <h4 className="text-3xl font-black text-slate-900 mt-2">₹{stats.revenue.toLocaleString()}</h4>
                   <div className="mt-8 flex gap-1 h-2">
                      {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                        <div key={i} className="flex-1 bg-green-100 rounded-full relative overflow-hidden">
                           <div className="absolute bottom-0 w-full bg-green-500 rounded-full" style={{ height: `${h}%` }}></div>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl">
                   <div className="flex items-center justify-between mb-8">
                      <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center"><Activity /></div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 bg-blue-50 px-3 py-1 rounded-full">High</span>
                   </div>
                   <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Platform Engagement</p>
                   <h4 className="text-3xl font-black text-slate-900 mt-2">{stats.engagement || 0}%</h4>
                   <div className="mt-8 flex items-end gap-2 h-12">
                      {[20, 35, 25, 45, 30, 50, 40, 60, 45, 70].map((h, i) => (
                        <div key={i} className="flex-1 bg-blue-500 rounded-t-lg shadow-lg shadow-blue-200" style={{ height: `${h}%` }}></div>
                      ))}
                   </div>
                </div>

                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl">
                   <div className="flex items-center justify-between mb-8">
                      <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center"><Calendar /></div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-purple-500 bg-purple-50 px-3 py-1 rounded-full">Active</span>
                   </div>
                   <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Customer Retention</p>
                   <h4 className="text-3xl font-black text-slate-900 mt-2">{stats.retention || 0}%</h4>
                   <div className="mt-8 relative h-4 bg-slate-100 rounded-full overflow-hidden">
                      <div className="absolute left-0 top-0 h-full bg-purple-500 rounded-full shadow-lg" style={{ width: `${stats.retention || 0}%` }}></div>
                   </div>
                </div>

                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl">
                    <div className="flex items-center justify-between mb-8">
                       <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center">🏷️</div>
                       <span className="text-[10px] font-black uppercase tracking-widest text-orange-500 bg-orange-50 px-3 py-1 rounded-full">Savings</span>
                    </div>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Total Discounts Given</p>
                    <h4 className="text-3xl font-black text-slate-900 mt-2">₹{(stats as any).totalDiscounts?.toLocaleString() || '0'}</h4>
                    <div className="mt-8 flex gap-1 h-2">
                       {[30, 50, 40, 70, 50, 80, 60].map((h, i) => (
                         <div key={i} className="flex-1 bg-orange-100 rounded-full relative overflow-hidden">
                            <div className="absolute bottom-0 w-full bg-orange-500 rounded-full" style={{ height: `${h}%` }}></div>
                         </div>
                       ))}
                    </div>
                 </div>
             </div>

             <div className="bg-slate-900 p-12 rounded-[4rem] text-white overflow-hidden relative shadow-2xl">
                <div className="absolute top-0 right-0 p-10 opacity-10"><BarChart3 className="w-64 h-64" /></div>
                <h3 className="text-2xl font-black mb-12 flex items-center gap-4"><PieChart className="text-green-500" /> Sales Distribution</h3>
                <div className="grid md:grid-cols-2 gap-20 items-center">
                   <div className="space-y-8">
                       {Object.keys(stats.categoryDistribution).length > 0 ? Object.entries(stats.categoryDistribution).map(([category, count]: [string, any], i) => {
                         const total = Object.values(stats.categoryDistribution).reduce((a: any, b: any) => a + b, 0) as number;
                         const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                         const colors = ['bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500'];
                         return (
                           <div key={i} className="space-y-2">
                              <div className="flex justify-between text-sm font-bold text-white">
                                  <span>{category}</span>
                                  <span className="text-slate-400">{percentage}%</span>
                              </div>
                              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                 <div className={`h-full ${colors[i % colors.length]}`} style={{ width: `${percentage}%` }}></div>
                              </div>
                           </div>
                         );
                       }) : (
                         <div className="text-slate-400 font-bold">No sales data for this period</div>
                       )}
                    </div>
                    <div className="flex items-center justify-center">
                       <div className="w-64 h-64 rounded-full border-[20px] border-white/5 flex items-center justify-center relative">
                          <div className="absolute inset-0 border-[20px] border-green-500 rounded-full" style={{ clipPath: 'polygon(50% 50%, 50% 0, 100% 0, 100% 100%, 0 100%, 0 50%)' }}></div>
                          <div className="text-center">
                             <h4 className="text-4xl font-black text-white mb-2">₹{stats.revenue.toLocaleString()}</h4>
                             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Sales</p>
                          </div>
                       </div>
                    </div>
                </div>
             </div>
          </motion.div>
        );

      case 'Discounts':
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
             <div className="bg-white rounded-[3rem] p-12 border border-slate-100 shadow-xl max-w-2xl mx-auto text-center">
                <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-4xl shadow-inner ${discountConfig.enabled ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-400'}`}>
                   {discountConfig.enabled ? '🎉' : '💤'}
                </div>
                <h3 className="text-3xl font-black mb-4">Periodic <span className="text-green-600">Discounts</span></h3>
                <p className="text-slate-500 font-medium mb-12">Enable global store-wide discounts for a specific period to boost sales.</p>
                
                <div className="space-y-8 text-left">
                   <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem]">
                      <div>
                         <p className="font-black text-slate-900">Enable Flash Sale</p>
                         <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Status: {discountConfig.enabled ? 'ACTIVE' : 'INACTIVE'}</p>
                      </div>
                      <button 
                        onClick={() => setDiscountConfig({...discountConfig, enabled: !discountConfig.enabled})}
                        className={`w-16 h-8 rounded-full relative transition-all ${discountConfig.enabled ? 'bg-green-600' : 'bg-slate-300'}`}
                      >
                         <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${discountConfig.enabled ? 'left-9' : 'left-1'}`} />
                      </button>
                   </div>

                   <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Discount Percentage (%)</label>
                      <input 
                        type="number" 
                        value={discountConfig.percentage} 
                        onChange={e => setDiscountConfig({...discountConfig, percentage: parseInt(e.target.value) || 0})}
                        className="w-full p-6 bg-slate-50 rounded-[2rem] border-none focus:ring-2 focus:ring-green-500/20 font-black text-2xl"
                        placeholder="0"
                      />
                   </div>

                   <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Announcement Message</label>
                      <textarea 
                        value={discountConfig.message} 
                        onChange={e => setDiscountConfig({...discountConfig, message: e.target.value})}
                        className="w-full p-6 bg-slate-50 rounded-[2rem] border-none focus:ring-2 focus:ring-green-500/20 font-bold h-32"
                        placeholder="e.g. Summer Health Sale! Get 10% off on all medicines."
                      />
                   </div>

                   <button 
                     onClick={async () => {
                        setSavingDiscount(true);
                        try {
                           const token = localStorage.getItem('token');
                           await axios.post(`${API_URL}/api/admin/discounts`, discountConfig, {
                              headers: { Authorization: `Bearer ${token}` }
                           });
                           alert('Discount settings saved successfully! 🚀');
                        } catch (err) {
                           alert('Failed to save discounts');
                        } finally {
                           setSavingDiscount(false);
                        }
                     }}
                     disabled={savingDiscount}
                     className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-lg hover:bg-green-600 transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
                   >
                      {savingDiscount ? <Loader2 className="animate-spin mx-auto" /> : 'APPLY GLOBAL DISCOUNT'}
                   </button>
                </div>
             </div>
          </motion.div>
        );
    }
  };

  if (!mounted || !authorized) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
       <Loader2 className="w-12 h-12 animate-spin text-green-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Add Medicine Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md"
          >
             <motion.div 
               initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
               className="bg-white w-full max-w-xl rounded-[3rem] p-10 shadow-2xl relative"
             >
                <button onClick={() => setShowAddModal(false)} className="absolute top-8 right-8 p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-6 h-6" /></button>
                <h3 className="text-3xl font-black mb-8">Add <span className="text-green-600">Medicine</span></h3>
                 <div className="flex gap-6 mb-8">
                    <div className="flex-1 space-y-4">
                       <label className="text-xs font-black uppercase tracking-widest text-slate-400">AI Product Scan</label>
                       <div className="relative group">
                          <input 
                            type="file" 
                            id="prod-image" 
                            className="hidden" 
                            onChange={(e) => {
                               const f = e.target.files?.[0];
                               if (f) {
                                  const name = f.name.split('.')[0].replace(/_/g, ' ');
                                  setNewMed({
                                     ...newMed,
                                     name: name.charAt(0).toUpperCase() + name.slice(1),
                                     category: 'Antibiotic',
                                     price: '299',
                                     stock: '50',
                                     description: `Premium quality ${name} for medical use.`
                                  });
                               }
                            }}
                          />
                          <label htmlFor="prod-image" className="w-full h-40 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center gap-3 cursor-pointer group-hover:border-green-500 group-hover:bg-green-50/50 transition-all">
                             <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg group-hover:bg-green-600 transition-colors">
                                <Camera className="w-6 h-6" />
                             </div>
                             <p className="text-xs font-black text-slate-400 group-hover:text-green-600">Scan Product Label</p>
                          </label>
                       </div>
                    </div>
                 </div>

                 <form onSubmit={handleAddMedicine} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-slate-400">Name</label>
                          <input required type="text" value={newMed.name} onChange={e => setNewMed({...newMed, name: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-green-500/20 font-bold" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-slate-400">Category</label>
                          <select value={newMed.category} onChange={e => setNewMed({...newMed, category: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-green-500/20 font-bold">
                             {['Fever', 'Antibiotic', 'Pain Relief', 'Allergy', 'Vitamins'].map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-slate-400">Price (INR)</label>
                          <input required type="number" value={newMed.price} onChange={e => setNewMed({...newMed, price: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-green-500/20 font-bold" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-slate-400">Stock</label>
                          <input required type="number" value={newMed.stock} onChange={e => setNewMed({...newMed, stock: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-green-500/20 font-bold" />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-black uppercase tracking-widest text-slate-400">Description</label>
                       <textarea required value={newMed.description} onChange={e => setNewMed({...newMed, description: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-green-500/20 font-bold h-32" />
                    </div>
                   <button type="submit" className="w-full py-5 bg-green-600 text-white rounded-[2rem] font-black text-lg hover:bg-green-700 transition-all shadow-xl shadow-green-200">
                      Save Medicine
                   </button>
                </form>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Toggle Button */}
      <button 
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed bottom-8 right-8 z-[70] w-16 h-16 bg-green-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all active:scale-95"
      >
        <Menu className="w-8 h-8" />
      </button>

      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[55] lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside 
        onMouseEnter={() => isCollapsed && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`${(isCollapsed && !isHovered) ? 'w-24' : 'w-80'} bg-slate-900 text-white fixed lg:flex flex-col p-10 h-full z-[60] transition-all duration-300 shadow-2xl shadow-black/50 ${isMobileMenuOpen ? 'flex left-0' : 'hidden lg:flex -left-full lg:left-0'}`}
      >
        <div className="flex items-center justify-between mb-16">
           <div className={`flex items-center gap-5 ${(isCollapsed && !isHovered) && !isMobileMenuOpen ? 'hidden' : 'flex'}`}>
              <Logo className="w-12 h-12" />
              <span className="text-2xl font-black tracking-tighter text-white">Admin <span className="text-green-500">Panel</span></span>
           </div>
           <div className="flex items-center gap-2">
              <button 
                onClick={() => { setIsCollapsed(!isCollapsed); setIsHovered(false); }}
                className={`p-3 bg-white/5 hover:bg-green-600 rounded-xl transition-all text-white ${(isCollapsed && !isHovered) && !isMobileMenuOpen ? 'mx-auto' : ''} hidden lg:block`}
              >
                {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
              </button>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-3 bg-white/5 hover:bg-red-600 rounded-xl transition-all text-white lg:hidden"
              >
                <X className="w-6 h-6" />
              </button>
           </div>
        </div>
        
        <nav className="flex-1 space-y-4">
          {[
            { name: 'Dashboard', icon: LayoutDashboard },
            { name: 'Inventory', icon: Package },
            { name: 'Orders', icon: ShoppingBag },
            { name: 'Customers', icon: Users },
            { name: 'Analytics', icon: BarChart3 },
            { name: 'Discounts', icon: DollarSign },
          ].map((item) => (
            <button 
              key={item.name} 
              onClick={() => { setActiveTab(item.name); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center ${(isCollapsed && !isHovered) && !isMobileMenuOpen ? 'justify-center' : 'gap-5'} px-6 py-4 rounded-2xl transition-all ${activeTab === item.name ? 'bg-green-600 text-white shadow-xl shadow-green-600/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              title={(isCollapsed && !isHovered) ? item.name : ''}
            >
               <item.icon className="w-6 h-6 flex-shrink-0" />
               {(!((isCollapsed && !isHovered)) || isMobileMenuOpen) && <span className="font-black tracking-wide">{item.name}</span>}
            </button>
          ))}
        </nav>

        <div className="pt-8 border-t border-white/5 space-y-4">
          <Link href="/?exit=true" className={`w-full flex items-center ${(isCollapsed && !isHovered) && !isMobileMenuOpen ? 'justify-center' : 'gap-5'} px-6 py-4 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 transition-all`} title={(isCollapsed && !isHovered) ? 'Exit' : ''}>
             <ArrowLeft className="w-6 h-6 flex-shrink-0" />
             {(!((isCollapsed && !isHovered)) || isMobileMenuOpen) && <span className="font-black tracking-wide">Exit to Site</span>}
          </Link>
          <button onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href='/login'; }} className={`w-full flex items-center ${(isCollapsed && !isHovered) && !isMobileMenuOpen ? 'justify-center' : 'gap-5'} px-6 py-4 rounded-2xl text-red-400 hover:text-white hover:bg-red-600 transition-all`} title={(isCollapsed && !isHovered) ? 'Logout' : ''}>
             <LogOut className="w-6 h-6 flex-shrink-0" />
             {(!((isCollapsed && !isHovered)) || isMobileMenuOpen) && <span className="font-black tracking-wide">Logout</span>}
          </button>
         </div>
       </aside>

      <main className={`flex-1 ${isCollapsed ? 'lg:ml-24' : 'lg:ml-80'} p-6 md:p-12 transition-all duration-300`}>
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8">
           <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">{activeTab}</h1>
              <p className="text-slate-500 font-medium">Managing Ecosystem in ₹ INR</p>
           </div>
        
           <div className="flex items-center gap-6">
              <div className="relative group">
                 <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-600 w-5 h-5 transition-colors" />
                 <input 
                  type="text" 
                  placeholder="Universal Search..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-14 pr-6 py-5 rounded-[2rem] bg-white border border-slate-100 shadow-xl shadow-slate-100/50 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all font-bold min-w-[300px]" 
                 />
              </div>

              <div className="relative">
                <button 
                  onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                  className="relative w-16 h-16 bg-white rounded-2xl flex items-center justify-center border border-slate-100 shadow-xl shadow-slate-100/50 hover:bg-slate-50 transition-all group"
                >
                   <Bell className="w-6 h-6 text-slate-400 group-hover:text-green-600" />
                   {notifCount > 0 && (
                     <span className="absolute -top-2 -right-2 w-7 h-7 bg-red-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-4 border-slate-50 shadow-lg animate-bounce">
                       {notifCount}
                     </span>
                   )}
                </button>

                <AnimatePresence>
                  {showNotifDropdown && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-4 w-[400px] bg-white rounded-[2rem] shadow-2xl border border-slate-100 z-[110] overflow-hidden"
                    >
                      <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                        <h3 className="font-black text-slate-900 uppercase tracking-widest text-[10px]">Recent Alerts</h3>
                        {notifCount > 0 && (
                          <button 
                            onClick={async () => {
                              try {
                                const token = localStorage.getItem('token');
                                if (token) {
                                  await axios.post(`${API_URL}/api/notifications/read`, {}, {
                                    headers: { Authorization: `Bearer ${token}` }
                                  });
                                  setNotifCount(0);
                                  setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                                  window.dispatchEvent(new Event('notif-refresh'));
                                }
                              } catch (e) {
                                console.error('Failed to clear notifications:', e);
                              }
                            }}
                            className="text-[10px] font-black text-green-600 hover:underline uppercase tracking-widest"
                          >
                            Clear All
                          </button>
                        )}
                      </div>
                      <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        {notifications.length > 0 ? (
                          notifications.slice(0, 10).map((n) => (
                            <div 
                              key={n.id} 
                              onClick={async () => {
                                // 1. Extract Order ID if possible
                                const orderMatch = n.message.match(/(?:ORD-|ANJ-|#)([A-Z0-9-]+)|(\d{4,})/i);
                                if (orderMatch) {
                                  const orderId = (orderMatch[1] || orderMatch[2]).replace(/[()]/g, '');
                                  setActiveTab('Orders');
                                  setSearch(orderId);
                                } else if (n.title.toLowerCase().includes('order')) {
                                  setActiveTab('Orders');
                                  setSearch(''); // Show all orders if no specific ID
                                }
                                
                                // Refresh data to ensure the new order is in the list
                                fetchData();
                                
                                // 2. Close dropdown
                                setShowNotifDropdown(false);

                                // 3. Mark this specific one as read (optional logic but good to have)
                                if (!n.read) {
                                  try {
                                    const token = localStorage.getItem('token');
                                    await axios.post(`${API_URL}/api/notifications/read`, {}, {
                                      headers: { Authorization: `Bearer ${token}` }
                                    });
                                    setNotifCount(0); // For now just clear badge
                                  } catch (e) {}
                                }
                              }}
                              className={`p-5 border-b border-slate-50 hover:bg-slate-50 transition-colors relative cursor-pointer ${!n.read ? 'bg-green-50/30' : ''}`}
                            >
                              {!n.read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-600"></div>}
                              <div className="flex items-start gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                  n.type === 'order' ? 'bg-blue-50 text-blue-600' : 
                                  n.type === 'alert' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                                }`}>
                                  {n.type === 'order' ? <ShoppingBag className="w-5 h-5" /> : 
                                   n.type === 'alert' ? <ShieldAlert className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-black text-slate-900 text-sm truncate">{n.title}</p>
                                  <p className="text-xs text-slate-500 font-medium line-clamp-2 mt-0.5">{n.message}</p>
                                  <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-tight">
                                    {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(n.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-10 text-center text-slate-400">
                            <Bell className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p className="font-bold text-xs uppercase tracking-widest">No new alerts</p>
                          </div>
                        )}
                      </div>
                      <Link 
                        href="/notifications" 
                        onClick={() => setShowNotifDropdown(false)}
                        className="p-4 w-full bg-slate-900 text-white text-center font-black text-[10px] uppercase tracking-[0.2rem] hover:bg-green-600 transition-all block"
                      >
                        View Full History
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
           </div>
         </header>

         {fetchError && (
           <div className="mb-12 p-8 bg-red-50 border border-red-100 rounded-[2rem] text-red-600 shadow-xl shadow-red-100/20 relative overflow-hidden group">
             <div className="absolute top-0 left-0 w-2 h-full bg-red-500"></div>
             <div className="flex flex-col md:flex-row items-center gap-6">
               <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                 <ShieldAlert className="w-8 h-8 text-red-600" />
               </div>
               <div className="flex-1 text-center md:text-left">
                 <h4 className="text-xl font-black mb-1">Database Connectivity Issue</h4>
                 <p className="font-bold opacity-80">{fetchError}. Please ensure the server is running on the correct port (default: 5010).</p>
               </div>
               <button 
                onClick={() => { setFetchError(null); fetchData(); }}
                className="px-8 py-4 bg-red-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-200"
               >
                 Retry Connection
               </button>
             </div>
           </div>
         )}

        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
      </main>
    </div>
  );
}
