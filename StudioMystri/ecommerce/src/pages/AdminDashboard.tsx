import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [product, setProduct] = useState({
    name: '',
    description: '',
    base_price: '',
    category: '',
    subcategory: '',
    images: [''],
    variants: [{ name: '', price_modifier: 0, stock: 0 }]
  });

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f7f6]">
        <div className="text-center">
          <h2 className="font-serif text-2xl mb-4">Access Denied</h2>
          <p className="mb-4">You must be an administrator to view this page.</p>
          <button onClick={() => navigate('/')} className="text-[#e8ba30] underline">Go Home</button>
        </div>
      </div>
    );
  }

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...product.images];
    newImages[index] = value;
    setProduct({ ...product, images: newImages });
  };

  const addImageField = () => {
    setProduct({ ...product, images: [...product.images, ''] });
  };

  const removeImageField = (index: number) => {
    const newImages = product.images.filter((_, i) => i !== index);
    setProduct({ ...product, images: newImages });
  };

  const handleVariantChange = (index: number, field: string, value: any) => {
    const newVariants = [...product.variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setProduct({ ...product, variants: newVariants });
  };

  const addVariant = () => {
    setProduct({ ...product, variants: [...product.variants, { name: '', price_modifier: 0, stock: 0 }] });
  };

  const removeVariant = (index: number) => {
    const newVariants = product.variants.filter((_, i) => i !== index);
    setProduct({ ...product, variants: newVariants });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...product,
          base_price: parseFloat(product.base_price),
          images: product.images.filter(img => img.trim() !== '')
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('Product created successfully!');
        setProduct({
          name: '',
          description: '',
          base_price: '',
          category: '',
          subcategory: '',
          images: [''],
          variants: [{ name: '', price_modifier: 0, stock: 0 }]
        });
      } else {
        setError(data.error || 'Failed to create product');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f7f6] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-serif text-3xl text-[#211d11]">Admin Dashboard</h1>
          <button onClick={() => navigate('/dashboard')} className="flex items-center text-sm text-[#8c8c8c] hover:text-[#211d11]">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
          </button>
        </div>

        <div className="bg-white p-8 shadow-sm border border-[#211d11]/5 rounded-lg">
          <h2 className="font-serif text-xl mb-6 border-b border-[#211d11]/10 pb-4">Add New Product</h2>

          {message && <div className="bg-green-50 text-green-600 p-4 mb-6 rounded">{message}</div>}
          {error && <div className="bg-red-50 text-red-600 p-4 mb-6 rounded">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#8c8c8c] mb-2">Product Name</label>
                <input
                  type="text"
                  required
                  value={product.name}
                  onChange={e => setProduct({ ...product, name: e.target.value })}
                  className="w-full border-b border-[#211d11]/20 py-2 focus:outline-none focus:border-[#e8ba30] bg-transparent"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#8c8c8c] mb-2">Base Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={product.base_price}
                  onChange={e => setProduct({ ...product, base_price: e.target.value })}
                  className="w-full border-b border-[#211d11]/20 py-2 focus:outline-none focus:border-[#e8ba30] bg-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#8c8c8c] mb-2">Description</label>
              <textarea
                rows={4}
                value={product.description}
                onChange={e => setProduct({ ...product, description: e.target.value })}
                className="w-full border border-[#211d11]/20 p-3 rounded focus:outline-none focus:border-[#e8ba30] bg-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#8c8c8c] mb-2">Category</label>
                <input
                  type="text"
                  value={product.category}
                  onChange={e => setProduct({ ...product, category: e.target.value })}
                  className="w-full border-b border-[#211d11]/20 py-2 focus:outline-none focus:border-[#e8ba30] bg-transparent"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#8c8c8c] mb-2">Subcategory</label>
                <input
                  type="text"
                  value={product.subcategory}
                  onChange={e => setProduct({ ...product, subcategory: e.target.value })}
                  className="w-full border-b border-[#211d11]/20 py-2 focus:outline-none focus:border-[#e8ba30] bg-transparent"
                />
              </div>
            </div>

            {/* Images */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#8c8c8c] mb-2">Image URLs</label>
              {product.images.map((img, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={img}
                    onChange={e => handleImageChange(index, e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="flex-1 border-b border-[#211d11]/20 py-2 focus:outline-none focus:border-[#e8ba30] bg-transparent"
                  />
                  <button type="button" onClick={() => removeImageField(index)} className="text-red-500 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button type="button" onClick={addImageField} className="text-xs flex items-center text-[#e8ba30] hover:text-[#c59d24] mt-2">
                <Plus className="h-3 w-3 mr-1" /> Add Image URL
              </button>
            </div>

            {/* Variants */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#8c8c8c] mb-4">Variants</label>
              {product.variants.map((variant, index) => (
                <div key={index} className="grid grid-cols-12 gap-4 mb-4 items-end bg-gray-50 p-4 rounded">
                  <div className="col-span-5">
                    <label className="text-[10px] text-gray-500">Name</label>
                    <input
                      type="text"
                      value={variant.name}
                      onChange={e => handleVariantChange(index, 'name', e.target.value)}
                      className="w-full border-b border-gray-300 py-1 bg-transparent"
                    />
                  </div>
                  <div className="col-span-3">
                    <label className="text-[10px] text-gray-500">Price Modifier</label>
                    <input
                      type="number"
                      value={variant.price_modifier}
                      onChange={e => handleVariantChange(index, 'price_modifier', parseFloat(e.target.value))}
                      className="w-full border-b border-gray-300 py-1 bg-transparent"
                    />
                  </div>
                  <div className="col-span-3">
                    <label className="text-[10px] text-gray-500">Stock</label>
                    <input
                      type="number"
                      value={variant.stock}
                      onChange={e => handleVariantChange(index, 'stock', parseInt(e.target.value))}
                      className="w-full border-b border-gray-300 py-1 bg-transparent"
                    />
                  </div>
                  <div className="col-span-1">
                    <button type="button" onClick={() => removeVariant(index)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addVariant} className="text-xs flex items-center text-[#e8ba30] hover:text-[#c59d24]">
                <Plus className="h-3 w-3 mr-1" /> Add Variant
              </button>
            </div>

            <div className="pt-6 border-t border-[#211d11]/10">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#211d11] text-white py-4 uppercase tracking-[0.2em] text-xs hover:bg-[#e8ba30] transition-colors duration-300 flex items-center justify-center gap-2"
              >
                {loading ? 'Creating...' : 'Create Product'} <Save className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
