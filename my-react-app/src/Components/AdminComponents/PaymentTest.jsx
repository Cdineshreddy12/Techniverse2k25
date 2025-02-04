import React, { useState, useEffect } from 'react';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import { toast } from 'react-hot-toast';

const PaymentHandler = () => {
  const { user, isAuthenticated, isLoading } = useKindeAuth();
  const [selectedCombo, setSelectedCombo] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Predefined event packages/combos
  const eventCombos = [
    {
      id: 'combo1',
      name: 'Basic Pack',
      price: 499,
      description: 'Access to 2 events',
      events: [
        { id: 'evt1', name: 'Coding Competition' },
        { id: 'evt2', name: 'Tech Quiz' }
      ],
      workshops: []
    },
    {
      id: 'combo2',
      name: 'Pro Pack',
      price: 999,
      description: 'Access to 4 events + 1 workshop',
      events: [
        { id: 'evt1', name: 'Coding Competition' },
        { id: 'evt2', name: 'Tech Quiz' },
        { id: 'evt3', name: 'Hackathon' },
        { id: 'evt4', name: 'Project Expo' }
      ],
      workshops: [
        { id: 'wsp1', name: 'AI/ML Workshop' }
      ]
    },
    {
      id: 'combo3',
      name: 'Premium Pack',
      price: 1499,
      description: 'Access to all events + 2 workshops',
      events: [
        { id: 'evt1', name: 'Coding Competition' },
        { id: 'evt2', name: 'Tech Quiz' },
        { id: 'evt3', name: 'Hackathon' },
        { id: 'evt4', name: 'Project Expo' },
        { id: 'evt5', name: 'Paper Presentation' }
      ],
      workshops: [
        { id: 'wsp1', name: 'AI/ML Workshop' },
        { id: 'wsp2', name: 'Web Development Workshop' }
      ]
    }
  ];

  const handleComboSelect = (combo) => {
    setSelectedCombo(combo);
  };

  const handlePayment = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to continue');
      return;
    }

    if (!selectedCombo) {
      toast.error('Please select a package');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch('http://localhost:4000/api/initiate-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          kindeId: user.id,
          combo: selectedCombo,
          selectedEvents: selectedCombo.events,
          selectedWorkshops: selectedCombo.workshops
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Registration initiated successfully!');
        // Redirect to payment gateway or confirmation page
        // window.location.href = data.paymentUrl; // If you have a payment gateway URL
      } else {
        toast.error(data.error || 'Failed to initiate payment');
      }
    } catch (error) {
      console.error('Payment Error:', error);
      toast.error('Failed to process payment');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
    </div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Select Your Package</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {eventCombos.map((combo) => (
          <div 
            key={combo.id}
            className={`p-6 rounded-lg border transition-all ${
              selectedCombo?.id === combo.id 
                ? 'border-sky-500 bg-sky-500/10' 
                : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
            }`}
          >
            <h3 className="text-xl font-bold text-white mb-2">{combo.name}</h3>
            <p className="text-2xl font-bold text-sky-400 mb-4">₹{combo.price}</p>
            <p className="text-gray-400 mb-4">{combo.description}</p>
            
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-300 mb-2">Events:</h4>
              <ul className="text-gray-400 text-sm space-y-1">
                {combo.events.map(event => (
                  <li key={event.id}>• {event.name}</li>
                ))}
              </ul>
            </div>

            {combo.workshops.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-300 mb-2">Workshops:</h4>
                <ul className="text-gray-400 text-sm space-y-1">
                  {combo.workshops.map(workshop => (
                    <li key={workshop.id}>• {workshop.name}</li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={() => handleComboSelect(combo)}
              className={`w-full py-2 px-4 rounded-lg font-medium transition-all ${
                selectedCombo?.id === combo.id
                  ? 'bg-sky-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {selectedCombo?.id === combo.id ? 'Selected' : 'Select Package'}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <button
          onClick={handlePayment}
          disabled={!selectedCombo || isProcessing}
          className="px-8 py-3 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Processing...</span>
            </>
          ) : (
            <span>Proceed to Payment</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default PaymentHandler;