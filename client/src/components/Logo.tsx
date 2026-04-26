'use client';
import { motion } from 'framer-motion';
import { Plus, Leaf } from 'lucide-react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({ className = "", showText = false, size = 'md', vertical = true }: LogoProps & { vertical?: boolean }) {
  const iconSizes = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  return (
    <div className={`flex ${vertical ? 'flex-col items-center' : 'items-center gap-4'} ${className}`}>
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`${iconSizes[size]} relative flex shrink-0 items-center justify-center bg-white rounded-[1.2rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-slate-50`}
      >
        <div className="relative flex items-center justify-center w-full h-full p-2">
          <Plus className="text-[#003366] w-full h-full" strokeWidth={3} />
          <Leaf 
            className="text-[#22c55e] w-1/3 h-1/3 absolute -bottom-0.5 -right-0.5 drop-shadow-sm" 
            fill="currentColor" 
          />
        </div>
      </motion.div>
      
      {showText && (
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col"
        >
          <h1 className={`${textSizes[size]} font-black tracking-tighter text-[#003366] leading-none mb-1`}>
            ANJANEYA
          </h1>
          <div className="flex items-center gap-2 w-full">
            <div className="h-[2px] w-4 bg-green-500 rounded-full" />
            <span className="text-[10px] font-black tracking-[0.2em] text-green-600 uppercase">PHARMACY</span>
            <div className="h-[2px] w-4 bg-green-500 rounded-full" />
          </div>
          {size === 'lg' && (
            <p className="text-[10px] font-bold text-slate-400 mt-1.5 tracking-wide">
              Fast Medicines. Trusted Care.
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
}

