import React from 'react';

export default function FAQ() {
  return (
    <div className="min-h-screen bg-[#f8f7f6] pt-20 pb-32">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="font-serif text-5xl text-[#211d11] mb-12 text-center">Frequently Asked Questions</h1>
        
        <div className="space-y-12">
          <section>
            <h2 className="text-xl font-serif text-[#211d11] mb-4">Do you ship internationally?</h2>
            <p className="text-[#8c8c8c] font-light leading-relaxed">
              Yes, we ship to most countries. Please contact us for a custom shipping quote.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-[#211d11] mb-4">What is your return policy?</h2>
            <p className="text-[#8c8c8c] font-light leading-relaxed">
              We accept returns on standard items within 30 days of delivery. Custom orders are final sale.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-[#211d11] mb-4">Can I customize my order?</h2>
            <p className="text-[#8c8c8c] font-light leading-relaxed">
              Many of our pieces can be customized with different finishes, fabrics, and dimensions. 
              Please contact our design team to discuss your specific requirements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-[#211d11] mb-4">Do you offer trade discounts?</h2>
            <p className="text-[#8c8c8c] font-light leading-relaxed">
              Yes, we offer a trade program for interior designers, architects, and other industry professionals.
              Please apply for a trade account on our website.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
