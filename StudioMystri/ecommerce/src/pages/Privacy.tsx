import React from 'react';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#f8f7f6] pt-20 pb-32">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="font-serif text-5xl text-[#211d11] mb-12 text-center">Privacy Policy</h1>
        
        <div className="space-y-12">
          <section>
            <h2 className="text-xl font-serif text-[#211d11] mb-4">Information We Collect</h2>
            <p className="text-[#8c8c8c] font-light leading-relaxed mb-4">
              We collect personal information such as your name, email address, shipping address, and payment details when you place an order or create an account.
            </p>
            <p className="text-[#8c8c8c] font-light leading-relaxed">
              We also collect non-personal information about your browsing behavior on our website to improve our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-[#211d11] mb-4">How We Use Your Information</h2>
            <p className="text-[#8c8c8c] font-light leading-relaxed mb-4">
              We use your information to process your orders, communicate with you about your account, and send you marketing emails (if you opt-in).
            </p>
            <p className="text-[#8c8c8c] font-light leading-relaxed">
              We do not sell or rent your personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-[#211d11] mb-4">Security</h2>
            <p className="text-[#8c8c8c] font-light leading-relaxed">
              We implement reasonable security measures to protect your personal information from unauthorized access, use, or disclosure.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
