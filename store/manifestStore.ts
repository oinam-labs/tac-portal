import { create } from 'zustand';
import { Manifest, Shipment } from '../types';
import { db } from '../lib/mock-db';

interface ManifestState {
    manifests: Manifest[];
    availableShipments: Shipment[];
    isLoading: boolean;

    fetchManifests: () => void;
    fetchAvailableShipments: (origin: string, dest: string) => void;

    createManifest: (data: Partial<Manifest>) => Promise<void>;
    addShipmentsToManifest: (manifestId: string, shipmentIds: string[]) => Promise<void>;
    updateManifestStatus: (manifestId: string, status: 'DEPARTED' | 'ARRIVED') => Promise<void>;
}

export const useManifestStore = create<ManifestState>((set) => ({
    manifests: [],
    availableShipments: [],
    isLoading: false,

    fetchManifests: () => {
        set({ isLoading: true });
        // Simulate network
        setTimeout(() => {
            set({ manifests: db.getManifests(), isLoading: false });
        }, 400);
    },

    fetchAvailableShipments: (origin, dest) => {
        // In a real app, this would be a filtered API query.
        // Here we just filter the mock DB state.
        const shipments = db.getShipments().filter(s =>
            s.originHub === origin &&
            s.destinationHub === dest &&
            (s.status === 'CREATED' || s.status === 'RECEIVED_AT_ORIGIN_HUB') &&
            !s.manifestId // Not already on a manifest
        );
        set({ availableShipments: shipments });
    },

    createManifest: async (data) => {
        set({ isLoading: true });

        const newManifest: Manifest = {
            id: `MNF-${Math.floor(Math.random() * 10000)}`,
            reference: `MNF-2024-${Math.floor(Math.random() * 1000)}`,
            createdAt: new Date().toISOString(),
            status: 'OPEN',
            shipmentIds: [],
            shipmentCount: 0,
            totalWeight: 0,
            createdBy: 'Admin', // Hardcoded for now
            // Defaults for safety, should be overridden by data
            type: 'TRUCK',
            originHub: 'IMPHAL',
            destinationHub: 'NEW_DELHI',
            vehicleMeta: {},
            ...data as any
        };

        await new Promise(resolve => setTimeout(resolve, 800));
        db.addManifest(newManifest);

        set(state => ({
            manifests: [newManifest, ...state.manifests],
            isLoading: false
        }));
    },

    addShipmentsToManifest: async (manifestId, shipmentIds) => {
        set({ isLoading: true });
        await new Promise(resolve => setTimeout(resolve, 500));

        try {
            shipmentIds.forEach(id => db.addShipmentToManifest(manifestId, id));
            // Refresh
            set({
                manifests: db.getManifests(),
                isLoading: false
            });
        } catch (error) {
            console.error(error);
            set({ isLoading: false });
        }
    },

    updateManifestStatus: async (manifestId, status) => {
        set({ isLoading: true });
        await new Promise(resolve => setTimeout(resolve, 500));

        db.updateManifestStatus(manifestId, status);

        set({
            manifests: db.getManifests(),
            isLoading: false
        });
    }
}));