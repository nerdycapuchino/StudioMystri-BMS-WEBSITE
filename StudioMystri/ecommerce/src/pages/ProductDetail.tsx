import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'motion/react';
import { Minus, Plus, ChevronDown, ArrowRight } from 'lucide-react';
import { getProductBySlug } from '../lib/api';

// Mock Data for the specific design
const MOCK_PRODUCT = {
  id: 'sculpted-marble-table',
  name: 'The Sculpted Marble Table',
  price: 3200,
  description: 'A masterpiece of form and function. Carved from a single block of Carrara marble, this table defies gravity with its cantilevered design. The honed finish offers a soft, tactile experience, while the natural veining ensures that no two pieces are exactly alike.',
  images: [
    'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1615529182904-14819c35db37?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=1000&auto=format&fit=crop'
  ],
  details: [
    'Solid Carrara marble',
    'Honed finish',
    'Dimensions: 48" W x 24" D x 16" H',
    'Weight: 180 lbs',
    'Hand-finished in Italy'
  ],
  shipping: 'White glove delivery included. Please allow 8-10 weeks for production and delivery. Returns accepted within 14 days of delivery, subject to a 20% restocking fee.'
};

const RELATED_PRODUCTS = [
  {
    id: 'velvet-armchair',
    name: 'Velvet Armchair',
    price: 1850,
    image: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 'brass-floor-lamp',
    name: 'Brass Floor Lamp',
    price: 650,
    image: 'https://images.unsplash.com/photo-1507473888900-52e1adad5468?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 'abstract-sculpture',
    name: 'Abstract Sculpture',
    price: 420,
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1000&auto=format&fit=crop'
  }
];

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<any>(MOCK_PRODUCT);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeAccordion, setActiveAccordion] = useState<string | null>('details');
  const { addItem } = useCart();
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;
      try {
        const result = await getProductBySlug(slug);
        if (result.data) {
          const p = result.data;
          setProduct({
            id: p.id,
            name: p.name,
            price: p.discountPrice || p.price,
            originalPrice: p.discountPrice ? p.price : undefined,
            description: p.description || p.seoDescription || '',
            images: p.images?.length > 0 ? p.images : MOCK_PRODUCT.images,
            details: [
              p.materials && `Materials: ${p.materials}`,
              p.dimensions && `Dimensions: ${p.dimensions}`,
              p.weight && `Weight: ${p.weight} kg`,
              `SKU: ${p.sku}`,
            ].filter(Boolean),
            shipping: MOCK_PRODUCT.shipping,
            category: p.category,
            variants: p.variants || [],
            stockQuantity: p.stockQuantity,
          });
        }
      } catch (err) {
        console.error('Failed to fetch product:', err);
        // Keep mock data as fallback
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#f8f7f6]">Loading...</div>;

  const handleAddToCart = () => {
    addItem({
      product_id: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.images[0]
    });
  };

  const toggleAccordion = (id: string) => {
    setActiveAccordion(activeAccordion === id ? null : id);
  };

  return (
    <div className="bg-[#f8f7f6] min-h-screen pb-20 pt-10">
      {/* Breadcrumbs */}
      <div className="max-w-[1800px] mx-auto px-6 mb-8">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[#8c8c8c]">
          <Link to="/" className="hover:text-[#211d11] transition-colors">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-[#211d11] transition-colors">Shop</Link>
          <span>/</span>
          <Link to="/shop/tables" className="hover:text-[#211d11] transition-colors">Tables</Link>
          <span>/</span>
          <span className="text-[#211d11]">{product.name}</span>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Gallery */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="aspect-[4/5] bg-[#e5e5e5] overflow-hidden relative"
            >
              <img
                src={product.images[currentImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </motion.div>
            <div className="grid grid-cols-3 gap-4">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImage(idx)}
                  className={`aspect-square bg-[#e5e5e5] overflow-hidden transition-all duration-300 ${currentImage === idx ? 'ring-1 ring-[#211d11]' : 'opacity-70 hover:opacity-100'}`}
                >
                  <img src={img} alt={`${product.name} ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col pt-8 lg:pt-0 lg:sticky lg:top-32 lg:h-fit">
            <span className="text-[#e8ba30] text-xs uppercase tracking-[0.2em] block mb-4">Limited Edition</span>
            <h1 className="font-serif text-4xl md:text-5xl text-[#211d11] mb-6 leading-tight">{product.name}</h1>
            <p className="text-2xl font-light text-[#211d11] mb-8">${product.price.toLocaleString()}</p>

            <p className="text-[#8c8c8c] font-light leading-relaxed mb-10 text-sm md:text-base">
              {product.description}
            </p>

            {/* Quantity & Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <div className="flex items-center border border-[#211d11]/20 w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-4 hover:bg-[#211d11]/5 transition-colors text-[#211d11]"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="px-4 font-medium min-w-[3rem] text-center text-[#211d11]">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-4 hover:bg-[#211d11]/5 transition-colors text-[#211d11]"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="flex-1 bg-[#211d11] text-white py-4 px-8 uppercase tracking-[0.2em] text-xs hover:bg-[#e8ba30] transition-colors duration-300"
              >
                Add to Bag
              </button>
            </div>

            {/* Accordions */}
            <div className="border-t border-[#211d11]/10">
              {/* Product Details */}
              <div className="border-b border-[#211d11]/10">
                <button
                  onClick={() => toggleAccordion('details')}
                  className="w-full py-6 flex justify-between items-center text-xs uppercase tracking-[0.2em] text-[#211d11] hover:text-[#e8ba30] transition-colors"
                >
                  Product Details
                  <motion.div
                    animate={{ rotate: activeAccordion === 'details' ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {activeAccordion === 'details' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <ul className="pb-6 text-sm text-[#8c8c8c] font-light space-y-2 list-disc list-inside">
                        {product.details.map((detail, idx) => (
                          <li key={idx}>{detail}</li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Shipping & Returns */}
              <div className="border-b border-[#211d11]/10">
                <button
                  onClick={() => toggleAccordion('shipping')}
                  className="w-full py-6 flex justify-between items-center text-xs uppercase tracking-[0.2em] text-[#211d11] hover:text-[#e8ba30] transition-colors"
                >
                  Shipping & Returns
                  <motion.div
                    animate={{ rotate: activeAccordion === 'shipping' ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {activeAccordion === 'shipping' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="pb-6 text-sm text-[#8c8c8c] font-light leading-relaxed">
                        {product.shipping}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* You May Also Like */}
        <div className="mt-32 mb-12">
          <div className="flex justify-between items-end mb-12">
            <h2 className="font-serif text-3xl md:text-4xl text-[#211d11]">You May <span className="italic text-[#8c8c8c]">Also Like</span></h2>
            <Link to="/shop" className="hidden md:flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#211d11] hover:text-[#e8ba30] transition-colors">
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {RELATED_PRODUCTS.map((item, index) => (
              <Link to={`/product/${item.id}`} key={index} className="group block">
                <div className="aspect-[3/4] overflow-hidden bg-[#e5e5e5] mb-4 relative">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                </div>
                <h3 className="font-serif text-xl text-[#211d11] mb-1 group-hover:text-[#e8ba30] transition-colors">{item.name}</h3>
                <p className="text-sm font-medium text-[#8c8c8c]">${item.price.toLocaleString()}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
