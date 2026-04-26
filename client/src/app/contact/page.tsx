'use client';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, ArrowRight } from 'lucide-react';
import { useState } from 'react';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      {/* Hero */}
      <section className="section-blue py-14">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-green-400 font-semibold text-sm mb-3">Contact Us</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Get in Touch</h1>
          <p className="text-blue-200 max-w-2xl mx-auto">
            Have questions about your medication or need help with an order? We're here to help.
          </p>
        </div>
      </section>

      <section className="py-14">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white p-8 md:p-10 rounded-2xl shadow-lg border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <MessageSquare className="w-6 h-6 text-green-600" /> Send us a Message
                </h3>
                {submitted ? (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Send className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                    <p className="text-gray-500">We'll get back to you within 24 hours.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Full Name</label>
                        <input 
                          type="text" 
                          placeholder="John Doe" 
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none font-medium text-sm transition-all" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Email Address</label>
                        <input 
                          type="email" 
                          placeholder="john@example.com" 
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none font-medium text-sm transition-all" 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Subject</label>
                      <input 
                        type="text" 
                        placeholder="How can we help?" 
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData({...formData, subject: e.target.value})}
                        className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none font-medium text-sm transition-all" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Message</label>
                      <textarea 
                        rows={5} 
                        placeholder="Type your message here..." 
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                        className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none font-medium text-sm resize-none transition-all" 
                      />
                    </div>
                    <button type="submit" className="btn-green w-full py-4 rounded-xl text-base flex items-center justify-center gap-2">
                      <Send className="w-5 h-5" /> Send Message
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Contact Info Cards */}
            <div className="space-y-5">
              {[
                { icon: MapPin, label: 'Visit Us', value: 'Anganwadi, Karnataka - 585209\nNear Bus Stand, Main Road', color: 'bg-blue-50 text-blue-600' },
                { icon: Phone, label: 'Call Us', value: '+91 98765 43210\nCall Us Anytime', color: 'bg-green-50 text-green-600' },
                { icon: Mail, label: 'Email Us', value: 'help@medsremind.com', color: 'bg-purple-50 text-purple-600' },
                { icon: Clock, label: 'Working Hours', value: 'Mon-Sat: 8AM - 9PM\nSunday: 8AM - 1PM', color: 'bg-orange-50 text-orange-600' },
              ].map((item, i) => (
                <div key={i} className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">{item.label}</p>
                    <p className="text-sm font-semibold text-gray-800 whitespace-pre-line leading-relaxed">{item.value}</p>
                  </div>
                </div>
              ))}

              {/* WhatsApp CTA */}
              <div className="section-blue p-6 rounded-xl text-white relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-500/20 rounded-full blur-2xl"></div>
                <h4 className="font-bold mb-2 relative z-10">Need quick help?</h4>
                <p className="text-blue-200 text-sm mb-4 relative z-10">Chat with our pharmacist on WhatsApp for instant support.</p>
                <a 
                  href="https://wa.me/919876543210" 
                  target="_blank" 
                  className="inline-flex items-center gap-2 px-5 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-all text-sm relative z-10"
                >
                  💬 Order on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Google Maps Section */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Our Location</h2>
            <p className="text-gray-500">Find us on Google Maps — we're easy to locate!</p>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-100" style={{ height: '450px' }}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3846.204!2d76.383!3d15.923!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTXCsDU1JzIyLjgiTiA3NsKwMjInNTguOCJF!5e0!3m2!1sen!2sin!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="MedsRemind Pharmacy Location"
            />
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm text-gray-600">
            <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-green-600" /> Anganwadi, Karnataka - 585209</span>
            <span className="flex items-center gap-2"><Phone className="w-4 h-4 text-green-600" /> +91 98765 43210</span>
            <a href="https://maps.google.com/?q=Anganwadi+Karnataka+585209" target="_blank" className="flex items-center gap-2 text-green-600 font-semibold hover:underline">
              Get Directions <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
