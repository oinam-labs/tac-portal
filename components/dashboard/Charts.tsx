import React from 'react';
import { ShipmentTrendChart } from './charts/ShipmentTrendChart';
import { StatusDistributionChart } from './charts/StatusDistributionChart';
import { FleetStatusChart } from './charts/FleetStatusChart';

export const DashboardCharts: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Trend Chart (2 columns) */}
      <div className="lg:col-span-2">
        <ShipmentTrendChart />
      </div>

      {/* Status Distribution (1 column) */}
      <div className="lg:col-span-1">
        <StatusDistributionChart />
      </div>

      {/* Fleet Status (Full width) */}
      <div className="lg:col-span-3">
        <FleetStatusChart />
      </div>
    </div>
  );
};

export default DashboardCharts;
