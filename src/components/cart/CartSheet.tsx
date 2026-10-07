"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Send, Trash2, Plus, Minus } from "lucide-react";
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

export function CartSheet() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const { items, totalItems, removeItem, addItem, decreaseItem, updateQuantity } = useCartStore();

  const [mounted, setMounted] = useState(false);
  
  // Share Modal State
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareStep, setShareStep] = useState<'name' | 'link'>('name');
  const [customerName, setCustomerName] = useState('');
  const [cartLink, setCartLink] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const handleOpenCart = () => setIsOpen(true);
    window.addEventListener('open-cart', handleOpenCart);
    return () => window.removeEventListener('open-cart', handleOpenCart);
  }, []);

  const totalAmount = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleShareCart = () => {
    if (items.length === 0) return;
    setShareStep('name');
    setCustomerName('');
    setIsShareModalOpen(true);
  };

  const handleGenerateLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) return;

    const itemIds = items.map((i) => `${i.id}-${i.quantity}`).join(",");
    const baseUrl = window.location.origin;
    const cartUrl = `${baseUrl}/cart?items=${itemIds}&name=${encodeURIComponent(customerName.trim())}`;
    
    setCartLink(cartUrl);
    setShareStep('link');
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
              <div className="grid grid-cols-3 gap-2 py-6">
                {items.map((item) => (
                  <motion.div 
                    key={item.id} 
                    layoutId={`cart-image-${item.id}`}
                    onClick={() => setSelectedItem(item)}
                    className="relative w-full aspect-square overflow-hidden rounded-[12px] bg-[#E5E3DC] dark:bg-[#222] cursor-pointer group"
                  >
                    <img src={item.imageUrl} alt={item.name} className="absolute inset-0 h-full w-full object-cover transition-transform group-hover:scale-105" />
                    {item.quantity > 1 && (
                      <div className="absolute top-1 right-1 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full z-10">
                        x{item.quantity}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </ScrollArea>

            {/* In-Cart Item Popup Overlay (Full Screen) */}
            <AnimatePresence>
                {selectedItem && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 bg-black/60 backdrop-blur-xl"
                  >
                    <div className="relative z-10 flex flex-col items-center w-[260px]">
                      {/* Hard pixel spacer guarantees the layout NEVER collapses during transit */}
                      <div className="w-[260px] h-[325px] shrink-0 mb-6">
                        <motion.div 
                          layoutId={`cart-image-${selectedItem.id}`}
                          className="w-full h-full overflow-hidden bg-[#E5E3DC] dark:bg-[#222] shadow-2xl relative"
                          style={{ borderRadius: '24px' }}
                        >
                          <img src={selectedItem.imageUrl} alt={selectedItem.name} className="absolute inset-0 h-full w-full object-cover" />
                        </motion.div>
                      </div>

                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ delay: 0.15, duration: 0.3 }}
                        className="flex w-full flex-col gap-3 relative z-20"
                      >
                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between bg-[#F8F6F0] dark:bg-[#1A1A1A] rounded-2xl p-3 shadow-xl w-full border border-black/5 dark:border-white/10">
                          <button 
                            onClick={() => {
                              decreaseItem(selectedItem.id);
                              const currentQ = Number(selectedItem.quantity) || 1;
                              if (currentQ <= 1) setSelectedItem(null);
                              else setSelectedItem({ ...selectedItem, quantity: currentQ - 1 });
                            }}
                            className="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-[#111111] dark:text-[#EBEBEB] border-none outline-none focus:outline-none"
                            style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}
                          >
                            {Number(selectedItem.quantity) <= 1 ? <Trash2 size={22} strokeWidth={2} className="text-red-500" /> : <Minus size={22} strokeWidth={2} />}
                          </button>
                          
                          <input 
                            type="number"
                            min="1"
                            value={selectedItem.quantity}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              if (!isNaN(val) && val > 0) {
                                updateQuantity(selectedItem.id, val);
                                setSelectedItem({ ...selectedItem, quantity: val });
                              } else if (e.target.value === '') {
                                setSelectedItem({ ...selectedItem, quantity: '' });
                              }
                            }}
                            onBlur={() => {
                              if (selectedItem.quantity === '' || selectedItem.quantity < 1) {
                                updateQuantity(selectedItem.id, 1);
                                setSelectedItem({ ...selectedItem, quantity: 1 });
                              }
                            }}
                            className="text-[20px] font-bold font-sans text-[#111111] dark:text-[#EBEBEB] w-12 text-center bg-transparent border-none outline-none focus:outline-none p-0 m-0 no-spinners"
                          />
                          
                          <button 
                            onClick={() => {
                              addItem(selectedItem);
                              const currentQ = Number(selectedItem.quantity) || 1;
                              setSelectedItem({ ...selectedItem, quantity: currentQ + 1 });
                            }}
                            className="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-[#111111] dark:text-[#EBEBEB] border-none outline-none focus:outline-none"
                            style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}
                          >
                            <Plus size={22} strokeWidth={2} />
                          </button>
                        </div>

                        <button 
                          onClick={() => setSelectedItem(null)}
                          className="w-full h-14 rounded-2xl bg-[#111111] dark:bg-[#F8F6F0] hover:bg-black dark:hover:bg-white text-white dark:text-[#111111] font-bold text-[16px] shadow-2xl transition-transform hover:scale-105 border-none outline-none focus:outline-none"
                        >
                          Done
                        </button>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}

          {items.length > 0 && (
            <div className="p-6 bg-[#F8F6F0] dark:bg-[#111111] border-t border-black/5 dark:border-white/10 transition-colors duration-300 relative z-40">
              <button 
                className="w-full h-14 rounded-full bg-[#111111] dark:bg-[#F8F6F0] hover:bg-black dark:hover:bg-white text-white dark:text-[#111111] font-bold text-[15px] font-sans flex items-center justify-center gap-2 border-none outline-none focus:outline-none transition-colors"
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
              className="w-full max-w-[320px] bg-[#F8F6F0] dark:bg-[#1A1A1A] rounded-[28px] p-8 shadow-2xl flex flex-col items-center text-center border border-black/5 dark:border-white/10"
            >
              {shareStep === 'name' ? (
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
                    className="w-full h-14 rounded-2xl bg-[#111111] dark:bg-[#F8F6F0] hover:bg-black dark:hover:bg-white text-white dark:text-[#111111] font-bold text-[15px] shadow-xl transition-colors border-none outline-none focus:outline-none flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Generate Link
                  </button>
                </form>
              ) : (
                <>
                  <div className="w-16 h-16 bg-[#E5E3DC] dark:bg-[#222] rounded-full flex items-center justify-center mb-6">
                    <Send size={28} className="text-[#111111] dark:text-[#EBEBEB] ml-1" />
                  </div>
                  
                  <h3 className="text-[20px] font-bold font-sans text-[#111111] dark:text-[#EBEBEB] mb-2">
                    Link Ready!
                  </h3>
                  
                  <p className="text-[14px] font-medium text-[#666666] dark:text-[#999999] mb-8 leading-relaxed px-2">
                    Copy this secure link and share it directly with us to finalize your purchase.
                  </p>

                  <div className="w-full bg-[#E5E3DC] dark:bg-[#222] rounded-2xl p-3 flex items-center justify-between gap-3 mb-4">
                    <span className="text-[13px] font-medium text-[#111111] dark:text-[#EBEBEB] truncate flex-1 text-left select-all">
                      {cartLink}
                    </span>
                  </div>

                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(cartLink);
                      setIsCopied(true);
                      setTimeout(() => setIsCopied(false), 2000);
                    }}
                    className="w-full h-14 rounded-2xl bg-[#111111] dark:bg-[#F8F6F0] hover:bg-black dark:hover:bg-white text-white dark:text-[#111111] font-bold text-[15px] shadow-xl transition-colors border-none outline-none focus:outline-none flex items-center justify-center gap-2"
                  >
                    {isCopied ? "Copied!" : "Copy Link"}
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
