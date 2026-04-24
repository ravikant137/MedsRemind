'use client';
import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Package, ShoppingBag, Users, TrendingUp, 
  AlertTriangle, Search, Plus, ExternalLink, Trash2, 
  Edit3, CheckCircle, Clock, XCircle, ChevronRight, Loader2, X,
  BarChart3, PieChart, Activity, DollarSign, Calendar, ArrowLeft, LogOut, Camera, ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [stats, setStats] = useState({ revenue: 0, orders: 0, users: 0, medicines: 0 });
  const [medicines, setMedicines] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState('');
  const [newMed, setNewMed] = useState({
    name: '', composition: '', price: '', stock: '', category: 'Fever', description: ''
  });
  const [mounted, setMounted] = useState(false);
  const [authorized, setAuthorized] = useState(false);
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

  useEffect(() => {
    if (authorized) {
      fetchData();
    }
  }, [authorized, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      if (activeTab === 'Dashboard' || activeTab === 'Analytics') {
        const [statsRes, ordersRes] = await Promise.all([
          axios.get('http://localhost:5000/api/admin/stats', config),
          axios.get('http://localhost:5000/api/admin/orders', config)
        ]);
        setStats(statsRes.data || { revenue: 0, orders: 0, users: 0, medicines: 0 });
        setOrders(ordersRes.data || []);
      } else if (activeTab === 'Inventory') {
        const res = await axios.get('http://localhost:5000/api/medicines');
        setMedicines(res.data || []);
      } else if (activeTab === 'Orders') {
        const res = await axios.get('http://localhost:5000/api/admin/orders', config);
        setOrders(res.data || []);
      } else if (activeTab === 'Customers') {
        const res = await axios.get('http://localhost:5000/api/admin/users', config);
        setCustomers(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteMedicine = async (id: number) => {
    if (!confirm('Are you sure you want to delete this medicine?')) return;
    try {
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
      await axios.delete(`http://localhost:5000/api/medicines/${id}`, config);
      setMedicines(prev => prev.filter((m: any) => m.id !== id));
    } catch (err) {
      alert('Failed to delete medicine');
    }
  };

  const handleAddMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
      await axios.post('http://localhost:5000/api/medicines', newMed, config);
      setShowAddModal(false);
      setNewMed({ name: '', composition: '', price: '', stock: '', category: 'Fever', description: '' });
      fetchData();
    } catch (err) {
      alert('Failed to add medicine');
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
            {/* Stats Grid */}
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
                <div className="space-y-4">
                   {orders.map((order: any) => (
                     <div key={order.id} className={`p-6 border rounded-[2rem] flex flex-wrap items-center justify-between gap-6 hover:shadow-md transition-all ${order.is_emergency ? 'bg-red-50 border-red-200' : 'bg-white border-slate-50'}`}>
                        <div className="flex items-center gap-5">
                           <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black ${order.is_emergency ? 'bg-red-600 text-white' : 'bg-slate-900 text-white'}`}>#{order.id}</div>
                           <div>
                              <div className="flex items-center gap-2">
                                <p className="font-black text-slate-900">{order.user_name}</p>
                                {order.is_emergency === 1 && (
                                  <span className="px-3 py-1 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full animate-pulse flex items-center gap-1">
                                    <ShieldAlert className="w-3 h-3" /> PRIORITY 10M
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-400 font-medium">{order.address}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-10">
                           <div className="text-center">
                              <p className="text-xs text-slate-400 font-black uppercase tracking-widest">Amount</p>
                              <p className="font-black text-green-600 text-lg">₹{order.total_amount}</p>
                           </div>
                           <div className="text-center">
                              <p className="text-xs text-slate-400 font-black uppercase tracking-widest">Status</p>
                              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${order.is_emergency ? 'bg-red-100 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                {order.is_emergency ? <ShieldAlert className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />} 
                                {order.is_emergency ? 'Emergency' : 'Paid'}
                              </span>
                           </div>
                           <button className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-green-600 hover:text-white transition-all">
                              <ExternalLink className="w-5 h-5" />
                           </button>
                        </div>
                     </div>
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
             <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl">
                   <div className="flex items-center justify-between mb-8">
                      <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center"><DollarSign /></div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-green-500 bg-green-50 px-3 py-1 rounded-full">+12.5%</span>
                   </div>
                   <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Revenue Growth</p>
                   <h4 className="text-3xl font-black text-slate-900 mt-2">₹{(stats.revenue * 0.8).toLocaleString()}</h4>
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
                   <h4 className="text-3xl font-black text-slate-900 mt-2">84%</h4>
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
                   <h4 className="text-3xl font-black text-slate-900 mt-2">92%</h4>
                   <div className="mt-8 relative h-4 bg-slate-100 rounded-full overflow-hidden">
                      <div className="absolute left-0 top-0 h-full bg-purple-500 rounded-full shadow-lg" style={{ width: '92%' }}></div>
                   </div>
                </div>
             </div>

             <div className="bg-slate-900 p-12 rounded-[4rem] text-white overflow-hidden relative shadow-2xl">
                <div className="absolute top-0 right-0 p-10 opacity-10"><BarChart3 className="w-64 h-64" /></div>
                <h3 className="text-2xl font-black mb-12 flex items-center gap-4"><PieChart className="text-green-500" /> Sales Distribution</h3>
                <div className="grid md:grid-cols-2 gap-20 items-center">
                   <div className="space-y-8">
                      {[
                        { label: 'Antibiotics', val: '45%', color: 'bg-green-500' },
                        { label: 'Pain Relief', val: '25%', color: 'bg-blue-500' },
                        { label: 'Vitamins', val: '20%', color: 'bg-purple-500' },
                        { label: 'Others', val: '10%', color: 'bg-orange-500' }
                      ].map((item, i) => (
                        <div key={i} className="space-y-2">
                           <div className="flex justify-between text-sm font-bold">
                              <span>{item.label}</span>
                              <span className="text-slate-400">{item.val}</span>
                           </div>
                           <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                              <div className={`h-full ${item.color}`} style={{ width: item.val }}></div>
                           </div>
                        </div>
                      ))}
                   </div>
                   <div className="flex items-center justify-center">
                      <div className="w-64 h-64 rounded-full border-[20px] border-white/5 flex items-center justify-center relative">
                         <div className="absolute inset-0 border-[20px] border-green-500 rounded-full" style={{ clipPath: 'polygon(50% 50%, 50% 0, 100% 0, 100% 100%, 0 100%, 0 50%)' }}></div>
                         <div className="text-center">
                            <p className="text-4xl font-black">₹{stats.revenue.toLocaleString()}</p>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Total Sales</p>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </motion.div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center h-96 text-slate-400 gap-6">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-4xl">🚧</div>
            <h3 className="text-2xl font-bold">Section Under Development</h3>
            <p className="font-medium">We're working hard to bring this feature to life.</p>
          </div>
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
                                  // Mock AI Scan for product
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

      {/* Admin Sidebar */}
      <aside className="w-80 bg-slate-900 text-white hidden lg:flex flex-col p-10 fixed h-full z-10">
        <div className="flex items-center gap-4 mb-16">
          <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center font-black shadow-2xl shadow-green-500/20">M</div>
          <span className="text-2xl font-black tracking-tighter">Admin <span className="text-green-500">Panel</span></span>
        </div>
        
        <nav className="flex-1 space-y-4">
          {[
            { name: 'Dashboard', icon: LayoutDashboard },
            { name: 'Inventory', icon: Package },
            { name: 'Orders', icon: ShoppingBag },
            { name: 'Customers', icon: Users },
            { name: 'Analytics', icon: BarChart3 },
          ].map((item) => (
            <button 
              key={item.name} 
              onClick={() => setActiveTab(item.name)}
              className={`w-full flex items-center gap-5 px-6 py-4 rounded-2xl transition-all ${activeTab === item.name ? 'bg-green-600 text-white shadow-xl shadow-green-600/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
               <item.icon className="w-6 h-6" />
               <span className="font-black tracking-wide">{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="pt-8 border-t border-white/5 space-y-4">
          <Link href="/" className="w-full flex items-center gap-5 px-6 py-4 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 transition-all">
             <ArrowLeft className="w-6 h-6" />
             <span className="font-black tracking-wide">Exit to Site</span>
          </Link>
          <button onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href='/login'; }} className="w-full flex items-center gap-5 px-6 py-4 rounded-2xl text-red-400 hover:text-white hover:bg-red-600 transition-all">
             <LogOut className="w-6 h-6" />
             <span className="font-black tracking-wide">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-80 p-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8">
           <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">{activeTab}</h1>
              <p className="text-slate-500 font-medium">Managing Ecosystem in ₹ INR</p>
           </div>
           <div className="flex gap-4">
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
           </div>
        </header>

        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
      </main>
    </div>
  );
}
