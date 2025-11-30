// src/pages/Home.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { useFilters } from "../context/FiltersContext";
import { ProductCard } from "../components/ProductCard";
import { fetchProducts } from "../store/slices/productsSlice";
import type { Product } from "../types";

// Icons
import {
  DevicePhoneMobileIcon,
  HomeModernIcon,
  ShoppingBagIcon,
  TvIcon,
  ComputerDesktopIcon,
  WalletIcon,
} from "@heroicons/react/24/solid";

const banners = [
  "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=1600&q=80",
  "https://images.unsplash.com/photo-1513708922415-9d8f8d3b1a2c?w=1600&q=80",
  "https://static.nike.com/a/images/t_web_pdp_936_v2/f_auto/70195dd3-d464-4a2b-9d61-fabe0cfdd1df/NIKE+STRUCTURE+26.png",
  "https://m.media-amazon.com/images/S/aplus-media-library-service-media/32cc0bad-3da3-48a9-aacb-c4f8fecba307.__CR0,216,4500,2784_PT0_SX970_V1___.jpeg",
  "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=1600&q=80",
];

// category metadata for icons & descriptions
const categoryMeta: Record<string, { icon: JSX.Element; description: string }> =
  {
    Electronics: {
      icon: <DevicePhoneMobileIcon className="w-6 h-6 text-indigo-600" />,
      description: "Mobiles, laptops & gadgets",
    },
    "Home Decor": {
      icon: <HomeModernIcon className="w-6 h-6 text-indigo-600" />,
      description: "Make your space beautiful",
    },
    Watches: {
      icon: <WalletIcon className="w-6 h-6 text-indigo-600" />,
      description: "Premium timepieces",
    },
    Bags: {
      icon: <ShoppingBagIcon className="w-6 h-6 text-indigo-600" />,
      description: "Style meets function",
    },
    Shoes: {
      icon: <TvIcon className="w-6 h-6 text-indigo-600" />,
      description: "Trendy & comfortable",
    },
    Computers: {
      icon: <ComputerDesktopIcon className="w-6 h-6 text-indigo-600" />,
      description: "Work & gaming machines",
    },
    Accessories: {
      icon: <ShoppingBagIcon className="w-6 h-6 text-indigo-600" />,
      description: "Jewelry, sunglasses & more",
    },
    Fitness: {
      icon: <TvIcon className="w-6 h-6 text-indigo-600" />,
      description: "Gear for your active lifestyle",
    },

    beauty: {
      icon: <WalletIcon className="w-6 h-6 text-pink-500" />,
      description: "Skincare, makeup & more",
    },
    fragrances: {
      icon: <TvIcon className="w-6 h-6 text-yellow-500" />,
      description: "Perfumes & scents",
    },
    furniture: {
      icon: <HomeModernIcon className="w-6 h-6 text-green-600" />,
      description: "Comfort & style for your home",
    },
  };

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((s) => s.products);
  const { setProducts, setFilters } = useFilters();
  const [slide, setSlide] = useState(0);

  // Ensure products are fetched if store is empty
  useEffect(() => {
    if (!items || items.length === 0) {
      dispatch(fetchProducts());
    }
  }, [dispatch, items]);

  // Sync products into filter context
  useEffect(() => {
    if (items?.length) setProducts(items);
  }, [items, setProducts]);

  // Banner rotation
  useEffect(() => {
    const t = setInterval(
      () => setSlide((s) => (s + 1) % banners.length),
      4500
    );
    return () => clearInterval(t);
  }, []);

  const categories = Array.from(
    new Set((items || []).map((p) => p.category))
  ).slice(0, 6);

  const offerItems = (items || []).slice(0, 6);

  const onClickCategory = (category: string) => {
    setFilters((p) => ({ ...p, category }));
    navigate(
      `/products?category=${encodeURIComponent(category)}&openSidebar=1`
    );
  };

  if (loading && (!items || items.length === 0)) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="text-lg font-medium mb-6">Loading products…</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 animate-pulse h-48"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Hero */}
      <div className="relative w-full h-64 sm:h-80 md:h-[380px] rounded-xl overflow-hidden mb-8">
        <img
          src={banners[slide]}
          className="w-full h-full object-cover transition-transform duration-700"
          alt={`banner-${slide}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute left-8 bottom-8 text-white">
          <h2 className="text-3xl md:text-4xl font-bold">Welcome to ShopHub</h2>
          <p className="mt-2 max-w-xl">
            Discover curated products and exclusive deals — handpicked for you.
          </p>
        </div>
      </div>

      {/* Category Cards */}
      <section className="mb-10">
        <h3 className="text-xl font-semibold mb-4">Shop by Category</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onClickCategory(cat)}
              className="group p-4 rounded-lg bg-white dark:bg-gray-800 shadow hover:shadow-lg transition flex flex-col justify-between gap-2"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/20 rounded-lg group-hover:scale-105 transition">
                  {categoryMeta[cat]?.icon || (
                    <span className="text-indigo-600 font-bold">{cat[0]}</span>
                  )}
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                    {cat}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {categoryMeta[cat]?.description || "Explore"}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Deals */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Hot Deals — Up to 50% OFF</h3>
          <button
            onClick={() => navigate("/products?openSidebar=1")}
            className="text-sm text-indigo-600"
          >
            View all deals
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {offerItems.map((p) => (
            <div key={p.id || p._id} className="relative">
              <div className="absolute right-3 top-3 px-2 py-1 bg-red-600 text-white text-xs rounded">
                50% OFF
              </div>
              <ProductCard product={{ ...p, price: p.price / 2 }} />
            </div>
          ))}
        </div>
      </section>

      {/* Trending */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Trending Products</h3>
          <button
            onClick={() => navigate("/products?sort=trending")}
            className="text-sm text-indigo-600"
          >
            View all
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {(items || []).slice(6, 10).map((p) => (
            <ProductCard key={p.id || p._id} product={p} />
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">New Arrivals</h3>
          <button
            onClick={() => navigate("/products?sort=new")}
            className="text-sm text-indigo-600"
          >
            Explore fresh picks
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {(items || []).slice(10, 15).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-xl p-10 mb-16 text-center">
        <h3 className="text-2xl font-semibold mb-3">
          Get updates on new offers 🎉
        </h3>
        <p className="mb-6 text-white/80 text-sm">
          Be the first to know about flash sales & limited offers.
        </p>
        <div className="flex justify-center gap-2">
          <input
            placeholder="Enter your email"
            className="rounded-md p-2 text-black w-60"
          />
          <button className="bg-white text-indigo-600 px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition">
            Subscribe
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;
