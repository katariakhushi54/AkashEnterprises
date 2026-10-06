export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  imageUrl: string;
  colors?: string[];
  originalPrice?: number;
}

export const products: Product[] = [
  {
    id: "1",
    name: "Classic Oversized Tee",
    price: 1299,
    category: "T-Shirts",
    imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
    colors: ["#111111", "#888888", "#CCCCCC"],
  },
  {
    id: "2",
    name: "Essential Hoodie",
    price: 1999,
    category: "Hoodies",
    imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80",
    colors: ["#111111", "#DCDCDC"],
  },
  {
    id: "3",
    name: "Oxford Button-Down",
    price: 1799,
    category: "Shirts",
    imageUrl: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "4",
    name: "Relaxed Fit Tee",
    price: 1299,
    category: "T-Shirts",
    imageUrl: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "5",
    name: "Straight Leg Denim",
    price: 2199,
    category: "Pants",
    imageUrl: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "6",
    name: "Classic Leather Jacket",
    price: 3499,
    category: "Jackets",
    imageUrl: "https://images.unsplash.com/photo-1559551409-dadc959f76b8?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "7",
    name: "Knit Wool Sweater",
    price: 2899,
    category: "Sweaters",
    imageUrl: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "8",
    name: "Graphic Tee Bundle",
    price: 3699,
    category: "T-Shirts",
    imageUrl: "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?auto=format&fit=crop&w=800&q=80", 
  },
  {
    id: "9",
    name: "Zip-Up Fleece",
    price: 1599,
    category: "Hoodies",
    imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "10",
    name: "Minimalist Crewneck",
    price: 1899,
    category: "Shirts",
    imageUrl: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80",
  }
];
