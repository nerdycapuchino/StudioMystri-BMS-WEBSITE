import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'glass';
    noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    variant = 'default',
    noPadding = false
}) => {
    const baseStyles = 'rounded-2xl border transition-all duration-300';

    const variants = {
        default: 'bg-card text-card-foreground border-border shadow-sm hover:shadow-md',
        glass: 'bg-white/10 backdrop-blur-xl border-white/20 shadow-glow',
    };

    return (
        <div className={`${baseStyles} ${variants[variant]} ${noPadding ? '' : 'p-6'} ${className}`}>
            {children}
        </div>
    );
};

export const CardHeader: React.FC<{ title: string; subtitle?: string; icon?: React.ReactNode }> = ({ title, subtitle, icon }) => (
    <div className="flex items-center justify-between mb-6">
        <div>
            <h3 className="text-lg font-bold tracking-tight">{title}</h3>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {icon && <div className="text-primary">{icon}</div>}
    </div>
);
