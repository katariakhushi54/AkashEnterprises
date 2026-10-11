'use server'

import { client } from '@/sanity/lib/client'

interface SanityCategory {
  _id: string;
  title: string;
  images?: string[];
}

export async function getStorefrontData() {
  const query = `*[_type == "category"] | order(_createdAt asc) { 
    _id, 
    title, 
    "images": products[].asset->url 
  }`
  
  const categories: SanityCategory[] = await client.fetch(query)
  
  // Flatten into a products array for the frontend
  const products: {
    id: string;
    name: string;
    price: number;
    category: string;
    imageUrl: string;
    description: string;
  }[] = []
  
  categories.forEach((cat: SanityCategory) => {
    if (cat.images) {
      cat.images.forEach((url: string, index: number) => {
        products.push({
          id: `${cat._id}-${index}`,
          name: `${cat.title} Item`, // dummy name
          price: 0, // dummy price or fetch from Sanity if added
          category: cat.title,
          imageUrl: url,
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
