
import React from 'react';
import MultiStepCreateInvoice from './MultiStepCreateInvoice';

interface Props {
    onSuccess: () => void;
    onCancel: () => void;
}

export const CreateInvoiceForm: React.FC<Props> = ({ onSuccess, onCancel }) => {
    return <MultiStepCreateInvoice onSuccess={onSuccess} onCancel={onCancel} />;
};
