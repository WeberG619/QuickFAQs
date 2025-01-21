import React from 'react';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        
        <div className="bg-white shadow rounded-lg p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Introduction</h2>
            <p className="text-gray-600">
              At QuickFAQs, we take your privacy seriously. This Privacy Policy explains how we collect,
              use, disclose, and safeguard your information when you use our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information We Collect</h2>
            <div className="space-y-4">
              <h3 className="text-xl font-medium text-gray-900">Personal Information</h3>
              <ul className="list-disc pl-5 text-gray-600 space-y-2">
                <li>Name and email address when you create an account</li>
                <li>Billing information when you subscribe to our service</li>
                <li>Communications between you and QuickFAQs</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900">Usage Information</h3>
              <ul className="list-disc pl-5 text-gray-600 space-y-2">
                <li>Log data and device information</li>
                <li>FAQ generation history and preferences</li>
                <li>Performance and interaction data</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Use Your Information</h2>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li>To provide and maintain our service</li>
              <li>To process your payments and prevent fraud</li>
              <li>To send you updates and marketing communications</li>
              <li>To improve our service and develop new features</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Security</h2>
            <p className="text-gray-600">
              We implement appropriate technical and organizational security measures to protect your
              personal information. However, no method of transmission over the Internet is 100% secure,
              and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Rights</h2>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li>Access and update your personal information</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of marketing communications</li>
              <li>Export your data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Cookies</h2>
            <p className="text-gray-600">
              We use cookies and similar tracking technologies to improve your experience on our website.
              You can control cookies through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to This Policy</h2>
            <p className="text-gray-600">
              We may update this Privacy Policy from time to time. We will notify you of any changes by
              posting the new Privacy Policy on this page and updating the "Last Updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-600">
              If you have any questions about this Privacy Policy, please contact us at:
              <br />
              Email: privacy@quickfaqs.com
              <br />
              Address: 123 Innovation Drive, Silicon Valley, CA 94025
            </p>
          </section>

          <div className="text-sm text-gray-500 mt-8">
            Last Updated: January 21, 2025
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
