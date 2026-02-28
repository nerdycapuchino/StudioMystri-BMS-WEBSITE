import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, ChevronRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="bg-[#f8f7f6]">
      {/* Hero Section */}
      <section className="relative h-screen w-full overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=2674&auto=format&fit=crop" 
            alt="Minimalist Luxury Interior" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>
        
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center text-white px-6">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xs md:text-sm uppercase tracking-[0.3em] mb-6 font-light"
          >
            Est. 2024
          </motion.span>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="font-serif text-5xl md:text-7xl lg:text-8xl mb-8 leading-tight font-medium"
          >
            The Art of <br/> <span className="italic font-light">Living</span>
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Link 
              to="/shop" 
              className="group inline-flex items-center gap-3 border border-white/30 bg-white/10 backdrop-blur-sm px-8 py-4 text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-[#211d11] transition-all duration-300"
            >
              Explore Collection 
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white flex flex-col items-center gap-2"
        >
          <span className="text-[10px] uppercase tracking-[0.2em] opacity-70">Scroll</span>
          <div className="w-px h-12 bg-white/30 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1/2 bg-white animate-scroll-down"></div>
          </div>
        </motion.div>
      </section>

      {/* Signature Spaces */}
      <section className="py-24 md:py-32 px-6 max-w-[1800px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div>
            <span className="text-[#e8ba30] text-xs uppercase tracking-[0.2em] block mb-4">Curated Spaces</span>
            <h2 className="font-serif text-4xl md:text-5xl text-[#211d11]">Signature <span className="italic text-[#8c8c8c]">Interiors</span></h2>
          </div>
          <Link to="/projects" className="group flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#211d11] hover:text-[#e8ba30] transition-colors pb-1 border-b border-[#211d11]/20 hover:border-[#e8ba30]">
            View All Projects <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: "The Ravine House", location: "Toronto, Canada", image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2653&auto=format&fit=crop" },
            { title: "Azure Villa", location: "Nice, France", image: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?q=80&w=2670&auto=format&fit=crop" },
            { title: "Urban Loft", location: "New York, USA", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2670&auto=format&fit=crop" }
          ].map((project, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: index * 0.2, duration: 0.8 }}
              className="group cursor-pointer"
            >
              <div className="relative aspect-[4/5] overflow-hidden mb-6 bg-[#e5e5e5]">
                <img 
                  src={project.image} 
                  alt={project.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
              </div>
              <h3 className="font-serif text-2xl text-[#211d11] mb-2 group-hover:text-[#e8ba30] transition-colors">{project.title}</h3>
              <p className="text-xs uppercase tracking-[0.2em] text-[#8c8c8c]">{project.location}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Collection */}
      <section className="bg-[#211d11] text-white py-24 md:py-32 overflow-hidden">
        <div className="max-w-[1800px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative z-10 aspect-square max-w-xl mx-auto lg:mx-0"
              >
                <img 
                  src="https://images.unsplash.com/photo-1592078615290-033ee584e267?q=80&w=1000&auto=format&fit=crop" 
                  alt="Velvet Armchair" 
                  className="w-full h-full object-cover"
                />
              </motion.div>
              {/* Decorative Element */}
              <div className="absolute top-[-40px] left-[-40px] w-full h-full border border-[#e8ba30]/20 z-0 hidden md:block"></div>
            </div>
            
            <div className="order-1 lg:order-2">
              <motion.span 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-[#e8ba30] text-xs uppercase tracking-[0.2em] block mb-6"
              >
                New Arrival
              </motion.span>
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="font-serif text-4xl md:text-6xl mb-8 leading-tight"
              >
                The Velvet <br/> <span className="italic text-gray-400">Sanctuary</span>
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-gray-400 text-lg leading-relaxed mb-10 max-w-md font-light"
              >
                Crafted with Italian velvet and solid oak, this piece redefines comfort through sculptural form and meticulous detailing.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <Link 
                  to="/product/velvet-armchair" 
                  className="inline-block border-b border-[#e8ba30] pb-1 text-[#e8ba30] text-xs uppercase tracking-[0.2em] hover:text-white hover:border-white transition-colors"
                >
                  View Product Details
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-24 md:py-32 px-6 max-w-[1800px] mx-auto">
        <div className="text-center mb-20">
          <span className="text-[#e8ba30] text-xs uppercase tracking-[0.2em] block mb-4">Browse by Category</span>
          <h2 className="font-serif text-4xl md:text-5xl text-[#211d11]">Curated <span className="italic text-[#8c8c8c]">Collections</span></h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: "Seating", image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=1000&auto=format&fit=crop", link: "/shop/seating" },
            { title: "Tables", image: "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?q=80&w=1000&auto=format&fit=crop", link: "/shop/tables" },
            { title: "Lighting", image: "https://images.unsplash.com/photo-1513506003011-3b03c8b512a4?q=80&w=1000&auto=format&fit=crop", link: "/shop/lighting" },
            { title: "Objects", image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1000&auto=format&fit=crop", link: "/shop/objects" }
          ].map((category, index) => (
            <Link to={category.link} key={index} className="group relative aspect-[3/4] overflow-hidden block">
              <img 
                src={category.image} 
                alt={category.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500" />
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <h3 className="font-serif text-3xl text-white mb-2 italic">{category.title}</h3>
                <span className="text-[10px] uppercase tracking-[0.2em] text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 block">
                  Explore
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Journal / Stories */}
      <section className="bg-white py-24 md:py-32 border-t border-[#211d11]/5">
        <div className="max-w-[1800px] mx-auto px-6">
          <div className="flex justify-between items-end mb-16">
            <h2 className="font-serif text-4xl md:text-5xl text-[#211d11]">Journal <span className="italic text-[#8c8c8c]">& Stories</span></h2>
            <Link to="/journal" className="hidden md:flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#211d11] hover:text-[#e8ba30] transition-colors">
              Read All Articles <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { 
                title: "The Philosophy of Minimalism", 
                excerpt: "Exploring how less becomes more in contemporary interior design.",
                date: "Oct 12, 2023",
                image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=1000&auto=format&fit=crop"
              },
              { 
                title: "Sustainable Craftsmanship", 
                excerpt: "Why we choose materials that respect the earth and stand the test of time.",
                date: "Sep 28, 2023",
                image: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?q=80&w=1000&auto=format&fit=crop"
              },
              { 
                title: "Lighting as Architecture", 
                excerpt: "How light shapes space and influences mood in modern homes.",
                date: "Sep 15, 2023",
                image: "https://images.unsplash.com/photo-1507473888900-52e1adad5468?q=80&w=1000&auto=format&fit=crop"
              }
            ].map((article, index) => (
              <article key={index} className="group cursor-pointer">
                <div className="aspect-[16/10] overflow-hidden mb-6 bg-[#f8f7f6]">
                  <img 
                    src={article.image} 
                    alt={article.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.2em] text-[#8c8c8c] mb-3">
                  <span>{article.date}</span>
                  <span className="w-8 h-px bg-[#211d11]/10"></span>
                  <span>Design</span>
                </div>
                <h3 className="font-serif text-2xl text-[#211d11] mb-3 group-hover:text-[#e8ba30] transition-colors leading-tight">
                  {article.title}
                </h3>
                <p className="text-sm text-[#8c8c8c] font-light leading-relaxed mb-4">
                  {article.excerpt}
                </p>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#211d11] border-b border-[#211d11]/20 pb-0.5 group-hover:border-[#e8ba30] group-hover:text-[#e8ba30] transition-colors">
                  Read Article
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
