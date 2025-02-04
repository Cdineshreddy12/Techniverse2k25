import express from 'express'
const router=express.Router();
import { Student } from '../Models/StudentSchema.js';
router.post('/combo/select', async (req, res) => {
    const { kindeId, combo } = req.body;
    
    try {
      const student = await Student.findOneAndUpdate(
        { kindeId },
        { 
          activeCombo: {
            ...combo,
            selectedAt: new Date()
          }
        },
        { new: true }
      );
      
      res.json({ success: true, combo: student.activeCombo });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  router.get('/combo/active/:kindeId', async (req, res) => {
    try {
      const student = await Student.findOne({ kindeId: req.params.kindeId });
      res.json({ combo: student?.activeCombo || null });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  router.post('/combo/clear/:kindeId', async (req, res) => {
    try {
      await Student.findOneAndUpdate(
        { kindeId: req.params.kindeId },
        { $unset: { activeCombo: "" } }
      );
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  export default router;