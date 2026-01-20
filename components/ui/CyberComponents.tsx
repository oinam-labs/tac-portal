
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
        outline: "border border-cyber-border text-muted-foreground",
        neon: "bg-primary/10 text-primary border border-primary/50 shadow-sm",
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

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', className = '', disabled, ...props }) => {
    const base = "font-sans font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-cyber-accent/50 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";

    const variants = {
        primary: "bg-primary/10 hover:bg-primary/20 active:bg-primary/30 text-primary border border-primary/50 shadow-sm hover:shadow-md",
        secondary: "bg-cyber-surface hover:bg-muted active:bg-muted/80 text-muted-foreground border border-cyber-border",
        ghost: "bg-transparent hover:bg-primary/5 active:bg-primary/10 text-muted-foreground hover:text-primary",
        danger: "bg-red-500/10 hover:bg-red-500/20 active:bg-red-500/30 text-red-600 dark:text-red-400 border border-red-500/50",
    };

    const sizes = {
        sm: "px-3 py-1.5 text-xs",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-base",
    };

    return (
        <button
            className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
};

// Input
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
    ({ className = '', ...props }, ref) => (
        <input
            ref={ref}
            className={`bg-white/50 dark:bg-cyber-surface/50 border border-cyber-border text-foreground rounded-lg px-4 py-2 focus:border-cyber-neon focus:ring-1 focus:ring-cyber-neon focus:outline-none placeholder-muted-foreground transition-all w-full ${className}`}
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


export const Th: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({ children, className = '', ...props }) => (
    <th className={`p-4 text-xs font-mono text-muted-foreground uppercase tracking-wider border-b border-cyber-border ${className}`} {...props}>{children}</th>
);

export const Td: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({ children, className = '', ...props }) => (
    <td className={`p-4 border-b border-cyber-border/50 text-sm text-foreground ${className}`} {...props}>{children}</td>
);
