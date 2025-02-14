import express from 'express';
const router = express.Router();
import { Student } from '../Models/StudentSchema.js';

// Get cart contents
router.get('/cart/:kindeId', async (req, res) => {
  try {
    const student = await Student.findOne({ kindeId: req.params.kindeId })
      .populate({
        path: 'cart.eventId',
        populate: {
          path: 'departments'
        }
      })
      .populate({
        path: 'workshops.workshopId',
        populate: {
          path: 'departments'
        }
      });

    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found'
      });
    }

    // Transform events data
    const transformedEvents = student.cart.map(cartItem => {
      if (!cartItem.eventId) return null; // Skip if event reference is invalid
      
      return {
        id: cartItem.eventId._id,
        type: 'event',
        fee: cartItem.price || cartItem.eventId.registrationFee,
        eventInfo: {
          id: cartItem.eventId._id,
          title: cartItem.eventId.title,
          description: cartItem.eventId.description,
          department: cartItem.eventId.departments[0],
          tag: cartItem.eventId.tag
        },
        schedule: {
          startTime: cartItem.eventId.startTime,
          duration: cartItem.eventId.duration
        },
        registration: cartItem.eventId.registration,
        media: {
          bannerDesktop: cartItem.eventId.bannerDesktop,
          bannerMobile: cartItem.eventId.bannerMobile
        }
      };
    }).filter(Boolean); // Remove null entries

    // Transform workshops data
    const transformedWorkshops = student.workshops.map(workshopItem => {
      if (!workshopItem.workshopId) return null; // Skip if workshop reference is invalid
      
      return {
        id: workshopItem.workshopId._id,
        type: 'workshop',
        title: workshopItem.workshopId.title,
        description: workshopItem.workshopId.description,
        departments: workshopItem.workshopId.departments,
        lecturer: workshopItem.workshopId.lecturer,
        price: workshopItem.price || workshopItem.workshopId.price,
        registration: workshopItem.workshopId.registration,
        schedule: {
          startTime: workshopItem.workshopId.registration.startTime,
          duration: workshopItem.workshopId.duration
        },
        media: {
          bannerDesktop: workshopItem.workshopId.bannerDesktop,
          bannerMobile: workshopItem.workshopId.bannerMobile
        }
      };
    }).filter(Boolean); // Remove null entries

    res.json({ 
      success: true,
      cart: {
        events: transformedEvents,
        workshops: transformedWorkshops,
        activeCombo: student.activeCombo || null
      }
    });
    
  } catch (error) {
    console.error('Cart fetch error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Add event to cart
router.post('/cart/add', async (req, res) => {
  const { kindeId, item } = req.body;
  
  try {
    if (!kindeId || !item || !item.eventId) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing required fields'
      });
    }

    let student = await Student.findOne({ kindeId });
    
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Please complete your registration first'
      });
    }

    // Check for duplicate
    const isDuplicate = student.cart.some(e => 
      e.eventId.toString() === item.eventId.toString()
    );

    if (isDuplicate) {
      return res.status(400).json({
        success: false,
        error: 'This event is already in your cart'
      });
    }

    // Add to cart
    student = await Student.findOneAndUpdate(
      { kindeId },
      { 
        $push: { 
          cart: {
            eventId: item.eventId,
            price: item.price
          }
        }
      },
      { new: true }
    ).populate('cart.eventId');

    res.json({ 
      success: true,
      cart: student.cart
    });

  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});


router.delete('/cart/workshop/:kindeId/:itemId', async (req, res) => {
  try {
    const { kindeId, itemId } = req.params;

    const student = await Student.findOneAndUpdate(
      { kindeId },
      { 
        $pull: { 
          workshops: { workshopId: itemId }
        } 
      },
      { new: true }
    )
    .populate('cart.eventId')
    .populate('workshops.workshopId');

    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found'
      });
    }

    // Transform the response to match the expected format
    const transformedEvents = student.cart.map(cartItem => ({
      id: cartItem.eventId._id,
      type: 'event',
      fee: cartItem.price || cartItem.eventId.registrationFee,
      eventInfo: {
        id: cartItem.eventId._id,
        title: cartItem.eventId.title,
        description: cartItem.eventId.description,
        department: cartItem.eventId.departments[0]
      }
    })).filter(Boolean);

    const transformedWorkshops = student.workshops.map(workshopItem => ({
      id: workshopItem.workshopId._id,
      type: 'workshop',
      title: workshopItem.workshopId.title,
      price: workshopItem.price || workshopItem.workshopId.price,
      departments: workshopItem.workshopId.departments
    })).filter(Boolean);

    res.json({ 
      success: true,
      cart: {
        events: transformedEvents,
        workshops: transformedWorkshops,
        activeCombo: student.activeCombo
      }
    });
  } catch (error) {
    console.error('Remove workshop error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Add workshop to cart
router.post('/cart/workshop/add', async (req, res) => {
  const { kindeId, item } = req.body;
  
  try {
    if (!kindeId || !item || !item.workshopId) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing required fields'
      });
    }

    let student = await Student.findOne({ kindeId });
    
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Please complete your registration first'
      });
    }

    // Check for duplicate
    const isDuplicate = student.workshops.some(w => 
      w.workshopId.toString() === item.workshopId.toString()
    );

    if (isDuplicate) {
      return res.status(400).json({
        success: false,
        error: 'This workshop is already in your cart'
      });
    }

    // Add to cart
    student = await Student.findOneAndUpdate(
      { kindeId },
      { 
        $push: { 
          workshops: {
            workshopId: item.workshopId,
            price: item.price
          }
        }
      },
      { new: true }
    ).populate('workshops.workshopId');

    res.json({ 
      success: true,
      workshops: student.workshops
    });

  } catch (error) {
    console.error('Add workshop error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Remove from cart (works for both events and workshops)
router.delete('/cart/:kindeId/:itemId', async (req, res) => {
  try {
    const { kindeId, itemId } = req.params;
    const { type } = req.query; // 'event' or 'workshop'

    const updateQuery = type === 'workshop' 
      ? { $pull: { workshops: { workshopId: itemId } } }
      : { $pull: { cart: { eventId: itemId } } };

    const student = await Student.findOneAndUpdate(
      { kindeId },
      updateQuery,
      { new: true }
    )
    .populate('cart.eventId')
    .populate('workshops.workshopId');

    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found'
      });
    }

    res.json({ 
      success: true,
      cart: {
        events: student.cart,
        workshops: student.workshops,
        activeCombo: student.activeCombo
      }
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

export default router;