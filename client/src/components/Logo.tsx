'use client';
import { motion } from 'framer-motion';
import { Plus, Leaf } from 'lucide-react';

export default function Logo({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <motion.div 
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`relative flex items-center justify-center bg-white rounded-[1.5rem] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] border border-slate-100 ${className}`}
    >
      <div className="relative flex items-center justify-center w-full h-full p-2">
        <Plus className="text-[#003366] w-full h-full" strokeWidth={2.5} />
        <Leaf 
          className="text-green-500 w-1/3 h-1/3 absolute bottom-1 right-1 drop-shadow-sm" 
          fill="currentColor" 
        />
      </div>
    </motion.div>
  );
}

