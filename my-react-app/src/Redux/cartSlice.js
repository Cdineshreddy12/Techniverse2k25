import { createSlice } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';

const initialState = {
  items: [],
  workshops: [],
  activeCombo: null
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { type, item } = action.payload;
      console.log('Adding to cart:', type, item);
      
      // Validate item structure
      if (!item || !item.eventInfo?.id) {
        console.error('Invalid item structure:', item);
        return;
      }
      
      if (type === 'workshop') {
        const existingWorkshop = state.workshops.find(w => 
          w.eventInfo?.id === item.eventInfo.id
        );
        if (!existingWorkshop) {
          state.workshops.push(item);
        }
      } else {
        const existingItem = state.items.find(i => 
          i.eventInfo?.id === item.eventInfo.id
        );
        if (!existingItem) {
          state.items.push(item);
        }
      }
    },
    removeFromCart: (state, action) => {
      const { type, id } = action.payload;
      console.log('Removing from cart:', type, id);
      
      if (type === 'workshop') {
        state.workshops = state.workshops.filter(w => w.eventInfo?.id !== id);
        if (state.activeCombo?.name.toLowerCase().includes('workshop')) {
          state.activeCombo = null;
        }
      } else {
        state.items = state.items.filter(item => item.eventInfo?.id !== id);
      }
    },
    setActiveCombo: (state, action) => {
      state.activeCombo = action.payload;
    },
    clearActiveCombo: (state) => {
      state.activeCombo = null;
    },
    clearCart: (state) => {
      state.items = [];
      state.workshops = [];
      state.activeCombo = null;
    },
    syncCart: (state, action) => {
      console.log('Syncing cart with data:', action.payload);
      const { items, workshops, activeCombo } = action.payload;
      
      // Process items to ensure correct structure
      const processedItems = Array.isArray(items) ? items.map(item => ({
        ...item,
        eventInfo: {
          ...item.eventInfo,
          id: item.eventInfo?.id || item.id // Fallback to item.id if eventInfo.id is missing
        }
      })) : [];

      const processedWorkshops = Array.isArray(workshops) ? workshops.map(item => ({
        ...item,
        eventInfo: {
          ...item.eventInfo,
          id: item.eventInfo?.id || item.id
        }
      })) : [];
      
      state.items = processedItems;
      state.workshops = processedWorkshops;
      state.activeCombo = activeCombo || null;
      
      console.log('Cart state after sync:', state);
    }
  }
});

export const { 
  addToCart, 
  removeFromCart, 
  setActiveCombo, 
  clearActiveCombo, 
  clearCart, 
  syncCart 
} = cartSlice.actions;

export default cartSlice.reducer;