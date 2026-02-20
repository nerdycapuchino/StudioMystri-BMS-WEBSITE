import React from 'react';

const shimmer = 'animate-pulse bg-white/5 rounded-xl';

export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {Array.from({ length: count }).map((_, i) => (
            <div key={i} className={`${shimmer} h-32`} />
        ))}
    </div>
);

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ rows = 5, cols = 5 }) => (
    <div className="space-y-3">
        <div className={`${shimmer} h-10 w-full`} />
        {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex gap-4">
                {Array.from({ length: cols }).map((_, j) => (
                    <div key={j} className={`${shimmer} h-8 flex-1`} />
                ))}
            </div>
        ))}
    </div>
);

export const FormSkeleton: React.FC<{ fields?: number }> = ({ fields = 4 }) => (
    <div className="space-y-5">
        {Array.from({ length: fields }).map((_, i) => (
            <div key={i} className="space-y-2">
                <div className={`${shimmer} h-3 w-24`} />
                <div className={`${shimmer} h-10 w-full`} />
            </div>
        ))}
        <div className={`${shimmer} h-12 w-36`} />
    </div>
);

export const ListSkeleton: React.FC<{ items?: number }> = ({ items = 6 }) => (
    <div className="space-y-3">
        {Array.from({ length: items }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
                <div className={`${shimmer} size-10 rounded-full !rounded-full`} />
                <div className="flex-1 space-y-2">
                    <div className={`${shimmer} h-3 w-3/4`} />
                    <div className={`${shimmer} h-2 w-1/2`} />
                </div>
            </div>
        ))}
    </div>
);

export const ChartSkeleton: React.FC = () => (
    <div className={`${shimmer} h-64 w-full`} />
);

export const InlineError: React.FC<{ message: string; onRetry?: () => void }> = ({ message, onRetry }) => (
    <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
        <span className="material-symbols-outlined text-4xl mb-3 text-red-500/60">error</span>
        <p className="text-sm mb-3">{message}</p>
        {onRetry && (
            <button onClick={onRetry} className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors">
                Retry
            </button>
        )}
    </div>
);

export const PageLoader: React.FC = () => (
    <div className="flex items-center justify-center h-full">
        <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
);
