// @vitest-environment jsdom
console.log('Test file loaded: useShiftReport.test.tsx');
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useShiftReport } from '@/hooks/useShiftReport';
import { shiftReportService } from '@/lib/services/shiftReportService';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock the service
vi.mock('@/lib/services/shiftReportService', () => ({
    shiftReportService: {
        generateReport: vi.fn(),
    },
}));

// Setup QueryClient for tests
const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });
    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
};

describe('useShiftReport', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('calls generateReport with correct filters', async () => {
        const filters = {
            hubId: 'HUB123',
            shiftStart: new Date('2023-10-27T08:00:00Z'),
            shiftEnd: new Date('2023-10-27T20:00:00Z')
        };
        (shiftReportService.generateReport as any).mockResolvedValue({
            reportId: '123',
            metrics: { totalShipments: 10 },
        });

        const { result } = renderHook(() => useShiftReport(filters), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(shiftReportService.generateReport).toHaveBeenCalledWith(filters);
        expect(result.current.data).toEqual({
            reportId: '123',
            metrics: { totalShipments: 10 },
        });
    });

    it('handles errors correctly', async () => {
        const filters = {
            hubId: 'HUB123',
            shiftStart: new Date('2023-10-27T08:00:00Z'),
            shiftEnd: new Date('2023-10-27T20:00:00Z')
        };
        const error = new Error('Failed to fetch');
        (shiftReportService.generateReport as any).mockRejectedValue(error);

        const { result } = renderHook(() => useShiftReport(filters), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isError).toBe(true));

        expect(result.current.error).toEqual(error);
    });
});
