import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  fetchProductById,
  clearSelectedProduct,
} from "../store/slices/productsSlice";
import { addToCart } from "../store/slices/cartSlice";
import { formatPrice } from "../utils";
import { Button } from "../components/Button";
import { ProductDetailSkeleton } from "../components/Skeleton";

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { selectedProduct, selectedProductLoading } = useAppSelector(
    (state) => state.products
  );

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(id));
    }
    return () => {
      dispatch(clearSelectedProduct());
    };
  }, [id, dispatch]);

  useEffect(() => {
    if (selectedProduct?.variants) {
      const initialVariants: Record<string, string> = {};
      selectedProduct.variants.forEach((variant) => {
        initialVariants[variant.name] = variant.options[0];
      });
      setSelectedVariants(initialVariants);
    }
  }, [selectedProduct]);

  const handleAddToCart = () => {
    if (selectedProduct) {
      dispatch(
        addToCart({
          product: selectedProduct,
          quantity,
          selectedVariants:
            Object.keys(selectedVariants).length > 0
              ? selectedVariants
              : undefined,
        })
      );
    }
  };

  if (selectedProductLoading) {
    return <ProductDetailSkeleton />;
  }

  if (!selectedProduct) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Product not found</h2>
        <Button onClick={() => navigate("/")}>Back to Products</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-6 focus-ring rounded px-2 py-1"
      >
        <svg
          className="w-5 h-5 mr-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
            <img
              src={selectedProduct.images[selectedImage]}
              alt={selectedProduct.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {selectedProduct.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`aspect-square rounded overflow-hidden border-2 transition-all focus-ring ${
                  selectedImage === index
                    ? "border-primary-600 dark:border-primary-400"
                    : "border-transparent hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                <img
                  src={image}
                  alt={`${selectedProduct.title} ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{selectedProduct.title}</h1>
            {selectedProduct.rating && (
              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(selectedProduct.rating!)
                          ? "text-yellow-400"
                          : "text-gray-300 dark:text-gray-600"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="ml-2 text-gray-600 dark:text-gray-400">
                  {selectedProduct.rating} ({selectedProduct.reviews} reviews)
                </span>
              </div>
            )}
          </div>

          <div className="text-4xl font-bold text-primary-600 dark:text-primary-400">
            {formatPrice(selectedProduct.price)}
          </div>

          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            {selectedProduct.description}
          </p>

          {selectedProduct.stock < 10 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-red-700 dark:text-red-300">
              <span className="font-semibold">Low stock:</span> Only{" "}
              {selectedProduct.stock} items remaining
            </div>
          )}

          {selectedProduct.variants && selectedProduct.variants.length > 0 && (
            <div className="space-y-4">
              {selectedProduct.variants.map((variant) => (
                <div key={variant.name}>
                  <label className="block font-semibold mb-2">
                    {variant.name}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {variant.options.map((option) => (
                      <button
                        key={option}
                        onClick={() =>
                          setSelectedVariants((prev) => ({
                            ...prev,
                            [variant.name]: option,
                          }))
                        }
                        className={`px-4 py-2 rounded-lg border-2 transition-all focus-ring ${
                          selectedVariants[variant.name] === option
                            ? "border-primary-600 bg-primary-50 dark:border-primary-400 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                            : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div>
            <label className="block font-semibold mb-2">Quantity</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="w-10 h-10 flex items-center justify-center rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed focus-ring"
                aria-label="Decrease quantity"
              >
                -
              </button>
              <span className="text-xl font-semibold w-12 text-center">
                {quantity}
              </span>
              <button
                onClick={() =>
                  setQuantity(Math.min(selectedProduct.stock, quantity + 1))
                }
                disabled={quantity >= selectedProduct.stock}
                className="w-10 h-10 flex items-center justify-center rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed focus-ring"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>

          <Button
            onClick={handleAddToCart}
            disabled={selectedProduct.stock === 0}
            className="w-full"
            size="lg"
          >
            {selectedProduct.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </Button>
        </div>
      </div>
    </div>
  );
};
