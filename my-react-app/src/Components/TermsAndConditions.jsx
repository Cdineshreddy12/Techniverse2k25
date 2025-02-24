// Create TermsAndConditions.jsx in your components folder

import React from 'react';

const TermsAndConditions = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 text-gray-100">
      <h1 className="text-3xl font-bold mb-6">Terms and Conditions</h1>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
        <p className="mb-4">
          By accessing and registering for Techniverse2k25 events and workshops, you agree to be bound by these Terms and Conditions and all applicable laws and regulations.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">2. Registration and Eligibility</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Registration is open to college students with valid student ID</li>
          <li>RGUKT SKLM students must use their official college email for registration</li>
          <li>Participants must provide accurate and complete information during registration</li>
          <li>Age requirement: Participants must be at least 16 years old</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">3. Payment and Pricing</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>All prices are in Indian Rupees (INR)</li>
          <li>Payment must be made in full to confirm registration</li>
          <li>Different pricing applies for RGUKT students and external participants</li>
          <li>All transactions are processed securely through Razorpay</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">4. Event Participation</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Participants must carry valid ID proof during events</li>
          <li>QR codes issued are non-transferable</li>
          <li>Participants must follow event-specific rules and guidelines</li>
          <li>Organizers reserve the right to modify event schedules if necessary</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">5. Code of Conduct</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Participants must maintain professional behavior during events</li>
          <li>Any form of harassment or discrimination will not be tolerated</li>
          <li>Participants must respect intellectual property rights</li>
          <li>Violation of rules may result in disqualification without refund</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">6. Cancellation and Refunds</h2>
        <p className="mb-4">
          Please refer to our <a href="/cancellation-policy" className="text-purple-600 hover:text-purple-800">Cancellation and Refund Policy</a> for detailed information.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">7. Privacy</h2>
        <p className="mb-4">
          Your privacy is important to us. Please review our <a href="/privacy-policy" className="text-purple-600 hover:text-purple-800">Privacy Policy</a> to understand how we handle your information.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">8. Contact Information</h2>
        <p className="mb-2">For any queries regarding these terms, contact us at:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Email:techniverse@rguktsklm.ac.in</li>
          <li>Response time: Within 48 hours</li>
        </ul>
      </section>

      <p className="text-sm text-gray-100 mt-8">Last updated: February 24, 2025</p>
    </div>
  );
};

export default TermsAndConditions;