import React from 'react';

export default function Care() {
  return (
    <div className="min-h-screen bg-[#f8f7f6] pt-20 pb-32">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="font-serif text-5xl text-[#211d11] mb-12 text-center">Product Care</h1>
        
        <div className="space-y-12">
          <section>
            <h2 className="text-xl font-serif text-[#211d11] mb-4">Wood Furniture</h2>
            <p className="text-[#8c8c8c] font-light leading-relaxed mb-4">
              Dust regularly with a soft, dry cloth. Avoid direct sunlight and extreme humidity changes.
              Clean spills immediately with a damp cloth and mild soap if necessary.
            </p>
            <p className="text-[#8c8c8c] font-light leading-relaxed">
              We recommend using a high-quality wood polish or wax once a year to maintain the finish.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-[#211d11] mb-4">Upholstery</h2>
            <p className="text-[#8c8c8c] font-light leading-relaxed mb-4">
              Vacuum regularly using the upholstery attachment. Blot spills immediately with a clean, white cloth.
              Do not rub. Professional cleaning is recommended for deep stains.
            </p>
            <p className="text-[#8c8c8c] font-light leading-relaxed">
              Rotate cushions regularly to ensure even wear.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-[#211d11] mb-4">Marble & Stone</h2>
            <p className="text-[#8c8c8c] font-light leading-relaxed">
              Use coasters and placemats to protect surfaces from heat and moisture.
              Clean with a pH-neutral cleaner specifically designed for stone. Avoid acidic cleaners like vinegar or lemon juice.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
