import express from 'express'
const router=express.Router();
import { Student } from '../Models/StudentSchema.js';
import { validateCartItem } from '../middleware/validation.js';

router.post('/cart/add', async (req, res) => {
  const { kindeId, item } = req.body;
  
  try {
    // Validate required fields
    if (!kindeId || !item) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: 'Both kindeId and item are required'
      });
    }

    // Validate cart item
    let validatedItem;
    try {
      validatedItem = validateCartItem(item);
    } catch (validationError) {
      return res.status(400).json({
        error: 'Invalid item data',
        details: validationError.message
      });
    }

    // Find or create student with complete profile check
    let student = await Student.findOne({ kindeId });
    
    if (!student) {
      return res.status(404).json({
        error: 'Profile not found',
        details: 'Please complete your registration before adding items to cart'
      });
    }

    // Check if registration form is complete
    if (!student.name || !student.email || !student.mobileNumber) {
      return res.status(400).json({
        error: 'Incomplete profile',
        details: 'Please complete your profile before adding items to cart'
      });
    }

    // Check if item already exists in cart
    const itemExists = student.cart?.some(cartItem => 
      cartItem.eventId?.toString() === validatedItem.eventId.toString()
    );

    if (itemExists) {
      return res.status(400).json({
        error: 'Duplicate item',
        details: 'This event is already in your cart'
      });
    }

    // Add new item to cart with validation
    student = await Student.findOneAndUpdate(
      { kindeId },
      { $push: { cart: validatedItem } },
      { 
        new: true,
        runValidators: true
      }
    ).populate('cart.eventId');

    res.json({ 
      success: true, 
      cart: student.cart,
      message: 'Item added to cart successfully'
    });

  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ 
      error: 'Server error',
      details: error.message 
    });
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
        populate: {
          path: 'departments',
          model: 'Department'
        }
      });

    // Transform the data to match frontend structure
    const transformedCart = populatedStudent.cart.map(cartItem => {
      if (!cartItem.eventId) return null; // Skip if event doesn't exist
      
      const event = cartItem.eventId;
      const department = event.departments[0]; // Assuming first department is primary

      return {
        id: event._id,
        eventId: event._id, // Include both for compatibility
        fee: cartItem.price || event.registrationFee,
        eventInfo: {
          id: event._id,
          title: event.title,
          tag: event.tag,
          description: event.details.description,
          department: {
            id: department?._id || '',
            shortName: department?.shortName || '',
            color: department?.color || 'indigo',
            name: department?.name || ''
          }
        },
        schedule: {
          startTime: event.startTime,
          duration: event.duration,
          venue: event.details.venue
        },
        registration: {
          type: event.registrationType,
          fee: cartItem.price || event.registrationFee,
          maxTeamSize: event.details.maxTeamSize,
          totalSlots: event.maxRegistrations,
          registeredCount: event.registrationCount,
          isRegistrationOpen: event.status === 'published' && 
                            new Date() <= new Date(event.registrationEndTime),
          endTime: event.registrationEndTime
        },
        media: {
          bannerDesktop: event.bannerDesktop,
          bannerMobile: event.bannerMobile
        }
      };
    }).filter(item => item !== null); // Remove any null items

    res.json({ 
      success: true,
      cart: transformedCart 
    });
    
  } catch (error) {
    console.error('Cart fetch error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
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