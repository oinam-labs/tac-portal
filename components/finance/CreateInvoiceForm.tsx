
import React from 'react';
import MultiStepCreateInvoice from './MultiStepCreateInvoice';
import { Invoice, Shipment } from '@/types';

interface Props {
    onSuccess: (invoice?: Invoice, shipment?: Shipment) => void;
    onCancel: () => void;
}

export const CreateInvoiceForm: React.FC<Props> = ({ onSuccess, onCancel }) => {
    return <MultiStepCreateInvoice onSuccess={onSuccess} onCancel={onCancel} />;
};
