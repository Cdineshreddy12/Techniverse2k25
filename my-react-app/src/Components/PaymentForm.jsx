import React, { useState } from 'react';
import axios from 'axios';

const PaymentForm = () => {
    const [loading, setLoading] = useState(false);

    const handlePayment = async (amount) => {
        try {
            setLoading(true);
            
            // Create order
            const orderResponse = await axios.post('/api/create-order', {
                amount: amount
            });
            
            const options = {
                key: "your_razorpay_key_id",
                amount: orderResponse.data.amount,
                currency: "INR",
                name: "Your College Fest",
                description: "Registration Fee",
                order_id: orderResponse.data.id,
                handler: async (response) => {
                    try {
                        // Verify payment
                        const verifyResponse = await axios.post('/api/verify-payment', response);
                        if (verifyResponse.data.success) {
                            alert('Payment successful!');
                            // Update UI or redirect
                        }
                    } catch (error) {
                        alert('Payment verification failed');
                    }
                },
                prefill: {
                    name: "",
                    email: "",
                    contact: ""
                },
                theme: {
                    color: "#3399cc"
                }
            };
            
            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error) {
            alert('Failed to initiate payment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <button 
                onClick={() => handlePayment(500)} 
                disabled={loading}
            >
                Pay Registration Fee
            </button>
        </div>
    );
};

export default PaymentForm;