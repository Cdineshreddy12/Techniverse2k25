import React from 'react';

const ShippingPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 text-white ">
      <h1 className="text-3xl font-bold mb-6">Shipping Policy</h1>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Digital Delivery</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold mb-2">Instant Access</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Upon successful payment, you will receive immediate access to your registration confirmation</li>
              <li>A QR code will be generated for event/workshop access</li>
              <li>An email confirmation will be sent to your registered email address</li>
            </ul>
          </div>



          <div>
            <h3 className="text-xl font-semibold mb-2">Registration Confirmation</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Registration details will be available in your profile dashboard immediately after payment</li>
              <li>Digital tickets and QR codes are delivered instantly</li>
              <li>No physical shipping is involved in this process</li>
            </ul>
          </div>

          <section className="mb-8">
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold mb-2">Shipping Timeline</h3>
            <p>Items will be delivered within 7 to 10 working days after order confirmation.</p>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-2">Our Address</h3>
            <address className="not-italic">
              Bahudha Block,<br />
              Etcherla Mandal,<br />
              S.M Puram,<br />
              Srikakulam District,<br />
              Andhra Pradesh,<br />
              PIN: 532410
            </address>
          </div>
        </div>
      </section>

          <div>
            <h3 className="text-xl font-semibold mb-2">Workshop Materials</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Any digital materials related to workshops will be made available through our platform</li>
              <li>Access details will be shared via email before the workshop date</li>
              <li>Materials will remain accessible throughout the duration of the workshop</li>
            </ul>
          </div>
        </div>
      </section>
      
      

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Technical Support</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>For any issues with digital delivery, contact our support team</li>
          <li>Support email: techniverse@rguktsklm.ac.in</li>
          <li>Response time: Within 24 hours</li>
        </ul>
      </section>

      <p className="text-sm text-gray-100 mt-8">Last updated: February 24, 2025</p>
    </div>
  );
};

export default ShippingPolicy;