'use client';
import { useState } from 'react';
import { 
  Upload, FileText, CheckCircle, AlertCircle, Loader2, 
  Sparkles, Pill, ArrowRight, Bell, Calendar, Activity, Clock, ShoppingBag 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { API_URL } from '@/config';
import { useRouter } from 'next/navigation';

export default function PrescriptionUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSettingReminders, setIsSettingReminders] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [remindersSet, setRemindersSet] = useState(false);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(f);
    }
  };

  const handleUpload = () => {
    setIsProcessing(true);
    // Mocking AI OCR processing
    setTimeout(() => {
      setIsProcessing(false);
      setResult({
        medicines: [
          { name: 'Paracetamol 500mg', dosage: '1-0-1', duration: '5 days' },
          { name: 'Amoxicillin 250mg', dosage: '1-1-1', duration: '7 days' }
        ],
        confidence: 99
      });
    }, 3000);
  };

  const handleSetReminders = async () => {
    setIsSettingReminders(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/reminders/bulk`, {
        medicines: result.medicines
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setRemindersSet(true);
      setTimeout(() => {
        router.push('/reminders');
      }, 2000);
    } catch (err) {
      alert('Failed to set reminders. Please login.');
      router.push('/login');
    } finally {
      setIsSettingReminders(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-6 px-6 pb-20 overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-green-100/50 rounded-full blur-[120px] -z-10"></div>
      
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-10">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-[10px] font-black mb-4 uppercase tracking-widest"
          >
            <Sparkles className="w-3 h-3" /> AI-POWERED EXTRACTION
          </motion.div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Upload <span className="text-green-600">Prescription</span></h1>
          <p className="text-slate-500 mt-2 text-sm font-medium max-w-lg mx-auto">Extract medicine data automatically from your RX.</p>
        </header>

        <div className="grid md:grid-cols-2 gap-12">
           {/* Upload Zone */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className={`glass-card p-10 rounded-[3rem] border-2 border-dashed flex flex-col items-center justify-center transition-all min-h-[450px] ${file ? 'border-green-500 bg-green-50/20' : 'border-slate-200 hover:border-green-400 bg-white/40'}`}
            >
              <div className="w-24 h-24 bg-gradient-to-r from-primary to-secondary rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl group-hover:rotate-12 transition-transform">
                 <Upload className="w-10 h-10 text-white" />
              </div>
              <p className="text-slate-900 font-black text-xl mb-4 text-center">Drop your RX here</p>
              <p className="text-slate-400 text-sm mb-10 text-center font-medium">JPG, PNG or PDF formats supported up to 10MB</p>
              
              <input 
                type="file" 
                id="file-upload" 
                className="hidden" 
                onChange={handleFileChange}
                accept="image/*,application/pdf"
              />
              <label htmlFor="file-upload" className="px-10 py-5 bg-gradient-to-r from-primary to-secondary text-white rounded-[2rem] font-black cursor-pointer hover:from-primary-dark hover:to-secondary-dark transition-all shadow-xl shadow-slate-200">
                 {file ? 'Change Prescription' : 'Browse Files'}
              </label>

              {file && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-10 flex items-center gap-4 bg-white p-5 rounded-3xl shadow-xl border border-slate-100 w-full"
                >
                   <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                      <FileText className="w-6 h-6" />
                   </div>
                   <div className="flex-1 truncate">
                      <p className="text-sm font-black text-slate-800 truncate">{file.name}</p>
                      <p className="text-xs text-slate-400 font-bold">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                   </div>
                   <button onClick={() => {setFile(null); setPreview(null); setResult(null);}} className="text-slate-300 hover:text-red-500 p-2 font-bold text-2xl">×</button>
                </motion.div>
              )}
           </motion.div>

           {/* Results Zone */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-8 rounded-[3rem] flex flex-col h-full min-h-[450px] border border-white shadow-2xl shadow-green-100/20"
            >
              {!file && (
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40">
                   <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                      <AlertCircle className="w-10 h-10 text-slate-400" />
                   </div>
                   <p className="font-bold text-slate-400">Waiting for upload...</p>
                </div>
              )}

              {file && !result && !isProcessing && (
                <div className="flex-1 flex flex-col">
                   <h3 className="font-black text-slate-900 mb-6 flex items-center gap-2">
                     <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                     Visual Preview
                   </h3>
                   <div className="flex-1 bg-slate-100 rounded-[2.5rem] overflow-hidden border border-slate-200 relative group">
                      {preview && <img src={preview} alt="Prescription" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent"></div>
                   </div>
                   <button 
                     onClick={handleUpload}
                     className="w-full mt-10 py-5 bg-green-600 text-white rounded-[2rem] font-black hover:bg-green-700 transition-all shadow-xl shadow-green-200 flex items-center justify-center gap-3"
                   >
                      Start AI Scanning <ArrowRight className="w-5 h-5" />
                   </button>
                </div>
              )}

              <AnimatePresence>
                {isProcessing && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-1 flex flex-col items-center justify-center text-center py-20"
                  >
                     <div className="relative">
                        <Loader2 className="w-24 h-24 text-green-600 animate-spin mb-8" />
                        <Activity className="w-8 h-8 text-green-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                     </div>
                     <h3 className="text-3xl font-black text-slate-900">Neural Syncing...</h3>
                     <p className="text-slate-500 mt-4 font-medium">Extracting medical entities and dosages</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {result && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex-1 flex flex-col"
                >
                   <div className="flex items-center justify-between mb-8">
                      <h3 className="font-black text-slate-900 text-xl">Extracted Data</h3>
                      <div className="flex items-center gap-2 text-xs font-black text-green-600 bg-green-50 px-4 py-2 rounded-full border border-green-100">
                         <CheckCircle className="w-4 h-4" /> {result.confidence}% CONFIDENCE
                      </div>
                   </div>
                   
                   <div className="space-y-4 flex-1">
                      {result.medicines.map((m: any, i: number) => (
                        <motion.div 
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          key={i} 
                          className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 group hover:bg-white hover:shadow-xl transition-all"
                        >
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                <Pill className="w-5 h-5 text-green-600" />
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between">
                                   <p className="font-black text-slate-900">{m.name}</p>
                                   <Bell className="w-4 h-4 text-green-600" />
                                </div>
                                <div className="flex gap-4 mt-1 text-sm text-slate-400 font-bold">
                                   <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> {m.dosage}</span>
                                   <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {m.duration}</span>
                                </div>
                              </div>
                           </div>
                        </motion.div>
                      ))}
                   </div>

                   <div className="pt-10 space-y-4">
                      {remindersSet ? (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="w-full py-5 bg-green-600 text-white rounded-[2rem] font-black flex items-center justify-center gap-3 shadow-2xl shadow-green-200"
                        >
                           <CheckCircle className="w-6 h-6" /> All Reminders Synchronized
                        </motion.div>
                      ) : (
                        <button 
                          onClick={handleSetReminders}
                          disabled={isSettingReminders}
                          className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black hover:bg-green-600 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                           {isSettingReminders ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Auto-Set Smart Reminders <Bell className="w-5 h-5" /></>}
                        </button>
                      )}
                      <button 
                        onClick={() => router.push('/shop')}
                        className="w-full py-4 text-slate-400 font-bold hover:text-green-600 transition-all flex items-center justify-center gap-2"
                      >
                         <ShoppingBag className="w-5 h-5" /> Buy these medicines
                      </button>
                   </div>
                </motion.div>
              )}
           </motion.div>
        </div>
      </div>
    </div>
  );
}
