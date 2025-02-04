import express from 'express'
const router=express.Router();
import { Student } from '../Models/StudentSchema.js';
router.post('/cart/add', async (req, res) => {
  const { kindeId, item } = req.body;
  
  try {
    // Validate required fields
    if (!kindeId || !item || !item.eventId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Find or create student
    let student = await Student.findOne({ kindeId });
    
    if (!student) {
      student = await Student.create({
        kindeId,
        cart: []
      });
    }

    // Check if item already exists in cart - with null safety
    const itemExists = student.cart && student.cart.some(cartItem => 
      cartItem && cartItem.eventId && cartItem.eventId.toString() === item.eventId
    );

    if (itemExists) {
      return res.status(400).json({ error: 'Item already in cart' });
    }

    // Add new item to cart
    const cartItem = {
      eventId: item.eventId,
      price: item.price || 0,
      addedAt: new Date()
    };

    student = await Student.findOneAndUpdate(
      { kindeId },
      { $push: { cart: cartItem } },
      { new: true }
    ).populate('cart.eventId');

    res.json({ success: true, cart: student.cart });

  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: error.message });
  }
});
  
  router.get('/cart/:kindeId', async (req, res) => {
    try {
      // First find or create the student
      let student = await Student.findOne({ kindeId: req.params.kindeId });
      
      // If student doesn't exist, create one
      if (!student) {
        student = await Student.create({
          kindeId: req.params.kindeId,
          cart: [] // Initialize empty cart
        });
      }
  
      // Now we know student exists, get the populated cart data
      const populatedStudent = await Student.findOne({ kindeId: req.params.kindeId })
        .populate({
          path: 'cart.eventId',
          model: 'Event',
          select: 'eventInfo schedule registration media'
        });
  
      // Transform the data to match frontend structure
      const transformedCart = populatedStudent.cart.map(cartItem => {
        if (!cartItem.eventId) return null; // Skip if event doesn't exist
        
        return {
          id: cartItem.eventId._id,
          eventId: cartItem.eventId._id, // Include both for compatibility
          fee: cartItem.price || cartItem.eventId.registration.fee,
          eventInfo: cartItem.eventId.eventInfo,
          schedule: cartItem.eventId.schedule,
          registration: cartItem.eventId.registration,
          media: cartItem.eventId.media
        };
      }).filter(item => item !== null); // Remove any null items
  
      res.json({ cart: transformedCart });
      
    } catch (error) {
      console.error('Cart fetch error:', error);
      res.status(500).json({ error: error.message });
    }
  });
  
  router.delete('/cart/:kindeId/:itemId', async (req, res) => {
    try {
      const student = await Student.findOneAndUpdate(
        { kindeId: req.params.kindeId },
        { $pull: { cart: { eventId: req.params.itemId } } },
        { new: true }
      );
      res.json({ cart: student.cart });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  export default router;