import express from 'express';
const router=express.Router();
import { Registration } from '../Models/RegistrationSchema.js';

router.post('/code/validate-registration', async (req, res) => {
    try {
      const { code, eventId } = req.body;
      
      // Find registration by validation code
      const registration = await Registration.findOne({
        'events.validationCode': code
      }).populate('userId');
  
      if (!registration) {
        return res.status(404).json({
          isValid: false,
          message: 'Invalid registration code'
        });
      }
  
      // Find the specific event
      const event = registration.events.find(e => e.eventId === eventId);
      
      if (!event) {
        return res.status(404).json({
          isValid: false,
          message: 'Event not found in registration'
        });
      }
  
      if (event.status === 'attended') {
        return res.status(400).json({
          isValid: false,
          message: 'Already checked in for this event'
        });
      }
  
      // Update status to attended
      event.status = 'attended';
      await registration.save();
  
      return res.json({
        isValid: true,
        message: 'Check-in successful',
        participant: {
          name: registration.userId.name,
          comboName: registration.comboId,
          eventName: event.eventName
        }
      });
    } catch (error) {
      console.error('Validation error:', error);
      return res.status(500).json({
        isValid: false,
        message: 'Internal server error'
      });
    }
  });
 export default router;  