import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { clearOrder } from "../store/slices/checkoutSlice";
import { formatPrice } from "../utils";
import { Button } from "../components/Button";

export const Success: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const order = useAppSelector((state) => state.checkout.currentOrder);

  useEffect(() => {
    if (!order) {
      navigate("/");
    }
  }, [order, navigate]);

  const handleBackToHome = () => {
    dispatch(clearOrder());
    navigate("/");
  };

  if (!order) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-10 h-10 text-green-600 dark:text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Thank you for your purchase. Your order has been placed successfully.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="mb-6 pb-6 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-2">Order Details</h2>
          <div className="text-sm space-y-1">
            <p>
              <span className="text-gray-600 dark:text-gray-400">
                Order Number:
              </span>{" "}
              <span className="font-mono font-semibold">{order.id}</span>
            </p>
            <p>
              <span className="text-gray-600 dark:text-gray-400">Date:</span>{" "}
              {new Date(order.orderDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="mb-6 pb-6 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4">Items Ordered</h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-4">
                <img
                  src={item.product.images[0]}
                  alt={item.product.title}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="flex-1">
                  <p className="font-medium">{item.product.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Quantity: {item.quantity}
                  </p>
                  {item.selectedVariants && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {Object.entries(item.selectedVariants).map(
                        ([key, value]) => (
                          <span key={key} className="mr-2">
                            {key}: {value}
                          </span>
                        )
                      )}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {formatPrice(item.product.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6 pb-6 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-2">Shipping Address</h2>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p>
              {order.checkoutData.firstName} {order.checkoutData.lastName}
            </p>
            <p>{order.checkoutData.address}</p>
            <p>
              {order.checkoutData.city}, {order.checkoutData.state}{" "}
              {order.checkoutData.zipCode}
            </p>
            <p>{order.checkoutData.country}</p>
            <p className="mt-2">{order.checkoutData.phone}</p>
            <p>{order.checkoutData.email}</p>
          </div>
        </div>

        <div className="flex justify-between items-center text-xl font-bold">
          <span>Total Paid</span>
          <span className="text-primary-600 dark:text-primary-400">
            {formatPrice(order.total)}
          </span>
        </div>
      </div>

      <div className="text-center space-y-4">
        <p className="text-gray-600 dark:text-gray-400">
          A confirmation email has been sent to{" "}
          <span className="font-semibold">{order.checkoutData.email}</span>
        </p>
        <Button onClick={handleBackToHome} size="lg">
          Continue Shopping
        </Button>
      </div>
    </div>
  );
};
