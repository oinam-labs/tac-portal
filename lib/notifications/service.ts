import { toast } from 'sonner';
import { useNotificationStore } from './store';
import type { NotificationPayload, NotificationCategory, NotificationType } from './types';

/**
 * Smart toast rules - determines if a notification should show a toast
 */
function shouldShowToast(category: NotificationCategory, type: NotificationType): boolean {
    // Never toast for system info notifications
    if (category === 'system' && type === 'info') return false;

    // Always toast for errors and warnings
    if (type === 'error' || type === 'warning') return true;

    // Toast for success on user actions
    if (type === 'success') return true;

    // Don't toast for general info
    if (type === 'info') return false;

    return true;
}

/**
 * Create a notification and optionally show a toast
 */
export function notify(payload: NotificationPayload): void {
    const { addNotification } = useNotificationStore.getState();
    addNotification(payload);

    // Smart toast rule
    if (shouldShowToast(payload.category, payload.type)) {
        const toastFn = {
            success: toast.success,
            error: toast.error,
            warning: toast.warning,
            info: toast.info,
        }[payload.type] || toast;

        toastFn(payload.title, {
            description: payload.message ?? undefined,
            action: payload.href
                ? {
                    label: 'View',
                    onClick: () => {
                        window.location.hash = payload.href!;
                    },
                }
                : undefined,
        });
    }
}

/**
 * Show a toast without persisting to notifications
 */
export function showToast(
    type: NotificationType,
    title: string,
    options?: {
        description?: string;
        action?: { label: string; onClick: () => void };
        duration?: number;
    }
): void {
    const toastFn = {
        success: toast.success,
        error: toast.error,
        warning: toast.warning,
        info: toast.info,
    }[type] || toast;

    toastFn(title, {
        description: options?.description,
        action: options?.action,
        duration: options?.duration,
    });
}

/**
 * Promise-based toast for async operations (login, form submit, etc.)
 */
export async function toastPromise<T>(
    promise: Promise<T>,
    messages: {
        loading: string;
        success: string | ((data: T) => string);
        error: string | ((error: Error) => string);
    }
): Promise<T> {
    toast.promise(promise, {
        loading: messages.loading,
        success: messages.success,
        error: messages.error,
    });
    return promise;
}

/**
 * Notification helpers for common events
 */
export const notifications = {
    // Invoice notifications
    invoiceCreated: (invoiceNumber: string, href?: string) => {
        notify({
            user_id: 'current',
            type: 'success',
            category: 'invoice',
            title: 'Invoice Created',
            message: `Invoice ${invoiceNumber} has been created successfully.`,
            href: href ?? `/finance`,
            metadata: { invoiceNumber },
        });
    },

    invoicePaid: (invoiceNumber: string) => {
        notify({
            user_id: 'current',
            type: 'success',
            category: 'payment',
            title: 'Payment Received',
            message: `Payment for invoice ${invoiceNumber} has been confirmed.`,
            metadata: { invoiceNumber },
        });
    },

    // Shipment notifications
    shipmentCreated: (awb: string, href?: string) => {
        notify({
            user_id: 'current',
            type: 'success',
            category: 'shipment',
            title: 'Shipment Created',
            message: `Shipment ${awb} has been created.`,
            href: href ?? `/shipments`,
            metadata: { awb },
        });
    },

    shipmentStatusUpdate: (awb: string, status: string) => {
        notify({
            user_id: 'current',
            type: 'info',
            category: 'shipment',
            title: 'Shipment Update',
            message: `Shipment ${awb} is now ${status.replace(/_/g, ' ').toLowerCase()}.`,
            href: `/tracking?awb=${awb}`,
            metadata: { awb, status },
        });
    },

    shipmentDelivered: (awb: string) => {
        notify({
            user_id: 'current',
            type: 'success',
            category: 'shipment',
            title: 'Shipment Delivered',
            message: `Shipment ${awb} has been delivered successfully.`,
            metadata: { awb },
        });
    },

    // Auth notifications
    loginSuccess: (userName?: string) => {
        showToast('success', 'Welcome back!', {
            description: userName ? `Logged in as ${userName}` : undefined,
        });
    },

    loginError: (message: string) => {
        showToast('error', 'Login Failed', {
            description: message,
        });
    },

    logoutSuccess: () => {
        showToast('info', 'Logged out successfully');
    },

    // System notifications
    networkError: () => {
        showToast('error', 'Network Error', {
            description: 'Please check your connection and try again.',
        });
    },

    saveSuccess: (itemName?: string) => {
        showToast('success', itemName ? `${itemName} saved` : 'Saved successfully');
    },

    deleteSuccess: (itemName?: string) => {
        showToast('success', itemName ? `${itemName} deleted` : 'Deleted successfully');
    },

    permissionDenied: () => {
        showToast('error', 'Permission Denied', {
            description: 'You do not have permission to perform this action.',
        });
    },
};

export default notifications;
