"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Send, Trash2, Plus, Minus, X } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useModalHistory } from "@/hooks/useModalHistory";

function QuantityControl({ item, decreaseItem, updateQuantity, addItem }: any) {
  const [localVal, setLocalVal] = useState(item.quantity.toString());

  useEffect(() => {
    setLocalVal(item.quantity.toString());
  }, [item.quantity]);

  return (
    <div className="flex items-center bg-[#E5E3DC] dark:bg-[#222] rounded-xl h-10 p-1 shrink-0 shadow-inner">
      <button 
        onClick={() => decreaseItem(item.id)}
        className="w-8 h-full flex items-center justify-center text-[#111111] dark:text-[#EBEBEB] rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
      >
        <Minus size={14} />
      </button>
      
      <input 
        type="number"
        min="1"
        value={localVal}
        onChange={(e) => {
          setLocalVal(e.target.value);
          const val = parseInt(e.target.value);
          if (!isNaN(val) && val > 0) {
            updateQuantity(item.id, val);
          }
        }}
        onBlur={() => {
          if (localVal === '' || parseInt(localVal) < 1) {
            setLocalVal('1');
            updateQuantity(item.id, 1);
          }
        }}
        className="text-[14px] font-bold font-sans text-[#111111] dark:text-[#EBEBEB] w-10 h-full text-center bg-white dark:bg-[#111] border border-black/5 dark:border-white/5 rounded-md outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 p-0 mx-0.5 no-spinners cursor-text transition-all shadow-sm"
      />
      
      <button 
        onClick={() => addItem(item)}
        className="w-8 h-full flex items-center justify-center text-[#111111] dark:text-[#EBEBEB] rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}

export function CartSheet() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const { items, totalItems, removeItem, addItem, decreaseItem, updateQuantity, clearCart } = useCartStore();

  const [mounted, setMounted] = useState(false);
  
  // Share Modal State
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');

  // Clear Cart Modal State
  const [isClearCartModalOpen, setIsClearCartModalOpen] = useState(false);

  useModalHistory(isOpen, () => setIsOpen(false), 'cart');
  useModalHistory(isShareModalOpen, () => setIsShareModalOpen(false), 'shareCart');
  useModalHistory(isClearCartModalOpen, () => setIsClearCartModalOpen(false), 'clearCart');
  useModalHistory(!!selectedItem, () => setSelectedItem(null), 'cartItemImage');

  useEffect(() => {
    setMounted(true);
    
    const handleOpenCart = () => setIsOpen(true);
    window.addEventListener('open-cart', handleOpenCart);
    return () => window.removeEventListener('open-cart', handleOpenCart);
  }, []);

  const totalAmount = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleShareCart = () => {
    if (items.length === 0) return;
    setCustomerName('');
    setIsShareModalOpen(true);
  };

  const handleGenerateLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) return;

    const itemIds = items.map((i) => `${i.id}-${i.quantity}`).join(",");
    const baseUrl = window.location.origin;
    const cartUrl = `${baseUrl}/cart?items=${itemIds}&name=${encodeURIComponent(customerName.trim())}`;
    
    const message = `Hello Akash Enterprises! I would like to place an order.\n\nMy Name: ${customerName.trim()}\n\nHere is my cart: ${cartUrl}`;
    const whatsappUrl = `https://wa.me/918390005505?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
    setIsShareModalOpen(false);
  };

  if (!mounted) return null;

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="bottom" className="h-[66vh] sm:h-screen sm:max-w-md p-0 flex flex-col rounded-t-3xl sm:rounded-none bg-[#F8F6F0] dark:bg-[#111111] border-none shadow-2xl transition-colors duration-300">
          <SheetHeader className="px-6 py-5 border-b border-black/5 dark:border-white/10 text-left bg-[#F8F6F0] dark:bg-[#111111] transition-colors duration-300">
            <SheetTitle className="text-xl font-bold font-sans text-[#111111] dark:text-[#EBEBEB]">Your Cart</SheetTitle>
          </SheetHeader>

          {items.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center text-[#999999] dark:text-[#666666] bg-[#F8F6F0] dark:bg-[#111111] transition-colors duration-300">
              <ShoppingBag size={48} className="mb-4 opacity-20" />
              <p className="font-medium font-sans">Your cart is empty.</p>
            </div>
          ) : (
            <>
            <ScrollArea className="flex-1 px-6 bg-[#F8F6F0] dark:bg-[#111111] transition-colors duration-300 relative overflow-hidden">
              <div className="flex flex-col gap-3 py-6">
                {items.map((item, index) => (
                  <div key={item.id} className="flex items-center gap-4 bg-[#E5E3DC]/30 dark:bg-[#222]/30 p-3 rounded-2xl border border-black/5 dark:border-white/5">
                    <div className="flex items-center gap-3">
                      <span className="text-[15px] font-bold text-[#999999] dark:text-[#666666] w-5 text-right font-sans">
                        {index + 1}.
                      </span>
                      <motion.div 
                        layoutId={`cart-image-${item.id}`}
                        onClick={() => setSelectedItem(item)}
                        className="w-16 h-20 shrink-0 rounded-[12px] overflow-hidden bg-[#E5E3DC] dark:bg-[#222] cursor-pointer"
                      >
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      </motion.div>
                    </div>
                    
                    <div className="flex-1" />
                    
                    <div className="flex items-center shrink-0">
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="w-9 h-10 flex items-center justify-center text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded-xl mr-3 transition-colors shrink-0"
                      >
                        <Trash2 size={16} />
                      </button>
                      
                      <QuantityControl 
                        item={item} 
                        decreaseItem={decreaseItem} 
                        updateQuantity={updateQuantity} 
                        addItem={addItem} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* In-Cart Item Image Popup Overlay */}
            <AnimatePresence>
                {selectedItem && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-xl"
                    onClick={() => setSelectedItem(null)}
                  >
                    <div className="relative z-10 w-full max-w-xs flex flex-col items-center">
                      <motion.div 
                        layoutId={`cart-image-${selectedItem.id}`}
                        className="w-full relative overflow-hidden bg-[#E5E3DC] dark:bg-[#222] shadow-2xl"
                        style={{ aspectRatio: '4/5', borderRadius: '24px' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <img src={selectedItem.imageUrl} alt={selectedItem.name} className="absolute inset-0 h-full w-full object-cover" />
                        
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
            </>
          )}

          {items.length > 0 && (
            <div className="p-6 bg-[#F8F6F0] dark:bg-[#111111] border-t border-black/5 dark:border-white/10 transition-colors duration-300 relative z-40 flex items-center gap-3">
              <button 
                onClick={() => setIsClearCartModalOpen(true)}
                className="h-14 px-5 sm:px-6 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-600 font-bold text-[14px] sm:text-[15px] transition-colors border-none outline-none focus:outline-none shrink-0 flex items-center gap-2"
              >
                <Trash2 size={18} />
                Clear
              </button>
              
              <button 
                className="flex-1 h-14 rounded-full bg-[#111111] dark:bg-[#F8F6F0] hover:bg-black dark:hover:bg-white text-white dark:text-[#111111] font-bold text-[15px] font-sans flex items-center justify-center gap-2 border-none outline-none focus:outline-none transition-colors"
                onClick={handleShareCart}
                style={{ border: 'none', boxShadow: 'none' }}
              >
                <Send className="mr-2 h-4 w-4" />
                Share Cart
              </button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Share Cart Modal Overlay */}
      <AnimatePresence>
        {isShareModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex flex-col items-center justify-center p-6 bg-black/60 backdrop-blur-xl"
            onClick={() => setIsShareModalOpen(false)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[320px] bg-[#F8F6F0] dark:bg-[#1A1A1A] rounded-[28px] p-8 shadow-2xl flex flex-col items-center text-center border border-black/5 dark:border-white/10 relative"
            >
              <button 
                onClick={() => setIsShareModalOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/10 text-[#111111] dark:text-[#EBEBEB] hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
              >
                <X size={16} strokeWidth={2.5} />
              </button>

                <form onSubmit={handleGenerateLink} className="w-full flex flex-col items-center">
                  <h3 className="text-[20px] font-bold font-sans text-[#111111] dark:text-[#EBEBEB] mb-2">
                    Who is this for?
                  </h3>
                  <p className="text-[14px] font-medium text-[#666666] dark:text-[#999999] mb-6 px-2">
                    Enter your name so the business owner knows who this order is from.
                  </p>
                  
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Your Full Name"
                    required
                    autoFocus
                    className="w-full h-14 bg-[#E5E3DC] dark:bg-[#222] rounded-2xl px-4 text-center font-bold text-[15px] text-[#111111] dark:text-[#EBEBEB] placeholder:text-black/30 dark:placeholder:text-white/30 border-none outline-none focus:ring-2 focus:ring-black dark:focus:ring-white mb-6"
                  />
                  
                  <button 
                    type="submit"
                    disabled={!customerName.trim()}
                    className="w-full h-14 rounded-2xl bg-[#25D366] hover:bg-[#128C7E] text-white font-bold text-[15px] shadow-xl transition-colors border-none outline-none focus:outline-none flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={18} />
                    Send on WhatsApp
                  </button>
                </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clear Cart Confirmation Modal */}
      <AnimatePresence>
        {isClearCartModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex flex-col items-center justify-center p-6 bg-black/60 backdrop-blur-xl"
            onClick={() => setIsClearCartModalOpen(false)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[320px] bg-[#F8F6F0] dark:bg-[#1A1A1A] rounded-[28px] p-8 shadow-2xl flex flex-col items-center text-center border border-black/5 dark:border-white/10 relative"
            >
              <button 
                onClick={() => setIsClearCartModalOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/10 text-[#111111] dark:text-[#EBEBEB] hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
              >
                <X size={16} strokeWidth={2.5} />
              </button>

              <div className="w-16 h-16 bg-red-500/10 dark:bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                <Trash2 size={28} className="text-red-500" />
              </div>
              
              <h3 className="text-[20px] font-bold font-sans text-[#111111] dark:text-[#EBEBEB] mb-2">
                Clear Cart?
              </h3>
              
              <p className="text-[14px] font-medium text-[#666666] dark:text-[#999999] mb-8 leading-relaxed px-2">
                Are you sure you want to remove all items from your cart? This action cannot be undone.
              </p>

              <div className="flex w-full gap-3">
                <button 
                  onClick={() => setIsClearCartModalOpen(false)}
                  className="flex-1 h-12 rounded-2xl bg-[#E5E3DC] dark:bg-[#333] hover:bg-[#D8D6CF] dark:hover:bg-[#444] text-[#111111] dark:text-[#EBEBEB] font-bold text-[15px] transition-colors border-none outline-none focus:outline-none"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    clearCart();
                    setIsClearCartModalOpen(false);
                  }}
                  className="flex-1 h-12 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold text-[15px] shadow-xl transition-colors border-none outline-none focus:outline-none"
                >
                  Clear
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
