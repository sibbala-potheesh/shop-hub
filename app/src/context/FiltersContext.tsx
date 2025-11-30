// src/context/FiltersContext.tsx
import React, { createContext, useContext, useMemo, useState } from "react";
import { Product } from "../types";

export type Filters = {
  search: string;
  category: string | null;
  priceMin: number | null;
  priceMax: number | null;
  ratingMin: number | null;
  inStockOnly: boolean;
  selectedColors: string[];
  sortBy: "featured" | "price-asc" | "price-desc" | "rating-desc" | "newest";
};

type ContextValue = {
  products: Product[];
  setProducts: (p: Product[]) => void;
  filters: Filters;
  setFilters: (updater: (prev: Filters) => Filters) => void;
  clearFilters: () => void;
};

const defaultFilters: Filters = {
  search: "",
  category: null,
  priceMin: null,
  priceMax: null,
  ratingMin: null,
  inStockOnly: false,
  selectedColors: [],
  sortBy: "featured",
};

const FiltersContext = createContext<ContextValue | undefined>(undefined);

export const FiltersProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filters, setFilters] = useState<Filters>(defaultFilters);

  const clearFilters = () => setFilters(defaultFilters);

  const value = useMemo(
    () => ({ products, setProducts, filters, setFilters, clearFilters }),
    [products, filters]
  );

  return (
    <FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>
  );
};

export const useFilters = (): ContextValue => {
  const ctx = useContext(FiltersContext);
  if (!ctx) {
    throw new Error("useFilters must be used inside FiltersProvider");
  }
  return ctx;
};
