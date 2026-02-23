
import React, { useState, useEffect } from 'react';
import { Scan, X, Zap } from 'lucide-react';

export const Scanner: React.FC = () => {
  const [scanning, setScanning] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let scanner: any;

    if (scanning) {
        // Dynamic import logic simulation for HTML5-QRCode
        // The script is loaded in index.html, so we access via window
        const Html5QrcodeScanner = (window as any).Html5QrcodeScanner;

        if (Html5QrcodeScanner) {
            scanner = new Html5QrcodeScanner(
                "reader", 
                { fps: 10, qrbox: { width: 250, height: 250 } },
                /* verbose= */ false
            );

            scanner.render(
                (decodedText: string) => {
                    setLastResult(decodedText);
                    setScanning(false);
                    scanner.clear();
                },
                (errorMessage: string) => {
                    // console.warn(errorMessage);
                }
            );
        } else {
            setError("Scanner library not loaded.");
        }
    }

    return () => {
        if (scanner) {
            scanner.clear().catch((error: any) => console.error("Failed to clear scanner", error));
        }
    };
  }, [scanning]);

  const startScan = () => {
      setScanning(true);
      setLastResult(null);
      setError(null);
  };

  const stopScan = () => {
      setScanning(false);
      // Force reload to clear camera stream if library doesn't handle it well in React cleanup
      window.location.reload(); 
  };

  return (
    <div className="h-full flex flex-col bg-black text-slate-800 p-4">
      <div className="flex justify-between items-center mb-4">
         <h2 className="text-2xl font-black uppercase tracking-tighter">Universal Scanner</h2>
         <div className="flex gap-2">
             {!scanning && (
                 <button onClick={startScan} className="px-6 py-2 bg-primary text-black rounded-full text-xs font-bold uppercase hover:bg-green-600 transition-colors shadow-glow">
                    Active Camera
                 </button>
             )}
             {scanning && (
                 <button onClick={() => setScanning(false)} className="px-6 py-2 bg-red-600 text-slate-800 rounded-full text-xs font-bold uppercase hover:bg-red-700 transition-colors">
                    Stop
                 </button>
             )}
         </div>
      </div>

      <div className="flex-1 relative bg-slate-50 rounded-[2rem] overflow-hidden border border-slate-200 flex flex-col items-center justify-center">
          {scanning ? (
              <div id="reader" className="w-full max-w-md"></div>
          ) : (
              <div className="text-center p-8">
                  <div className="size-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-200">
                      <Scan className="w-10 h-10 text-slate-500" />
                  </div>
                  <p className="text-slate-500 font-bold mb-2">Ready to Scan</p>
                  <p className="text-slate-400 text-xs">Supports QR, EAN, UPC, Code 128</p>
              </div>
          )}
          {error && <p className="text-red-500 mt-4 font-bold">{error}</p>}
      </div>

      {lastResult && (
          <div className="mt-4 p-6 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl flex justify-between items-center animate-fade-in-up">
              <div>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Decoded Result</p>
                  <p className="text-2xl font-mono font-black text-primary break-all">{lastResult}</p>
              </div>
              <div className="flex gap-2">
                  <button onClick={() => navigator.clipboard.writeText(lastResult)} className="px-6 py-3 bg-slate-50 hover:bg-slate-100 rounded-xl font-bold text-sm transition-colors">Copy</button>
                  <button onClick={() => setLastResult(null)} className="px-6 py-3 bg-slate-50 hover:bg-slate-100 rounded-xl font-bold text-sm transition-colors"><X className="w-4 h-4"/></button>
              </div>
          </div>
      )}
    </div>
  );
};
