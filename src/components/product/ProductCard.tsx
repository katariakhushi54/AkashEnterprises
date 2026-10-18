"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Product } from "@/data/products";
import { useCartStore } from "@/store/useCartStore";
import { useState, useEffect, useMemo } from "react";
import { Plus, X } from "lucide-react";
import { useModalHistory } from "@/hooks/useModalHistory";
import { normalizeSizes } from "@/lib/sizes";

export function ProductCard({ product, showColors = false }: { product: Product, showColors?: boolean }) {
  const addItem = useCartStore((state) => state.addItem);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const uniqueSizes = useMemo(() => {
    return normalizeSizes(product.sizes);
  }, [product.sizes]);

  const [selectedSize, setSelectedSize] = useState<string>(uniqueSizes[0] || "");

  useEffect(() => {
    if (uniqueSizes.length > 0) {
      setSelectedSize(uniqueSizes[0]);
    } else {
      setSelectedSize("");
    }
  }, [uniqueSizes]);

  useModalHistory(isModalOpen, () => setIsModalOpen(false), `productPopup-${product.id}`);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({
      ...product,
      selectedSize: selectedSize || (uniqueSizes[0] || undefined),
    });
    
    // Close modal by popping history state first
    window.history.back();
    
    // Wait a tiny bit for the popstate to finish before pushing the new cart state
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('open-cart'));
    }, 150);
  };

  return (
    <>
      {/* The Grid Card */}
      <motion.div
        className="flex flex-col cursor-pointer group w-full"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        onClick={() => setIsModalOpen(true)}
      >
        <motion.div 
          layoutId={`image-container-${product.id}`}
          className="relative w-full overflow-hidden bg-[#E5E3DC] dark:bg-[#222]" 
          style={{ aspectRatio: '4/5', borderRadius: '20px' }}
        >
          <motion.img
            layoutId={`image-${product.id}`}
            src={product.imageUrl}
            alt={product.name}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />
        </motion.div>

        {/* Clean Info & Price below image */}
        <div className="mt-2.5 px-1 flex flex-col gap-0.5">
          <p className="text-[11px] sm:text-[12px] font-medium tracking-wider text-[#777] dark:text-[#999] uppercase truncate">
            {product.category}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-[14px] sm:text-[15px] font-bold text-[#111111] dark:text-[#F8F6F0] tracking-tight">
              {product.price > 0 ? `₹${product.price.toLocaleString('en-IN')}` : 'Price on Request'}
            </span>
            {uniqueSizes && uniqueSizes.length > 0 && (
              <span className="text-[11px] font-semibold text-[#888] dark:text-[#AAA]">
                {uniqueSizes.length === 1 ? uniqueSizes[0] : `${uniqueSizes[0]}-${uniqueSizes[uniqueSizes.length - 1]}`}
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* The Elegant Popup Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            {/* Blurred Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/30 backdrop-blur-md"
            />
            
            {/* Modal Content */}
            <div className="relative z-10 w-full max-w-sm sm:max-w-md flex flex-col items-center">
              <motion.div 
                layoutId={`image-container-${product.id}`}
                className="w-full relative overflow-hidden rounded-[24px] bg-[#E5E3DC] dark:bg-[#222] shadow-2xl flex items-center justify-center"
                style={{ maxHeight: '72vh' }}
              >
                <motion.img
                  layoutId={`image-${product.id}`}
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-auto max-h-[72vh] object-contain block"
                />
                
                {/* Elegant Overlapping Close Button */}
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: 0.2, duration: 0.2 }}
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 dark:bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/30 dark:border-white/10 hover:bg-white/30 dark:hover:bg-black/60 transition-colors z-20"
                  aria-label="Close modal"
                >
                  <X size={20} strokeWidth={2} />
                </motion.button>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="w-full bg-[#F8F6F0] dark:bg-[#1A1A1A] mt-4 rounded-3xl p-4 sm:p-5 shadow-xl flex flex-col gap-4 border border-black/5 dark:border-white/10"
              >
                {/* Size Selector if available */}
                {uniqueSizes && uniqueSizes.length > 0 && (
                  <div className="flex flex-col gap-2 pb-3 border-b border-black/5 dark:border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#777] dark:text-[#999] uppercase tracking-wider">
                        Select Size
                      </span>
                      {selectedSize && (
                        <span className="text-[12px] font-bold text-[#111111] dark:text-[#F8F6F0]">
                          Size: {selectedSize}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {uniqueSizes.map((size, idx) => {
                        const isSelected = selectedSize === size;
                        return (
                          <button
                            key={`${size}-${idx}`}
                            type="button"
                            onClick={() => setSelectedSize(size)}
                            className={`h-9 min-w-[38px] px-3 rounded-xl font-bold text-[13px] transition-all flex items-center justify-center border-none outline-none cursor-pointer ${
                              isSelected
                                ? 'bg-[#111111] text-white dark:bg-[#F8F6F0] dark:text-[#111111] shadow-md scale-105'
                                : 'bg-[#E5E3DC] dark:bg-[#2A2A2A] text-[#333] dark:text-[#CCC] hover:bg-black/10 dark:hover:bg-white/10'
                            }`}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex flex-col pr-3">
                    <span className="text-[12px] font-medium text-[#777] dark:text-[#999] uppercase tracking-wider">
                      {product.category}
                    </span>
                    <span className="text-[20px] font-bold text-[#111111] dark:text-[#F8F6F0]">
                      {product.price > 0 ? `₹${product.price.toLocaleString('en-IN')}` : 'Price on Request'}
                    </span>
                  </div>
                  
                  <button 
                    onClick={handleAddToCart}
                    className="h-12 px-6 rounded-full bg-[#111111] dark:bg-[#F8F6F0] hover:bg-black dark:hover:bg-white text-white dark:text-[#111111] flex items-center justify-center gap-2 font-bold text-[14px] transition-transform hover:scale-105 border-none outline-none focus:outline-none shadow-md shrink-0 cursor-pointer"
                    style={{ border: 'none', boxShadow: 'none' }}
                  >
                    <Plus size={18} strokeWidth={2} />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

    </>
  );
}

