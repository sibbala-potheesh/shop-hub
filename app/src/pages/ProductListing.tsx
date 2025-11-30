// src/pages/ProductListing.tsx
import React, { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchProducts } from "../store/slices/productsSlice";
import { ProductCard } from "../components/ProductCard";
import { ProductCardSkeleton } from "../components/Skeleton";
import { useFilters } from "../context/FiltersContext";
import { useLocation } from "react-router-dom";

export const ProductListing: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((state) => state.products);
  const { filters, setFilters, setProducts } = useFilters();
  const location = useLocation();

  // fetch products
  useEffect(() => {
    if (items.length === 0) dispatch(fetchProducts());
  }, [dispatch, items.length]);

  // sync items into filters context
  useEffect(() => {
    setProducts(items);
  }, [items, setProducts]);

  // read URL query params and apply filters (category)
  useEffect(() => {
    const qs = new URLSearchParams(location.search);
    const cat = qs.get("category");
    if (cat) {
      setFilters((p) => ({ ...p, category: cat }));
    }
    // other query params could be used too (e.g. search)
  }, [location.search, setFilters]);

  const filtered = useMemo(() => {
    let list = [...items];

    if (filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    if (filters.category)
      list = list.filter((p) => p.category === filters.category);
    if (filters.priceMin !== null)
      list = list.filter((p) => p.price >= filters.priceMin!);
    if (filters.priceMax !== null)
      list = list.filter((p) => p.price <= filters.priceMax!);
    if (filters.ratingMin !== null)
      list = list.filter(
        (p) => typeof p.rating === "number" && p.rating >= filters.ratingMin!
      );
    if (filters.inStockOnly) list = list.filter((p) => p.stock > 0);

    if (filters.selectedColors.length > 0) {
      list = list.filter((p) =>
        p.variants?.some(
          (v) =>
            v.type === "color" &&
            v.options.some((o) => filters.selectedColors.includes(o))
        )
      );
    }

    switch (filters.sortBy) {
      case "price-asc":
        return list.sort((a, b) => a.price - b.price);
      case "price-desc":
        return list.sort((a, b) => b.price - a.price);
      case "rating-desc":
        return list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      case "newest":
        return list.sort((a, b) => Number(b.id) - Number(a.id));
      default:
        return list;
    }
  }, [items, filters]);

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">All Products</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Discover our curated collection
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">
                No products found
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductListing;
