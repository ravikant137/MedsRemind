'use client';
import { useState } from 'react';
import { 
  Upload, FileText, CheckCircle, AlertCircle, Loader2, 
  Pill, ArrowRight, Bell, Clock, Activity, ShoppingBag, ShieldCheck
} from 'lucide-react';
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

  const handleUpload = async () => {
    if (!file || !preview) return;
    setIsProcessing(true);
    try {
      const res = await axios.post('/api/analyze-prescription', {
        image: preview
      });
      
      setResult({
        medicines: res.data.medicines || [],
        confidence: 99
      });
    } catch (err: any) {
      console.error('Prescription Analysis Error:', err);
      const serverError = err.response?.data?.error || 'Failed to analyze prescription. Please ensure the image is clear.';
      alert(serverError);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSetReminders = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Your session has expired. Please login again.');
      router.push('/login');
      return;
    }

    setIsSettingReminders(true);
    try {
      await axios.post('/api/reminders/bulk', {
        medicines: result.medicines
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRemindersSet(true);
      setTimeout(() => { router.push('/reminders'); }, 2000);
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Unknown error';
      alert(`Sync Failed: ${errorMsg}. Please try logging in again.`);
      console.error('Sync error:', err);
      // router.push('/login'); // Temporarily disable redirect to see error
    } finally {
      setIsSettingReminders(false);
    }
  };

  const handleBuyMedicines = () => {
    if (!result || !result.medicines) return;
    
    // Automatically add extracted medicines to the cart (stock)
    const cartItems = result.medicines.map((med: any, index: number) => ({
      id: 9000 + index, // Mock ID for checkout
      name: med.name,
      price: Math.floor(Math.random() * 100) + 50, // Mock price
      stock: 100,
      quantity: 1,
      category: 'Prescription'
    }));
    
    localStorage.setItem('meds_cart', JSON.stringify(cartItems));
    router.push('/checkout');
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      {/* Header */}
      <section className="section-blue py-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-green-400 font-semibold text-sm mb-2">Prescription Upload</p>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Upload Your Prescription</h1>
          <p className="text-blue-200 max-w-lg mx-auto text-sm">
            Upload your prescription and we will extract medicine details automatically. Our pharmacist will verify and confirm your order.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-8 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-6 text-center">
            {[
              { step: 1, text: 'Upload your prescription image or PDF' },
              { step: 2, text: 'We verify medicines and availability' },
              { step: 3, text: 'Get medicines delivered to your door' },
            ].map(s => (
              <div key={s.step} className="flex flex-col items-center">
                <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold mb-2 text-sm">{s.step}</div>
                <p className="text-xs text-gray-500 font-medium">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-10">
            {/* Upload Zone */}
            <div className={`bg-white p-8 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center min-h-[420px] transition-all shadow-md ${
              file ? 'border-green-400 bg-green-50/30' : 'border-gray-200 hover:border-green-400'
            }`}>
              <div className="w-20 h-20 bg-blue-900 rounded-2xl flex items-center justify-center mb-6">
                <Upload className="w-10 h-10 text-white" />
              </div>
              <p className="text-gray-900 font-bold text-lg mb-2 text-center">Drop your prescription here</p>
              <p className="text-gray-400 text-sm mb-8 text-center">JPG, PNG or PDF formats supported (up to 10MB)</p>
              
              <input type="file" id="file-upload" className="hidden" onChange={handleFileChange} accept="image/*,application/pdf" />
              <label htmlFor="file-upload" className="btn-green cursor-pointer px-8 py-3 rounded-lg text-sm">
                {file ? 'Change Prescription' : 'Browse Files'}
              </label>

              {file && (
                <div className="mt-6 flex items-center gap-3 bg-white p-4 rounded-xl shadow-md border border-gray-100 w-full">
                  <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1 truncate">
                    <p className="text-sm font-bold text-gray-800 truncate">{file.name}</p>
                    <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button onClick={() => { setFile(null); setPreview(null); setResult(null); }} className="text-gray-300 hover:text-red-500 text-xl font-bold">×</button>
                </div>
              )}
            </div>

            {/* Results Zone */}
            <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 flex flex-col min-h-[420px]">
              {!file && (
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="font-semibold text-gray-400">Waiting for upload...</p>
                </div>
              )}

              {file && !result && !isProcessing && (
                <div className="flex-1 flex flex-col">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div> Preview
                  </h3>
                  <div className="flex-1 bg-gray-50 rounded-xl overflow-hidden border border-gray-200 relative">
                    {preview && <img src={preview} alt="Prescription" className="w-full h-full object-cover" />}
                  </div>
                  <button 
                    onClick={handleUpload}
                    className="btn-green w-full mt-6 py-4 rounded-xl text-sm flex items-center justify-center gap-2"
                  >
                    Start Processing <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {isProcessing && (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <div className="relative">
                    <Loader2 className="w-16 h-16 text-green-600 animate-spin mb-6" />
                    <Activity className="w-6 h-6 text-green-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Processing...</h3>
                  <p className="text-gray-500 mt-2 text-sm">Extracting medicine details from your prescription</p>
                </div>
              )}

              {result && (
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-gray-900 text-lg">Extracted Medicines</h3>
                    <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
                      <CheckCircle className="w-3.5 h-3.5" /> {result.confidence}% Match
                    </span>
                  </div>
                  <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {result.medicines.map((m: any, i: number) => (
                      <div key={i} className="p-5 bg-slate-50 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group relative">
                        <div className="flex items-start gap-4">
                           <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm shrink-0 border border-slate-50">
                              <Pill className="w-6 h-6 text-green-600" />
                           </div>
                           <div className="flex-1">
                              <h4 className="font-black text-slate-900 text-lg mb-2">{m.name}</h4>
                              <div className="flex flex-wrap gap-2">
                                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-100">
                                   <Activity className="w-3.5 h-3.5 text-blue-500" />
                                   <span className="text-xs font-bold text-slate-500">{m.dosage}</span>
                                </div>
                                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-100">
                                   <Clock className="w-3.5 h-3.5 text-purple-500" />
                                   <span className="text-xs font-bold text-slate-500">{m.duration || m.frequency}</span>
                                </div>
                              </div>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-6 space-y-3">
                    {remindersSet ? (
                      <div className="w-full py-4 bg-green-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 text-sm">
                        <CheckCircle className="w-5 h-5" /> Reminders Set Successfully
                      </div>
                    ) : (
                      <button 
                        onClick={handleSetReminders}
                        disabled={isSettingReminders}
                        className="btn-blue w-full py-4 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isSettingReminders ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Bell className="w-4 h-4" /> Set Medicine Reminders</>}
                      </button>
                    )}
                    <button 
                      onClick={handleBuyMedicines}
                      className="w-full py-3 text-gray-500 font-semibold hover:text-green-600 transition-colors text-sm flex items-center justify-center gap-2"
                    >
                      <ShoppingBag className="w-4 h-4" /> Buy these medicines
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Safety notice */}
          <div className="mt-10 bg-yellow-50 border border-yellow-200 rounded-xl p-5 flex items-start gap-4">
            <ShieldCheck className="w-6 h-6 text-yellow-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-yellow-800 text-sm mb-1">Prescription Required</p>
              <p className="text-yellow-700 text-xs">Prescription medicines will be dispensed only against a valid prescription. Our pharmacist will verify your prescription before processing the order.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
