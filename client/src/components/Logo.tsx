'use client';
import { motion } from 'framer-motion';
import { Pill } from 'lucide-react';

export default function Logo({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <motion.div 
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`relative flex items-center justify-center bg-green-600 rounded-[1.5rem] shadow-lg shadow-green-200 ${className}`}
    >
      <Pill className="text-white w-2/3 h-2/3 rotate-[135deg]" />
    </motion.div>
  );
}

