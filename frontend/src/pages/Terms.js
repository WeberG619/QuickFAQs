import React from 'react';

const Terms = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        
        <div className="bg-white shadow rounded-lg p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Agreement to Terms</h2>
            <p className="text-gray-600">
              By accessing or using QuickFAQs, you agree to be bound by these Terms of Service and all
              applicable laws and regulations. If you do not agree with any of these terms, you are
              prohibited from using or accessing this site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Use License</h2>
            <div className="space-y-4 text-gray-600">
              <p>
                Permission is granted to temporarily access QuickFAQs for personal, non-commercial
                transitory viewing only. This is the grant of a license, not a transfer of title, and
                under this license you may not:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose</li>
                <li>Attempt to decompile or reverse engineer any software</li>
                <li>Remove any copyright or proprietary notations</li>
                <li>Transfer the materials to another person</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Service Description</h2>
            <p className="text-gray-600">
              QuickFAQs provides an AI-powered FAQ generation platform. We reserve the right to modify,
              suspend, or discontinue any aspect of the service at any time without notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. User Accounts</h2>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li>You must be 18 years or older to use this service</li>
              <li>You are responsible for maintaining account security</li>
              <li>You must provide accurate and complete information</li>
              <li>You may not use another person's account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Payment Terms</h2>
            <div className="space-y-4 text-gray-600">
              <p>
                Subscription fees are billed in advance on a monthly or annual basis. All fees are
                non-refundable unless otherwise required by law.
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Prices are subject to change with notice</li>
                <li>You are responsible for all applicable taxes</li>
                <li>Subscriptions auto-renew unless cancelled</li>
                <li>Refunds are handled on a case-by-case basis</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Intellectual Property</h2>
            <p className="text-gray-600">
              The service and its original content, features, and functionality are owned by QuickFAQs
              and are protected by international copyright, trademark, patent, trade secret, and other
              intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Limitation of Liability</h2>
            <p className="text-gray-600">
              In no event shall QuickFAQs be liable for any indirect, incidental, special,
              consequential, or punitive damages arising out of or relating to your use of the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Termination</h2>
            <p className="text-gray-600">
              We may terminate or suspend your account and access to the service immediately, without
              prior notice, for conduct that we believe violates these Terms or is harmful to other
              users, us, or third parties, or for any other reason.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Governing Law</h2>
            <p className="text-gray-600">
              These Terms shall be governed by and construed in accordance with the laws of the State
              of California, without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Changes to Terms</h2>
            <p className="text-gray-600">
              We reserve the right to modify these terms at any time. We will notify you of any
              changes by posting the new Terms of Service on this page.
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

export default Terms;
