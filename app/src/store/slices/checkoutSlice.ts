// src/store/checkout/checkoutSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { CheckoutFormData, Order } from "../../types";
import { orderService } from "../../services/orderService";
interface CheckoutState {
  formData: Partial<CheckoutFormData>;
  currentOrder: Order | null;
  loading: boolean;
  error: string | null;
}

const initialState: CheckoutState = {
  formData: {},
  currentOrder: null,
  loading: false,
  error: null,
};

export const createOrder = createAsyncThunk<
  Order, // fulfilled return type
  Partial<Order>, // argument type
  { rejectValue: string }
>("checkout/createOrder", async (orderArg, { rejectWithValue }) => {
  try {
    const created = await orderService.create(orderArg);
    return created;
  } catch (err: any) {
    return rejectWithValue(err?.message ?? "Network error");
  }
});

const checkoutSlice = createSlice({
  name: "checkout",
  initialState,
  reducers: {
    updateFormData: (
      state,
      action: PayloadAction<Partial<CheckoutFormData>>
    ) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    // Keep this if you still want a manual submit action available
    submitOrder: (state, action: PayloadAction<Order>) => {
      state.currentOrder = action.payload;
    },
    clearOrder: (state) => {
      state.currentOrder = null;
      state.formData = {};
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action: PayloadAction<Order>) => {
        state.loading = false;
        state.currentOrder = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        const message =
          action.payload ?? action.error.message ?? "Failed to create order";

        const fallbackOrder: Order = {
          id: `local-${Date.now()}`,
          status: "pending",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...(action.meta.arg ?? {}),
        } as Order;

        state.currentOrder = fallbackOrder;
        state.error = message;
      });
  },
});

export const { updateFormData, submitOrder, clearOrder } =
  checkoutSlice.actions;
export default checkoutSlice.reducer;
