export interface Product {
  id: string;
  _id?: string;

  title: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  stock: number;
  variants?: ProductVariant[];
  rating?: number;
  reviews?: number;
}

export interface ProductVariant {
  type: "size" | "color";
  name: string;
  options: string[];
}

export interface CartItem {
  id: string;
  _id?: string;
  product: Product;
  quantity: number;
  selectedVariants?: Record<string, string>;
}

export interface CheckoutFormData {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  checkoutData: CheckoutFormData;
  orderDate: string;
}
