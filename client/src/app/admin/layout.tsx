'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, Users, Settings, LogOut, ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { logout } = useAuth();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
    { name: 'Orders', icon: ShoppingBag, href: '/admin/orders' },
    { name: 'Medicines', icon: Settings, href: '/admin/medicines' },
    { name: 'Users', icon: Users, href: '/admin/users' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className={`bg-slate-900 text-white transition-all duration-300 flex flex-col ${isCollapsed ? 'w-20' : 'w-72'}`}>
        <div className="p-8 flex items-center justify-between">
          {!isCollapsed && <span className="font-black text-xl tracking-tighter">ADMIN PANEL</span>}
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-10">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all ${
                  isActive ? 'bg-green-600 text-white shadow-lg shadow-green-900/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon className="w-6 h-6 flex-shrink-0" />
                {!isCollapsed && <span className="font-bold">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-8 border-t border-white/5">
           <button onClick={logout} className="flex items-center gap-4 px-4 py-4 text-slate-400 hover:text-red-400 transition-colors w-full">
              <LogOut className="w-6 h-6" />
              {!isCollapsed && <span className="font-bold">Logout</span>}
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto max-h-screen custom-scrollbar">
        {children}
      </main>
    </div>
  );
}
