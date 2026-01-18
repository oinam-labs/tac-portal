
import { create } from 'zustand';
import { Invoice, InvoiceStatus } from '../types';
import { db } from '../lib/mock-db';

interface InvoiceState {
    invoices: Invoice[];
    isLoading: boolean;
    fetchInvoices: () => void;
    createInvoice: (data: Partial<Invoice>) => Promise<void>;
    updateInvoiceStatus: (id: string, status: InvoiceStatus) => Promise<void>;
}

export const useInvoiceStore = create<InvoiceState>((set) => ({
    invoices: [],
    isLoading: false,

    fetchInvoices: () => {
        set({ isLoading: true });
        setTimeout(() => {
            set({ invoices: db.getInvoices(), isLoading: false });
        }, 300);
    },

    createInvoice: async (data) => {
        set({ isLoading: true });
        
        const newInvoice: Invoice = {
            id: `INV-${Math.floor(Math.random() * 100000)}`,
            invoiceNumber: `INV-${Math.floor(Date.now() / 1000)}`,
            createdAt: new Date().toISOString(),
            status: 'ISSUED',
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            customerId: data.customerId || '',
            customerName: data.customerName || 'Unknown',
            shipmentId: data.shipmentId || '',
            awb: data.awb || '',
            financials: data.financials || {
                baseFreight: 0,
                fuelSurcharge: 0,
                handlingFee: 0,
                insurance: 0,
                tax: { cgst: 0, sgst: 0, igst: 0, total: 0 },
                discount: 0,
                totalAmount: 0
            },
            ...data as any
        };

        await new Promise(resolve => setTimeout(resolve, 600));
        db.addInvoice(newInvoice);
        
        set(state => ({
            invoices: [newInvoice, ...state.invoices],
            isLoading: false
        }));
    },

    updateInvoiceStatus: async (id, status) => {
        set({ isLoading: true });
        await new Promise(resolve => setTimeout(resolve, 500));
        db.updateInvoiceStatus(id, status);
        set({ invoices: db.getInvoices(), isLoading: false });
    }
}));
