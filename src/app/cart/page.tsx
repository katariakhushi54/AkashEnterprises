"use client";

import { products } from "@/data/products";
import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";

function SharedCartContent() {
  const searchParams = useSearchParams();
  const itemsParam = searchParams.get("items");
  const customerName = searchParams.get("name") || "";
  
  const [selectedItem, setSelectedItem] = useState<{product: any, quantity: number, idx: number} | null>(null);
  
  const sharedItems = itemsParam
    ? itemsParam.split(",").map((str) => {
        const parts = str.split("-");
        const id = parts.slice(0, -1).join("-");
        const quantity = parseInt(parts[parts.length - 1] || "1", 10);
        const product = products.find((p) => p.id === id);
        return { product, quantity };
      }).filter(item => item.product !== undefined)
    : [];

  return (
    <main className="min-h-screen bg-[#F8F6F0] dark:bg-[#111111] pb-32 transition-colors duration-300 font-sans">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 bg-[#F8F6F0]/90 dark:bg-[#111111]/90 px-6 backdrop-blur-md border-b border-black/5 dark:border-white/10 mx-auto max-w-lg md:max-w-xl w-full transition-colors duration-300">
        <Link href="/" className="p-1 -ml-1 text-[#111111] dark:text-[#EBEBEB] transition-colors focus:outline-none">
          <ArrowLeft size={22} strokeWidth={1.5} />
        </Link>
        <h1 className="text-[16px] font-bold tracking-tight text-[#111111] dark:text-[#EBEBEB]">
          Shared Cart
        </h1>
      </header>

      <div className="mx-auto max-w-lg md:max-w-xl px-4 pt-8 w-full">
        {sharedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-[#999999] dark:text-[#666666]">
            <ShoppingBag size={48} className="mb-4 opacity-20" />
            <p className="text-[16px] font-medium">This cart is empty or invalid.</p>
            <Link href="/" className="mt-6 font-bold text-[#111111] dark:text-[#EBEBEB] underline">
              Browse Catalog
            </Link>
          </div>
        ) : (
          <div className="rounded-[32px] bg-[#F8F6F0] dark:bg-[#1A1A1A] p-6 sm:p-8 shadow-xl border border-black/5 dark:border-white/10 transition-colors duration-300">
            <h2 className="mb-6 text-[22px] font-bold tracking-tight text-[#111111] dark:text-[#EBEBEB]">
              Order Summary {customerName && <>for <span className="text-[#666666] dark:text-[#999999]">{customerName}</span></>}
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              {sharedItems.map(({ product, quantity }, idx) => (
                <motion.div 
                  key={idx} 
                  layoutId={`shared-image-${idx}`}
                  onClick={() => setSelectedItem({ product, quantity, idx })}
                  className="relative w-full aspect-[4/5] overflow-hidden rounded-[20px] bg-[#E5E3DC] dark:bg-[#222] cursor-pointer"
                >
                  <img
                    src={product?.imageUrl}
                    alt="Order Item"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-[#111111] dark:bg-[#F8F6F0] text-white dark:text-[#111111] w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold shadow-lg">
                    {idx + 1}
                  </div>
                  {quantity > 1 && (
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-[12px] font-bold px-2.5 py-1 rounded-full shadow-lg">
                      x{quantity}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Full Screen Image Popup Overlay */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 bg-black/80 backdrop-blur-xl"
            onClick={() => setSelectedItem(null)}
          >
            <div className="relative z-10 w-full max-w-md flex flex-col items-center">
              <motion.div 
                layoutId={`shared-image-${selectedItem.idx}`}
                className="w-full overflow-hidden bg-[#E5E3DC] dark:bg-[#222] shadow-2xl relative"
                style={{ aspectRatio: '4/5', borderRadius: '24px' }}
                onClick={(e) => e.stopPropagation()}
              >
                <img src={selectedItem.product.imageUrl} alt="Popup Item" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute top-4 left-4 bg-[#111111] dark:bg-[#F8F6F0] text-white dark:text-[#111111] w-10 h-10 rounded-full flex items-center justify-center text-[15px] font-bold shadow-lg">
                  {selectedItem.idx + 1}
                </div>
                {selectedItem.quantity > 1 && (
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white text-[14px] font-bold px-3 py-1.5 rounded-full shadow-lg">
                    x{selectedItem.quantity}
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

export default function SharedCartPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8F6F0] dark:bg-[#111111]" />}>
      <SharedCartContent />
    </Suspense>
  );
}
