"use client";

import { products as fallbackProducts, Product } from "@/data/products";
import Link from "next/link";
import { ArrowLeft, ShoppingBag, X, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useModalHistory } from "@/hooks/useModalHistory";
import { getStorefrontData } from "../actions";

function SharedCartContent() {
  const searchParams = useSearchParams();
  const itemsParam = searchParams.get("items");
  const customerName = searchParams.get("name") || "";
  
  const [allProducts, setAllProducts] = useState<Product[]>(fallbackProducts);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<{ product: Product; quantity: number; idx: number } | null>(null);
  
  useModalHistory(!!selectedItem, () => setSelectedItem(null), 'sharedCartItemImage');

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getStorefrontData();
        setAllProducts([...data.products, ...fallbackProducts]);
      } catch (e) {
        console.error("Failed to load storefront data for cart", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const sharedItems: { product: Product; quantity: number }[] = itemsParam
    ? itemsParam.split(",").flatMap((str) => {
        const parts = str.split("-");
        const rawId = parts.slice(0, -1).join("-");
        let id = rawId;
        let selectedSize: string | undefined = undefined;
        if (rawId.includes("~")) {
          const [baseId, size] = rawId.split("~");
          id = baseId;
          selectedSize = size;
        }
        const quantity = parseInt(parts[parts.length - 1] || "1", 10);
        const product = allProducts.find((p) => p.id === id);
        if (!product) return [];
        return [{ 
          product: { ...product, selectedSize }, 
          quantity 
        }];
      })
    : [];

  return (
    <main className="min-h-screen bg-[#F8F6F0] dark:bg-[#111111] pb-32 transition-colors duration-300 font-sans">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-center gap-4 bg-[#F8F6F0]/90 dark:bg-[#111111]/90 px-6 backdrop-blur-md border-b border-black/5 dark:border-white/10 mx-auto max-w-lg md:max-w-xl w-full transition-colors duration-300">
        <h1 className="text-[16px] font-bold tracking-tight text-[#111111] dark:text-[#EBEBEB]">
          Shared Cart
        </h1>
      </header>

      <div className="mx-auto max-w-lg md:max-w-xl px-4 pt-8 w-full">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-[#999999] dark:text-[#666666]">
            <Loader2 className="animate-spin mb-4 text-[#111111] dark:text-[#EBEBEB]" size={36} />
            <p className="text-[16px] font-medium">Loading cart items...</p>
          </div>
        ) : sharedItems.length === 0 ? (
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
            
            <div className="flex flex-col gap-3">
              {sharedItems.map(({ product, quantity }, idx) => (
                <div key={idx} className="flex items-center justify-between gap-4 bg-[#E5E3DC]/30 dark:bg-[#222]/30 p-3 rounded-2xl border border-black/5 dark:border-white/5 shadow-sm">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="text-[15px] font-bold text-[#999999] dark:text-[#666666] w-5 text-right font-sans shrink-0">
                      {idx + 1}.
                    </span>
                    <motion.div 
                      layoutId={`shared-image-${idx}`}
                      onClick={() => setSelectedItem({ product: product!, quantity, idx })}
                      className="relative w-16 h-20 sm:w-20 sm:h-24 shrink-0 rounded-[12px] overflow-hidden bg-[#E5E3DC] dark:bg-[#222] cursor-pointer"
                    >
                      <img
                        src={product?.imageUrl}
                        alt="Order Item"
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                    <div className="flex flex-col min-w-0 px-2 justify-center">
                      <p className="text-[13px] sm:text-[14px] font-bold text-[#111111] dark:text-[#EBEBEB] truncate">
                        {product?.category || product?.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {product?.selectedSize && (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#111111]/10 dark:bg-white/10 text-[#111111] dark:text-[#EBEBEB]">
                            Size: {product.selectedSize}
                          </span>
                        )}
                        {product && product.price > 0 && (
                          <span className="text-[13px] sm:text-[14px] font-extrabold text-[#111111] dark:text-[#F8F6F0]">
                            ₹{product.price.toLocaleString('en-IN')} {quantity > 1 ? `× ${quantity} = ₹${(product.price * quantity).toLocaleString('en-IN')}` : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center bg-[#111111] dark:bg-[#F8F6F0] rounded-xl h-10 px-4 shrink-0 shadow-lg">
                    <span className="text-[14px] font-bold text-white dark:text-[#111111]">
                      Qty: {quantity}
                    </span>
                  </div>
                </div>
              ))}
            </div>


            {(() => {
              const sharedTotal = sharedItems.reduce((acc, item) => acc + (item.product.price || 0) * item.quantity, 0);
              return sharedTotal > 0 ? (
                <div className="mt-6 pt-5 border-t border-black/5 dark:border-white/10 flex items-center justify-between px-2">
                  <span className="text-[15px] font-medium text-[#777] dark:text-[#999]">Total Order Value</span>
                  <span className="text-[22px] font-extrabold text-[#111111] dark:text-[#F8F6F0]">
                    ₹{sharedTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              ) : null;
            })()}
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
                className="w-full relative overflow-hidden rounded-[24px] bg-[#E5E3DC] dark:bg-[#222] shadow-2xl flex items-center justify-center"
                style={{ maxHeight: '72vh' }}
                onClick={(e) => e.stopPropagation()}
              >
                <img src={selectedItem.product.imageUrl} alt="Popup Item" className="w-full h-auto max-h-[72vh] object-contain block" />
                
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <div className="bg-black/60 backdrop-blur-md text-white text-[14px] font-bold px-3 py-1.5 rounded-full shadow-lg">
                    x{selectedItem.quantity}
                  </div>
                  {selectedItem.product.selectedSize && (
                    <div className="bg-white/90 text-[#111] dark:bg-black/80 dark:text-white backdrop-blur-md text-[13px] font-bold px-3 py-1.5 rounded-full shadow-lg">
                      Size: {selectedItem.product.selectedSize}
                    </div>
                  )}
                </div>
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: 0.1, duration: 0.2 }}
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 dark:bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/30 dark:border-white/10 hover:bg-white/30 dark:hover:bg-black/60 transition-colors z-20"
                >
                  <X size={20} strokeWidth={2} />
                </motion.button>
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
