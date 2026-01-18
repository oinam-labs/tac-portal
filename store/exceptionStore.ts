
import { create } from 'zustand';
import { Exception } from '../types';
import { db } from '../lib/mock-db';

interface ExceptionState {
    exceptions: Exception[];
    isLoading: boolean;
    
    fetchExceptions: () => void;
    raiseException: (data: Partial<Exception>) => Promise<void>;
    resolveException: (id: string, note: string) => Promise<void>;
}

export const useExceptionStore = create<ExceptionState>((set) => ({
    exceptions: [],
    isLoading: false,

    fetchExceptions: () => {
        set({ isLoading: true });
        setTimeout(() => {
            set({ exceptions: db.getExceptions(), isLoading: false });
        }, 300);
    },

    raiseException: async (data) => {
        set({ isLoading: true });
        const newException: Exception = {
            id: `EX-${Math.floor(Math.random() * 10000)}`,
            shipmentId: data.shipmentId!,
            awb: data.awb!,
            type: data.type || 'DELAYED',
            severity: data.severity || 'LOW',
            description: data.description || '',
            status: 'OPEN',
            reportedAt: new Date().toISOString()
        };

        await new Promise(resolve => setTimeout(resolve, 600));
        db.addException(newException);

        set(state => ({
            exceptions: [newException, ...state.exceptions],
            isLoading: false
        }));
    },

    resolveException: async (id, note) => {
        set({ isLoading: true });
        await new Promise(resolve => setTimeout(resolve, 500));
        db.resolveException(id, note);
        set({ exceptions: db.getExceptions(), isLoading: false });
    }
}));
