import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline';
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'primary',
    className = ''
}) => {
    const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wider uppercase';

    const variants = {
        primary: 'bg-primary/10 text-primary border border-primary/20',
        secondary: 'bg-secondary text-secondary-foreground',
        success: 'bg-green-500/10 text-green-600 border border-green-500/20',
        warning: 'bg-amber-500/10 text-amber-600 border border-amber-500/20',
        error: 'bg-red-500/10 text-red-600 border border-red-500/20',
        outline: 'border border-border text-muted-foreground',
    };

    return (
        <span className={`${baseStyles} ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
};
