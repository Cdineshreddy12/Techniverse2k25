// cartSlice.js
import { createSlice } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';
const initialState = {
  items: [],
  total: 0
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const existingItem = state.items.find(item => 
        item.id === action.payload.id
      );
      
      if (!existingItem) {
        state.items.push(action.payload);
        state.total += action.payload.fee;
      }
    },
    removeFromCart: (state, action) => {
      const itemIndex = state.items.findIndex(item => 
        item.id === action.payload
      );
      
      if (itemIndex !== -1) {
        state.total -= state.items[itemIndex].fee;
        state.items.splice(itemIndex, 1);
      }
    },
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
    },
    syncCart: (state, action) => {
      state.items = action.payload;
      state.total = action.payload.reduce((sum, item) => sum + item.fee, 0);
    }
  }
});

export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;