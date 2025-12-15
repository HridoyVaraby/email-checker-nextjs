'use client';

import { Toaster, toast, ToastOptions } from 'react-hot-toast';

export const showToast = {
    success: (message: string) => toast.success(message),
    error: (message: string) => toast.error(message),
    loading: (message: string) => toast.loading(message),
    dismiss: (id?: string) => toast.dismiss(id),
};

const toastOptions: ToastOptions = {
    duration: 4000,
    style: {
        background: 'white',
        color: 'black',
        border: '1px solid black',
        padding: '16px',
        borderRadius: '8px',
    },
    success: {
        iconTheme: {
            primary: 'black',
            secondary: 'white',
        },
    },
    error: {
        iconTheme: {
            primary: 'black',
            secondary: 'white',
        },
    },
};

export default function ToastProvider() {
    return (
        <Toaster
            position="bottom-right"
            toastOptions={toastOptions}
        />
    );
}
