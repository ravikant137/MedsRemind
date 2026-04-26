'use client';
import Link from 'next/link';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  if (pathname.startsWith('/admin') || pathname === '/login' || pathname === '/signup') return null;

  return (
    <footer>
      {/* Info Bar — About, Location, Working Hours */}
      <div className="bg-green-50 border-t border-green-100">
        <div className="max-w-7xl mx-auto px-4 py-12 grid md:grid-cols-3 gap-10">
          <div>
            <h4 className="font-bold text-gray-900 text-lg mb-3">About Anjaneya Pharmacy</h4>
            <p className="text-gray-600 text-sm leading-relaxed mb-3">
              We are committed to your health and well-being by providing genuine medicines, expert advice and reliable services since 2018.
            </p>
            <Link href="/about" className="text-green-700 font-semibold text-sm hover:underline">Read More →</Link>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-lg mb-3">Our Location</h4>
            <p className="text-gray-600 text-sm leading-relaxed mb-1">Anganwadi, Karnataka - 585209</p>
            <p className="text-gray-600 text-sm leading-relaxed mb-3">Near Bus Stand, Main Road</p>
            <a 
              href="https://maps.google.com/?q=Anganwadi+Karnataka+585209" 
              target="_blank" 
              className="text-green-700 font-semibold text-sm hover:underline flex items-center gap-1"
            >
              <MapPin className="w-4 h-4" /> View on Google Maps →
            </a>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-lg mb-3">Working Hours</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Mon - Sat</span>
                <span className="font-semibold text-gray-900">8:00 AM - 9:00 PM</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Sunday</span>
                <span className="font-semibold text-gray-900">8:00 AM - 1:00 PM</span>
              </div>
            </div>
            <Link href="/contact" className="inline-block mt-4 px-5 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 transition-colors">
              Open Now
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="section-blue text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
            {/* Logo & Tagline */}
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 bg-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg font-black">A</span>
                </div>
                <div className="leading-tight">
                  <span className="text-white text-base font-black block">ANJANEYA<span className="text-green-400"> PHARMACY</span></span>
                  <span className="text-blue-300 text-[9px]">Trusted Medicines. Genuine Care.</span>
                </div>
              </Link>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-white text-sm mb-4">Quick Links</h4>
              <ul className="space-y-2.5 text-blue-200 text-sm">
                <li><Link href="/" className="hover:text-green-400 transition-colors">Home</Link></li>
                <li><Link href="/shop" className="hover:text-green-400 transition-colors">Medicines</Link></li>
                <li><Link href="/prescription" className="hover:text-green-400 transition-colors">Upload Prescription</Link></li>
                <li><Link href="/shop" className="hover:text-green-400 transition-colors">Categories</Link></li>
              </ul>
            </div>

            {/* Information */}
            <div>
              <h4 className="font-bold text-white text-sm mb-4">Information</h4>
              <ul className="space-y-2.5 text-blue-200 text-sm">
                <li><Link href="/about" className="hover:text-green-400 transition-colors">About Us</Link></li>
                <li><Link href="/privacy" className="hover:text-green-400 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-green-400 transition-colors">Terms & Conditions</Link></li>
              </ul>
            </div>

            {/* Contact Us */}
            <div>
              <h4 className="font-bold text-white text-sm mb-4">Contact Us</h4>
              <ul className="space-y-2.5 text-blue-200 text-sm">
                <li className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-green-400" /> +91 98765 43210</li>
                <li className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-green-400" /> anjaneyapharmacy@gmail.com</li>
                <li className="flex items-start gap-2"><MapPin className="w-3.5 h-3.5 text-green-400 mt-0.5 shrink-0" /> Anganwadi, Karnataka - 585209</li>
              </ul>
            </div>

            {/* Need Help */}
            <div>
              <h4 className="font-bold text-white text-sm mb-4">Need Help?</h4>
              <p className="text-blue-200 text-sm mb-3">Chat with us on WhatsApp</p>
              <a 
                href="https://wa.me/919876543210" 
                target="_blank"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-500 text-white text-sm font-bold rounded-lg hover:bg-green-600 transition-colors"
              >
                💬 Order on WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-blue-800">
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-3">
            <p className="text-blue-300 text-xs">
              <strong>Disclaimer:</strong> Prescription medicines will be dispensed only against valid prescription.
            </p>
            <p className="text-blue-300 text-xs font-medium">
              © {currentYear} Anjaneya Pharmacy. All Rights Reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
