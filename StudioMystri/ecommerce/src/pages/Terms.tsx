import React from 'react';

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#f8f7f6] pt-20 pb-32">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="font-serif text-5xl text-[#211d11] mb-12 text-center">Terms of Service</h1>
        
        <div className="space-y-12">
          <section>
            <h2 className="text-xl font-serif text-[#211d11] mb-4">Acceptance of Terms</h2>
            <p className="text-[#8c8c8c] font-light leading-relaxed mb-4">
              By accessing or using our website, you agree to be bound by these Terms of Service.
              If you do not agree to these terms, please do not use our website.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-[#211d11] mb-4">Intellectual Property</h2>
            <p className="text-[#8c8c8c] font-light leading-relaxed mb-4">
              All content on our website, including text, images, logos, and designs, is the property of Studio Mystri or its licensors and is protected by copyright and other intellectual property laws.
            </p>
            <p className="text-[#8c8c8c] font-light leading-relaxed">
              You may not reproduce, distribute, or modify any content without our prior written consent.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-[#211d11] mb-4">Limitation of Liability</h2>
            <p className="text-[#8c8c8c] font-light leading-relaxed">
              Studio Mystri shall not be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with your use of our website or products.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
