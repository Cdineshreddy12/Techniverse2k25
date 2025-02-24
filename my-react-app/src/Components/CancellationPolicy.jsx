import React from 'react';

const CancellationPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 text-gray-100">
      <h1 className="text-3xl font-bold mb-6">Cancellation and Refund Policy</h1>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Event Registration Cancellation</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold mb-2">Cancellation Timeline</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Cancellations made 7 days or more before the event: Full refund minus processing fees</li>
              <li>Cancellations made 3-6 days before the event: 50% refund</li>
              <li>Cancellations made less than 72 hours before the event: No refund</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Refund Process</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold mb-2">How to Request a Refund</h3>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Log in to your account</li>
              <li>Navigate to "My Registrations"</li>
              <li>Select the registration you wish to cancel</li>
              <li>Click on "Request Refund"</li>
              <li>Fill in the required information</li>
            </ol>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
        <p>For refund-related queries:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Email: techniverse@rguktsklm.ac.in</li>
          <li>Response time: Within 48 hours</li>
        </ul>
      </section>

      <p className="text-sm text-gray-100 mt-8">Last updated: February 24, 2025</p>
    </div>
  );
};

export default CancellationPolicy;