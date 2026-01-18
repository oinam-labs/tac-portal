import { create } from 'zustand';
import { Shipment, Customer, Package, TrackingEvent } from '../types';
import { db } from '../lib/mock-db';

interface ShipmentState {
    shipments: Shipment[];
    customers: Customer[];
    currentShipmentEvents: TrackingEvent[];
    isLoading: boolean;
    
    // Actions
    fetchShipments: () => void;
    fetchCustomers: () => void;
    fetchShipmentEvents: (shipmentId: string) => void;
    createShipment: (data: Partial<Shipment>, packages: Package[]) => Promise<void>;
    addCustomer: (customer: Partial<Customer>) => Promise<void>;
}

export const useShipmentStore = create<ShipmentState>((set, get) => ({
    shipments: [],
    customers: [],
    currentShipmentEvents: [],
    isLoading: false,

    fetchShipments: () => {
        set({ isLoading: true });
        // Simulate API call
        setTimeout(() => {
            set({ shipments: db.getShipments(), isLoading: false });
        }, 500);
    },

    fetchCustomers: () => {
        set({ customers: db.getCustomers() });
    },

    fetchShipmentEvents: (shipmentId: string) => {
        const events = db.getEvents(shipmentId);
        set({ currentShipmentEvents: events });
    },

    createShipment: async (shipmentData, packages) => {
        set({ isLoading: true });
        
        const newShipment: Shipment = {
            id: `SH-${Math.floor(Math.random() * 10000)}`,
            awb: db.generateAWB(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: 'CREATED',
            eta: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +3 days mock
            lastUpdate: 'Shipment Created',
            invoiceId: `INV-${Math.floor(Math.random() * 1000)}`,
            serviceLevel: 'STANDARD', // Default
            ...shipmentData as any
        };

        // Simulate DB write
        await new Promise(resolve => setTimeout(resolve, 800));
        
        db.addShipment(newShipment);
        
        set((state) => ({ 
            shipments: [newShipment, ...state.shipments],
            isLoading: false 
        }));
    },

    addCustomer: async (customer) => {
        set({ isLoading: true });
        
        const newCustomer: Customer = {
            id: `C-${Math.floor(Math.random() * 10000)}`,
            createdAt: new Date().toISOString(),
            activeContracts: 0,
            tier: 'STANDARD',
            type: 'BUSINESS',
            companyName: customer.companyName || '',
            name: customer.name || 'Unknown',
            email: customer.email || '',
            phone: customer.phone || '',
            address: customer.address || '',
            ...customer as any
        };

        await new Promise(resolve => setTimeout(resolve, 500));
        db.addCustomer(newCustomer);
        
        set(state => ({
            customers: [newCustomer, ...state.customers],
            isLoading: false
        }));
    }
}));
