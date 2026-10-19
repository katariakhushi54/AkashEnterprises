"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { ProductCard } from "@/components/product/ProductCard";
// import { CartSheet } from "@/components/cart/CartSheet";
import { Header } from "@/components/layout/Header";
import { getStorefrontData } from "./actions";
import { Loader2, MapPin, ArrowUpRight } from "lucide-react";

export default function CollectionPage() {
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [products, setProducts] = useState<{ id: string, name: string, price: number, category: string, imageUrl: string, sizes?: string[], bottomWidth?: string, sizeBottomWidths?: Record<string, string>, description: string }[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getStorefrontData();
        setCategories(data.categories);
        setProducts(data.products);
      } catch (e) {
        console.error("Failed to load storefront data", e);
      }
      setIsLoading(false);
    }
    loadData();
  }, []);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: products.length };
    products.forEach((p) => {
      if (p.category) {
        counts[p.category] = (counts[p.category] || 0) + 1;
      }
    });
    return counts;
  }, [products]);

  const activeChipRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (activeChipRef.current) {
      activeChipRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [activeCategory]);

  const filteredProducts = activeCategory === "All" 
    ? products 
    : products.filter(p => p.category === activeCategory);

  return (
    <main className="min-h-screen bg-[#F8F6F0] dark:bg-[#111111] pb-32 font-sans text-[#111111] dark:text-[#EBEBEB] transition-colors duration-300 flex flex-col">
      <Header
        categories={categories}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        categoryCounts={categoryCounts}
      />

      {/* Sticky Filter Chips Bar */}
      <div className="sticky top-16 md:top-20 z-30 w-full bg-[#F8F6F0] dark:bg-[#111111] border-b border-black/5 dark:border-white/10 transition-colors duration-300">
        <div className="mx-auto w-full max-w-lg md:max-w-xl px-4 md:px-8 py-2.5">
          <div className="flex overflow-x-auto no-scrollbar gap-2 items-center">
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  ref={isActive ? activeChipRef : null}
                  onClick={() => setActiveCategory(cat)}
                  className={`shrink-0 px-4 py-2 rounded-full text-[13px] md:text-[14px] font-sans transition-all duration-200 focus:outline-none flex items-center justify-center cursor-pointer border-none ${
                    isActive
                      ? 'bg-[#111111] text-white dark:bg-[#F8F6F0] dark:text-[#111111] font-bold shadow-sm scale-[1.02]'
                      : 'bg-[#E5E3DC] text-[#444] hover:bg-[#DCDAD2] hover:text-[#111] dark:bg-[#222222] dark:text-[#888] dark:hover:bg-[#2A2A2A] dark:hover:text-[#EBEBEB] font-medium'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-lg md:max-w-xl px-4 md:px-8 pt-5 flex-1">

        {isLoading ? (
          <div className="flex flex-col items-center justify-center pt-20">
            <Loader2 className="animate-spin mb-4 text-[#111111] dark:text-[#EBEBEB]" size={32} />
            <p className="font-bold">Loading collection...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-20 text-[#999]">
            <p className="font-bold">No products found in this category.</p>
          </div>
        ) : (
          /* 2-Column Product Grid */
          <div className="grid grid-cols-2 gap-x-4 gap-y-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* <CartSheet /> */}

      {/* Editorial Storefront Footer */}
      <footer className="mt-auto pt-12 pb-14 border-t border-black/10 dark:border-white/10 bg-[#F4F2EC] dark:bg-[#0E0E0E] transition-colors duration-300">
        <div className="mx-auto w-full max-w-lg md:max-w-xl px-4 md:px-8 flex flex-col items-center text-center">
          {/* Brand Header */}
          <p
            className="text-lg md:text-xl font-serif tracking-[0.2em] text-[#111111] dark:text-[#F8F6F0] uppercase transition-colors"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            AAKASH ENTERPRISES
          </p>
          <p className="text-[11px] uppercase tracking-widest text-[#777] dark:text-[#888] font-medium mt-1 mb-6">
            Wholesale & Retail Clothing
          </p>

          {/* Location & Address Card */}
          <div className="w-full bg-[#F8F6F0] dark:bg-[#161616] rounded-2xl p-5 border border-black/5 dark:border-white/5 shadow-xs flex flex-col items-center gap-2 transition-colors">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#666] dark:text-[#999]">
              <MapPin size={13} className="text-[#111] dark:text-[#F8F6F0]" />
              <span>Store Address</span>
            </div>

            <address className="not-italic text-[13px] leading-relaxed text-[#333] dark:text-[#CCC]">
              <p className="font-bold text-[#111] dark:text-[#F8F6F0]">Maa Sharda Complex, 3rd Floor</p>
              <p>Near Kahaniya Electric, Shahada</p>
              <p className="font-medium">Maharashtra – 425409, India</p>
            </address>

            <a
              href="https://maps.google.com/?q=Maa+Sharda+Complex,+Near+Kahaniya+Electric,+Shahada,+Maharashtra+425409"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] font-bold text-[#111] dark:text-[#F8F6F0] hover:underline underline-offset-4 opacity-80 hover:opacity-100 transition-opacity"
            >
              <span>Get Directions</span>
              <ArrowUpRight size={12} />
            </a>
          </div>

          {/* Footer Subtext */}
          <div className="mt-8 pt-5 border-t border-black/5 dark:border-white/5 w-full flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#888] dark:text-[#666] gap-2">
            <p>&copy; {new Date().getFullYear()} Aakash Enterprises. All rights reserved.</p>
            <p className="tracking-wide">Shahada, Maharashtra</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
