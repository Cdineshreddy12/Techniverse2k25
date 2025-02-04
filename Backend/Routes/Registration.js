import express from 'express'
const router=express.Router();
import { Student } from '../Models/StudentSchema.js';

router.post('/register', async (req, res) => {
    const { kindeId, name, email, collegeId, branch, collegeName } = req.body;
    try {
        const user = await Student.findOneAndUpdate(
            { kindeId },
            { name, email, collegeId, branch, collegeName }, // Include name in update
            { upsert: true, new: true }
        );
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

  router.get('/user/:kindeId', async (req, res) => {
    try {
      const user = await  Student.findOne({ kindeId: req.params.kindeId });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  export default router;