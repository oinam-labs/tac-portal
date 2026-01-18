import React from 'react';
import { ShipmentTrendChart } from './charts/ShipmentTrendChart';
import { StatusDistributionChart } from './charts/StatusDistributionChart';
import { FleetStatusChart } from './charts/FleetStatusChart';

interface DashboardChartsProps {
    isLoading?: boolean;
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ isLoading }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Trend Chart (2 columns) */}
            <div className="lg:col-span-2">
                <ShipmentTrendChart isLoading={isLoading} />
            </div>

            {/* Status Distribution (1 column) */}
            <div className="lg:col-span-1">
                <StatusDistributionChart isLoading={isLoading} />
            </div>

            {/* Fleet Status (Full width) */}
            <div className="lg:col-span-3">
                <FleetStatusChart isLoading={isLoading} />
            </div>
        </div>
    );
};

export default DashboardCharts;
