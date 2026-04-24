'use client';
import Link from 'next/link';
import { Pill, Github, Twitter, Linkedin, Mail, ShieldCheck, Heart, MapPin, Phone } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  if (pathname.startsWith('/admin')) return null;

  return (
    <footer className="bg-slate-900 text-slate-400 pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          <div className="space-y-8">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center shadow-2xl shadow-green-900/50 group-hover:rotate-12 transition-transform">
                <Pill className="text-white w-7 h-7" />
              </div>
              <span className="text-2xl font-black text-white tracking-tighter uppercase">Meds<span className="text-green-600">Remind</span></span>
            </Link>
            <p className="text-sm leading-relaxed font-medium">
              Empowering individuals to take control of their health through AI-driven medication management and seamless pharmacy integration. Your health, our priority.
            </p>
            <div className="flex gap-4">
              {[Twitter, Github, Linkedin, Mail].map((Icon, i) => (
                <button key={i} className="w-10 h-10 rounded-xl border border-slate-800 flex items-center justify-center hover:bg-green-600 hover:border-green-600 hover:text-white transition-all group">
                  <Icon className="w-5 h-5" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-xs mb-8">Platform</h4>
            <ul className="space-y-4 font-bold text-sm">
              <li><Link href="/shop" className="hover:text-green-500 transition-colors">Find Medicines</Link></li>
              <li><Link href="/prescription" className="hover:text-green-500 transition-colors">AI RX Scan</Link></li>
              <li><Link href="/reminders" className="hover:text-green-500 transition-colors">Schedule</Link></li>
              <li><Link href="/track" className="hover:text-green-500 transition-colors">Order Tracking</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-xs mb-8">Company</h4>
            <ul className="space-y-4 font-bold text-sm">
              <li><Link href="/about" className="hover:text-green-500 transition-colors">About Us</Link></li>
              <li><Link href="/discounts" className="hover:text-green-500 transition-colors">Health Rewards</Link></li>
              <li><Link href="/privacy" className="hover:text-green-500 transition-colors">Data Privacy</Link></li>
              <li><Link href="/contact" className="hover:text-green-500 transition-colors">Support Center</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-xs mb-8">Support</h4>
            <div className="space-y-6">
              <div className="flex gap-4">
                <MapPin className="w-5 h-5 text-green-600 shrink-0" />
                <p className="text-sm font-medium">123 Health Ave, Medical District, Delhi, India</p>
              </div>
              <div className="flex gap-4">
                <Phone className="w-5 h-5 text-green-600 shrink-0" />
                <p className="text-sm font-medium">+91 98765 43210</p>
              </div>
              <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-800">
                <p className="text-xs text-slate-500 mb-2 font-black uppercase tracking-widest">Emergency Line</p>
                <p className="text-white font-black text-lg">1800-MEDS-HELP</p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
            <ShieldCheck className="w-4 h-4 text-green-600" /> &copy; {currentYear} MedsRemind Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-6 text-xs font-black uppercase tracking-widest text-slate-600">
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <div className="flex items-center gap-2">
              Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> for your health
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
