// src/App.tsx
import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import { useAppDispatch, useAppSelector } from "./store/hooks";
import { setDarkMode } from "./store/slices/uiSlice";
import { initializeAuth } from "./store/slices/authSlice";
import { loadOrders } from "./store/slices/ordersSlice";
import { loadAddresses } from "./store/slices/addressSlice";

import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { CartDrawer } from "./components/CartDrawer";
import { ProtectedRoute } from "./components/ProtectedRoute";

import Home from "./pages/Home";
import ProductListing from "./pages/ProductListing";

import SidebarFilter from "./components/SidebarFilter";
import { FiltersProvider, useFilters } from "./context/FiltersContext";
import { Checkout } from "./pages/Checkout";
import { ProductDetail } from "./pages/ProductDetail";
import { Login } from "./pages/Login";
import { Success } from "./pages/Success";
import { MyOrders } from "./pages/MyOrders";
import { Profile } from "./pages/Profile";
import { AddressManagement } from "./pages/AddressManagement";

//
// ─── LAYOUT ───────────────────────────────────────────────────────────────
//
const AppLayoutInner: React.FC = () => {
  const { items } = useAppSelector((s) => s.products);
  const { setProducts } = useFilters();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Sync Redux products into FiltersContext
  useEffect(() => {
    setProducts(items);
  }, [items, setProducts]);

  // Show sidebar only on product-related pages
  const showSidebar =
    location.pathname.startsWith("/products") ||
    location.pathname.startsWith("/product");

  // If URL contains ?openSidebar=1 → open mobile sidebar
  useEffect(() => {
    const qs = new URLSearchParams(location.search);
    if (qs.get("openSidebar") === "1") {
      setMobileOpen(true);
    }
  }, [location.search]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* HEADER */}
      <Header />

      {/* MAIN LAYOUT */}
      <main className="flex-1">
        <div className="w-[90vw] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-6">
            {/* ─── SIDEBAR (DESKTOP) ─────────────────────────────── */}
            {showSidebar && (
              <div className="hidden md:block w-72 flex-shrink-0">
                <SidebarFilter />
              </div>
            )}

            {/* ─── PAGE CONTENT ───────────────────────────────────── */}
            <div className="flex-1">
              {/* Mobile Filter Toggle */}
              {showSidebar && (
                <div className="md:hidden mb-4">
                  <button
                    onClick={() => setMobileOpen(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow text-sm"
                  >
                    Filters
                  </button>
                </div>
              )}

              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<ProductListing />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/login" element={<Login />} />

                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <Checkout />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/success"
                  element={
                    <ProtectedRoute>
                      <Success />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/my-orders"
                  element={
                    <ProtectedRoute>
                      <MyOrders />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/addresses"
                  element={
                    <ProtectedRoute>
                      <AddressManagement />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <Footer />

      {/* CART DRAWER */}
      <CartDrawer />

      {/* ─── MOBILE SLIDE-OVER SIDEBAR ───────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-80 p-4 bg-white dark:bg-gray-800 shadow-xl">
            <SidebarFilter isOpen={true} onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

//
// ─── ROOT APP ─────────────────────────────────────────────────────────────
//
const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const darkMode = useAppSelector((state) => state.ui.darkMode);

  // Handle dark mode
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // Init app: dark mode, auth, orders, addresses
  useEffect(() => {
    const stored = localStorage.getItem("darkMode");
    if (stored !== null) dispatch(setDarkMode(JSON.parse(stored)));

    dispatch(initializeAuth());

    const token = localStorage.getItem("token");
    if (token) {
      dispatch(loadOrders());
      dispatch(loadAddresses());
    }
  }, [dispatch]);

  return (
    <FiltersProvider>
      <Router>
        <AppLayoutInner />
      </Router>
    </FiltersProvider>
  );
};

export default App;
