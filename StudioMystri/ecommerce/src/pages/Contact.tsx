import React from 'react';
import { Link } from 'react-router-dom';

export default function Contact() {
  return (
    <div className="min-h-screen bg-[#f8f7f6] pt-20 pb-32">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="font-serif text-5xl text-[#211d11] mb-8 text-center">Contact Us</h1>
        <p className="text-[#8c8c8c] text-center max-w-xl mx-auto mb-16 font-light">
          We are here to assist you with any inquiries regarding our products, orders, or services.
        </p>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div>
              <h3 className="text-xs uppercase tracking-[0.2em] text-[#211d11] mb-4 font-bold">General Inquiries</h3>
              <p className="text-[#8c8c8c] font-light">hello@studiomystri.com</p>
              <p className="text-[#8c8c8c] font-light">+1 (555) 123-4567</p>
            </div>
            <div>
              <h3 className="text-xs uppercase tracking-[0.2em] text-[#211d11] mb-4 font-bold">Visit Our Showroom</h3>
              <p className="text-[#8c8c8c] font-light">123 Design District Blvd</p>
              <p className="text-[#8c8c8c] font-light">New York, NY 10013</p>
              <p className="text-[#8c8c8c] font-light mt-2">Mon-Fri: 10am - 6pm</p>
              <p className="text-[#8c8c8c] font-light">Sat: 11am - 5pm</p>
            </div>
          </div>

          <form className="space-y-6">
            <div>
              <label className="block text-xs uppercase tracking-[0.2em] text-[#8c8c8c] mb-2">Name</label>
              <input type="text" className="w-full bg-transparent border-b border-[#211d11]/20 py-2 focus:outline-none focus:border-[#e8ba30]" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.2em] text-[#8c8c8c] mb-2">Email</label>
              <input type="email" className="w-full bg-transparent border-b border-[#211d11]/20 py-2 focus:outline-none focus:border-[#e8ba30]" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.2em] text-[#8c8c8c] mb-2">Message</label>
              <textarea rows={4} className="w-full bg-transparent border border-[#211d11]/20 p-3 focus:outline-none focus:border-[#e8ba30]"></textarea>
            </div>
            <button className="bg-[#211d11] text-white px-8 py-3 text-xs uppercase tracking-[0.2em] hover:bg-[#e8ba30] transition-colors">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
