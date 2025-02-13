import { createSlice } from '@reduxjs/toolkit';

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
      
      if (type === 'workshop') {
        const existingWorkshop = state.workshops.find(w => w.id === item.id);
        if (!existingWorkshop) {
          state.workshops.push(item);
        }
      } else {
        const existingItem = state.items.find(i => i.eventInfo?.id === item.eventInfo?.id);
        if (!existingItem) {
          state.items.push(item);
        }
      }
    },
    removeFromCart: (state, action) => {
      const { type, id } = action.payload;
      
      if (type === 'workshop') {
        // Remove workshop
        state.workshops = state.workshops.filter(w => w.id !== id);
        
        // Check and clear workshop combo if needed
        if (state.workshops.length === 0 && state.activeCombo?.name) {
          const comboName = state.activeCombo.name.toLowerCase();
          if (comboName.includes('workshop') || comboName.includes('combo')) {
            state.activeCombo = null;
          }
        }
      } else {
        // Remove event
        state.items = state.items.filter(item => item.eventInfo?.id !== id);
        
        // Clear combo if all events are removed
        if (state.items.length === 0 && state.activeCombo?.name) {
          const comboName = state.activeCombo.name.toLowerCase();
          if (comboName.includes('events') || comboName.includes('combo')) {
            state.activeCombo = null;
          }
        }
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
      const { items, workshops, activeCombo } = action.payload;
      
      // Process items
      const processedItems = Array.isArray(items) ? items.map(item => ({
        ...item,
        eventInfo: {
          ...item.eventInfo,
          id: item.eventInfo?.id || item.id
        }
      })) : [];

      // Process workshops
      const processedWorkshops = Array.isArray(workshops) ? workshops.map(workshop => ({
        ...workshop,
        id: workshop.id || workshop._id,
        type: 'workshop'
      })) : [];
      
      state.items = processedItems;
      state.workshops = processedWorkshops;
      state.activeCombo = activeCombo || null;
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