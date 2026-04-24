'use client';
import { Heart, ShieldCheck, Zap, Users, Award, Target, Pill, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function About() {
  return (
    <div className="min-h-screen bg-slate-50 pt-32 px-6 pb-20">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-32">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-24 h-24 bg-green-600 rounded-[2.5rem] flex items-center justify-center text-white mx-auto mb-10 shadow-2xl shadow-green-200"
          >
            <Pill className="w-12 h-12" />
          </motion.div>
          <h1 className="text-6xl font-black text-slate-900 tracking-tight mb-8">Revolutionizing <span className="text-green-600">Healthcare</span></h1>
          <p className="text-xl text-slate-500 font-medium max-w-3xl mx-auto leading-relaxed">We combine cutting-edge AI technology with compassionate care to ensure you never miss a dose and always have access to the medication you need.</p>
        </header>

        <div className="grid md:grid-cols-2 gap-20 items-center mb-32">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <h2 className="text-4xl font-black text-slate-900 leading-tight">Our Mission is to make <span className="text-green-600">Health Management</span> effortless for everyone.</h2>
            <p className="text-lg text-slate-500 font-medium leading-relaxed">MedsRemind started with a simple observation: managing multiple medications is stressful and error-prone. We built a platform that takes the cognitive load off patients, allowing them to focus on recovery and wellness.</p>
            <div className="grid grid-cols-2 gap-8 pt-8">
              <div className="space-y-2">
                <p className="text-4xl font-black text-slate-900">10M+</p>
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Doses Tracked</p>
              </div>
              <div className="space-y-2">
                <p className="text-4xl font-black text-slate-900">500k</p>
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Active Users</p>
              </div>
            </div>
          </motion.div>
          <div className="relative">
            <div className="absolute inset-0 bg-green-200 blur-[100px] opacity-30 rounded-full"></div>
            <div className="relative bg-white p-12 rounded-[5rem] shadow-2xl border border-slate-100 grid grid-cols-2 gap-8">
              {[
                { icon: ShieldCheck, label: 'Secure', color: 'text-blue-600' },
                { icon: Zap, label: 'Fast', color: 'text-orange-600' },
                { icon: Heart, label: 'Caring', color: 'text-red-600' },
                { icon: Award, label: 'Trusted', color: 'text-green-600' }
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center text-center gap-4">
                  <div className="w-16 h-16 bg-slate-50 rounded-[1.5rem] flex items-center justify-center">
                    <item.icon className={`w-8 h-8 ${item.color}`} />
                  </div>
                  <p className="font-black uppercase tracking-widest text-xs text-slate-900">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <section className="bg-slate-900 rounded-[5rem] p-16 md:p-24 text-white text-center relative overflow-hidden mb-32">
          <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
            <div className="absolute top-10 left-10 w-64 h-64 border-4 border-white rounded-full"></div>
            <div className="absolute bottom-10 right-10 w-96 h-96 border-8 border-white rounded-full"></div>
          </div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black mb-10 max-w-3xl mx-auto leading-tight"
          >
            Ready to experience the future of <span className="text-green-500">Personal Pharmacy?</span>
          </motion.h2>
          <div className="flex flex-wrap justify-center gap-6">
            <Link href="/signup" className="px-12 py-6 bg-green-600 text-white rounded-[2rem] font-black hover:bg-green-700 transition-all shadow-xl shadow-green-900/50 flex items-center gap-3">
              Join MedsRemind Now <ArrowRight className="w-6 h-6" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
