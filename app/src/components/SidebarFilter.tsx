// src/components/SidebarFilter.tsx
import React, { useMemo } from "react";
import { Filters, useFilters } from "../context/FiltersContext";

const SidebarFilter: React.FC<{ onClose?: () => void; isOpen?: boolean }> = ({
  onClose,
  isOpen = true,
}) => {
  const { products, filters, setFilters, clearFilters } = useFilters();

  // derive categories and color options
  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category))).sort(),
    [products]
  );

  const colorOptions = useMemo(() => {
    const colors = new Set<string>();
    products.forEach((p) =>
      p.variants
        ?.filter((v) => v.type.toLowerCase() === "color")
        .forEach((v) => v.options.forEach((o) => colors.add(o)))
    );
    return Array.from(colors).sort();
  }, [products]);

  const maxPrice = useMemo(
    () => Math.ceil(products.reduce((mx, p) => Math.max(mx, p.price), 0)),
    [products]
  );

  return (
    <aside
      className={`bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-5 shadow-sm w-full max-w-xs
        ${isOpen ? "block" : "hidden"} md:block`}
      aria-hidden={!isOpen}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          Filters
        </h3>

        <div className="flex items-center gap-2">
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden text-sm px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
            >
              Close
            </button>
          )}
          <button
            onClick={() => clearFilters()}
            className="text-sm px-3 py-1 rounded-md bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-300 mb-2">
          Search
        </label>
        <input
          value={filters.search}
          onChange={(e) =>
            setFilters((p) => ({ ...p, search: e.target.value }))
          }
          placeholder="Search products..."
          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-600"
        />
      </div>

      {/* Category */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-300 mb-2">
          Category
        </label>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => setFilters((p) => ({ ...p, category: null }))}
            className={`text-left px-3 py-2 rounded-lg text-sm ${
              filters.category === null
                ? "bg-indigo-50 dark:bg-indigo-900/25 text-indigo-700 dark:text-indigo-200"
                : "bg-transparent text-gray-600 dark:text-gray-300"
            }`}
          >
            All
          </button>

          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilters((p) => ({ ...p, category: cat }))}
              className={`text-left px-3 py-2 rounded-lg text-sm ${
                filters.category === cat
                  ? "bg-indigo-50 dark:bg-indigo-900/25 text-indigo-700 dark:text-indigo-200"
                  : "bg-transparent text-gray-600 dark:text-gray-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Price */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-300 mb-2">
          Price
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            placeholder="Min"
            value={filters.priceMin ?? ""}
            onChange={(e) =>
              setFilters((p) => ({
                ...p,
                priceMin: e.target.value === "" ? null : Number(e.target.value),
              }))
            }
            className="w-1/2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
          />
          <input
            type="number"
            min={0}
            placeholder={`Max (${maxPrice})`}
            value={filters.priceMax ?? ""}
            onChange={(e) =>
              setFilters((p) => ({
                ...p,
                priceMax: e.target.value === "" ? null : Number(e.target.value),
              }))
            }
            className="w-1/2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
          />
        </div>
        <p className="mt-2 text-xs text-gray-400 dark:text-gray-400">
          Leave blank to disable price bounds
        </p>
      </div>

      {/* Rating */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-300 mb-2">
          Minimum rating
        </label>
        <select
          value={filters.ratingMin ?? ""}
          onChange={(e) =>
            setFilters((p) => ({
              ...p,
              ratingMin: e.target.value === "" ? null : Number(e.target.value),
            }))
          }
          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
        >
          <option value="">Any</option>
          <option value={4.5}>4.5+</option>
          <option value={4.0}>4.0+</option>
          <option value={3.5}>3.5+</option>
          <option value={3.0}>3.0+</option>
        </select>
      </div>

      {/* Colors */}
      {colorOptions.length > 0 && (
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-300 mb-2">
            Colors
          </label>
          <div className="flex flex-wrap gap-2">
            {colorOptions.map((col) => {
              const active = filters.selectedColors.includes(col);
              return (
                <button
                  key={col}
                  onClick={() =>
                    setFilters((p) => {
                      const already = p.selectedColors.includes(col);
                      return {
                        ...p,
                        selectedColors: already
                          ? p.selectedColors.filter((c) => c !== col)
                          : [...p.selectedColors, col],
                      };
                    })
                  }
                  className={`px-3 py-1 rounded-full text-sm border transition shadow-sm whitespace-nowrap ${
                    active
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-transparent text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700"
                  }`}
                >
                  {col}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* In-stock */}
      <div className="mb-4">
        <label className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(e) =>
              setFilters((p) => ({ ...p, inStockOnly: e.target.checked }))
            }
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span>Only show in-stock</span>
        </label>
      </div>

      {/* Sort */}
      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-300 mb-2">
          Sort
        </label>
        <select
          value={filters.sortBy}
          onChange={(e) =>
            setFilters((p) => ({
              ...p,
              sortBy: e.target.value as Filters["sortBy"],
            }))
          }
          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
        >
          <option value="featured">Featured</option>
          <option value="price-asc">Price: Low → High</option>
          <option value="price-desc">Price: High → Low</option>
          <option value="rating-desc">Top rated</option>
          <option value="newest">Newest</option>
        </select>
      </div>

      <div className="mt-4">
        <button
          onClick={() => onClose?.()}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm shadow hover:brightness-95"
        >
          Apply filters
        </button>
      </div>
    </aside>
  );
};

export default SidebarFilter;
