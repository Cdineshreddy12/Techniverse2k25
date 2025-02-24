import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 text-gray-100">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold mb-2">Personal Information</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>College/Institution details</li>
              <li>Student ID/Registration number</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold mb-2">Registration and Services</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Process event and workshop registrations</li>
              <li>Generate QR codes for event access</li>
              <li>Send confirmation emails and updates</li>
              <li>Provide customer support</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
        <p>For privacy-related concerns:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Email: techniverse@rguktsklm.ac.in</li>
          <li>Response time: Within 48 hours</li>
        </ul>
      </section>

      <p className="text-sm text-gray-100 mt-8">Last updated: February 24, 2025</p>
    </div>
  );
};

export default PrivacyPolicy;