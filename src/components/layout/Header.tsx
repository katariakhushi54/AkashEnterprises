"use client";

import { Sun, Moon, Menu } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
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

  useEffect(() => {
    if (document.documentElement.classList.contains("dark")) {
      setTimeout(() => setIsDark(true), 0);
    }
  }, []);

  const toggleDark = () => {
    document.documentElement.classList.toggle("dark");
    setIsDark(!isDark);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#F8F6F0] dark:bg-[#111111] transition-colors duration-300">
        <div className="flex h-16 md:h-20 items-center justify-between px-5 md:px-8 mx-auto w-full max-w-lg md:max-w-xl">
          {/* Left: Hamburger Menu */}
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="p-1 -ml-1 text-[#111111] dark:text-[#F8F6F0] transition-colors bg-transparent border-none outline-none focus:outline-none flex items-center justify-center cursor-pointer"
            style={{ background: "transparent", border: "none", boxShadow: "none" }}
            aria-label="Open categories menu"
          >
            <Menu size={22} strokeWidth={1.5} />
          </button>

          {/* Center: Brand (Serif) */}
          <div className="flex-1 flex justify-center">
            <Link href="/">
              <span
                className="text-xl md:text-2xl font-serif tracking-widest text-[#111111] dark:text-[#F8F6F0] uppercase mt-1 inline-block whitespace-nowrap transition-colors duration-300"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                AKASH ENTERPRISES
              </span>
            </Link>
          </div>

          {/* Right: Theme Toggle */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={toggleDark}
              className="p-1 -mr-1 text-[#111111] dark:text-[#F8F6F0] transition-colors bg-transparent border-none outline-none focus:outline-none flex items-center justify-center cursor-pointer"
              style={{ background: "transparent", border: "none", boxShadow: "none" }}
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun size={22} strokeWidth={1.5} /> : <Moon size={22} strokeWidth={1.5} />}
            </button>
          </div>
        </div>
      </header>

      {/* Side Panel for Categories */}
      <CategoryDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        categories={categories}
        activeCategory={activeCategory}
        onSelectCategory={onSelectCategory}
        categoryCounts={categoryCounts}
      />
    </>
  );
}
