'use client';
import Link from 'next/link';
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter, MessageCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Logo from './Logo';

export default function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  if (pathname.startsWith('/admin') || pathname === '/login' || pathname === '/signup') return null;

  return (
    <footer>
      {/* ── Info Bar: About | Location | Working Hours ── */}
      <div style={{ background: '#e8f5e9', borderTop: '1px solid #c8e6c9' }}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-12 grid md:grid-cols-3 gap-10">
          <div>
            <h4 className="font-bold text-lg mb-3" style={{ color: '#003366' }}>About Anjaneya Pharmacy</h4>
            <p className="text-sm leading-relaxed mb-3" style={{ color: '#64748b' }}>
              We are committed to your health and well-being by providing genuine medicines, expert advice and reliable services since 2018.
            </p>
            <Link href="/about" className="text-sm font-semibold hover:underline" style={{ color: '#2e7d32' }}>Read More →</Link>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-3" style={{ color: '#003366' }}>Our Location</h4>
            <p className="text-sm leading-relaxed mb-1" style={{ color: '#64748b' }}>Anganwadi, Karnataka - 585209</p>
            <p className="text-sm leading-relaxed mb-3" style={{ color: '#64748b' }}>Near Bus Stand, Main Road</p>
            <a href="https://maps.google.com/?q=Anganwadi+Karnataka+585209" target="_blank"
               className="text-sm font-semibold hover:underline flex items-center gap-1" style={{ color: '#2e7d32' }}>
              <MapPin className="w-4 h-4" /> View on Google Maps →
            </a>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-3" style={{ color: '#003366' }}>Working Hours</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between" style={{ color: '#64748b' }}>
                <span>Mon - Sat</span>
                <span className="font-semibold" style={{ color: '#1a1a2e' }}>8:00 AM - 9:00 PM</span>
              </div>
              <div className="flex justify-between" style={{ color: '#64748b' }}>
                <span>Sunday</span>
                <span className="font-semibold" style={{ color: '#1a1a2e' }}>8:00 AM - 1:00 PM</span>
              </div>
            </div>
            <Link href="/contact" className="inline-block mt-4 px-5 py-2 text-white text-sm font-bold rounded-lg hover:brightness-110 transition-all"
                  style={{ background: '#2e7d32' }}>
              Open Now
            </Link>
          </div>
        </div>
      </div>

      {/* ── Main Dark Footer ── */}
      <div style={{ background: '#003366' }}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
            {/* Logo */}
            <div className="col-span-2 md:col-span-1 flex flex-col items-start">
              <Link href="/" className="flex items-center gap-3 mb-6 bg-white/10 p-3 rounded-2xl w-full">
                <Logo className="w-12 h-12 drop-shadow-md" />
                <div className="leading-tight flex flex-col justify-center">
                  <span className="text-white text-lg font-black tracking-tight block">ANJANEYA</span>
                  <div className="flex items-center gap-1 -mt-0.5">
                    <span className="h-[2px] w-3 bg-[#4CAF50]"></span>
                    <span className="text-[#4CAF50] text-xs font-black tracking-widest block uppercase">PHARMACY</span>
                    <span className="h-[2px] w-3 bg-[#4CAF50]"></span>
                  </div>
                  <span className="text-gray-300 text-[8px] font-bold tracking-wide mt-1">Fast Medicines. Trusted Care.</span>
                </div>
              </Link>
              
              <div className="flex items-center gap-3">
                <a href="https://wa.me/919876543210" className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center text-white hover:scale-110 transition-transform"><MessageCircle className="w-4 h-4" /></a>
                <a href="#" className="w-8 h-8 rounded-full bg-[#1877F2] flex items-center justify-center text-white hover:scale-110 transition-transform"><Facebook className="w-4 h-4" /></a>
                <a href="#" className="w-8 h-8 rounded-full bg-[#E4405F] flex items-center justify-center text-white hover:scale-110 transition-transform"><Instagram className="w-4 h-4" /></a>
                <a href="#" className="w-8 h-8 rounded-full bg-[#1DA1F2] flex items-center justify-center text-white hover:scale-110 transition-transform"><Twitter className="w-4 h-4" /></a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-white text-sm mb-4">Quick Links</h4>
              <ul className="space-y-2.5 text-sm" style={{ color: '#93a5cf' }}>
                <li><Link href="/" className="hover:text-green-400 transition-colors">Home</Link></li>
                <li><Link href="/shop" className="hover:text-green-400 transition-colors">Medicines</Link></li>
                <li><Link href="/prescription" className="hover:text-green-400 transition-colors">Upload Prescription</Link></li>
                <li><Link href="/shop" className="hover:text-green-400 transition-colors">Categories</Link></li>
                <li><Link href="/about" className="hover:text-green-400 transition-colors">Health Tips</Link></li>
              </ul>
            </div>

            {/* Information */}
            <div>
              <h4 className="font-bold text-white text-sm mb-4">Information</h4>
              <ul className="space-y-2.5 text-sm" style={{ color: '#93a5cf' }}>
                <li><Link href="/about" className="hover:text-green-400 transition-colors">About Us</Link></li>
                <li><Link href="/about" className="hover:text-green-400 transition-colors">Delivery Information</Link></li>
                <li><Link href="/privacy" className="hover:text-green-400 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-green-400 transition-colors">Terms & Conditions</Link></li>
                <li><Link href="/terms" className="hover:text-green-400 transition-colors">Refund Policy</Link></li>
              </ul>
            </div>

            {/* Contact Us */}
            <div>
              <h4 className="font-bold text-white text-sm mb-4">Contact Us</h4>
              <ul className="space-y-2.5 text-sm" style={{ color: '#93a5cf' }}>
                <li className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" style={{ color: '#4caf50' }} /> +91 98765 43210</li>
                <li className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" style={{ color: '#4caf50' }} /> anjaneyapharmacy@gmail.com</li>
                <li className="flex items-start gap-2"><MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: '#4caf50' }} /> Anganwadi, Karnataka - 585209</li>
              </ul>
            </div>

            {/* Need Help */}
            <div>
              <h4 className="font-bold text-white text-sm mb-4">Need Help?</h4>
              <p className="text-sm mb-4" style={{ color: '#93a5cf' }}>Chat with us on WhatsApp</p>
              <a href="https://wa.me/919876543210" target="_blank"
                 className="inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm font-bold rounded-lg hover:brightness-110 transition-all"
                 style={{ background: '#25d366' }}>
                💬 Order on WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-3">
            <p className="text-xs" style={{ color: '#93a5cf' }}>
              <strong>Disclaimer:</strong> Prescription medicines will be dispensed only against valid prescription.
            </p>
            <p className="text-xs font-medium" style={{ color: '#93a5cf' }}>
              © {currentYear} Anjaneya Pharmacy. All Rights Reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
