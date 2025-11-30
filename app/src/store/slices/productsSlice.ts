import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Product } from "../../types";
import { products as mockProducts } from "../../data/products";
import productsService from "../../services/productsService";

interface ProductsState {
  items: Product[];
  loading: boolean;
  error: string | null;
  selectedProduct: Product | null;
  selectedProductLoading: boolean;
}

const initialState: ProductsState = {
  items: [],
  loading: false,
  error: null,
  selectedProduct: null,
  selectedProductLoading: false,
};

export const fetchProducts = createAsyncThunk<Product[]>(
  "products/fetchProducts",
  async () => {
    try {
      // Try real API call
      const products = await productsService.getAll();
      console.log("Fetched products from API:", products);
      return products as unknown as Product[];
    } catch (error) {
      console.warn("API failed. Falling back to mock products.");

      // Simulate delay like before
      await new Promise((resolve) => setTimeout(resolve, 800));

      return mockProducts;
    }
  }
);

export const fetchProductById = createAsyncThunk<
  any, // fulfilled payload -> any
  string, // arg type -> id
  { rejectValue: any } // thunkAPI.rejectWithValue type -> any
>("products/fetchProductById", async (id: string, thunkAPI) => {
  try {
    // cast service result to any
    const product = (await productsService.getById(id)) as any;
    return product;
  } catch (err) {
    console.warn("API failed — falling back to mock", err);

    // keep your simulated delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    const product = (mockProducts as any[]).find((p) => p.id === id);
    if (!product) {
      // reject with any (could be string or object)
      return thunkAPI.rejectWithValue({ message: "Product not found" });
    }
    return product;
  }
});
const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchProducts.fulfilled,
        (state, action: PayloadAction<Product[]>) => {
          state.loading = false;
          state.items = action.payload;
        }
      )
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch products";
      })
      .addCase(fetchProductById.pending, (state) => {
        state.selectedProductLoading = true;
        state.error = null;
      })
      .addCase(
        fetchProductById.fulfilled,
        (state, action: PayloadAction<Product>) => {
          state.selectedProductLoading = false;
          state.selectedProduct = action.payload;
        }
      )
      .addCase(fetchProductById.rejected, (state, action) => {
        state.selectedProductLoading = false;
        state.error = action.error.message || "Failed to fetch product";
      });
  },
});

export const { clearSelectedProduct } = productsSlice.actions;
export default productsSlice.reducer;
