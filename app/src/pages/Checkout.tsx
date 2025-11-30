import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
  CardElement,
  Elements,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { updateFormData, submitOrder } from "../store/slices/checkoutSlice";
import { clearCart } from "../store/slices/cartSlice";
import { addOrder } from "../store/slices/ordersSlice";
import { formatPrice, calculateCartTotal, generateOrderId } from "../utils";
import { CheckoutFormData } from "../types";
import { Button } from "../components/Button";

const stripePromise = loadStripe(
  "pk_test_51SXbnX2E6FY4l7FJ5FF9gUaSFXz3psOfq6Z0gahLPOabu0VEWjzQYoW4a1Baw1IjEorRgOfjV7ZqFQ31xi6Crh9Y009m7JGKyU"
);

interface PaymentMethod {
  id: "card" | "paypal" | "apple_pay" | "google_pay" | "upi";
  name: string;
  icon: string;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: "card",
    name: "Credit/Debit Card",
    icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9MqnTgVTTvCYOT8UO_H6lkvA3nhyR33ScuQ&s",
  },
  {
    id: "paypal",
    name: "PayPal",
    icon: "data:image/png;base64,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",
  },
  {
    id: "apple_pay",
    name: "Apple Pay",
    icon: "data:image/png;base64,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",
  },
  {
    id: "google_pay",
    name: "Google Pay",
    icon: "data:image/png;base64,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",
  },
  // {
  //   id: "upi",
  //   name: "UPI",
  //   icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Unified_Payments_Interface_logo.svg/1200px-Unified_Payments_Interface_logo.svg.png",
  // },
];

const CheckoutForm: React.FC<{
  cartItems: any[];
  formData: Partial<CheckoutFormData>;
  errors: Partial<Record<keyof CheckoutFormData, string>>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddressSelect: (addressId: string) => void;
  addresses: any[];
  onSubmit: (payload: {
    paymentMethod: "card" | "paypal" | "apple_pay" | "google_pay" | "upi";
    paymentToken?: string;
  }) => Promise<void> | void;
  selectedPayment: "card" | "paypal" | "apple_pay" | "google_pay" | "upi";
  onPaymentChange: (
    method: "card" | "paypal" | "apple_pay" | "google_pay" | "upi"
  ) => void;
  isProcessing: boolean;
}> = ({
  cartItems,
  formData,
  errors,
  onInputChange,
  onAddressSelect,
  addresses,
  onSubmit,
  selectedPayment,
  onPaymentChange,
  isProcessing,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [useExistingAddress, setUseExistingAddress] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [paymentError, setPaymentError] = useState<string>("");

  const subtotal = calculateCartTotal(cartItems);
  const shipping = 15;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  const defaultAddress = addresses.find((addr) => addr.isDefault);

  const handleAddressSelect = (addressId: string) => {
    const address = addresses.find((addr) => addr.id === addressId);
    if (address) {
      onAddressSelect(addressId);
      setSelectedAddressId(addressId);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    console.log("Submitting form");
    e.preventDefault();
    setPaymentError("");

    if (selectedPayment === "card") {
      if (!stripe || !elements) {
        setPaymentError("Stripe not loaded");
        return;
      }

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        setPaymentError("Card element not found");
        return;
      }

      try {
        const { token, error } = await stripe.createToken(cardElement);

        if (error) {
          setPaymentError(error.message || "Card validation failed");
          return;
        }

        // Call onSubmit with a payload (no event)
        await onSubmit({
          paymentMethod: "card",
          paymentToken: token?.id,
        });
      } catch (err) {
        setPaymentError("Payment processing failed");
      }
    } else {
      await onSubmit({
        paymentMethod: selectedPayment,
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleFormSubmit} className="space-y-6">
            {/* Contact Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">
                Contact Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium mb-1"
                  >
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email || ""}
                    onChange={onInputChange}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      errors.email
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    } bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Shipping Address</h2>
                {addresses.length > 0 && (
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={useExistingAddress}
                      onChange={(e) => {
                        setUseExistingAddress(e.target.checked);
                        if (e.target.checked && defaultAddress) {
                          handleAddressSelect(defaultAddress.id);
                        }
                      }}
                      className="mr-2 focus:ring-2 focus:ring-blue-500 rounded"
                    />
                    Use saved address
                  </label>
                )}
              </div>

              {useExistingAddress && addresses.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Select Address
                  </label>
                  <select
                    value={selectedAddressId}
                    onChange={(e) => handleAddressSelect(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose an address</option>
                    {addresses.map((addr) => (
                      <option key={addr.id} value={addr.id}>
                        {addr.firstName} {addr.lastName} - {addr.address},{" "}
                        {addr.city}
                        {addr.isDefault ? " (Default)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium mb-1"
                  >
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName || ""}
                    onChange={onInputChange}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      errors.firstName
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    } bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500`}
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium mb-1"
                  >
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName || ""}
                    onChange={onInputChange}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      errors.lastName
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    } bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500`}
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.lastName}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium mb-1"
                  >
                    Address *
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address || ""}
                    onChange={onInputChange}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      errors.address
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    } bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500`}
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.address}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="city"
                    className="block text-sm font-medium mb-1"
                  >
                    City *
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city || ""}
                    onChange={onInputChange}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      errors.city
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    } bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500`}
                  />
                  {errors.city && (
                    <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="state"
                    className="block text-sm font-medium mb-1"
                  >
                    State *
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state || ""}
                    onChange={onInputChange}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      errors.state
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    } bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500`}
                  />
                  {errors.state && (
                    <p className="text-red-500 text-sm mt-1">{errors.state}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="zipCode"
                    className="block text-sm font-medium mb-1"
                  >
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode || ""}
                    onChange={onInputChange}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      errors.zipCode
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    } bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500`}
                  />
                  {errors.zipCode && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.zipCode}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="country"
                    className="block text-sm font-medium mb-1"
                  >
                    Country *
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={formData.country || ""}
                    onChange={onInputChange}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      errors.country
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    } bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500`}
                  />
                  {errors.country && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.country}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium mb-1"
                  >
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone || ""}
                    onChange={onInputChange}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      errors.phone
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    } bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500`}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => onPaymentChange(method.id)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedPayment === method.id
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                    }`}
                  >
                    <img
                      src={method.icon}
                      alt={method.name}
                      className="h-6 w-auto mx-auto"
                    />
                    <div className="text-sm font-medium text-center">
                      {method.name}
                    </div>
                  </button>
                ))}
              </div>

              {/* Card Payment Details */}
              {selectedPayment === "card" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
                    <CardElement
                      options={{
                        style: {
                          base: {
                            fontSize: "16px",
                            color: "#424770",
                            "::placeholder": {
                              color: "#aab7c4",
                            },
                          },
                          invalid: {
                            color: "#9e2146",
                          },
                        },
                      }}
                    />
                  </div>
                  {paymentError && (
                    <p className="text-red-500 text-sm">{paymentError}</p>
                  )}
                </div>
              )}

              {/* Other Payment Methods Info */}
              {selectedPayment !== "card" && (
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-900 dark:text-blue-200">
                    You will be redirected to{" "}
                    {paymentMethods.find((m) => m.id === selectedPayment)?.name}{" "}
                    to complete your payment securely.
                  </p>
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Place Order"}
            </Button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-24">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

            <div className="space-y-3 mb-6">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.title}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {item.product.title}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Qty: {item.quantity}
                    </p>
                    <p className="text-sm font-semibold">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t dark:border-gray-700 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span>{formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax</span>
                <span>{formatPrice(tax)}</span>
              </div>
              <div className="border-t dark:border-gray-700 pt-2 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatPrice(subtotal + shipping + tax)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Checkout: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const cartItems = useAppSelector((state) => state.cart.items);
  const formData = useAppSelector((state) => state.checkout.formData);
  const addresses = useAppSelector((state) => state.address.addresses);

  const [form, setForm] = useState<Partial<CheckoutFormData>>(formData);
  const [errors, setErrors] = useState<
    Partial<Record<keyof CheckoutFormData, string>>
  >({});
  const [selectedPayment, setSelectedPayment] = useState<
    "card" | "paypal" | "apple_pay" | "google_pay" | "upi"
  >("card");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleAddressSelect = (addressId: string) => {
    const address = addresses.find((addr) => addr.id === addressId);
    if (address) {
      setForm({
        ...form,
        firstName: address.firstName,
        lastName: address.lastName,
        address: address.address,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        country: address.country,
        phone: address.phone,
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CheckoutFormData, string>> = {};

    if (!form.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = "Invalid email";

    if (!form.firstName) newErrors.firstName = "First name is required";
    if (!form.lastName) newErrors.lastName = "Last name is required";
    if (!form.address) newErrors.address = "Address is required";
    if (!form.city) newErrors.city = "City is required";
    if (!form.state) newErrors.state = "State is required";
    if (!form.zipCode) newErrors.zipCode = "ZIP code is required";
    if (!form.country) newErrors.country = "Country is required";
    if (!form.phone) newErrors.phone = "Phone is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (payload: {
    paymentMethod: "card" | "paypal" | "apple_pay" | "google_pay" | "upi";
    paymentToken?: string;
  }) => {
    if (!validateForm()) return;

    if (cartItems.length === 0) {
      alert("Your cart is empty");
      return;
    }

    setIsProcessing(true);

    try {
      const subtotal = calculateCartTotal(cartItems);
      const shipping = 15;
      const tax = subtotal * 0.1;
      const total = subtotal + shipping + tax;

      const order = {
        id: generateOrderId(),
        items: cartItems,
        total,
        checkoutData: form as CheckoutFormData,
        paymentMethod: payload.paymentMethod,
        paymentToken: payload.paymentToken || "",
        orderDate: new Date().toISOString(),
      };

      dispatch(updateFormData(form));
      dispatch(submitOrder(order));
      dispatch(addOrder(order));
      dispatch(clearCart());
      navigate("/success");
    } catch (err) {
      console.error("Order submission failed:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (cartItems.length === 0) {
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
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Add some products before checking out
        </p>
        <Button onClick={() => navigate("/")}>Browse Products</Button>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm
        cartItems={cartItems}
        formData={form}
        errors={errors}
        onInputChange={handleInputChange}
        onAddressSelect={handleAddressSelect}
        addresses={addresses}
        onSubmit={handleSubmit}
        selectedPayment={selectedPayment}
        onPaymentChange={setSelectedPayment}
        isProcessing={isProcessing}
      />
    </Elements>
  );
};
