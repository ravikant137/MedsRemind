"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ClipboardList, ShoppingCart, User, Bell } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";

const BottomNav = () => {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user || pathname?.startsWith('/admin')) return null;

  const navItems = [
    { name: "Home", href: "/dashboard", icon: Home },
    { name: "Prescription", href: "/prescription", icon: ClipboardList },
    { name: "Orders", href: "/orders", icon: ShoppingCart },
    { name: "Reminders", href: "/reminders", icon: Bell },
    { name: "Profile", href: "/profile", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[999] block md:hidden bg-white/90 backdrop-blur-lg border-t border-gray-200 shadow-[0_-5px_20px_rgba(0,0,0,0,05)]">
      <div className="flex items-center justify-around h-20 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full transition-all relative ${
                isActive ? "text-blue-600 scale-105" : "text-gray-400 hover:text-blue-500"
              }`}
            >
              <div className={`p-2 rounded-xl transition-all ${isActive ? "bg-blue-50" : ""}`}>
                <Icon className="w-6 h-6" />
              </div>
              <span className={`text-[10px] mt-1 font-black uppercase tracking-tighter ${isActive ? "opacity-100" : "opacity-60"}`}>
                {item.name}
              </span>
              {isActive && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute -top-[1px] w-12 h-1 bg-blue-600 rounded-b-full shadow-[0_2px_10px_rgba(37,99,235,0.4)]" 
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
