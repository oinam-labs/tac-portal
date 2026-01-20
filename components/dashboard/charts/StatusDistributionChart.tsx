import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../ui/card';
import { TrendingUp } from 'lucide-react';

import { ChartSkeleton } from '../../ui/skeleton';

// Data would typically come from API/Props
const statusChartData = [
    { status: "inTransit", count: 450, fill: "var(--color-inTransit)" },
    { status: "delivered", count: 300, fill: "var(--color-delivered)" },
    { status: "pending", count: 200, fill: "var(--color-pending)" },
    { status: "exception", count: 50, fill: "var(--color-exception)" },
];

const COLORS = {
    primary: '#22d3ee',
    secondary: '#c084fc',
    success: '#10b981',
    warning: '#facc15',
    danger: '#f97316',
};

const STATUS_COLORS = [COLORS.primary, COLORS.success, COLORS.warning, COLORS.danger];

export const StatusDistributionChart: React.FC<{ isLoading?: boolean }> = ({ isLoading }) => {



    if (isLoading) return <ChartSkeleton />;

    const totalShipments = statusChartData.reduce((acc, curr) => acc + curr.count, 0);



    return (
        <Card className="flex flex-col h-full">
            <CardHeader className="items-center pb-0">
                <CardTitle className="flex items-center gap-2">
                    <span className="w-1 h-6 bg-cyber-purple rounded-full shadow-neon-purple"></span>
                    Status Distribution
                </CardTitle>
                <CardDescription>Current shipment status breakdown</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <div className="h-[250px] w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={statusChartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={90}
                                paddingAngle={3}
                                dataKey="count"
                                nameKey="status"
                            >
                                {statusChartData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} stroke="hsl(var(--card))" strokeWidth={2} />
                                ))}
                            </Pie>
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const data = payload[0].payload;
                                        return (
                                            <div className="bg-popover border border-border p-3 rounded-lg shadow-lg">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: data.fill }} />
                                                    <span className="font-semibold text-popover-foreground capitalize">
                                                        {data.status === 'inTransit' ? 'In Transit' : data.status}
                                                    </span>
                                                </div>
                                                <div className="text-2xl font-bold text-popover-foreground">
                                                    {data.count.toLocaleString()}
                                                </div>
                                                <div className="text-xs text-muted-foreground">Shipments</div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Center Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-3xl font-bold text-foreground font-mono">{totalShipments.toLocaleString()}</span>
                        <span className="text-xs text-muted-foreground">Total</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
                <div className="flex flex-wrap justify-center gap-3">
                    {statusChartData.map((_, index) => (
                        <div key={index} className="flex items-center text-xs text-muted-foreground">
                            <span className="w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: STATUS_COLORS[index] }}></span>
                            {statusChartData[index].status === 'inTransit' ? 'In Transit' : statusChartData[index].status === 'delivered' ? 'Delivered' : statusChartData[index].status === 'pending' ? 'Pending' : 'Exception'}
                        </div>
                    ))}
                </div>
                <div className="flex items-center gap-2 leading-none font-medium text-foreground mt-2">
                    <TrendingUp className="h-4 w-4 text-cyber-success" /> Real-time status overview
                </div>
            </CardFooter>
        </Card>
    );
};
