import React, { createContext, useState, useCallback, useContext } from 'react';
import { CheckCircleIcon, InformationCircleIcon, XMarkIcon } from '../components/icons';

type ToastType = 'success' | 'info' | 'error' | 'warning';

interface Toast {
    id: number;
    message: string;
    type: ToastType;
    duration?: number;
}

interface ToastContextType {
    addToast: (message: string, type: ToastType, duration?: number) => void;
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    warning: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
}

export const ToastContext = createContext<ToastContextType>({
    addToast: () => {},
    success: () => {},
    error: () => {},
    warning: () => {},
    info: () => {},
});

export const useToasts = () => useContext(ToastContext);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((message: string, type: ToastType, duration: number = 5000) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type, duration }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
    }, []);
    
    const success = useCallback((message: string, duration?: number) => {
        addToast(message, 'success', duration);
    }, [addToast]);

    const error = useCallback((message: string, duration?: number) => {
        addToast(message, 'error', duration);
    }, [addToast]);

    const warning = useCallback((message: string, duration?: number) => {
        addToast(message, 'warning', duration);
    }, [addToast]);

    const info = useCallback((message: string, duration?: number) => {
        addToast(message, 'info', duration);
    }, [addToast]);
    
    const removeToast = (id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const getToastIcon = (type: ToastType) => {
        switch (type) {
            case 'success':
                return <CheckCircleIcon className="w-6 h-6" />;
            case 'error':
                return (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'warning':
                return (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                );
            case 'info':
                return <InformationCircleIcon className="w-6 h-6" />;
        }
    };

    const getToastStyle = (type: ToastType) => {
        switch (type) {
            case 'success':
                return 'bg-green-600';
            case 'error':
                return 'bg-red-600';
            case 'warning':
                return 'bg-amber-600';
            case 'info':
                return 'bg-blue-600';
        }
    };

    return (
        <ToastContext.Provider value={{ addToast, success, error, warning, info }}>
            {children}
            <div className="fixed bottom-5 right-5 z-50 space-y-3 pointer-events-none">
                {toasts.map(toast => (
                    <div 
                        key={toast.id} 
                        className={`pointer-events-auto flex items-start max-w-sm p-4 rounded-lg shadow-lg text-white ${getToastStyle(toast.type)} animate-slide-in-up`}
                        role="alert"
                        aria-live="polite"
                    >
                        <div className="flex-shrink-0">
                            {getToastIcon(toast.type)}
                        </div>
                        <div className="ml-3 text-sm font-medium flex-1">{toast.message}</div>
                        <button 
                            onClick={() => removeToast(toast.id)} 
                            className="ml-auto -mx-1.5 -my-1.5 p-1.5 rounded-lg inline-flex h-8 w-8 hover:bg-white/20 transition"
                            aria-label="Sluit melding"
                        >
                            <XMarkIcon className="w-5 h-5"/>
                        </button>
                    </div>
                ))}
            </div>

            {/* Toast animations */}
            <style>{`
                @keyframes slide-in-up {
                    from {
                        transform: translateY(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
                .animate-slide-in-up {
                    animation: slide-in-up 0.3s ease-out;
                }
            `}</style>
        </ToastContext.Provider>
    );
};
