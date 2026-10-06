"use client";

import { products } from "@/data/products";
import { ProductCard } from "@/components/product/ProductCard";
import { CartSheet } from "@/components/cart/CartSheet";
import { Header } from "@/components/layout/Header";
import { useState } from "react";

export default function CollectionPage() {
  const categories = ["All", "T-Shirts", "Shirts", "Hoodies", "Pants", "Jackets", "Accessories"];
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredProducts = activeCategory === "All" 
    ? products 
    : products.filter(p => p.category === activeCategory);

  return (
    <main className="min-h-screen bg-[#F8F6F0] dark:bg-[#111111] pb-32 font-sans text-[#111111] dark:text-[#EBEBEB] transition-colors duration-300">
      <Header />

      <div className="mx-auto w-full max-w-lg md:max-w-xl px-4 md:px-8 pt-6">
        
        {/* Filter Chips - Clean borderless */}
        <div className="flex overflow-x-auto no-scrollbar gap-2 mb-6 pb-2 -mx-4 px-4 items-center">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="shrink-0 px-4 py-2 rounded-full text-[13px] md:text-[14px] font-sans font-medium transition-colors focus:outline-none flex items-center justify-center dark:!bg-[#222] dark:!text-[#EBEBEB] dark:hover:!bg-[#333]"
              style={{
                background: activeCategory === cat ? '#111111' : '#E5E3DC',
                color: activeCategory === cat ? '#ffffff' : '#111111',
                border: 'none',
                outline: 'none'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 2-Column Product Grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      <CartSheet />

      {/* Minimal Footer */}
      <footer className="mt-auto py-10 border-t border-black/5 dark:border-white/10 bg-[#F8F6F0] dark:bg-[#111111] transition-colors duration-300">
        <div className="mx-auto w-full max-w-lg md:max-w-xl px-4 flex flex-col items-center justify-center gap-2">
          <p className="text-[15px] font-serif tracking-widest text-[#111111] dark:text-[#F8F6F0] uppercase transition-colors" style={{ fontFamily: "var(--font-playfair)" }}>
            AKASH ENTERPRISES
          </p>
          <p className="text-[12px] font-sans text-[#999999] dark:text-[#666] mt-1 transition-colors">
            &copy; {new Date().getFullYear()} Akash Enterprises. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
