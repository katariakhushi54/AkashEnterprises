"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Product } from "@/data/products";
import { useCartStore } from "@/store/useCartStore";
import { useState } from "react";
import { Plus, X } from "lucide-react";
import { useModalHistory } from "@/hooks/useModalHistory";

export function ProductCard({ product, showColors = false }: { product: Product, showColors?: boolean }) {
  const addItem = useCartStore((state) => state.addItem);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useModalHistory(isModalOpen, () => setIsModalOpen(false), `productPopup-${product.id}`);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product);
    
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
        className="flex flex-col gap-3 cursor-pointer group w-full"
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
            <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
              <motion.div 
                layoutId={`image-container-${product.id}`}
                className="w-full relative overflow-hidden bg-[#E5E3DC] dark:bg-[#222] shadow-2xl"
                style={{ aspectRatio: '4/5', borderRadius: '24px' }}
              >
                <motion.img
                  layoutId={`image-${product.id}`}
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
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
                className="w-full bg-[#F8F6F0] dark:bg-[#1A1A1A] mt-4 rounded-3xl p-5 shadow-xl flex items-center justify-between border border-black/5 dark:border-white/10"
              >
                <div>
                  <h3 className="text-[18px] font-sans font-bold text-[#111111] dark:text-[#F8F6F0]">Add to Cart</h3>
                </div>
                
                <button 
                  onClick={handleAddToCart}
                  className="w-12 h-12 rounded-full bg-[#111111] dark:bg-[#F8F6F0] hover:bg-black dark:hover:bg-white text-white dark:text-[#111111] flex items-center justify-center transition-transform hover:scale-105 border-none outline-none focus:outline-none"
                  style={{ border: 'none', boxShadow: 'none' }}
                >
                  <Plus size={24} strokeWidth={1.5} />
                </button>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
