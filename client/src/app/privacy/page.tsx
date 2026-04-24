'use client';
import { Shield, Lock, Eye, FileText, CheckCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function Privacy() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 pt-32 px-6 pb-20">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => router.back()} className="mb-12 flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors font-black uppercase tracking-widest text-xs">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <header className="mb-20">
          <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white mb-8 shadow-2xl shadow-blue-200">
            <Shield className="w-10 h-10" />
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-4">Privacy <span className="text-blue-600">Policy</span></h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Last Updated: April 24, 2026</p>
        </header>

        <div className="bg-white p-12 md:p-20 rounded-[4rem] shadow-2xl shadow-slate-200/50 border border-white space-y-16">
          <section className="space-y-6">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-4">
              <Lock className="w-7 h-7 text-blue-600" /> Your Data is Secure
            </h2>
            <p className="text-slate-600 leading-relaxed font-medium">At MedsRemind, we take your medical privacy with the utmost seriousness. We use industry-standard AES-256 encryption to protect your sensitive health records and personal information.</p>
          </section>

          <section className="space-y-6">
            <h3 className="text-xl font-black text-slate-900">1. Information We Collect</h3>
            <ul className="space-y-4">
              {[
                'Personal Identification (Name, Email, Phone)',
                'Medical Information (Prescriptions, Medication Names)',
                'Delivery Address and Payment History',
                'Device and Usage Data for app optimization'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-4 text-slate-600 font-bold">
                  <CheckCircle className="w-5 h-5 text-green-500" /> {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-6">
            <h3 className="text-xl font-black text-slate-900">2. How We Use Your Data</h3>
            <p className="text-slate-600 leading-relaxed font-medium">Your data is primarily used to provide medication reminders, process orders, and improve our AI scanning accuracy. We NEVER sell your medical data to third-party advertisers.</p>
          </section>

          <section className="space-y-6">
            <h3 className="text-xl font-black text-slate-900">3. Your Rights</h3>
            <p className="text-slate-600 leading-relaxed font-medium">You have the right to access, export, and delete your data at any time from your profile settings. For HIPAA or GDPR related inquiries, please contact our privacy officer.</p>
          </section>

          <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                <FileText className="w-6 h-6" />
              </div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Full Document (PDF)</p>
            </div>
            <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-blue-600 transition-all shadow-xl">
              Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
