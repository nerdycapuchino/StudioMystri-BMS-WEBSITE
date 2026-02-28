import React from 'react';

export default function Shipping() {
  return (
    <div className="min-h-screen bg-[#f8f7f6] pt-20 pb-32">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="font-serif text-5xl text-[#211d11] mb-12 text-center">Shipping & Returns</h1>
        
        <div className="space-y-12">
          <section>
            <h2 className="text-xl font-serif text-[#211d11] mb-4">Shipping Policy</h2>
            <p className="text-[#8c8c8c] font-light leading-relaxed mb-4">
              We offer complimentary white-glove delivery on all furniture orders within the continental United States. 
              For international orders, please contact our support team for a custom quote.
            </p>
            <p className="text-[#8c8c8c] font-light leading-relaxed">
              In-stock items typically ship within 3-5 business days. Custom or made-to-order pieces have lead times ranging from 8-12 weeks.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-[#211d11] mb-4">Return Policy</h2>
            <p className="text-[#8c8c8c] font-light leading-relaxed mb-4">
              We want you to love your purchase. If you are not completely satisfied, we accept returns on standard items within 30 days of delivery.
              Items must be in original condition and packaging.
            </p>
            <p className="text-[#8c8c8c] font-light leading-relaxed">
              Custom orders are final sale and cannot be returned. A restocking fee of 15% applies to all furniture returns.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-[#211d11] mb-4">Damaged Items</h2>
            <p className="text-[#8c8c8c] font-light leading-relaxed">
              Please inspect your order upon delivery. If you notice any damage, please document it with photos and contact us immediately at support@studiomystri.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
