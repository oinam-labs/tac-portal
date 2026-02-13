import React from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
    title: string;
    description?: string;
    icon?: React.ReactNode;
    children?: React.ReactNode;
    className?: string;
}

/**
 * Consistent page header for all dashboard pages.
 * Renders a title + optional description on the left, with an action slot on the right.
 */
export function PageHeader({ title, description, icon, children, className }: PageHeaderProps) {
    return (
        <div
            className={cn(
                'flex flex-col gap-4 md:flex-row md:items-center md:justify-between',
                className
            )}
        >
            <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
                    {icon && <span className="shrink-0">{icon}</span>}
                    {title}
                </h1>
                {description && (
                    <p className="text-sm text-muted-foreground">{description}</p>
                )}
            </div>
            {children && (
                <div className="flex items-center gap-2 shrink-0">{children}</div>
            )}
        </div>
    );
}
