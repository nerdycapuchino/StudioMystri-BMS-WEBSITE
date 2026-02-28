import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Filter, ChevronDown, Plus, Eye } from 'lucide-react';
import { getProducts } from '../lib/api';

interface Product {
  id: string;
  slug?: string;
  name: string;
  price: number;
  discountPrice?: number;
  images?: string[];
  image?: string;
  hoverImage?: string;
  category: string;
  tag?: string;
  stockQuantity?: number;
}

// Mock data to match the design aesthetic
const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'The Sculpted Chair',
    price: 2450,
    category: 'Seating',
    image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=1000&auto=format&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?q=80&w=1000&auto=format&fit=crop',
    tag: 'Best Seller'
  },
  {
    id: '2',
    name: 'Velvet Lounge Sofa',
    price: 4800,
    category: 'Seating',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=1000&auto=format&fit=crop',
    tag: 'New Arrival'
  },
  {
    id: '3',
    name: 'Minimalist Stool',
    price: 850,
    category: 'Seating',
    image: 'https://images.unsplash.com/photo-1503602642458-232111445840?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: '4',
    name: 'The Accent Armchair',
    price: 1950,
    category: 'Seating',
    image: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?q=80&w=1000&auto=format&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: '5',
    name: 'Bouclé Dining Chair',
    price: 1200,
    category: 'Seating',
    image: 'https://images.unsplash.com/photo-1519947486511-46149fa0a254?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: '6',
    name: 'Leather Ottoman',
    price: 950,
    category: 'Seating',
    image: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: '7',
    name: 'Marble Coffee Table',
    price: 3200,
    category: 'Tables',
    image: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: '8',
    name: 'Arco Floor Lamp',
    price: 3695,
    category: 'Lighting',
    image: 'https://images.unsplash.com/photo-1513506003011-3b03c8b512a4?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: '9',
    name: 'Ceramic Vase',
    price: 150,
    category: 'Objects',
    image: 'https://images.unsplash.com/photo-1612196808214-b7e239e5f6b7?q=80&w=1000&auto=format&fit=crop'
  }
];

export default function ProductList() {
  const { category } = useParams<{ category: string }>();
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const result = await getProducts();
        if (result.data && result.data.length > 0) {
          const mapped = result.data.map((p: any) => ({
            ...p,
            image: p.images?.[0] || '',
            hoverImage: p.images?.[1] || undefined,
          }));
          if (category) {
            const filtered = mapped.filter((p: Product) => p.category.toLowerCase() === category.toLowerCase());
            setProducts(filtered.length > 0 ? filtered : mapped);
          } else {
            setProducts(mapped);
          }
        } else {
          // Fallback to mock data
          if (category) {
            const filtered = MOCK_PRODUCTS.filter(p => p.category.toLowerCase() === category.toLowerCase());
            setProducts(filtered.length > 0 ? filtered : MOCK_PRODUCTS);
          } else {
            setProducts(MOCK_PRODUCTS);
          }
        }
      } catch (err) {
        // Fallback to mock data on API error
        if (category) {
          const filtered = MOCK_PRODUCTS.filter(p => p.category.toLowerCase() === category.toLowerCase());
          setProducts(filtered.length > 0 ? filtered : MOCK_PRODUCTS);
        } else {
          setProducts(MOCK_PRODUCTS);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [category]);

  const getTitle = () => {
    if (!category) return "The Complete Collection";
    return `The ${category.charAt(0).toUpperCase() + category.slice(1)} Collection`;
  };

  return (
    <div className="bg-[#f8f7f6] min-h-screen pb-20">
      {/* Header */}
      <div className="pt-32 pb-16 px-6 text-center max-w-4xl mx-auto">
        <span className="text-[#e8ba30] text-xs uppercase tracking-[0.2em] block mb-4">Curated Collection</span>
        <h1 className="font-serif text-4xl md:text-6xl text-[#211d11] mb-6">{getTitle()}</h1>
        <p className="text-[#8c8c8c] font-light text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
          Discover our range of meticulously crafted pieces, where ergonomic comfort meets sculptural form.
          Each piece is designed to be a focal point in your living space.
        </p>
      </div>

      {/* Filters */}
      <div className="sticky top-20 z-40 bg-[#f8f7f6]/95 backdrop-blur-sm border-y border-[#211d11]/10 mb-12">
        <div className="max-w-[1800px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <button className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#211d11] hover:text-[#e8ba30] transition-colors">
              <Filter className="h-3 w-3" /> Filter
            </button>
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/shop/seating" className={`text-xs uppercase tracking-[0.2em] hover:text-[#211d11] transition-colors ${category === 'seating' ? 'text-[#211d11] font-bold' : 'text-[#8c8c8c]'}`}>
                Seating
              </Link>
              <Link to="/shop/tables" className={`text-xs uppercase tracking-[0.2em] hover:text-[#211d11] transition-colors ${category === 'tables' ? 'text-[#211d11] font-bold' : 'text-[#8c8c8c]'}`}>
                Tables
              </Link>
              <Link to="/shop/lighting" className={`text-xs uppercase tracking-[0.2em] hover:text-[#211d11] transition-colors ${category === 'lighting' ? 'text-[#211d11] font-bold' : 'text-[#8c8c8c]'}`}>
                Lighting
              </Link>
              <Link to="/shop/objects" className={`text-xs uppercase tracking-[0.2em] hover:text-[#211d11] transition-colors ${category === 'objects' ? 'text-[#211d11] font-bold' : 'text-[#8c8c8c]'}`}>
                Objects
              </Link>
            </div>
          </div>
          <button className="flex items-center gap-1 text-xs uppercase tracking-[0.2em] text-[#211d11] hover:text-[#e8ba30] transition-colors">
            Sort By <ChevronDown className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-[1800px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <Link to={`/product/${product.slug || product.id}`} className="block">
                <div className="relative aspect-[3/4] overflow-hidden bg-[#e5e5e5] mb-6">
                  {product.tag && (
                    <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur px-3 py-1.5">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-[#211d11]">{product.tag}</span>
                    </div>
                  )}

                  <img
                    src={product.image}
                    alt={product.name}
                    className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${product.hoverImage ? 'group-hover:opacity-0' : ''}`}
                  />

                  {product.hoverImage && (
                    <img
                      src={product.hoverImage}
                      alt={product.name}
                      className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700 group-hover:scale-105"
                    />
                  )}

                  {/* Action Overlay */}
                  <div className="absolute bottom-0 left-0 w-full p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex gap-2">
                    <button className="flex-1 bg-white/90 backdrop-blur text-[#211d11] py-3 text-xs uppercase tracking-[0.2em] hover:bg-[#211d11] hover:text-white transition-colors flex items-center justify-center gap-2">
                      <Plus className="h-3 w-3" /> Add
                    </button>
                    <button className="flex-1 bg-[#211d11]/90 backdrop-blur text-white py-3 text-xs uppercase tracking-[0.2em] hover:bg-[#e8ba30] hover:text-[#211d11] transition-colors flex items-center justify-center gap-2">
                      <Eye className="h-3 w-3" /> View Item
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-serif text-xl text-[#211d11] mb-1 group-hover:text-[#e8ba30] transition-colors">{product.name}</h3>
                    <p className="text-xs uppercase tracking-[0.2em] text-[#8c8c8c]">{product.category}</p>
                  </div>
                  <span className="text-sm font-medium text-[#211d11]">${product.price.toLocaleString()}</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Load More */}
        <div className="mt-20 text-center">
          <button className="inline-block border-b border-[#211d11] pb-1 text-[#211d11] text-xs uppercase tracking-[0.2em] hover:text-[#e8ba30] hover:border-[#e8ba30] transition-colors">
            Load More Products
          </button>
        </div>
      </div>
    </div>
  );
}
