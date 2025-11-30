import { Product } from "../types";

export const products: Product[] = [
  {
    id: "1",
    title: "Premium Wireless Headphones",
    description:
      "High-quality wireless headphones with active noise cancellation and 30-hour battery life.",
    price: 299.99,
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80",
      "https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=800&q=80",
    ],
    category: "Electronics",
    stock: 15,
    variants: [
      {
        type: "color",
        name: "Color",
        options: ["Black", "Silver", "Blue"],
      },
    ],
    rating: 4.8,
    reviews: 245,
  },
  {
    id: "2",
    title: "Smart Watch Pro",
    description:
      "Advanced fitness tracking, heart rate monitor, GPS, and 5-day battery life.",
    price: 399.99,
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80",
    ],
    category: "Electronics",
    stock: 8,
    variants: [
      {
        type: "color",
        name: "Color",
        options: ["Black", "Rose Gold", "Space Gray"],
      },
      {
        type: "size",
        name: "Size",
        options: ["40mm", "44mm"],
      },
    ],
    rating: 4.6,
    reviews: 189,
  },
  {
    id: "3",
    title: "Minimalist Leather Backpack",
    description:
      "Handcrafted genuine leather backpack with laptop compartment. Perfect for daily commute.",
    price: 149.99,
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
      "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800&q=80",
    ],
    category: "Accessories",
    stock: 22,
    variants: [
      {
        type: "color",
        name: "Color",
        options: ["Brown", "Black", "Tan"],
      },
    ],
    rating: 4.9,
    reviews: 312,
  },
  {
    id: "4",
    title: "Classic Sunglasses",
    description: "UV400 protection polarized lenses with durable metal frame.",
    price: 89.99,
    images: [
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80",
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80",
    ],
    category: "Accessories",
    stock: 45,
    variants: [
      {
        type: "color",
        name: "Frame Color",
        options: ["Gold", "Silver", "Black"],
      },
    ],
    rating: 4.5,
    reviews: 156,
  },
  {
    id: "5",
    title: "Mechanical Keyboard RGB",
    description:
      "Cherry MX switches, RGB backlighting, and programmable keys for gaming and productivity.",
    price: 179.99,
    images: [
      "https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80",
      "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&q=80",
    ],
    category: "Electronics",
    stock: 3,
    variants: [
      {
        type: "color",
        name: "Switch Type",
        options: ["Red", "Blue", "Brown"],
      },
    ],
    rating: 4.7,
    reviews: 423,
  },
  {
    id: "6",
    title: "Yoga Mat Premium",
    description:
      "Extra thick eco-friendly TPE material with alignment markers. Non-slip surface.",
    price: 49.99,
    images: [
      "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&q=80",
      "https://images.unsplash.com/photo-1603988363607-e1e4a66962c6?w=800&q=80",
    ],
    category: "Fitness",
    stock: 67,
    variants: [
      {
        type: "color",
        name: "Color",
        options: ["Purple", "Blue", "Pink", "Black"],
      },
    ],
    rating: 4.8,
    reviews: 891,
  },
  {
    id: "7",
    title: "Stainless Steel Water Bottle",
    description:
      "Insulated 32oz bottle keeps drinks cold for 24hrs, hot for 12hrs. BPA-free.",
    price: 34.99,
    images: [
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80",
      "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=800&q=80",
    ],
    category: "Accessories",
    stock: 120,
    variants: [
      {
        type: "color",
        name: "Color",
        options: ["Silver", "Matte Black", "Rose Gold", "Navy"],
      },
    ],
    rating: 4.6,
    reviews: 567,
  },
  {
    id: "8",
    title: "Portable Bluetooth Speaker",
    description:
      "360° sound, waterproof IPX7, 20-hour battery. Perfect for outdoor adventures.",
    price: 129.99,
    images: [
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80",
      "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&q=80",
    ],
    category: "Electronics",
    stock: 34,
    variants: [
      {
        type: "color",
        name: "Color",
        options: ["Black", "Blue", "Red"],
      },
    ],
    rating: 4.7,
    reviews: 234,
  },
];
