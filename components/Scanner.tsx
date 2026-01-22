
import React, { useState, useRef, useEffect } from 'react';
import { Scan, X, Zap } from 'lucide-react';

export const Scanner: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scanning, setScanning] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = async () => {
    setScanning(true);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error(err);
      setError("Unable to access camera. Please allow permissions.");
      setScanning(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    setScanning(false);
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const simulateDetection = () => {
      setLastResult(`SKU-${Math.floor(Math.random() * 99999)}`);
      // In a real app, a barcode detection library would trigger this
  };

  return (
    <div className="h-full flex flex-col bg-black text-white p-4">
      <div className="flex justify-between items-center mb-4">
         <h2 className="text-2xl font-black uppercase tracking-tighter">Universal Scanner</h2>
         <div className="flex gap-2">
             <button onClick={simulateDetection} className="px-4 py-2 bg-white/10 rounded-full text-xs font-bold uppercase hover:bg-white/20">Simulate Read</button>
             {scanning ? (
                 <button onClick={stopCamera} className="px-4 py-2 bg-red-600 rounded-full text-xs font-bold uppercase hover:bg-red-700">Stop</button>
             ) : (
                 <button onClick={startCamera} className="px-4 py-2 bg-green-600 rounded-full text-xs font-bold uppercase hover:bg-green-700">Start</button>
             )}
         </div>
      </div>

      <div className="flex-1 relative bg-zinc-900 rounded-[2rem] overflow-hidden border border-white/10 flex flex-col items-center justify-center">
          {error ? (
              <div className="text-red-500 text-center p-8 font-bold">{error}</div>
          ) : (
              <>
                <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover opacity-80" />
                
                {/* Overlay UI */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <div className="w-64 h-64 border-2 border-primary/50 rounded-3xl relative">
                        <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary -mt-1 -ml-1 rounded-tl-xl"></div>
                        <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary -mt-1 -mr-1 rounded-tr-xl"></div>
                        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary -mb-1 -ml-1 rounded-bl-xl"></div>
                        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary -mb-1 -mr-1 rounded-br-xl"></div>
                        
                        {scanning && <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-red-500 shadow-[0_0_10px_red] animate-pulse"></div>}
                    </div>
                    <p className="mt-8 bg-black/60 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest text-zinc-300 backdrop-blur-sm">Align code within frame</p>
                </div>
              </>
          )}
      </div>

      {lastResult && (
          <div className="mt-4 p-6 bg-surface-dark border border-white/10 rounded-2xl flex justify-between items-center animate-fade-in-up">
              <div>
                  <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Last Scan</p>
                  <p className="text-2xl font-mono font-black text-primary">{lastResult}</p>
              </div>
              <div className="flex gap-2">
                  <button onClick={() => navigator.clipboard.writeText(lastResult)} className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold text-sm transition-colors">Copy</button>
                  <button onClick={() => setLastResult(null)} className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold text-sm transition-colors"><X className="w-4 h-4"/></button>
              </div>
          </div>
      )}
    </div>
  );
};
