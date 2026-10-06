"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Product } from "@/data/products";
import { useCartStore } from "@/store/useCartStore";
import { useState } from "react";
import { Plus } from "lucide-react";

export function ProductCard({ product, showColors = false }: { product: Product, showColors?: boolean }) {
  const addItem = useCartStore((state) => state.addItem);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product);
    setIsModalOpen(false); // Optionally close modal on add
    window.dispatchEvent(new CustomEvent('open-cart')); // Show them it was added
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
                className="w-full overflow-hidden bg-[#E5E3DC] dark:bg-[#222] shadow-2xl"
                style={{ aspectRatio: '4/5', borderRadius: '24px' }}
              >
                <motion.img
                  layoutId={`image-${product.id}`}
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
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
