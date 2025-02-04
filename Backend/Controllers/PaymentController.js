import Razorpay from 'razorpay';
import crypto from 'crypto'
const razorpay = new Razorpay({
    key_id: config.RAZORPAY_KEY_ID,
    key_secret: config.RAZORPAY_SECRET
});

const createOrder = async (req, res) => {
    try {
        const options = {
            amount: req.body.amount * 100, // amount in paise
            currency: "INR",
            receipt: `receipt_${Date.now()}`
        };
        
        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const verifyPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    const signature = crypto
        .createHmac('sha256', config.RAZORPAY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');
    
    if (signature === razorpay_signature) {
        try {
            // Update payment status in database
            await Payment.findOneAndUpdate(
                { orderId: razorpay_order_id },
                {
                    paymentId: razorpay_payment_id,
                    status: 'completed',
                    paymentSignature: razorpay_signature,
                    updatedAt: new Date()
                }
            );

            // Update registration status
            await Registration.findOneAndUpdate(
                { paymentOrderId: razorpay_order_id },
                { 
                    paymentStatus: 'paid',
                    registrationStatus: 'confirmed'
                }
            );

            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: 'Database update failed' });
        }
    } else {
        res.status(400).json({ error: 'Invalid signature' });
    }
};

export{createOrder,verifyPayment};