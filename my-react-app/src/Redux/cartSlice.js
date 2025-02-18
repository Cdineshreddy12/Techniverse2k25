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
          // Ensure workshop data structure
          const processedWorkshop = {
            ...item,
            id: item.id || item._id,
            title: item.title || '',
            departments: item.departments || [],
            price: item.price || 0,
            media: item.media || {},
            registration: item.registration || {},
            type: 'workshop'
          };
          state.workshops.push(processedWorkshop);
        }
      } else {
        const existingItem = state.items.find(i => i.eventInfo?.id === item.eventInfo?.id);
        if (!existingItem) {
          // Ensure event data structure
          const processedItem = {
            ...item,
            eventInfo: {
              ...item.eventInfo,
              id: item.eventInfo?.id || item.id,
              title: item.eventInfo?.title || item.title || '',
              department: item.eventInfo?.department || item.department || {},
              tag: item.eventInfo?.tag || item.tag || ''
            },
            fee: item.fee || 0,
            schedule: item.schedule || {},
            media: item.media || {}
          };
          state.items.push(processedItem);
        }
      }
    },
    
    removeFromCart: (state, action) => {
      const { type, id } = action.payload;
      
      if (type === 'workshop') {
        // Store workshop data before removal
        const workshopToRemove = state.workshops.find(w => w.id === id);
        state.workshops = state.workshops.filter(w => w.id !== id);
        
        // Check and clear workshop combo if needed
        if (state.workshops.length === 0 && state.activeCombo?.name) {
          const comboName = state.activeCombo.name.toLowerCase();
          if (comboName.includes('workshop') || comboName.includes('combo')) {
            state.activeCombo = null;
          }
        }
      } else {
        // Store event data before removal
        const eventToRemove = state.items.find(item => item.eventInfo?.id === id);
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
      
      // Process items with complete data structure
      state.items = (Array.isArray(items) ? items : []).map(item => ({
        ...item,
        eventInfo: {
          ...item.eventInfo,
          id: item.eventInfo?.id || item.id,
          title: item.eventInfo?.title || item.title || '',
          department: item.eventInfo?.department || item.department || {},
          tag: item.eventInfo?.tag || item.tag || ''
        },
        fee: item.fee || 0,
        schedule: item.schedule || {},
        media: item.media || {}
      }));

      // Process workshops with complete data structure
      state.workshops = (Array.isArray(workshops) ? workshops : []).map(workshop => ({
        ...workshop,
        id: workshop.id || workshop._id,
        title: workshop.title || '',
        departments: workshop.departments || [],
        price: workshop.price || 0,
        media: workshop.media || {},
        registration: workshop.registration || {},
        type: 'workshop'
      }));
      
      // Set active combo
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