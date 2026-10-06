"use client";

import { Search, ShoppingBag, Sun, Moon } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import Link from "next/link";
import { useState, useEffect } from "react";

export function Header() {
  const totalItems = useCartStore((state) => state.totalItems);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) setIsDark(true);
  }, []);

  const toggleDark = () => {
    document.documentElement.classList.toggle('dark');
    setIsDark(!isDark);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#F8F6F0] dark:bg-[#111111] transition-colors duration-300">
      <div className="flex h-16 md:h-20 items-center justify-between px-5 md:px-8 mx-auto w-full max-w-lg md:max-w-xl">
        
        {/* Left: Theme Toggle */}
        <button 
          onClick={toggleDark}
          className="p-1 -ml-1 text-[#111111] dark:text-[#F8F6F0] transition-colors bg-transparent border-none outline-none focus:outline-none flex items-center justify-center"
          style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}
        >
          {isDark ? <Sun size={22} strokeWidth={1.5} /> : <Moon size={22} strokeWidth={1.5} />}
        </button>

        {/* Center: Brand (Serif) */}
        <div className="flex-1 flex justify-center">
          <Link href="/">
            <span className="text-xl md:text-2xl font-serif tracking-widest text-[#111111] dark:text-[#F8F6F0] uppercase mt-1 inline-block whitespace-nowrap transition-colors duration-300" style={{ fontFamily: "var(--font-playfair)" }}>
              AKASH ENTERPRISES
            </span>
          </Link>
        </div>
        
        {/* Right: Cart */}
        <div className="flex items-center gap-3">
          <button 
            className="p-1 text-[#111111] dark:text-[#F8F6F0] transition-colors relative bg-transparent border-none outline-none focus:outline-none flex items-center justify-center"
            style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}
            onClick={() => {
              window.dispatchEvent(new CustomEvent('open-cart'));
            }}
          >
            <ShoppingBag size={22} strokeWidth={1.25} />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-[15px] w-[15px] items-center justify-center rounded-full bg-[#111111] dark:bg-[#F8F6F0] text-[9px] font-bold text-white dark:text-[#111111] ring-2 ring-[#F8F6F0] dark:ring-[#111111]">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
