'use client';
import { Heart, ShieldCheck, Zap, Users, Award, Clock, Truck, Pill, Star, ArrowRight, MapPin, Phone } from 'lucide-react';
import Link from 'next/link';

export default function About() {
  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      {/* Hero */}
      <section className="section-blue py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-green-400 font-semibold text-sm mb-3">About Us</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Your Trusted Neighborhood Pharmacy</h1>
          <p className="text-blue-200 max-w-2xl mx-auto">
            We are committed to providing genuine medicines, expert advice and reliable delivery services since 2018. Your health is our priority.
          </p>
        </div>
      </section>

      {/* Mission + Stats */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">
              Our Mission is to make <span className="text-green-600">Healthcare Accessible</span> for everyone.
            </h2>
            <p className="text-gray-500 leading-relaxed">
              Anjaneya Pharmacy started with a simple observation: finding the right medicines at the right time is stressful. We built a pharmacy that combines technology with care — offering online ordering, prescription uploads, and lightning-fast delivery so you can focus on getting better.
            </p>
            <p className="text-gray-500 leading-relaxed">
              Our trained pharmacists verify every prescription, ensure safe packaging, and provide expert guidance whenever you need it. Whether you order through our website or WhatsApp, we treat every order with the same care.
            </p>
            <div className="grid grid-cols-2 gap-6 pt-4">
              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                <p className="text-3xl font-black text-green-600">500+</p>
                <p className="text-sm text-gray-500 font-medium">Happy Customers</p>
              </div>
              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                <p className="text-3xl font-black text-green-600">10K+</p>
                <p className="text-sm text-gray-500 font-medium">Orders Delivered</p>
              </div>
              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                <p className="text-3xl font-black text-green-600">5000+</p>
                <p className="text-sm text-gray-500 font-medium">Medicines Available</p>
              </div>
              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                <p className="text-3xl font-black text-green-600">4.9/5</p>
                <p className="text-sm text-gray-500 font-medium">Google Rating</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="grid grid-cols-2 gap-6">
              {[
                { icon: ShieldCheck, label: 'Genuine Medicines', color: 'bg-green-50 text-green-600' },
                { icon: Truck, label: '60 Min Delivery', color: 'bg-blue-50 text-blue-600' },
                { icon: Award, label: 'Licensed Pharmacy', color: 'bg-yellow-50 text-yellow-600' },
                { icon: Heart, label: 'Patient Care', color: 'bg-red-50 text-red-600' },
                { icon: Clock, label: 'Mon-Sat 8AM-9PM', color: 'bg-purple-50 text-purple-600' },
                { icon: Zap, label: 'Express Service', color: 'bg-orange-50 text-orange-600' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.color}`}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <span className="font-semibold text-gray-800 text-sm">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Our Core Values</h2>
          <p className="text-gray-500 text-center mb-10">What drives us every day</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Quality First', desc: 'We source medicines only from authorized distributors and maintain strict quality controls.', icon: ShieldCheck, color: 'text-green-600 bg-green-50' },
              { title: 'Customer Care', desc: 'Our pharmacists are available for consultation via phone and WhatsApp to guide you properly.', icon: Users, color: 'text-blue-600 bg-blue-50' },
              { title: 'Fast & Reliable', desc: 'We promise delivery within 60 minutes for all orders within our service area.', icon: Truck, color: 'text-orange-600 bg-orange-50' },
            ].map((val, i) => (
              <div key={i} className="p-8 rounded-xl border border-gray-100 hover:shadow-lg transition-all text-center">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 ${val.color}`}>
                  <val.icon className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{val.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-green py-14">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to experience our service?</h2>
          <p className="text-green-100 mb-8">Join hundreds of satisfied customers who trust Anjaneya Pharmacy for their healthcare needs.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/shop" className="px-8 py-4 bg-white text-green-700 font-bold rounded-lg hover:bg-green-50 transition-all shadow-lg flex items-center gap-2">
              Browse Medicines <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/contact" className="px-8 py-4 bg-green-800 text-white font-bold rounded-lg hover:bg-green-900 transition-all shadow-lg">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
