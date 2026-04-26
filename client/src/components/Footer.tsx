'use client';
import Link from 'next/link';
import { Phone, Mail, MapPin } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  if (pathname.startsWith('/admin') || pathname === '/login' || pathname === '/signup') return null;

  return (
    <footer>
      {/* ── Info Bar: About | Location | Working Hours ── */}
      <div style={{ background: '#e8f5e9', borderTop: '1px solid #c8e6c9' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid md:grid-cols-3 gap-10">
          <div>
            <h4 className="font-bold text-lg mb-3" style={{ color: '#1a1a2e' }}>About Anjaneya Pharmacy</h4>
            <p className="text-sm leading-relaxed mb-3" style={{ color: '#64748b' }}>
              We are committed to your health and well-being by providing genuine medicines, expert advice and reliable services since 2018.
            </p>
            <Link href="/about" className="text-sm font-semibold hover:underline" style={{ color: '#2e7d32' }}>Read More →</Link>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-3" style={{ color: '#1a1a2e' }}>Our Location</h4>
            <p className="text-sm leading-relaxed mb-1" style={{ color: '#64748b' }}>Anganwadi, Karnataka - 585209</p>
            <p className="text-sm leading-relaxed mb-3" style={{ color: '#64748b' }}>Near Bus Stand, Main Road</p>
            <a href="https://maps.google.com/?q=Anganwadi+Karnataka+585209" target="_blank"
               className="text-sm font-semibold hover:underline flex items-center gap-1" style={{ color: '#2e7d32' }}>
              <MapPin className="w-4 h-4" /> View on Google Maps →
            </a>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-3" style={{ color: '#1a1a2e' }}>Working Hours</h4>
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
      <div style={{ background: '#1a237e' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
            {/* Logo */}
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2.5 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#2e7d32' }}>
                  <span className="text-white text-lg font-black">A</span>
                </div>
                <div className="leading-tight">
                  <span className="text-white text-sm font-black block">ANJANEYA</span>
                  <span className="font-black text-sm block" style={{ color: '#4caf50' }}>PHARMACY</span>
                  <span className="text-[8px] block" style={{ color: '#93a5cf' }}>Trusted Medicines. Genuine Care.</span>
                </div>
              </Link>
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
