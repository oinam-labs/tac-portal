
import React from 'react';

// Card
export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`bg-cyber-card backdrop-blur-md border border-cyber-border rounded-xl p-6 shadow-neon-sm hover:shadow-neon transition-all duration-300 ${className}`}>
        {children}
    </div>
);

// Badge
export const Badge: React.FC<{ children: React.ReactNode; variant?: 'default' | 'outline' | 'neon'; className?: string }> = ({ children, variant = 'default', className = '' }) => {
    const baseStyle = "px-2 py-0.5 rounded text-xs font-mono font-bold tracking-wide uppercase";
    const variants = {
        default: "bg-cyber-surface text-cyber-accent border border-cyber-border",
        outline: "border border-cyber-border text-slate-500 dark:text-gray-400",
        neon: "bg-cyber-accent/10 text-cyber-neon border border-cyber-neon/50 shadow-[0_0_10px_rgba(34,211,238,0.3)]",
    };
    return (
        <span className={`${baseStyle} ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
};

// Button
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
    const base = "font-sans font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-cyber-accent/50 disabled:opacity-50 disabled:cursor-not-allowed";
    
    const variants = {
        primary: "bg-cyber-accent/10 hover:bg-cyber-accent/20 text-cyber-accentHover dark:text-cyber-neon border border-cyber-neon/50 shadow-[0_0_15px_rgba(34,211,238,0.15)] hover:shadow-[0_0_20px_rgba(34,211,238,0.3)]",
        secondary: "bg-cyber-surface hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-cyber-border",
        ghost: "bg-transparent hover:bg-cyber-accent/5 text-slate-500 hover:text-cyber-accentHover dark:text-slate-400 dark:hover:text-cyber-neon",
        danger: "bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/50",
    };

    const sizes = {
        sm: "px-3 py-1.5 text-xs",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-base",
    };

    return (
        <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
            {children}
        </button>
    );
};

// Input
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
    ({ className = '', ...props }, ref) => (
        <input 
            ref={ref}
            className={`bg-white/50 dark:bg-cyber-surface/50 border border-cyber-border text-slate-900 dark:text-slate-100 rounded-lg px-4 py-2 focus:border-cyber-neon focus:ring-1 focus:ring-cyber-neon focus:outline-none placeholder-slate-500 dark:placeholder-slate-600 transition-all w-full ${className}`}
            {...props}
        />
    )
);
Input.displayName = 'Input';

// Table Components
export const Table: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse">{children}</table>
    </div>
);

export const Th: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <th className="p-4 text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-cyber-border">{children}</th>
);

export const Td: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <td className={`p-4 border-b border-cyber-border/50 text-sm text-slate-700 dark:text-slate-300 ${className}`}>{children}</td>
);
