// validation.js
export const validateEventRegistration = (event, user) => {
    if (!event || !user) {
      throw new Error('Invalid event or user data');
    }
  
    // Check if registration is open
    if (!event.registration.isRegistrationOpen) {
      throw new Error('Registration is currently closed for this event');
    }
  
    // Check if slots are available
    if (event.registration.registeredCount >= event.registration.totalSlots) {
      throw new Error('All slots are filled for this event');
    }
  
    // Check if the user has required student/college data
    if (!user.id) {
      throw new Error('Please login to register for events');
    }
  
    // Check if fee amount is valid
    if (typeof event.registration.fee !== 'number' || event.registration.fee < 0) {
      throw new Error('Invalid registration fee amount');
    }
  
    return {
      eventId: event._id,
      price: event.registration.fee,
      userId: user.id,
      registrationType: event.registration.type,
      maxTeamSize: event.registration.maxTeamSize || 1
    };
  };
  
  export const validateCartItem = (item) => {
    if (!item || !item.eventId || typeof item.price !== 'number') {
      throw new Error('Invalid cart item data');
    }
    
    return {
      eventId: item.eventId,
      price: item.price,
      addedAt: new Date()
    };
  };
  