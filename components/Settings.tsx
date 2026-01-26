import React, { useState } from 'react';
import { useGlobal } from '../context/GlobalContext';
import { Settings as SettingsIcon, Upload, Image as ImageIcon, CreditCard, Save, Check } from 'lucide-react';

export const Settings: React.FC = () => {
  const { formatCurrency } = useGlobal();
  const [logoUrl, setLogoUrl] = useState(localStorage.getItem('companyLogo') || '');
  const [backgroundUrl, setBackgroundUrl] = useState(localStorage.getItem('companyBackground') || '');
  const [razorpayKey, setRazorpayKey] = useState(localStorage.getItem('razorpayKey') || '');
  const [razorpaySecret, setRazorpaySecret] = useState(localStorage.getItem('razorpaySecret') || '');
  const [saved, setSaved] = useState(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBackgroundUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    localStorage.setItem('companyLogo', logoUrl);
    localStorage.setItem('companyBackground', backgroundUrl);
    localStorage.setItem('razorpayKey', razorpayKey);
    localStorage.setItem('razorpaySecret', razorpaySecret);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="h-full flex flex-col relative bg-background-dark text-white p-6 md:p-10 overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">System Settings</h2>
          <p className="text-zinc-400 text-sm mt-1">Configure branding and payment integrations</p>
        </div>
        {saved && (
          <div className="flex items-center gap-2 bg-green-500/20 text-green-500 px-4 py-2 rounded-full border border-green-500/30">
            <Check className="w-4 h-4" />
            <span className="text-sm font-bold">Saved Successfully!</span>
          </div>
        )}
      </div>

      <div className="space-y-6 max-w-4xl">
        {/* Branding Section */}
        <div className="bg-surface-dark border border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="size-10 bg-primary/20 rounded-full flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Company Branding</h3>
              <p className="text-zinc-500 text-sm">Upload your logo and background image</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-bold text-zinc-400 mb-2">Company Logo</label>
              <div className="relative bg-white/5 border-2 border-dashed border-white/10 rounded-xl p-6 hover:border-primary/50 transition-colors">
                {logoUrl ? (
                  <div className="relative">
                    <img src={logoUrl} alt="Logo" className="w-full h-32 object-contain rounded" />
                    <button 
                      onClick={() => setLogoUrl('')}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                    <p className="text-sm text-zinc-500">Click or drag to upload</p>
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
              <input 
                type="text"
                placeholder="Or paste image URL"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="w-full mt-2 bg-black/20 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-primary"
              />
            </div>

            {/* Background Upload */}
            <div>
              <label className="block text-sm font-bold text-zinc-400 mb-2">Background Image</label>
              <div className="relative bg-white/5 border-2 border-dashed border-white/10 rounded-xl p-6 hover:border-primary/50 transition-colors">
                {backgroundUrl ? (
                  <div className="relative">
                    <img src={backgroundUrl} alt="Background" className="w-full h-32 object-cover rounded" />
                    <button 
                      onClick={() => setBackgroundUrl('')}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                    <p className="text-sm text-zinc-500">Click or drag to upload</p>
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleBackgroundUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
              <input 
                type="text"
                placeholder="Or paste image URL"
                value={backgroundUrl}
                onChange={(e) => setBackgroundUrl(e.target.value)}
                className="w-full mt-2 bg-black/20 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Razorpay Integration */}
        <div className="bg-surface-dark border border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="size-10 bg-blue-500/20 rounded-full flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Razorpay Integration</h3>
              <p className="text-zinc-500 text-sm">Configure payment gateway credentials</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-zinc-400 mb-2">Razorpay Key ID</label>
              <input 
                type="text"
                placeholder="rzp_test_xxxxxxxxxxxxx"
                value={razorpayKey}
                onChange={(e) => setRazorpayKey(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-zinc-400 mb-2">Razorpay Secret Key</label>
              <input 
                type="password"
                placeholder="•••••••••••••••••••••"
                value={razorpaySecret}
                onChange={(e) => setRazorpaySecret(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary font-mono text-sm"
              />
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mt-4">
              <p className="text-sm text-blue-400">
                <strong>Note:</strong> Get your Razorpay credentials from{' '}
                <a href="https://dashboard.razorpay.com/" target="_blank" rel="noopener" className="underline">
                  Razorpay Dashboard
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button 
            onClick={handleSave}
            className="px-8 py-4 bg-primary text-black font-black uppercase text-sm tracking-widest rounded-xl shadow-glow hover:scale-105 transition-all flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            Save All Settings
          </button>
        </div>
      </div>
    </div>
  );
};
