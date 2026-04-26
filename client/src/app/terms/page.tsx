'use client';
import { FileText, Scale, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function Terms() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 pt-6 px-6 pb-20">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => router.back()} className="mb-12 flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors font-black uppercase tracking-widest text-xs">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <header className="mb-20">
          <div className="w-20 h-20 bg-orange-600 rounded-[2rem] flex items-center justify-center text-white mb-8 shadow-2xl shadow-orange-200">
            <Scale className="w-10 h-10" />
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-4">Terms of <span className="text-orange-600">Service</span></h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Last Updated: April 24, 2026</p>
        </header>

        <div className="bg-white p-12 md:p-20 rounded-[4rem] shadow-2xl shadow-slate-200/50 border border-white space-y-16">
          <div className="p-8 bg-orange-50 border border-orange-100 rounded-3xl flex gap-6 items-start">
            <AlertCircle className="w-8 h-8 text-orange-600 shrink-0" />
            <p className="text-sm font-bold text-orange-900 leading-relaxed">
              IMPORTANT MEDICAL DISCLAIMER: Anjaneya Pharmacy is a tracking and ordering tool. We do not provide medical advice. Always consult with a licensed healthcare professional before changing your medication regimen.
            </p>
          </div>

          <section className="space-y-6">
            <h2 className="text-2xl font-black text-slate-900">1. Acceptance of Terms</h2>
            <p className="text-slate-600 leading-relaxed font-medium">By using the Anjaneya Pharmacy application, you agree to comply with and be bound by the following terms and conditions of use. If you disagree with any part of these terms, please do not use our services.</p>
          </section>

          <section className="space-y-6">
            <h3 className="text-xl font-black text-slate-900">2. User Responsibilities</h3>
            <ul className="space-y-4">
              {[
                'You must provide accurate medical and prescription data.',
                'You are responsible for maintaining the confidentiality of your account.',
                'You must be at least 18 years old or use the service under supervision.',
                'You agree not to upload fraudulent prescriptions.'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-4 text-slate-600 font-bold">
                  <CheckCircle className="w-5 h-5 text-green-500" /> {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-6">
            <h3 className="text-xl font-black text-slate-900">3. Limitation of Liability</h3>
            <p className="text-slate-600 leading-relaxed font-medium">Anjaneya Pharmacy is not liable for any missed doses, incorrect medication usage, or side effects. The reminder system is an auxiliary tool and should not be the sole method for managing critical health routines.</p>
          </section>

          <section className="space-y-6">
            <h3 className="text-xl font-black text-slate-900">4. Service Availability</h3>
            <p className="text-slate-600 leading-relaxed font-medium">We strive for 99.9% uptime, but we do not guarantee uninterrupted access to the platform. Maintenance windows will be communicated via the app dashboard.</p>
          </section>

          <div className="pt-12 border-t border-slate-100">
            <p className="text-xs text-slate-400 font-bold text-center">Questions about our terms? Contact us at legal@anjaneyapharmacy.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
