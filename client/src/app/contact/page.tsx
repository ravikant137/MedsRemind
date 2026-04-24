'use client';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Contact() {
  return (
    <div className="min-h-screen bg-slate-50 pt-32 px-6 pb-20">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-20">
          <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-4">Get in <span className="text-green-600">Touch</span></h1>
          <p className="text-slate-500 font-medium max-w-2xl mx-auto">Have questions about your medication or our services? Our dedicated support team is here to help you 24/7.</p>
        </header>

        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-12 rounded-[4rem] shadow-2xl shadow-slate-200/50 border border-white"
            >
              <h3 className="text-2xl font-black text-slate-900 mb-10 flex items-center gap-3">
                <MessageSquare className="w-7 h-7 text-green-600" /> Send us a Message
              </h3>
              <form className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Full Name</label>
                    <input type="text" placeholder="John Doe" className="w-full p-5 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-green-500/20 font-bold" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Email Address</label>
                    <input type="email" placeholder="john@example.com" className="w-full p-5 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-green-500/20 font-bold" />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Subject</label>
                  <input type="text" placeholder="How can we help?" className="w-full p-5 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-green-500/20 font-bold" />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Message</label>
                  <textarea rows={6} placeholder="Type your message here..." className="w-full p-5 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-green-500/20 font-bold resize-none" />
                </div>
                <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-lg hover:bg-green-600 transition-all shadow-xl flex items-center justify-center gap-3">
                  <Send className="w-5 h-5" /> Send Message
                </button>
              </form>
            </motion.div>
          </div>

          <div className="space-y-8">
            {[
              { icon: MapPin, label: 'Visit Us', value: '123 Health Ave, Medical District, Delhi, India', color: 'text-blue-600 bg-blue-50' },
              { icon: Phone, label: 'Call Us', value: '+91 98765 43210', color: 'text-green-600 bg-green-50' },
              { icon: Mail, label: 'Email Us', value: 'support@medsremind.com', color: 'text-purple-600 bg-purple-50' },
              { icon: Clock, label: 'Working Hours', value: '24/7 Support Available', color: 'text-orange-600 bg-orange-50' }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-[3rem] shadow-xl shadow-slate-100/50 border border-slate-50 flex items-center gap-6"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${item.color}`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                  <p className="text-sm font-bold text-slate-900 leading-relaxed">{item.value}</p>
                </div>
              </motion.div>
            ))}

            <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white relative overflow-hidden shadow-2xl">
              <div className="absolute -top-10 -right-10 w-48 h-48 bg-green-500/20 rounded-full blur-3xl"></div>
              <h4 className="text-xl font-black mb-4 relative z-10">Emergency?</h4>
              <p className="text-slate-400 font-medium mb-8 relative z-10 text-sm">For immediate medical assistance, please contact our emergency hotline.</p>
              <button className="w-full py-4 bg-green-600 text-white rounded-2xl font-black hover:bg-green-700 transition-all shadow-xl shadow-green-900/50 flex items-center justify-center gap-2">
                <Phone className="w-5 h-5" /> 1800-MEDS-HELP
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
