"use client";

import { Menu, MapPin, X, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CategoryDrawer } from "./CategoryDrawer";

interface HeaderProps {
  categories?: string[];
  activeCategory?: string;
  onSelectCategory?: (category: string) => void;
  categoryCounts?: Record<string, number>;
}

export function Header({
  categories = ["All"],
  activeCategory = "All",
  onSelectCategory = () => {},
  categoryCounts = {},
}: HeaderProps) {
  const [isDark, setIsDark] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const locationCardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (document.documentElement.classList.contains("dark")) {
      setTimeout(() => setIsDark(true), 0);
    }
  }, []);

  // Close location popover on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsLocationOpen(false);
    };
    if (isLocationOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isLocationOpen]);

  const toggleDark = () => {
    document.documentElement.classList.toggle("dark");
    setIsDark(!isDark);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#F8F6F0] dark:bg-[#111111] transition-colors duration-300">
        <div className="relative flex h-16 md:h-20 items-center justify-between px-4 sm:px-6 md:px-8 mx-auto w-full max-w-lg md:max-w-xl">
          {/* Left Slot: Hamburger Menu */}
          <div className="w-9 flex items-center justify-start">
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="p-1.5 -ml-1.5 text-[#111111] dark:text-[#F8F6F0] transition-colors bg-transparent border-none outline-none focus:outline-none flex items-center justify-center cursor-pointer hover:opacity-80"
              style={{ background: "transparent", border: "none", boxShadow: "none" }}
              aria-label="Open categories menu"
            >
              <Menu size={22} strokeWidth={1.5} />
            </button>
          </div>

          {/* Center Slot: Brand Title (Sized & Spaced to never overlap side buttons) */}
          <div className="flex-1 min-w-0 flex justify-center px-2">
            <Link href="/" className="truncate">
              <span
                className="text-[15px] sm:text-[18px] md:text-2xl font-serif tracking-wider sm:tracking-widest text-[#111111] dark:text-[#F8F6F0] uppercase inline-block whitespace-nowrap transition-colors duration-300"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                AKASH ENTERPRISES
              </span>
            </Link>
          </div>

          {/* Right Slot: Circle Location Button */}
          <div className="w-9 flex items-center justify-end">
            <button
              type="button"
              onClick={() => setIsLocationOpen(!isLocationOpen)}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer border ${
                isLocationOpen
                  ? "bg-[#111111] text-white dark:bg-[#F8F6F0] dark:text-[#111111] border-transparent shadow-xs"
                  : "text-[#111111] dark:text-[#F8F6F0] bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 border-black/5 dark:border-white/5"
              }`}
              aria-label="Store Location & Address"
              title="Store Location & Directions"
            >
              <MapPin size={16} strokeWidth={1.75} />
            </button>
          </div>

          {/* Location Popover Card on Touch / Click */}
          <AnimatePresence>
            {isLocationOpen && (
              <>
                {/* Backdrop dismiss overlay */}
                <div
                  className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px]"
                  onClick={() => setIsLocationOpen(false)}
                />

                {/* Popover Card */}
                <motion.div
                  ref={locationCardRef}
                  initial={{ opacity: 0, y: -6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.95 }}
                  transition={{ duration: 0.16, ease: "easeOut" }}
                  className="absolute right-4 sm:right-6 md:right-8 top-[calc(100%-4px)] z-50 w-[calc(100vw-32px)] max-w-[320px] bg-[#F8F6F0] dark:bg-[#1A1A1A] text-[#111111] dark:text-[#EBEBEB] rounded-2xl p-4 md:p-5 border border-black/10 dark:border-white/10 shadow-2xl transition-colors"
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#666] dark:text-[#999]">
                      <MapPin size={13} className="text-[#111] dark:text-[#F8F6F0]" />
                      <span>Store Address</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsLocationOpen(false)}
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[#777] hover:text-[#111] dark:text-[#AAA] dark:hover:text-[#FFF] hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                      aria-label="Close location card"
                    >
                      <X size={14} strokeWidth={2} />
                    </button>
                  </div>

                  {/* Company Name & Address */}
                  <h3
                    className="text-base font-serif tracking-wider uppercase text-[#111] dark:text-[#F8F6F0] mb-1 font-bold"
                    style={{ fontFamily: "var(--font-playfair)" }}
                  >
                    Aakash Enterprises
                  </h3>

                  <address className="not-italic text-[13px] leading-relaxed text-[#444] dark:text-[#CCC]">
                    <p className="font-semibold text-[#111] dark:text-[#F8F6F0]">
                      Maa Sharda Complex, 3rd Floor
                    </p>
                    <p>Near Kahaniya Electric, Shahada</p>
                    <p className="font-medium">Maharashtra – 425409, India</p>
                  </address>

                  {/* Get Directions Button */}
                  <a
                    href="https://maps.google.com/?q=Maa+Sharda+Complex,+Near+Kahaniya+Electric,+Shahada,+Maharashtra+425409"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3.5 w-full py-2.5 px-3 rounded-xl bg-[#111111] text-white dark:bg-[#F8F6F0] dark:text-[#111111] font-bold text-[12px] flex items-center justify-center gap-1.5 hover:opacity-90 active:scale-[0.98] transition-all shadow-xs"
                  >
                    <span>Get Directions</span>
                    <ArrowUpRight size={14} strokeWidth={2.2} />
                  </a>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Side Panel for Categories & Theme */}
      <CategoryDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        categories={categories}
        activeCategory={activeCategory}
        onSelectCategory={onSelectCategory}
        categoryCounts={categoryCounts}
        isDark={isDark}
        onToggleDark={toggleDark}
      />
    </>
  );
}
