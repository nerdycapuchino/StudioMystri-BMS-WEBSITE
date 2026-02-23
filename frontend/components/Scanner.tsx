import React, { useState, useEffect } from 'react';
import { Scan, X, Zap, Copy, RefreshCw, Camera } from 'lucide-react';
import { Badge } from './ui/Badge';
import { Card } from './ui/Card';

export const Scanner: React.FC = () => {
    const [scanning, setScanning] = useState(false);
    const [lastResult, setLastResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let scanner: any;

        if (scanning) {
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
                setError("Scanner engine not initialized. Please ensure network connectivity.");
            }
        }

        return () => {
            if (scanner) {
                scanner.clear().catch((error: any) => console.error("Failed to clear scanner", error));
            }
        };
    }, [scanning]);

    return (
        <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-950 p-6 md:p-10 font-display">
            <div className="mx-auto max-w-4xl w-full flex flex-col gap-8 h-full">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 shrink-0">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase">Intelligent Scanner</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Universal barcode and QR recognition for inventory & POS.</p>
                    </div>
                    <div className="flex gap-3">
                        {!scanning ? (
                            <button
                                onClick={() => { setScanning(true); setLastResult(null); setError(null); }}
                                className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-blue-600 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-primary/20"
                            >
                                <Camera className="w-4 h-4" /> Start Camera
                            </button>
                        ) : (
                            <button
                                onClick={() => setScanning(false)}
                                className="flex items-center gap-2 px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold transition-all"
                            >
                                <X className="w-4 h-4" /> Terminate Session
                            </button>
                        )}
                    </div>
                </div>

                {/* Scanner Viewport */}
                <div className="flex-1 relative bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col items-center justify-center min-h-[400px]">
                    {scanning ? (
                        <div id="reader" className="w-full max-w-md"></div>
                    ) : (
                        <div className="text-center p-12 animate-in fade-in duration-500">
                            <div className="size-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/20">
                                <Scan className="w-10 h-10 text-primary animate-pulse" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Systems Ready</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-[280px] mx-auto">
                                Place code within the frame after activating the optical interface.
                            </p>
                            <div className="mt-8 flex flex-wrap justify-center gap-2">
                                <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800">QR Code</Badge>
                                <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800">EAN-13</Badge>
                                <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800">UPC</Badge>
                                <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800">Code 128</Badge>
                            </div>
                        </div>
                    )}

                    {/* Scanning Overlay Effect */}
                    {scanning && (
                        <div className="absolute inset-0 pointer-events-none border-[20px] border-slate-900/40 border-double">
                            <div className="w-full h-0.5 bg-primary/60 absolute top-1/2 -translate-y-1/2 animate-scan-line"></div>
                        </div>
                    )}

                    {error && (
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-900/50 px-4 py-2 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400 text-sm font-bold">
                            <Zap className="w-4 h-4" /> {error}
                        </div>
                    )}
                </div>

                {/* Results Panel */}
                {lastResult && (
                    <Card className="p-6 bg-white dark:bg-slate-900 border-primary/30 animate-in slide-in-from-bottom-4 duration-300">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="space-y-1 text-center md:text-left">
                                <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Validated Decoded Sequence</p>
                                <p className="text-2xl font-mono font-black text-primary break-all tracking-tight leading-tight">{lastResult}</p>
                            </div>
                            <div className="flex gap-3 shrink-0">
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(lastResult);
                                        // Simple alert/toast feedback could go here
                                    }}
                                    className="flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl font-bold text-sm transition-all"
                                >
                                    <Copy className="w-4 h-4" /> Copy Hash
                                </button>
                                <button
                                    onClick={() => setLastResult(null)}
                                    className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-500 rounded-xl transition-all"
                                >
                                    <RefreshCw className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
};
