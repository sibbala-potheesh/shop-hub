import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import { formatPrice } from "../utils";
import { Button } from "../components/Button";
import { Order } from "../types";

export const MyOrders: React.FC = () => {
  const navigate = useNavigate();
  const orders = useAppSelector((state) => state.orders.orders);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  if (orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <svg
          className="w-24 h-24 mx-auto text-gray-400 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <h2 className="text-2xl font-bold mb-4">No orders yet</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Start shopping to see your orders here
        </p>
        <Button onClick={() => navigate("/")}>Browse Products</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
          >
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Order ID:{" "}
                    <span className="font-mono font-semibold">{order.id}</span>
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Placed on{" "}
                    {new Date(order.orderDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="mt-4 md:mt-0 flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Total
                    </p>
                    <p className="text-xl font-bold text-primary-600 dark:text-primary-400">
                      {formatPrice(order.total)}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
                    Delivered
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <div className="flex -space-x-2">
                  {order.items.slice(0, 3).map((item, index) => (
                    <img
                      key={index}
                      src={item.product.images[0]}
                      alt={item.product.title}
                      className="w-12 h-12 rounded-full border-2 border-white dark:border-gray-800 object-cover"
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {order.items.length}{" "}
                  {order.items.length === 1 ? "item" : "items"}
                </p>
              </div>

              <button
                onClick={() => toggleOrderDetails(order.id)}
                className="text-primary-600 dark:text-primary-400 hover:underline text-sm font-medium focus-ring rounded px-2 py-1"
              >
                {expandedOrder === order.id ? "Hide Details" : "View Details"}
              </button>
            </div>

            {expandedOrder === order.id && (
              <div className="border-t dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-900/50">
                <h3 className="font-semibold mb-4">Order Items</h3>
                <div className="space-y-4 mb-6">
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

                <div className="border-t dark:border-gray-700 pt-4">
                  <h3 className="font-semibold mb-2">Shipping Address</h3>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p>
                      {order.checkoutData.firstName}{" "}
                      {order.checkoutData.lastName}
                    </p>
                    <p>{order.checkoutData.address}</p>
                    <p>
                      {order.checkoutData.city}, {order.checkoutData.state}{" "}
                      {order.checkoutData.zipCode}
                    </p>
                    <p>{order.checkoutData.country}</p>
                    <p className="mt-2">{order.checkoutData.phone}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
