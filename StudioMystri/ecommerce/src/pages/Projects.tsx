import React from 'react';

export default function Projects() {
  return (
    <div className="min-h-screen bg-[#f8f7f6] pt-20 pb-32">
      <div className="max-w-[1800px] mx-auto px-6">
        <h1 className="font-serif text-5xl text-[#211d11] mb-12 text-center">Our Projects</h1>
        <p className="text-[#8c8c8c] text-center max-w-xl mx-auto mb-20 font-light">
          Explore a selection of our recent interior design projects, showcasing our commitment to timeless elegance and functional beauty.
        </p>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Project 1 */}
          <div className="group cursor-pointer">
            <div className="aspect-[4/3] overflow-hidden mb-6">
              <img 
                src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1600&auto=format&fit=crop" 
                alt="Modern Minimalist Apartment" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <h3 className="font-serif text-2xl text-[#211d11] mb-2 group-hover:text-[#e8ba30] transition-colors">The Minimalist Loft</h3>
            <p className="text-xs uppercase tracking-[0.2em] text-[#8c8c8c]">New York, NY</p>
          </div>

          {/* Project 2 */}
          <div className="group cursor-pointer">
            <div className="aspect-[4/3] overflow-hidden mb-6">
              <img 
                src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1600&auto=format&fit=crop" 
                alt="Coastal Retreat" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <h3 className="font-serif text-2xl text-[#211d11] mb-2 group-hover:text-[#e8ba30] transition-colors">Coastal Retreat</h3>
            <p className="text-xs uppercase tracking-[0.2em] text-[#8c8c8c]">Hamptons, NY</p>
          </div>

          {/* Project 3 */}
          <div className="group cursor-pointer">
            <div className="aspect-[4/3] overflow-hidden mb-6">
              <img 
                src="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=1600&auto=format&fit=crop" 
                alt="Urban Sanctuary" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <h3 className="font-serif text-2xl text-[#211d11] mb-2 group-hover:text-[#e8ba30] transition-colors">Urban Sanctuary</h3>
            <p className="text-xs uppercase tracking-[0.2em] text-[#8c8c8c]">London, UK</p>
          </div>

          {/* Project 4 */}
          <div className="group cursor-pointer">
            <div className="aspect-[4/3] overflow-hidden mb-6">
              <img 
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600&auto=format&fit=crop" 
                alt="Mid-Century Modern Renovation" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <h3 className="font-serif text-2xl text-[#211d11] mb-2 group-hover:text-[#e8ba30] transition-colors">Mid-Century Modern Renovation</h3>
            <p className="text-xs uppercase tracking-[0.2em] text-[#8c8c8c]">Palm Springs, CA</p>
          </div>
        </div>
      </div>
    </div>
  );
}
