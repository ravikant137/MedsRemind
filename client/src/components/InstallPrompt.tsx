"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Download, X, Share } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const InstallPrompt = () => {
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                       (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(isIOSDevice);

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!sessionStorage.getItem("pwa-prompt-dismissed")) {
        setShow(true);
      }
    };

    // For iOS, we show it manually since they don't have the event
    if (isIOSDevice && !window.matchMedia('(display-mode: standalone)').matches && !sessionStorage.getItem("pwa-prompt-dismissed")) {
      setShow(true);
    }

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (pathname?.startsWith('/admin')) return null;

  const handleInstall = async () => {
    if (isIOS) {
      alert("To install: Tap the 'Share' icon below and select 'Add to Home Screen' 📲");
      return;
    }
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShow(false);
    }
  };

  const handleDismiss = () => {
    setShow(false);
    sessionStorage.setItem("pwa-prompt-dismissed", "true");
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-[calc(6.5rem+env(safe-area-inset-bottom))] left-4 right-4 z-[1000] bg-slate-900 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between md:hidden border border-slate-700"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center shrink-0">
              {isIOS ? <Share className="w-5 h-5" /> : <Download className="w-5 h-5" />}
            </div>
            <div>
              <p className="text-sm font-black">Install Anjaneya App</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                {isIOS ? "Tap Share > Add to Home Screen" : "Better experience & fast access"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleInstall}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-black shadow-lg shadow-green-900/50"
            >
              {isIOS ? "How?" : "Install"}
            </button>
            <button onClick={handleDismiss} className="p-2 text-slate-400">
              <X className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InstallPrompt;
