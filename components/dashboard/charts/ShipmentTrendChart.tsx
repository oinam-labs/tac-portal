import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { useStore } from '../../../store';
import { ChartSkeleton } from '../../ui/skeleton';

// Data would typically come from API/Props
const trendChartData = [
    { date: "2024-04-01", inbound: 222, outbound: 150 },
    { date: "2024-04-02", inbound: 97, outbound: 180 },
    { date: "2024-04-03", inbound: 167, outbound: 120 },
    { date: "2024-04-04", inbound: 242, outbound: 260 },
    { date: "2024-04-05", inbound: 373, outbound: 290 },
    { date: "2024-04-06", inbound: 301, outbound: 340 },
    { date: "2024-04-07", inbound: 245, outbound: 180 },
    { date: "2024-04-08", inbound: 409, outbound: 320 },
    { date: "2024-04-09", inbound: 59, outbound: 110 },
    // ... truncated middle data for brevity in component, assume full data set or fetched
    { date: "2024-06-25", inbound: 141, outbound: 190 },
    { date: "2024-06-26", inbound: 434, outbound: 380 },
    { date: "2024-06-27", inbound: 448, outbound: 490 },
    { date: "2024-06-28", inbound: 149, outbound: 200 },
    { date: "2024-06-29", inbound: 103, outbound: 160 },
    { date: "2024-06-30", inbound: 446, outbound: 400 },
];

const COLORS = {
    primary: '#22d3ee',
    secondary: '#c084fc',
};

export const ShipmentTrendChart: React.FC<{ isLoading?: boolean }> = ({ isLoading }) => {
    const [timeRange, setTimeRange] = useState("90d");
    const { theme } = useStore();
    const isDark = theme === 'dark';

    if (isLoading) return <ChartSkeleton />;

    const filteredData = trendChartData.slice(- (timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90));

    // Tooltip styles
    const tooltipStyle = {
        backgroundColor: isDark ? '#0f172a' : '#ffffff',
        borderColor: isDark ? '#1e293b' : '#e2e8f0',
        color: isDark ? '#f8fafc' : '#0f172a',
        borderRadius: '8px',
    };

    return (
        <Card className="pt-0 h-full">
            <CardHeader className="flex items-center gap-2 space-y-0 border-b border-cyber-border py-5 sm:flex-row">
                <div className="grid flex-1 gap-1">
                    <CardTitle className="flex items-center gap-2">
                        <span className="w-1 h-6 bg-cyber-neon rounded-full shadow-neon"></span>
                        Shipment Volume Trend
                    </CardTitle>
                    <CardDescription>
                        Showing inbound vs outbound shipments
                    </CardDescription>
                </div>
                <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex" aria-label="Select time range">
                        <SelectValue placeholder="Last 3 months" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                        <SelectItem value="90d" className="rounded-lg">Last 3 months</SelectItem>
                        <SelectItem value="30d" className="rounded-lg">Last 30 days</SelectItem>
                        <SelectItem value="7d" className="rounded-lg">Last 7 days</SelectItem>
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={filteredData}>
                            <defs>
                                <linearGradient id="fillInbound" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8} />
                                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0.1} />
                                </linearGradient>
                                <linearGradient id="fillOutbound" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={COLORS.secondary} stopOpacity={0.8} />
                                    <stop offset="95%" stopColor={COLORS.secondary} stopOpacity={0.1} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke={isDark ? 'rgba(100,116,139,0.2)' : 'rgba(148,163,184,0.3)'} />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                minTickGap={32}
                                tick={{ fill: '#64748b', fontSize: 12 }}
                                tickFormatter={(value) => {
                                    const date = new Date(value);
                                    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                                }}
                            />
                            <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Legend />
                            <Area dataKey="outbound" name="Outbound" type="monotone" fill="url(#fillOutbound)" stroke={COLORS.secondary} strokeWidth={2} stackId="a" />
                            <Area dataKey="inbound" name="Inbound" type="monotone" fill="url(#fillInbound)" stroke={COLORS.primary} strokeWidth={2} stackId="a" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};
