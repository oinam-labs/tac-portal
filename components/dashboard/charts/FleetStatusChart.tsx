import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../ui/card';
import { TrendingUp } from 'lucide-react';
import { useStore } from '../../../store';
import { ChartSkeleton } from '../../ui/skeleton';

// Data would typically come from API/Props
const fleetChartData = [
    { route: "DXB-SIN", active: 186, idle: 80 },
    { route: "SIN-HKG", active: 305, idle: 200 },
    { route: "HKG-NRT", active: 237, idle: 120 },
    { route: "NRT-LAX", active: 73, idle: 190 },
    { route: "LAX-JFK", active: 209, idle: 130 },
];

const COLORS = {
    primary: '#22d3ee',
    secondary: '#c084fc',
};

export const FleetStatusChart: React.FC<{ isLoading?: boolean }> = ({ isLoading }) => {
    const { theme } = useStore();
    const isDark = theme === 'dark';

    if (isLoading) return <ChartSkeleton height={200} />;

    // Tooltip styles
    const tooltipStyle = {
        backgroundColor: isDark ? '#0f172a' : '#ffffff',
        borderColor: isDark ? '#1e293b' : '#e2e8f0',
        color: isDark ? '#f8fafc' : '#0f172a',
        borderRadius: '8px',
    };

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <span className="w-1 h-6 bg-cyber-success rounded-full"></span>
                    Current Fleet Status
                </CardTitle>
                <CardDescription>Active vs idle fleet by route</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={fleetChartData}>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke={isDark ? 'rgba(100,116,139,0.2)' : 'rgba(148,163,184,0.3)'} />
                            <XAxis dataKey="route" tickLine={false} tickMargin={10} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                            <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Legend />
                            <Bar dataKey="active" name="Active" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
                            <Bar dataKey="idle" name="Idle" fill={COLORS.secondary} radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex gap-2 leading-none font-medium text-foreground">
                    Fleet utilization up by 12.3% <TrendingUp className="h-4 w-4 text-cyber-success" />
                </div>
                <div className="leading-none text-muted-foreground">
                    Comparing to previous period
                </div>
            </CardFooter>
        </Card>
    );
};
