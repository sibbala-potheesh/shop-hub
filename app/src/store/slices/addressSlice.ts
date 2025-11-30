import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Address {
  id: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

interface AddressState {
  addresses: Address[];
  loading: boolean;
}

const getAddressesFromStorage = (): Address[] => {
  const addressesStr = localStorage.getItem("userAddresses");
  return addressesStr ? JSON.parse(addressesStr) : [];
};

const initialState: AddressState = {
  addresses: getAddressesFromStorage(),
  loading: false,
};

const addressSlice = createSlice({
  name: "address",
  initialState,
  reducers: {
    addAddress: (state, action: PayloadAction<Omit<Address, "id">>) => {
      const newAddress = {
        ...action.payload,
        id: Date.now().toString(),
      };

      // If this is set as default, unset others
      if (newAddress.isDefault) {
        state.addresses.forEach((addr) => {
          addr.isDefault = false;
        });
      }

      state.addresses.push(newAddress);
      localStorage.setItem("userAddresses", JSON.stringify(state.addresses));
    },
    updateAddress: (state, action: PayloadAction<Address>) => {
      const index = state.addresses.findIndex(
        (addr) => addr.id === action.payload.id
      );
      if (index !== -1) {
        // If this is set as default, unset others
        if (action.payload.isDefault) {
          state.addresses.forEach((addr) => {
            addr.isDefault = false;
          });
        }
        state.addresses[index] = action.payload;
        localStorage.setItem("userAddresses", JSON.stringify(state.addresses));
      }
    },
    deleteAddress: (state, action: PayloadAction<string>) => {
      state.addresses = state.addresses.filter(
        (addr) => addr.id !== action.payload
      );
      localStorage.setItem("userAddresses", JSON.stringify(state.addresses));
    },
    setDefaultAddress: (state, action: PayloadAction<string>) => {
      state.addresses.forEach((addr) => {
        addr.isDefault = addr.id === action.payload;
      });
      localStorage.setItem("userAddresses", JSON.stringify(state.addresses));
    },
    loadAddresses: (state) => {
      state.addresses = getAddressesFromStorage();
    },
    clearAddresses: (state) => {
      state.addresses = [];
      localStorage.removeItem("userAddresses");
    },
  },
});

export const {
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  loadAddresses,
  clearAddresses,
} = addressSlice.actions;

export default addressSlice.reducer;
