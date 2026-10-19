"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, Sparkles } from "lucide-react";
import { useModalHistory } from "@/hooks/useModalHistory";

interface CategoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  categoryCounts?: Record<string, number>;
}

export function CategoryDrawer({
  isOpen,
  onClose,
  categories = [],
  activeCategory = "All",
  onSelectCategory,
  categoryCounts = {},
}: CategoryDrawerProps) {
  // Mobile back button closes drawer
  useModalHistory(isOpen, onClose, "categoryDrawer");

  // Prevent background body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Escape key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="relative z-10 w-[85vw] max-w-xs sm:max-w-sm h-full bg-[#F8F6F0] dark:bg-[#111111] text-[#111111] dark:text-[#EBEBEB] border-r border-black/10 dark:border-white/10 shadow-2xl flex flex-col justify-between overflow-hidden"
          >
            {/* Drawer Header */}
            <div className="px-5 pt-6 pb-4 border-b border-black/10 dark:border-white/10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#888] dark:text-[#777] flex items-center gap-1.5">
                  <Sparkles size={12} /> Catalog
                </span>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#555] hover:text-[#111] dark:text-[#AAA] dark:hover:text-[#FFF] hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                  aria-label="Close menu"
                >
                  <X size={18} strokeWidth={2} />
                </button>
              </div>

              <h2
                className="text-xl font-serif tracking-widest uppercase text-[#111111] dark:text-[#F8F6F0]"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                Categories
              </h2>
            </div>

            {/* Category Navigation Items */}
            <div className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-1.5 no-scrollbar">
              {categories.map((cat) => {
                const isActive = activeCategory === cat;
                const count = categoryCounts[cat];

                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      onSelectCategory(cat);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-[14px] md:text-[15px] transition-all duration-150 cursor-pointer border-none text-left ${
                      isActive
                        ? "bg-[#111111] text-white dark:bg-[#F8F6F0] dark:text-[#111111] font-bold shadow-sm"
                        : "bg-transparent text-[#333] dark:text-[#CCC] hover:bg-black/5 dark:hover:bg-white/5 font-medium"
                    }`}
                  >
                    <span className="truncate">
                      {cat === "All" ? "All Products" : cat}
                    </span>

                    <div className="flex items-center gap-2 shrink-0">
                      {typeof count === "number" && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-semibold transition-colors ${
                            isActive
                              ? "bg-white/20 text-white dark:bg-black/15 dark:text-[#111]"
                              : "bg-black/5 text-[#666] dark:bg-white/10 dark:text-[#AAA]"
                          }`}
                        >
                          {count}
                        </span>
                      )}
                      <ChevronRight
                        size={15}
                        className={`transition-transform ${
                          isActive
                            ? "text-white dark:text-[#111] translate-x-0.5"
                            : "text-[#999] dark:text-[#666]"
                        }`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Drawer Footer */}
            <div className="p-5 border-t border-black/10 dark:border-white/10 bg-[#F4F2EC] dark:bg-[#0D0D0D] transition-colors">
              <p
                className="text-[12px] font-serif tracking-widest text-[#111111] dark:text-[#F8F6F0] uppercase font-bold"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                Aakash Enterprises
              </p>
              <address className="not-italic text-[11px] text-[#777] dark:text-[#888] mt-1.5 leading-relaxed">
                <p>Maa Sharda Complex, 3rd Floor</p>
                <p>Near Kahaniya Electric, Shahada</p>
                <p>Maharashtra – 425409, India</p>
              </address>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
