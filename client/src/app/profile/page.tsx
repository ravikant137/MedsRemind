'use client';
import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, ShieldCheck, Edit3, Save, Camera, ArrowLeft, Loader2, Heart, Activity, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    setFormData({
      name: parsedUser.name || '',
      email: parsedUser.email || '',
      phone: parsedUser.phone || '',
      address: parsedUser.address || ''
    });
    setLoading(false);
  }, []);

  const handleSave = () => {
    // In a real app, this would be an API call
    const updatedUser = { ...user, ...formData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="w-12 h-12 animate-spin text-green-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pt-32 px-6 pb-20">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-12">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors font-black uppercase tracking-widest text-xs">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <button 
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className={`px-8 py-4 rounded-2xl font-black flex items-center gap-3 transition-all shadow-xl ${isEditing ? 'bg-green-600 text-white shadow-green-200 hover:bg-green-700' : 'bg-slate-900 text-white shadow-slate-200 hover:bg-slate-800'}`}
          >
            {isEditing ? <><Save className="w-5 h-5" /> Save Changes</> : <><Edit3 className="w-5 h-5" /> Edit Profile</>}
          </button>
        </header>

        <div className="grid md:grid-cols-3 gap-12">
          {/* Profile Sidebar */}
          <div className="space-y-8">
            <div className="bg-white p-10 rounded-[4rem] shadow-2xl shadow-slate-200/50 text-center relative overflow-hidden group border border-white">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                <Heart className="w-32 h-32 text-slate-900" />
              </div>
              <div className="relative mb-8">
                <div className="w-32 h-32 bg-gradient-to-tr from-green-600 to-green-400 rounded-[3rem] flex items-center justify-center text-white text-5xl font-black mx-auto shadow-2xl shadow-green-200">
                  {user?.name?.[0]}
                </div>
                {isEditing && (
                  <button className="absolute bottom-0 right-1/4 w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center border-4 border-white hover:bg-green-600 transition-colors">
                    <Camera className="w-5 h-5" />
                  </button>
                )}
              </div>
              <h2 className="text-2xl font-black text-slate-900">{user?.name}</h2>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2 mb-6">Patient ID: #MED-{user?.id || '001'}</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-green-100">
                <ShieldCheck className="w-4 h-4" /> Verified Patient
              </div>
            </div>

            <div className="bg-slate-900 p-8 rounded-[3rem] text-white">
              <h3 className="font-black mb-6 flex items-center gap-3">
                <Activity className="w-5 h-5 text-green-500" /> Health Stats
              </h3>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400">Blood Group</span>
                  <span className="font-black text-lg">O+ Positive</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400">Adherence</span>
                  <span className="font-black text-lg text-green-500">94%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400">Orders</span>
                  <span className="font-black text-lg">12 Total</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Area */}
          <div className="md:col-span-2 space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-12 rounded-[4rem] shadow-2xl shadow-slate-200/50 border border-white"
            >
              <h3 className="text-2xl font-black text-slate-900 mb-10 flex items-center gap-3">
                <User className="w-7 h-7 text-green-600" /> Personal Information
              </h3>
              
              <div className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                      <User className="w-3 h-3" /> Full Name
                    </label>
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={formData.name} 
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full p-5 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-green-500/20 font-bold"
                      />
                    ) : (
                      <p className="text-lg font-black text-slate-900 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">{formData.name}</p>
                    )}
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                      <Mail className="w-3 h-3" /> Email Address
                    </label>
                    {isEditing ? (
                      <input 
                        type="email" 
                        value={formData.email} 
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        className="w-full p-5 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-green-500/20 font-bold"
                      />
                    ) : (
                      <p className="text-lg font-black text-slate-900 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">{formData.email}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                    <Phone className="w-3 h-3" /> Contact Number
                  </label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={formData.phone} 
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full p-5 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-green-500/20 font-bold"
                    />
                  ) : (
                    <p className="text-lg font-black text-slate-900 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">{formData.phone || 'Not provided'}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                    <MapPin className="w-3 h-3" /> Delivery Address
                  </label>
                  {isEditing ? (
                    <textarea 
                      rows={4}
                      value={formData.address} 
                      onChange={e => setFormData({...formData, address: e.target.value})}
                      className="w-full p-5 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-green-500/20 font-bold resize-none"
                    />
                  ) : (
                    <p className="text-lg font-black text-slate-900 bg-slate-50/50 p-5 rounded-2xl border border-slate-100 leading-relaxed min-h-[120px]">{formData.address || 'No address saved yet.'}</p>
                  )}
                </div>
              </div>
            </motion.div>

            <div className="bg-green-600 p-10 rounded-[4rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-green-200">
              <div className="space-y-2">
                <h4 className="text-2xl font-black flex items-center gap-3"><ShoppingBag className="w-6 h-6" /> Recent Orders</h4>
                <p className="text-green-100 font-medium">Check your delivery status and order history.</p>
              </div>
              <button onClick={() => router.push('/track')} className="px-10 py-5 bg-white text-green-600 rounded-[2rem] font-black hover:bg-slate-50 transition-all shadow-xl">
                Track Orders
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
