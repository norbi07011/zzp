import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
    CheckCircleIcon, 
    ExclamationTriangleIcon, 
    InformationCircleIcon, 
    XCircleIcon, 
    XMarkIcon 
} from '@heroicons/react/24/outline';

export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

export interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
    persistent?: boolean;
    action?: {
        label: string;
        onClick: () => void;
    };
    onClose?: () => void;
}

interface ToastContextType {
    toasts: Toast[];
    addToast: (toast: Omit<Toast, 'id'>) => string;
    removeToast: (id: string) => void;
    clearAll: () => void;
    updateToast: (id: string, updates: Partial<Omit<Toast, 'id'>>) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

// Toast Component
interface ToastComponentProps {
    toast: Toast;
    onRemove: (id: string) => void;
    position: ToastPosition;
    index: number;
}

const ToastComponent: React.FC<ToastComponentProps> = ({ toast, onRemove, position, index }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        // Animate in
        const timer = setTimeout(() => setIsVisible(true), 50);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!toast.persistent && toast.duration !== 0) {
            const duration = toast.duration || 5000;
            const timer = setTimeout(() => {
                handleClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [toast.duration, toast.persistent]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => {
            onRemove(toast.id);
            toast.onClose?.();
        }, 300);
    };

    const getIcon = () => {
        switch (toast.type) {
            case 'success':
                return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
            case 'error':
                return <XCircleIcon className="w-5 h-5 text-red-400" />;
            case 'warning':
                return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />;
            case 'info':
                return <InformationCircleIcon className="w-5 h-5 text-blue-400" />;
        }
    };

    const getColorClasses = () => {
        switch (toast.type) {
            case 'success':
                return 'bg-green-50 border-green-200 text-green-900';
            case 'error':
                return 'bg-red-50 border-red-200 text-red-900';
            case 'warning':
                return 'bg-yellow-50 border-yellow-200 text-yellow-900';
            case 'info':
                return 'bg-blue-50 border-blue-200 text-blue-900';
        }
    };

    const getPositionClasses = () => {
        const baseOffset = index * 80;
        switch (position) {
            case 'top-right':
                return `top-4 right-4 translate-x-0`;
            case 'top-left':
                return `top-4 left-4 translate-x-0`;
            case 'bottom-right':
                return `bottom-4 right-4 translate-x-0`;
            case 'bottom-left':
                return `bottom-4 left-4 translate-x-0`;
            case 'top-center':
                return `top-4 left-1/2 -translate-x-1/2`;
            case 'bottom-center':
                return `bottom-4 left-1/2 -translate-x-1/2`;
        }
    };

    const getAnimationClasses = () => {
        if (isExiting) {
            return 'opacity-0 scale-95 translate-x-full';
        }
        if (isVisible) {
            return 'opacity-100 scale-100 translate-x-0';
        }
        return 'opacity-0 scale-95 translate-x-full';
    };

    return (
        <div
            className={`
                fixed z-50 max-w-sm w-full
                transform transition-all duration-300 ease-in-out
                ${getPositionClasses()}
                ${getAnimationClasses()}
            `}
            style={{
                top: position.includes('top') ? `${16 + index * 80}px` : undefined,
                bottom: position.includes('bottom') ? `${16 + index * 80}px` : undefined
            }}
        >
            <div className={`
                p-4 rounded-lg border shadow-lg backdrop-blur-sm
                ${getColorClasses()}
            `}>
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                        {getIcon()}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium">
                            {toast.title}
                        </h4>
                        {toast.message && (
                            <p className="text-sm opacity-90 mt-1">
                                {toast.message}
                            </p>
                        )}
                        
                        {toast.action && (
                            <div className="mt-3">
                                <button
                                    onClick={toast.action.onClick}
                                    className="text-sm font-medium underline hover:no-underline focus:outline-none"
                                >
                                    {toast.action.label}
                                </button>
                            </div>
                        )}
                    </div>
                    
                    <button
                        onClick={handleClose}
                        className="flex-shrink-0 p-1 rounded-md hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-current focus:ring-white/20 transition-colors"
                    >
                        <XMarkIcon className="w-4 h-4" />
                    </button>
                </div>
                
                {/* Progress bar for auto-dismiss */}
                {!toast.persistent && toast.duration !== 0 && (
                    <div className="mt-3 w-full bg-black/10 rounded-full h-1 overflow-hidden">
                        <div 
                            className="h-full bg-current opacity-60 transition-all ease-linear"
                            style={{
                                animation: `toast-progress ${toast.duration || 5000}ms linear forwards`
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

// Toast Container
interface ToastContainerProps {
    toasts: Toast[];
    position: ToastPosition;
    onRemove: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, position, onRemove }) => {
    if (toasts.length === 0) return null;

    return createPortal(
        <div className="fixed inset-0 pointer-events-none z-50">
            {toasts.map((toast, index) => (
                <ToastComponent
                    key={toast.id}
                    toast={toast}
                    onRemove={onRemove}
                    position={position}
                    index={index}
                />
            ))}
            
            {/* CSS Animation Keyframes */}
            <style>
                {`
                    @keyframes toast-progress {
                        from { width: 100%; }
                        to { width: 0%; }
                    }
                `}
            </style>
        </div>,
        document.body
    );
};

// Toast Provider
interface ToastProviderProps {
    children: React.ReactNode;
    position?: ToastPosition;
    maxToasts?: number;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ 
    children, 
    position = 'top-right',
    maxToasts = 5 
}) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((newToast: Omit<Toast, 'id'>) => {
        const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const toast: Toast = { id, ...newToast };
        
        setToasts(prev => {
            const updated = [toast, ...prev];
            // Limit number of toasts
            return updated.slice(0, maxToasts);
        });
        
        return id;
    }, [maxToasts]);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const clearAll = useCallback(() => {
        setToasts([]);
    }, []);

    const updateToast = useCallback((id: string, updates: Partial<Omit<Toast, 'id'>>) => {
        setToasts(prev => 
            prev.map(toast => 
                toast.id === id ? { ...toast, ...updates } : toast
            )
        );
    }, []);

    const contextValue: ToastContextType = {
        toasts,
        addToast,
        removeToast,
        clearAll,
        updateToast
    };

    return (
        <ToastContext.Provider value={contextValue}>
            {children}
            <ToastContainer 
                toasts={toasts} 
                position={position} 
                onRemove={removeToast} 
            />
        </ToastContext.Provider>
    );
};

// Convenience hooks for different toast types
export const useToastHelpers = () => {
    const { addToast } = useToast();

    const success = useCallback((title: string, message?: string, options?: Partial<Toast>) => {
        return addToast({ type: 'success', title, message, ...options });
    }, [addToast]);

    const error = useCallback((title: string, message?: string, options?: Partial<Toast>) => {
        return addToast({ type: 'error', title, message, persistent: true, ...options });
    }, [addToast]);

    const warning = useCallback((title: string, message?: string, options?: Partial<Toast>) => {
        return addToast({ type: 'warning', title, message, duration: 7000, ...options });
    }, [addToast]);

    const info = useCallback((title: string, message?: string, options?: Partial<Toast>) => {
        return addToast({ type: 'info', title, message, ...options });
    }, [addToast]);

    const promise = useCallback(async <T,>(
        promise: Promise<T>,
        {
            loading,
            success: successConfig,
            error: errorConfig
        }: {
            loading: { title: string; message?: string };
            success: { title: string; message?: string } | ((data: T) => { title: string; message?: string });
            error: { title: string; message?: string } | ((error: any) => { title: string; message?: string });
        }
    ) => {
        const loadingId = addToast({
            type: 'info',
            title: loading.title,
            message: loading.message,
            persistent: true
        });

        try {
            const result = await promise;
            
            const successToast = typeof successConfig === 'function' 
                ? successConfig(result) 
                : successConfig;
            
            addToast({
                type: 'success',
                title: successToast.title,
                message: successToast.message
            });
            
            return result;
        } catch (err) {
            const errorToast = typeof errorConfig === 'function' 
                ? errorConfig(err) 
                : errorConfig;
            
            addToast({
                type: 'error',
                title: errorToast.title,
                message: errorToast.message,
                persistent: true
            });
            
            throw err;
        } finally {
            // Remove loading toast
            setTimeout(() => {
                const { removeToast } = useToast();
                removeToast(loadingId);
            }, 100);
        }
    }, [addToast]);

    return {
        success,
        error,
        warning,
        info,
        promise
    };
};

export default ToastProvider;