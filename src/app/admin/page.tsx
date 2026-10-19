'use client';

import { useState, useEffect } from 'react';
import { Upload, Plus, Image as ImageIcon, LogIn, Loader2, X, CheckCircle2, Pencil, Trash2, AlertCircle } from 'lucide-react';
import { getCategories, createCategory, uploadAsset, addAssetsToCategory, getCategoryImages, getAllImages, updateCategory, deleteCategory, clearCategoryImages, deleteCategoryImage, updateImagePrice, updateImageSizes, updateImageBottomWidth, updateImageSizeBottomWidths, setCategoryPrice, loginAdmin, logoutAdmin, checkAdminAuth } from './actions';
import { normalizeSizes } from '@/lib/sizes';
import { ProductSpecEditor } from '@/components/admin/ProductSpecEditor';

interface Category {
  _id?: string;
  id?: string;
  title: string;
  price?: number;
  sizes?: string[];
  bottomWidth?: string;
  sizeBottomWidths?: { size: string; bottomWidth: string }[];
}

interface AdminImage {
  url: string;
  _key: string;
  categoryId?: string;
  price?: number;
  sizes?: string[];
  bottomWidth?: string;
  sizeBottomWidths?: { size: string; bottomWidth: string }[];
  categoryPrice?: number;
  categorySizes?: string[];
  categoryBottomWidth?: string;
  categorySizeBottomWidths?: { size: string; bottomWidth: string }[];
}

function arrayToMap(arr?: { size: string; bottomWidth: string }[]): Record<string, string> {
  const map: Record<string, string> = {};
  if (arr) {
    arr.forEach(item => {
      if (item.size && item.bottomWidth) map[item.size] = item.bottomWidth;
    });
  }
  return map;
}

function mapToArray(map: Record<string, string>): { size: string; bottomWidth: string }[] {
  return Object.entries(map)
    .filter(([size, width]) => size.trim() && width.trim())
    .map(([size, bottomWidth]) => ({ size: size.trim(), bottomWidth: bottomWidth.trim() }));
}

export default function CustomAdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [errorAlert, setErrorAlert] = useState<string | null>(null);
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [activeCategoryImages, setActiveCategoryImages] = useState<AdminImage[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryPrice, setNewCategoryPrice] = useState('');
  const [newCategorySizes, setNewCategorySizes] = useState<string[]>([]);
  const [newCategoryBottomWidth, setNewCategoryBottomWidth] = useState('');
  const [newCategorySizeBottomWidths, setNewCategorySizeBottomWidths] = useState<Record<string, string>>({});
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [editCategoryPrice, setEditCategoryPrice] = useState('');
  const [editCategorySizes, setEditCategorySizes] = useState<string[]>([]);
  const [editCategoryBottomWidth, setEditCategoryBottomWidth] = useState('');
  const [editCategorySizeBottomWidths, setEditCategorySizeBottomWidths] = useState<Record<string, string>>({});
  const [isDeleteCategoryOpen, setIsDeleteCategoryOpen] = useState(false);
  const [isClearImagesOpen, setIsClearImagesOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<AdminImage | null>(null);
  const [imagePriceInput, setImagePriceInput] = useState('');
  const [imageSizes, setImageSizes] = useState<string[]>([]);
  const [imageBottomWidth, setImageBottomWidth] = useState('');
  const [imageSizeBottomWidths, setImageSizeBottomWidths] = useState<Record<string, string>>({});
  const [isSavingPrice, setIsSavingPrice] = useState(false);

  const loadImages = async (
    categoryId: string, 
    catPrice?: number, 
    catSizes?: string[], 
    catBottomWidth?: string,
    catSizeBottomWidths?: { size: string; bottomWidth: string }[]
  ) => {
    setIsLoading(true);
    try {
      if (categoryId === 'all') {
        const images = await getAllImages();
        setActiveCategoryImages(images);
      } else {
        const images = await getCategoryImages(categoryId);
        setActiveCategoryImages(images.map((img: AdminImage) => ({ 
          ...img, 
          categoryId,
          categoryPrice: catPrice !== undefined ? catPrice : activeCategory?.price,
          categorySizes: catSizes !== undefined ? catSizes : activeCategory?.sizes,
          categoryBottomWidth: catBottomWidth !== undefined ? catBottomWidth : activeCategory?.bottomWidth,
          categorySizeBottomWidths: catSizeBottomWidths !== undefined ? catSizeBottomWidths : activeCategory?.sizeBottomWidths
        })));
      }
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

  // Handle Back Button for Modals and Category View
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      // Clear modals
      setIsAddingCategory(false);
      setIsEditingCategory(false);
      setIsDeleteCategoryOpen(false);
      setIsClearImagesOpen(false);
      setSelectedImage(null);
      setErrorAlert(null);
      
      // If we popped back to the root state, clear active category or go to 'all'
      if (!e.state || !e.state.view) {
        if (window.innerWidth >= 768) {
          setActiveCategory({ _id: 'all', title: 'All Products' });
          setActiveCategoryImages([]);
          setUploadSuccess(false);
          loadImages('all');
        } else {
          setActiveCategory(null);
        }
      }
    };
    
    if (isAuthenticated) {
      window.addEventListener('popstate', handlePopState);
    }
    
    // Initial load default category for desktop
    if (isAuthenticated && window.innerWidth >= 768 && !window.history.state?.view) {
      setTimeout(() => {
        setActiveCategory({ _id: 'all', title: 'All Products' });
        loadImages('all');
      }, 0);
    }
    
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isAuthenticated]);

  // Check existing session cookie on initial load
  useEffect(() => {
    checkAdminAuth()
      .then((authed) => {
        setIsAuthenticated(authed);
      })
      .finally(() => {
        setIsCheckingAuth(false);
      });
  }, []);

  // History Trap for Login Page
  useEffect(() => {
    if (!isAuthenticated && !isCheckingAuth) {
      // Ensure there's a state to pop from, preserving Next.js internal state
      window.history.pushState({ ...(window.history.state || {}), loginTrap: true }, '');
      
      const handlePopState = () => {
        // Prevent going back by pushing state again
        window.history.pushState({ ...(window.history.state || {}), loginTrap: true }, '');
      };
      
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, [isAuthenticated, isCheckingAuth]);

  const openModal = (type: 'add' | 'edit' | 'image' | 'delete' | 'clear' | 'error', data?: string | AdminImage) => {
    const currentState = window.history.state || {};
    window.history.pushState({ ...currentState, modal: type }, '');
    if (type === 'add') {
      setNewCategoryName('');
      setNewCategoryPrice('');
      setNewCategorySizes([]);
      setNewCategoryBottomWidth('');
      setNewCategorySizeBottomWidths({});
      setIsAddingCategory(true);
    }
    if (type === 'edit') {
      setEditCategoryName(activeCategory?.title || (typeof data === 'string' ? data : ''));
      setEditCategoryPrice(activeCategory?.price ? activeCategory.price.toString() : '');
      setEditCategorySizes(activeCategory?.sizes ? normalizeSizes(activeCategory.sizes) : []);
      setEditCategoryBottomWidth(activeCategory?.bottomWidth || '');
      setEditCategorySizeBottomWidths(arrayToMap(activeCategory?.sizeBottomWidths));
      setIsEditingCategory(true);
    }
    if (type === 'image') {
      const img = data as AdminImage;
      setSelectedImage(img);
      setImagePriceInput(img.price ? img.price.toString() : '');
      setImageSizes(img.sizes ? normalizeSizes(img.sizes) : []);
      setImageBottomWidth(img.bottomWidth || '');
      setImageSizeBottomWidths(arrayToMap(img.sizeBottomWidths));
    }
    if (type === 'delete') setIsDeleteCategoryOpen(true);
    if (type === 'clear') setIsClearImagesOpen(true);
    if (type === 'error') setErrorAlert(data as string);
  };

  const closeModal = () => {
    if (window.history.state?.modal) {
      window.history.back();
    } else {
      setIsAddingCategory(false);
      setIsEditingCategory(false);
      setIsDeleteCategoryOpen(false);
      setIsClearImagesOpen(false);
      setSelectedImage(null);
      setErrorAlert(null);
    }
  };

  // Fetch categories when logged in
  useEffect(() => {
    if (isAuthenticated) {
      loadCategories();
    }
  }, [isAuthenticated]);

  async function loadCategories() {
    setIsLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  }

  const handleSelectCategory = (cat: Category) => {
    if (!activeCategory) {
      window.history.pushState({ ...(window.history.state || {}), view: 'category' }, '');
    }
    setActiveCategory(cat);
    setActiveCategoryImages([]);
    setUploadSuccess(false);
    loadImages(cat._id || cat.id || '', cat.price, cat.sizes, cat.bottomWidth, cat.sizeBottomWidths);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    setIsLoggingIn(true);
    setLoginError(false);
    try {
      const res = await loginAdmin(password);
      if (res.success) {
        setIsAuthenticated(true);
        setPassword('');
      } else {
        setLoginError(true);
      }
    } catch {
      setLoginError(true);
    }
    setIsLoggingIn(false);
  };

  const handleLogout = async () => {
    try {
      await logoutAdmin();
    } catch (e) {
      console.error(e);
    }
    setIsAuthenticated(false);
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    
    setIsLoading(true);
    try {
      const parsedPrice = newCategoryPrice.trim() ? Number(newCategoryPrice.trim()) : undefined;
      const cleanSizes = newCategorySizes.length > 0 ? newCategorySizes : undefined;
      const cleanBottomWidth = newCategoryBottomWidth.trim() || undefined;
      const cleanSizeBottomWidths = mapToArray(newCategorySizeBottomWidths);

      const newCat = await createCategory(
        newCategoryName, 
        parsedPrice, 
        cleanSizes, 
        cleanBottomWidth,
        cleanSizeBottomWidths.length > 0 ? cleanSizeBottomWidths : undefined
      );
      setCategories([...categories, newCat]);
      handleSelectCategory(newCat);
      setNewCategoryName('');
      setNewCategoryPrice('');
      setNewCategorySizes([]);
      setNewCategoryBottomWidth('');
      setNewCategorySizeBottomWidths({});
      closeModal();
    } catch (e) {
      console.error(e);
      openModal('error', "Failed to create category");
    }
    setIsLoading(false);
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCategoryName.trim() || !activeCategory) return;
    
    setIsLoading(true);
    try {
      const catId = activeCategory._id || activeCategory.id;
      if (!catId) return;
      const parsedPrice = editCategoryPrice.trim() ? Number(editCategoryPrice.trim()) : null;
      const cleanSizes = editCategorySizes.length > 0 ? editCategorySizes : null;
      const cleanBottomWidth = editCategoryBottomWidth.trim() || null;
      const cleanSizeBottomWidths = mapToArray(editCategorySizeBottomWidths);

      await updateCategory(
        catId, 
        editCategoryName, 
        parsedPrice, 
        cleanSizes, 
        cleanBottomWidth,
        cleanSizeBottomWidths.length > 0 ? cleanSizeBottomWidths : null
      );
      
      const updatedCat: Category = { 
        ...activeCategory, 
        title: editCategoryName, 
        price: parsedPrice && parsedPrice > 0 ? parsedPrice : undefined,
        sizes: cleanSizes && cleanSizes.length > 0 ? cleanSizes : undefined,
        bottomWidth: cleanBottomWidth || undefined,
        sizeBottomWidths: cleanSizeBottomWidths.length > 0 ? cleanSizeBottomWidths : undefined
      };
      setCategories(categories.map(c => (c._id || c.id) === catId ? updatedCat : c));
      setActiveCategory(updatedCat);
      closeModal();
    } catch (e) {
      console.error(e);
      openModal('error', "Failed to update category");
    }
    setIsLoading(false);
  };

  const handleSaveImageDetails = async () => {
    if (!selectedImage) return;
    const catId = selectedImage.categoryId || activeCategory?._id || activeCategory?.id;
    if (!catId || catId === 'all') {
      openModal('error', 'Please navigate to the specific category to set this item details');
      return;
    }
    setIsSavingPrice(true);
    try {
      const priceNum = imagePriceInput.trim() ? Number(imagePriceInput.trim()) : null;
      await updateImagePrice(catId, selectedImage._key, priceNum);

      const cleanSizes = imageSizes.length > 0 ? imageSizes : null;
      await updateImageSizes(catId, selectedImage._key, cleanSizes);

      const cleanBottomWidth = imageBottomWidth.trim() || null;
      await updateImageBottomWidth(catId, selectedImage._key, cleanBottomWidth);

      const cleanSizeBottomWidths = mapToArray(imageSizeBottomWidths);
      await updateImageSizeBottomWidths(
        catId, 
        selectedImage._key, 
        cleanSizeBottomWidths.length > 0 ? cleanSizeBottomWidths : null
      );
      
      // Update local state
      setActiveCategoryImages(prev => prev.map(img => 
        img._key === selectedImage._key 
          ? { 
              ...img, 
              price: priceNum && priceNum > 0 ? priceNum : undefined,
              sizes: cleanSizes && cleanSizes.length > 0 ? cleanSizes : undefined,
              bottomWidth: cleanBottomWidth || undefined,
              sizeBottomWidths: cleanSizeBottomWidths.length > 0 ? cleanSizeBottomWidths : undefined
            } 
          : img
      ));
      
      // Close popup modal
      setSelectedImage(null);
      closeModal();
    } catch (e) {
      console.error(e);
      openModal('error', 'Failed to update image details');
    } finally {
      setIsSavingPrice(false);
    }
  };


  const handleDeleteCategory = async () => {
    if (!activeCategory) return;
    
    setIsLoading(true);
    try {
      const catId = activeCategory._id || activeCategory.id;
      if (!catId) return;
      await deleteCategory(catId);
      setCategories(categories.filter(c => (c._id || c.id) !== catId));
      setActiveCategory(null);
      closeModal();
    } catch (e) {
      console.error(e);
      openModal('error', "Failed to delete category");
    }
    setIsLoading(false);
  };

  const handleClearImages = async () => {
    if (!activeCategory) return;

    setIsLoading(true);
    try {
      const catId = activeCategory._id || activeCategory.id;
      if (!catId) return;
      await clearCategoryImages(catId);
      setActiveCategoryImages([]);
      closeModal();
    } catch (e) {
      console.error(e);
      openModal('error', "Failed to clear images");
    }
    setIsLoading(false);
  };

  const handleDeleteImage = async (imageKey: string, imageCategoryId?: string) => {
    if (!activeCategory) return;
    
    setIsLoading(true);
    try {
      const catId = imageCategoryId || activeCategory._id || activeCategory.id;
      if (!catId) return;
      await deleteCategoryImage(catId, imageKey);
      setActiveCategoryImages(activeCategoryImages.filter(img => img._key !== imageKey));
    } catch (e) {
      console.error(e);
      openModal('error', "Failed to delete image");
    }
    setIsLoading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files.length || !activeCategory) return;
    
    setIsUploading(true);
    setUploadSuccess(false);
    
    try {
      const files = Array.from(e.target.files);
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return await uploadAsset(formData);
      });
      
      const assetIds = await Promise.all(uploadPromises);
      const catId = activeCategory._id || activeCategory.id;
      if (!catId) return;
      await addAssetsToCategory(catId, assetIds);
      
      setUploadSuccess(true);
      loadImages(catId); // Reload images
    } catch (e) {
      console.error(e);
      openModal('error', "Failed to upload some images. Please try again.");
    }
    
    setIsUploading(false);
    // Reset file input
    e.target.value = '';
  };

  if (isCheckingAuth) {
    return (
      <main className="min-h-screen bg-[#F8F6F0] dark:bg-[#111111] flex items-center justify-center p-6">
        <Loader2 className="animate-spin text-[#111111] dark:text-[#EBEBEB]" size={36} />
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#F8F6F0] dark:bg-[#111111] flex items-center justify-center p-6 transition-colors duration-300">
        <div className="w-full max-w-md bg-white dark:bg-[#1A1A1A] p-8 rounded-3xl shadow-xl border border-black/5 dark:border-white/10">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold font-sans text-[#111111] dark:text-[#EBEBEB]">Admin Login</h1>
            <p className="text-[#666] dark:text-[#999] mt-2">Enter your password to access the dashboard</p>
          </div>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            {loginError && (
              <div className="bg-red-50 dark:bg-red-500/10 text-red-500 p-4 rounded-2xl text-[14px] font-bold flex items-center gap-3 border border-red-100 dark:border-red-500/20">
                <AlertCircle size={18} className="shrink-0" />
                Incorrect password. Please try again.
              </div>
            )}
            <input 
              type="password" 
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setLoginError(false);
              }}
              placeholder="Enter Admin Password"
              className="w-full h-14 bg-[#E5E3DC] dark:bg-[#222] rounded-2xl px-4 font-bold text-[15px] text-[#111111] dark:text-[#EBEBEB] border-none outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            />
            <button 
              type="submit" 
              disabled={isLoggingIn || !password.trim()}
              className="w-full h-14 rounded-2xl bg-[#111111] dark:bg-[#F8F6F0] text-white dark:text-[#111111] font-bold text-[15px] flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isLoggingIn ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
              {isLoggingIn ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F6F0] dark:bg-[#111111] pb-32 font-sans text-[#111111] dark:text-[#EBEBEB] transition-colors duration-300">
      <header className="sticky top-0 z-30 flex h-20 items-center justify-between px-6 md:px-12 bg-[#F8F6F0]/90 dark:bg-[#111111]/90 backdrop-blur-md border-b border-black/5 dark:border-white/10">
        <h1 className="text-[18px] font-bold tracking-tight">Akash Enterprises <span className="text-[#999] font-normal ml-2">/ Shop Manager</span></h1>
        <button onClick={handleLogout} className="text-[14px] font-bold text-red-500 hover:text-red-600 transition-colors">Logout</button>
      </header>

      <div className="max-w-5xl mx-auto px-6 pt-12 flex flex-col md:flex-row gap-12 relative">
        
        {/* Sidebar - Categories */}
        <div className={`w-full md:w-64 shrink-0 flex-col gap-4 ${activeCategory ? 'hidden md:flex' : 'flex'}`}>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[16px] font-bold text-[#666] dark:text-[#999] uppercase tracking-wider">Categories</h2>
          </div>
          
          {isLoading && categories.length === 0 && (
            <div className="text-[#999] text-sm animate-pulse">Loading categories...</div>
          )}

          <button 
            onClick={() => handleSelectCategory({ _id: 'all', title: 'All Products' })}
            className={`w-full text-left px-5 py-4 rounded-2xl font-bold text-[15px] transition-all ${
              activeCategory && activeCategory._id === 'all'
                ? 'bg-[#111111] text-white dark:bg-[#EBEBEB] dark:text-[#111111] shadow-xl' 
                : 'bg-white dark:bg-[#1A1A1A] hover:bg-[#E5E3DC] dark:hover:bg-[#222]'
            }`}
          >
            All Products
          </button>

          {categories.map(cat => {
            const activeId = activeCategory ? (activeCategory._id || activeCategory.id) : null;
            const catId = cat._id || cat.id;
            const isActive = activeId && catId && activeId === catId;
            return (
            <button 
              key={cat._id || cat.id}
              onClick={() => handleSelectCategory(cat)}
              className={`w-full text-left px-5 py-4 rounded-2xl font-bold text-[15px] transition-all flex items-center justify-between ${
                isActive
                  ? 'bg-[#111111] text-white dark:bg-[#EBEBEB] dark:text-[#111111] shadow-xl' 
                  : 'bg-white dark:bg-[#1A1A1A] hover:bg-[#E5E3DC] dark:hover:bg-[#222]'
              }`}
            >
              <span className="truncate">{cat.title}</span>
              {cat.price ? (
                <span className={`text-[12px] font-semibold px-2 py-0.5 rounded-full shrink-0 ml-2 ${
                  isActive 
                    ? 'bg-white/20 text-white dark:bg-black/20 dark:text-[#111111]' 
                    : 'bg-black/5 dark:bg-white/10 text-[#666] dark:text-[#999]'
                }`}>
                  ₹{cat.price}
                </span>
              ) : null}
            </button>
          )})}

          <button 
            onClick={() => openModal('add')}
            className="w-full h-14 mt-2 rounded-2xl border-2 border-dashed border-black/20 dark:border-white/20 text-[#111111] dark:text-[#EBEBEB] font-bold text-[15px] flex items-center justify-center gap-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <Plus size={18} />
            Add Category
          </button>
        </div>

        {/* Main Content - Bulk Upload */}
        <div className={`flex-1 ${!activeCategory ? 'hidden md:block' : 'block'}`}>
          {activeCategory ? (
            <div className="bg-white dark:bg-[#1A1A1A] rounded-[32px] p-8 shadow-xl border border-black/5 dark:border-white/10">
              <div className="md:hidden mb-6">
                <button 
                  onClick={() => window.history.back()}
                  className="text-[15px] font-bold text-[#666] dark:text-[#999] hover:text-[#111111] dark:hover:text-[#EBEBEB] transition-colors"
                >
                  &larr; Back to Categories
                </button>
              </div>
              <div className="flex items-center justify-between mb-6 pb-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-[24px] font-bold">
                    {activeCategory._id === 'all' ? activeCategory.title : `Upload to ${activeCategory.title}`}
                  </h2>
                  {activeCategory._id !== 'all' && activeCategory.price ? (
                    <span className="text-[13px] font-bold px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 text-[#111111] dark:text-[#EBEBEB]">
                      Default: ₹{activeCategory.price}
                    </span>
                  ) : null}
                  {activeCategory._id !== 'all' && activeCategory.bottomWidth ? (
                    <span className="text-[13px] font-bold px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 text-[#111111] dark:text-[#EBEBEB]">
                      Bottom: {activeCategory.bottomWidth}
                    </span>
                  ) : null}
                </div>
                {activeCategory._id !== 'all' && (
                  <div className="flex gap-2">
                    <button onClick={() => openModal('edit', activeCategory.title)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#F8F6F0] dark:bg-[#111111] hover:bg-black/5 transition-colors" title="Edit Category"><Pencil size={18} /></button>
                    <button onClick={() => openModal('delete')} className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors" title="Delete Category"><Trash2 size={18} /></button>
                  </div>
                )}
              </div>

              
              {activeCategory._id !== 'all' && (
                <div className={`w-full h-64 border-2 border-dashed ${uploadSuccess ? 'border-green-500 bg-green-500/5' : 'border-black/20 dark:border-white/20 bg-[#F8F6F0] dark:bg-[#111111]'} rounded-[24px] flex flex-col items-center justify-center cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors relative overflow-hidden group`}>
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    disabled={isUploading}
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed" 
                  />
                  
                  {isUploading ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="animate-spin mb-4 text-[#111111] dark:text-[#EBEBEB]" size={32} />
                      <h3 className="text-[18px] font-bold text-[#111111] dark:text-[#EBEBEB]">Uploading...</h3>
                      <p className="text-[14px] text-[#666] dark:text-[#999] mt-2">Please do not close this window</p>
                    </div>
                  ) : uploadSuccess ? (
                    <div className="flex flex-col items-center text-green-600 dark:text-green-500">
                      <CheckCircle2 size={48} className="mb-4" />
                      <h3 className="text-[18px] font-bold">Upload Complete!</h3>
                      <p className="text-[14px] mt-2 text-center max-w-[250px]">Drop more images here to add them to {activeCategory.title}</p>
                    </div>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-[#111111] dark:bg-[#EBEBEB] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Upload size={24} className="text-white dark:text-[#111111]" />
                      </div>
                      <h3 className="text-[18px] font-bold text-[#111111] dark:text-[#EBEBEB]">Tap to Bulk Upload</h3>
                      <p className="text-[14px] text-[#666] dark:text-[#999] mt-2">or drag and drop multiple images here</p>
                    </>
                  )}
                </div>
              )}

              {/* Show uploaded images */}
              {(activeCategoryImages.length > 0 || activeCategory._id === 'all') && (
                <div className={`mt-12 ${activeCategory._id === 'all' ? 'mt-0' : ''}`}>
                  <div className="flex items-center justify-between mb-4 border-b border-black/5 dark:border-white/10 pb-2">
                    <h3 className="text-[18px] font-bold">
                      {activeCategory._id === 'all' ? `All Images (${activeCategoryImages.length})` : `Currently in ${activeCategory.title} (${activeCategoryImages.length})`}
                    </h3>
                    {activeCategory._id !== 'all' && (
                      <button 
                        onClick={() => openModal('clear')}
                        className="text-red-500 hover:text-red-700 font-bold text-[14px] flex items-center gap-1 transition-colors"
                      >
                        <Trash2 size={16} />
                        Clear category bin
                      </button>
                    )}
                  </div>
                  {activeCategoryImages.length === 0 && activeCategory._id === 'all' ? (
                    <div className="flex flex-col items-center justify-center text-[#999] py-12">
                      <ImageIcon size={48} className="opacity-20 mb-4" />
                      <p className="font-bold">No images uploaded yet.</p>
                    </div>
                  ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                    {activeCategoryImages.map((img, i) => {
                      const displayPrice = img.price || (activeCategory?._id !== 'all' ? activeCategory?.price : img.categoryPrice);
                      const displaySizes = normalizeSizes((img.sizes && img.sizes.length > 0) 
                        ? img.sizes 
                        : (activeCategory?._id !== 'all' ? activeCategory?.sizes : img.categorySizes));
                      const displayBottomWidth = img.bottomWidth || (activeCategory?._id !== 'all' ? activeCategory?.bottomWidth : img.categoryBottomWidth);
                      return (
                      <button 
                        key={img._key || i} 
                        onClick={() => openModal('image', img)}
                        className="group relative aspect-[4/5] rounded-xl overflow-hidden bg-[#E5E3DC] dark:bg-[#222] border-none outline-none block w-full cursor-pointer hover:ring-2 hover:ring-black dark:hover:ring-white transition-all text-left"
                      >
                        <img src={img.url} alt="Product" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                        <div className="absolute bottom-2 left-2 right-2 flex flex-col gap-1 pointer-events-none">
                          <div className="flex justify-between items-center gap-1">
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-white shadow-sm shrink-0">
                              {displayPrice ? `₹${displayPrice}` : 'No price'}
                            </span>
                            {displayBottomWidth && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-white shadow-sm shrink-0 truncate max-w-[80px]">
                                B: {displayBottomWidth}
                              </span>
                            )}
                          </div>
                          {displaySizes && displaySizes.length > 0 && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white/80 dark:bg-black/80 backdrop-blur-md text-[#111] dark:text-white shadow-sm truncate">
                              {displaySizes.join(', ')}
                            </span>
                          )}
                        </div>
                      </button>
                    )})}
                  </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-[#999] pt-20">
              <ImageIcon size={48} className="opacity-20 mb-4" />
              <p className="font-bold">Select a category to manage photos.</p>
            </div>
          )}
        </div>

        {/* Add Category Modal */}
        {isAddingCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-[#1A1A1A] rounded-[32px] p-8 w-full max-w-sm shadow-2xl relative">
              <button 
                type="button"
                onClick={() => closeModal()}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 transition-colors"
              >
                <X size={16} />
              </button>
              <h3 className="text-[20px] font-bold mb-4">New Category</h3>
              <form onSubmit={handleCreateCategory} className="flex flex-col gap-4">
                <input 
                  autoFocus
                  type="text" 
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Category Name (e.g., Baggy Jeans)"
                  className="w-full h-14 bg-[#F8F6F0] dark:bg-[#111111] rounded-2xl px-4 font-bold text-[15px] border-none outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-[#111111] dark:text-[#EBEBEB]"
                />
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-[#666] dark:text-[#999] text-[15px]">₹</span>
                  <input 
                    type="number" 
                    min="0"
                    value={newCategoryPrice}
                    onChange={(e) => setNewCategoryPrice(e.target.value)}
                    placeholder="Default Price (Optional)"
                    className="w-full h-14 bg-[#F8F6F0] dark:bg-[#111111] rounded-2xl pl-9 pr-4 font-bold text-[15px] border-none outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-[#111111] dark:text-[#EBEBEB]"
                  />
                </div>
                <ProductSpecEditor
                  sizes={newCategorySizes}
                  onSizesChange={setNewCategorySizes}
                  bottomWidth={newCategoryBottomWidth}
                  onBottomWidthChange={setNewCategoryBottomWidth}
                  sizeBottomWidths={newCategorySizeBottomWidths}
                  onSizeBottomWidthsChange={setNewCategorySizeBottomWidths}
                  isCategoryLevel={true}
                />
                <button 
                  type="submit" 
                  disabled={isLoading || !newCategoryName.trim()}
                  className="w-full h-14 rounded-2xl bg-[#111111] dark:bg-[#F8F6F0] text-white dark:text-[#111111] font-bold text-[15px] flex items-center justify-center disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'Create Category'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Edit Category Modal */}
        {isEditingCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-[#1A1A1A] rounded-[32px] p-8 w-full max-w-md shadow-2xl relative">
              <button 
                type="button"
                onClick={() => closeModal()}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 transition-colors"
              >
                <X size={16} />
              </button>
              <h3 className="text-[20px] font-bold mb-4">Edit Category</h3>
              <form onSubmit={handleUpdateCategory} className="flex flex-col gap-4">
                <input 
                  autoFocus
                  type="text" 
                  value={editCategoryName}
                  onChange={(e) => setEditCategoryName(e.target.value)}
                  placeholder="Category Name"
                  className="w-full h-14 bg-[#F8F6F0] dark:bg-[#111111] rounded-2xl px-4 font-bold text-[15px] border-none outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-[#111111] dark:text-[#EBEBEB]"
                />
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-[#666] dark:text-[#999] text-[15px]">₹</span>
                  <input 
                    type="number" 
                    min="0"
                    value={editCategoryPrice}
                    onChange={(e) => setEditCategoryPrice(e.target.value)}
                    placeholder="Default Price (Optional)"
                    className="w-full h-14 bg-[#F8F6F0] dark:bg-[#111111] rounded-2xl pl-9 pr-4 font-bold text-[15px] border-none outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-[#111111] dark:text-[#EBEBEB]"
                  />
                </div>
                <ProductSpecEditor
                  sizes={editCategorySizes}
                  onSizesChange={setEditCategorySizes}
                  bottomWidth={editCategoryBottomWidth}
                  onBottomWidthChange={setEditCategoryBottomWidth}
                  sizeBottomWidths={editCategorySizeBottomWidths}
                  onSizeBottomWidthsChange={setEditCategorySizeBottomWidths}
                  isCategoryLevel={true}
                />
                <button 
                  type="submit" 
                  disabled={isLoading || !editCategoryName.trim()}
                  className="w-full h-14 rounded-2xl bg-[#111111] dark:bg-[#F8F6F0] text-white dark:text-[#111111] font-bold text-[15px] flex items-center justify-center disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'Save Changes'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Selected Image Modal */}
        {selectedImage && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md p-6">
            <button 
              type="button"
              onClick={() => closeModal()}
              className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X size={24} />
            </button>
            <div className="w-full max-w-4xl max-h-[60vh] flex-1 mb-4 flex items-center justify-center">
              <img src={selectedImage.url} alt="Selected Product" className="w-full h-full object-contain drop-shadow-2xl" />
            </div>

            {/* Price & Size Edit Actions */}
            <div className="w-full max-w-md bg-white dark:bg-[#1A1A1A] p-5 rounded-3xl shadow-2xl flex flex-col gap-4 border border-black/10 dark:border-white/10 max-h-[85vh] overflow-y-auto">
              <div className="flex flex-col gap-3">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-[#666] dark:text-[#999] text-[15px]">₹</span>
                  <input 
                    type="number"
                    min="0"
                    value={imagePriceInput}
                    onChange={(e) => setImagePriceInput(e.target.value)}
                    placeholder={
                      selectedImage.categoryPrice || (activeCategory?.price && activeCategory._id !== 'all')
                        ? `Price (Default: ₹${selectedImage.categoryPrice || activeCategory?.price})`
                        : "Enter Price (₹)"
                    }
                    className="w-full h-12 bg-[#F8F6F0] dark:bg-[#111111] rounded-2xl pl-9 pr-4 font-bold text-[15px] border-none outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-[#111111] dark:text-[#EBEBEB]"
                  />
                </div>

                <ProductSpecEditor
                  sizes={imageSizes}
                  onSizesChange={setImageSizes}
                  bottomWidth={imageBottomWidth}
                  onBottomWidthChange={setImageBottomWidth}
                  sizeBottomWidths={imageSizeBottomWidths}
                  onSizeBottomWidthsChange={setImageSizeBottomWidths}
                  defaultCategorySizes={normalizeSizes(selectedImage.categorySizes || activeCategory?.sizes)}
                  defaultCategoryBottomWidth={selectedImage.categoryBottomWidth || activeCategory?.bottomWidth}
                  defaultCategorySizeBottomWidths={arrayToMap(selectedImage.categorySizeBottomWidths || activeCategory?.sizeBottomWidths)}
                />

                <button
                  type="button"
                  onClick={handleSaveImageDetails}
                  disabled={isSavingPrice}
                  className="h-12 w-full rounded-2xl bg-[#111111] dark:bg-[#F8F6F0] text-white dark:text-[#111111] font-bold text-[14px] flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isSavingPrice ? <Loader2 size={16} className="animate-spin" /> : 'Save Item Changes'}
                </button>
              </div>

              <button 
                type="button"
                onClick={() => {
                  handleDeleteImage(selectedImage._key, selectedImage.categoryId);
                  setSelectedImage(null);
                  closeModal();
                }}
                className="h-11 w-full rounded-2xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 font-bold text-[13px] flex items-center justify-center gap-2 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
              >
                <Trash2 size={16} />
                Delete this Image
              </button>
            </div>
          </div>
        )}



        {/* Delete Category Modal */}
        {isDeleteCategoryOpen && activeCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-[#1A1A1A] rounded-[32px] p-8 w-full max-w-sm shadow-2xl relative text-center">
              <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 size={24} />
              </div>
              <h3 className="text-[20px] font-bold mb-2">Delete {activeCategory.title}?</h3>
              <p className="text-[14px] text-[#666] dark:text-[#999] mb-8">This action cannot be undone. All associated images will also be removed.</p>
              <div className="flex gap-4">
                <button 
                  onClick={() => closeModal()}
                  className="flex-1 h-12 rounded-2xl bg-[#F8F6F0] dark:bg-[#222] font-bold text-[15px] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteCategory}
                  disabled={isLoading}
                  className="flex-1 h-12 rounded-2xl bg-red-600 text-white font-bold text-[15px] hover:bg-red-700 transition-colors flex items-center justify-center disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Clear Images Modal */}
        {isClearImagesOpen && activeCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-[#1A1A1A] rounded-[32px] p-8 w-full max-w-sm shadow-2xl relative text-center">
              <div className="w-16 h-16 bg-orange-50 dark:bg-orange-500/10 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 size={24} />
              </div>
              <h3 className="text-[20px] font-bold mb-2">Clear Category Bin?</h3>
              <p className="text-[14px] text-[#666] dark:text-[#999] mb-8">Are you sure you want to remove ALL images from {activeCategory.title}?</p>
              <div className="flex gap-4">
                <button 
                  onClick={() => closeModal()}
                  className="flex-1 h-12 rounded-2xl bg-[#F8F6F0] dark:bg-[#222] font-bold text-[15px] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleClearImages}
                  disabled={isLoading}
                  className="flex-1 h-12 rounded-2xl bg-orange-600 text-white font-bold text-[15px] hover:bg-orange-700 transition-colors flex items-center justify-center disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'Clear All'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Generic Error Modal */}
        {errorAlert && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-[#1A1A1A] rounded-[32px] p-8 w-full max-w-sm shadow-2xl relative text-center">
              <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle size={24} />
              </div>
              <h3 className="text-[20px] font-bold mb-2">Error</h3>
              <p className="text-[14px] text-[#666] dark:text-[#999] mb-8">{errorAlert}</p>
              <button 
                onClick={() => closeModal()}
                className="w-full h-12 rounded-2xl bg-[#111111] dark:bg-[#F8F6F0] text-white dark:text-[#111111] font-bold text-[15px] hover:opacity-90 transition-opacity"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}

