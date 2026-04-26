'use client';
import { motion } from 'framer-motion';

export default function Logo({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      <motion.svg 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        initial="hidden"
        animate="visible"
      >
        {/* Top Blue Swoosh */}
        <motion.path
          d="M 80,40 C 70,10 20,10 10,40"
          stroke="#003366"
          strokeWidth="4"
          strokeLinecap="round"
          fill="transparent"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
        {/* Bottom Green Swoosh */}
        <motion.path
          d="M 20,60 C 30,90 80,90 90,60"
          stroke="#4CAF50"
          strokeWidth="4"
          strokeLinecap="round"
          fill="transparent"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
        />

        {/* Pill Left (Blue) */}
        <motion.path
          d="M 35,65 L 45,75 C 50,80 58,80 63,75 L 50,62 C 45,57 37,57 32,62 Z" // Adjust these points to make a proper angled capsule
          fill="#003366"
        />
        
        {/* Let's use simpler SVG shapes for the capsule */}
        <g transform="rotate(-45 50 50)">
          {/* Blue bottom half */}
          <motion.path
            d="M 40,50 L 40,65 C 40,70.5 44.5,75 50,75 C 55.5,75 60,70.5 60,65 L 60,50 Z"
            fill="#003366"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, delay: 0.5 }}
          />
          {/* Green top half */}
          <motion.path
            d="M 40,50 L 40,35 C 40,29.5 44.5,25 50,25 C 55.5,25 60,29.5 60,35 L 60,50 Z"
            fill="#4CAF50"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, delay: 0.7 }}
          />
        </g>

        {/* Leaves (Sprouting from top right) */}
        <motion.g 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1, type: "spring" }}
          transform="translate(65, 20) scale(0.6)"
        >
          {/* Main Leaf */}
          <path d="M 0,0 C -5,-10 5,-20 15,-20 C 15,-10 5,0 0,0 Z" fill="#4CAF50" />
          {/* Small Left Leaf */}
          <path d="M 0,0 C -10,-5 -15,-15 -5,-20 C -5,-10 0,0 0,0 Z" fill="#4CAF50" transform="rotate(-30)" />
          {/* Small Right Leaf */}
          <path d="M 10,-5 C 20,0 25,-10 15,-15 C 10,-10 10,-5 10,-5 Z" fill="#4CAF50" transform="rotate(30 10 -5)" />
        </motion.g>
      </motion.svg>
    </div>
  );
}
