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
    products[] {
      _key,
      price,
      sizes,
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
    description: string;
  }[] = []
  
  categories.forEach((cat: { _id: string; title: string; price?: number; sizes?: string[]; products?: { _key: string; price?: number; sizes?: string[]; url?: string }[] }) => {
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

        products.push({
          id: `${cat._id}-${index}`,
          name: `${cat.title} Item`,
          price: itemPrice,
          category: cat.title,
          imageUrl: prod.url,
          sizes: itemSizes,
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
