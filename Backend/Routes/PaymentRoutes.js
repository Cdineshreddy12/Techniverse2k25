// backend/routes.js
import express from 'express';
import { createOrder, verifyPayment } from '../Controllers/PaymentController.js';

const router = express.Router();

router.post('/create-order',createOrder);
router.post('/verify-payment', verifyPayment);

export default router; // Use export default instead of module.exports
