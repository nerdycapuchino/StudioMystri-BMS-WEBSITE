import React from 'react';

export default function Journal() {
  return (
    <div className="min-h-screen bg-[#f8f7f6] pt-20 pb-32">
      <div className="max-w-[1800px] mx-auto px-6">
        <h1 className="font-serif text-5xl text-[#211d11] mb-12 text-center">The Journal</h1>
        <p className="text-[#8c8c8c] text-center max-w-xl mx-auto mb-20 font-light">
          Stories on design, architecture, and the art of living well.
        </p>

        <div className="grid md:grid-cols-3 gap-12">
          {/* Article 1 */}
          <div className="group cursor-pointer">
            <div className="aspect-[3/4] overflow-hidden mb-6">
              <img 
                src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1000&auto=format&fit=crop" 
                alt="The Art of Slow Living" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#e8ba30] mb-2">Lifestyle</p>
            <h3 className="font-serif text-2xl text-[#211d11] mb-4 group-hover:text-[#e8ba30] transition-colors">The Art of Slow Living</h3>
            <p className="text-[#8c8c8c] font-light text-sm line-clamp-3">
              In a world that values speed and efficiency, we explore the benefits of slowing down and savoring the moment. 
              Discover how to create a home that encourages mindfulness and relaxation.
            </p>
          </div>

          {/* Article 2 */}
          <div className="group cursor-pointer">
            <div className="aspect-[3/4] overflow-hidden mb-6">
              <img 
                src="https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?q=80&w=1000&auto=format&fit=crop" 
                alt="Designing with Natural Light" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#e8ba30] mb-2">Design</p>
            <h3 className="font-serif text-2xl text-[#211d11] mb-4 group-hover:text-[#e8ba30] transition-colors">Designing with Natural Light</h3>
            <p className="text-[#8c8c8c] font-light text-sm line-clamp-3">
              Natural light has a profound impact on our well-being and the atmosphere of our homes. 
              Learn how to maximize natural light in your space through strategic design choices.
            </p>
          </div>

          {/* Article 3 */}
          <div className="group cursor-pointer">
            <div className="aspect-[3/4] overflow-hidden mb-6">
              <img 
                src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1000&auto=format&fit=crop" 
                alt="The History of Mid-Century Modern" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#e8ba30] mb-2">History</p>
            <h3 className="font-serif text-2xl text-[#211d11] mb-4 group-hover:text-[#e8ba30] transition-colors">The History of Mid-Century Modern</h3>
            <p className="text-[#8c8c8c] font-light text-sm line-clamp-3">
              Mid-century modern design remains one of the most popular styles today. 
              We delve into the origins of this movement and its enduring appeal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
