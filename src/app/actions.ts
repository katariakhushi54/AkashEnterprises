'use server'

import { client } from '@/sanity/lib/client'
import { normalizeSizes } from '@/lib/sizes'

interface SanityCategory {
  _id: string;
  title: string;
  images?: string[];
}

export async function getStorefrontData() {
  const query = `*[_type == "category"] | order(_createdAt asc) { 
    _id, 
    title, 
    price,
    sizes,
    bottomWidth,
    length,
    sizeBottomWidths[] { size, bottomWidth, length },
    products[] {
      _key,
      price,
      sizes,
      bottomWidth,
      length,
      sizeBottomWidths[] { size, bottomWidth, length },
      "url": asset->url
    }
  }`
  
  const categories = await client.fetch(query)
  
  // Flatten into a products array for the frontend
  const products: {
    id: string;
    name: string;
    price: number;
    category: string;
    imageUrl: string;
    sizes: string[];
    bottomWidth?: string;
    sizeBottomWidths?: Record<string, string>;
    length?: string;
    sizeLengths?: Record<string, string>;
    description: string;
  }[] = []
  
  categories.forEach((cat: { 
    _id: string; 
    title: string; 
    price?: number; 
    sizes?: string[]; 
    bottomWidth?: string; 
    length?: string;
    sizeBottomWidths?: { size: string; bottomWidth?: string; length?: string }[];
    products?: { 
      _key: string; 
      price?: number; 
      sizes?: string[]; 
      bottomWidth?: string; 
      length?: string;
      sizeBottomWidths?: { size: string; bottomWidth?: string; length?: string }[];
      url?: string 
    }[] 
  }) => {
    if (cat.products) {
      cat.products.forEach((prod, index: number) => {
        if (!prod.url) return;
        const itemPrice = (prod.price !== undefined && prod.price !== null && prod.price > 0)
          ? prod.price
          : (cat.price || 0);

        const rawSizes = (prod.sizes && prod.sizes.length > 0)
          ? prod.sizes
          : (cat.sizes && cat.sizes.length > 0 ? cat.sizes : []);

        const itemSizes = normalizeSizes(rawSizes);

        // Map size-specific bottom widths and lengths
        const rawSizeSpecs = (prod.sizeBottomWidths && prod.sizeBottomWidths.length > 0)
          ? prod.sizeBottomWidths
          : (cat.sizeBottomWidths && cat.sizeBottomWidths.length > 0 ? cat.sizeBottomWidths : undefined);

        const sizeBottomWidthsMap: Record<string, string> = {};
        const sizeLengthsMap: Record<string, string> = {};
        if (rawSizeSpecs) {
          rawSizeSpecs.forEach((item) => {
            if (item.size && item.bottomWidth && item.bottomWidth.trim()) {
              sizeBottomWidthsMap[item.size.trim()] = item.bottomWidth.trim();
            }
            if (item.size && item.length && item.length.trim()) {
              sizeLengthsMap[item.size.trim()] = item.length.trim();
            }
          });
        }

        let itemBottomWidth = (prod.bottomWidth && prod.bottomWidth.trim())
          ? prod.bottomWidth.trim()
          : (cat.bottomWidth && cat.bottomWidth.trim() ? cat.bottomWidth.trim() : undefined);

        // If bottomWidth wasn't explicitly set, synthesize from size mapping if available
        if (!itemBottomWidth && Object.keys(sizeBottomWidthsMap).length > 0) {
          const widths = Array.from(new Set(Object.values(sizeBottomWidthsMap)));
          if (widths.length === 1) {
            itemBottomWidth = widths[0];
          } else if (widths.length > 1) {
            itemBottomWidth = `${widths[0]} - ${widths[widths.length - 1]}`;
          }
        }

        let itemLength = (prod.length && prod.length.trim())
          ? prod.length.trim()
          : (cat.length && cat.length.trim() ? cat.length.trim() : undefined);

        // If length wasn't explicitly set, synthesize from size mapping if available
        if (!itemLength && Object.keys(sizeLengthsMap).length > 0) {
          const lengths = Array.from(new Set(Object.values(sizeLengthsMap)));
          if (lengths.length === 1) {
            itemLength = lengths[0];
          } else if (lengths.length > 1) {
            itemLength = `${lengths[0]} - ${lengths[lengths.length - 1]}`;
          }
        }

        products.push({
          id: `${cat._id}-${index}`,
          name: `${cat.title} Item`,
          price: itemPrice,
          category: cat.title,
          imageUrl: prod.url,
          sizes: itemSizes,
          bottomWidth: itemBottomWidth,
          sizeBottomWidths: Object.keys(sizeBottomWidthsMap).length > 0 ? sizeBottomWidthsMap : undefined,
          length: itemLength,
          sizeLengths: Object.keys(sizeLengthsMap).length > 0 ? sizeLengthsMap : undefined,
          description: `A premium ${cat.title.toLowerCase()}`
        })
      })
    }
  })
  
  return {
    categories: ["All", ...categories.map((c: SanityCategory) => c.title)],
    products
  }
}
