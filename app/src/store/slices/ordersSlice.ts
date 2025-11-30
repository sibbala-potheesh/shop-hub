import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Order } from "../../types";

interface OrdersState {
  orders: Order[];
  loading: boolean;
}

const getOrdersFromStorage = (): Order[] => {
  const ordersStr = localStorage.getItem("userOrders");
  return ordersStr ? JSON.parse(ordersStr) : [];
};

const initialState: OrdersState = {
  orders: getOrdersFromStorage(),
  loading: false,
};

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    addOrder: (state, action: PayloadAction<Order>) => {
      state.orders.unshift(action.payload);
      localStorage.setItem("userOrders", JSON.stringify(state.orders));
    },
    loadOrders: (state) => {
      state.orders = getOrdersFromStorage();
    },
    clearOrders: (state) => {
      state.orders = [];
      localStorage.removeItem("userOrders");
    },
  },
});

export const { addOrder, loadOrders, clearOrders } = ordersSlice.actions;
export default ordersSlice.reducer;
