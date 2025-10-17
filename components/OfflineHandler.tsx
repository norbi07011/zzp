import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
    WifiIcon, 
    CloudIcon, 
    ExclamationTriangleIcon,
    ArrowUpTrayIcon,
    CheckCircleIcon 
} from '@heroicons/react/24/outline';

// Offline Context
interface OfflineContextType {
    isOnline: boolean;
    lastOnline: Date | null;
    queuedActions: QueuedAction[];
    addToQueue: (action: Omit<QueuedAction, 'id' | 'timestamp'>) => void;
    removeFromQueue: (id: string) => void;
    retryAction: (id: string) => Promise<void>;
    clearQueue: () => void;
    syncPending: () => Promise<void>;
}

interface QueuedAction {
    id: string;
    type: string;
    payload: any;
    timestamp: Date;
    retryCount: number;
    maxRetries: number;
    endpoint?: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
}

const OfflineContext = createContext<OfflineContextType | null>(null);

export const useOffline = () => {
    const context = useContext(OfflineContext);
    if (!context) {
        throw new Error('useOffline must be used within an OfflineProvider');
    }
    return context;
};

// Network Status Hook
export const useNetworkStatus = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [connectionType, setConnectionType] = useState<string>('unknown');

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Check connection type if available
        if ('connection' in navigator) {
            const connection = (navigator as any).connection;
            setConnectionType(connection.effectiveType || 'unknown');
            
            const handleConnectionChange = () => {
                setConnectionType(connection.effectiveType || 'unknown');
            };
            
            connection.addEventListener('change', handleConnectionChange);
            
            return () => {
                window.removeEventListener('online', handleOnline);
                window.removeEventListener('offline', handleOffline);
                connection.removeEventListener('change', handleConnectionChange);
            };
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return { isOnline, connectionType };
};

// Offline Storage Helper
class OfflineStorage {
    private static QUEUE_KEY = 'offline_queue';
    private static CACHE_KEY = 'offline_cache';

    static getQueue(): QueuedAction[] {
        try {
            const data = localStorage.getItem(this.QUEUE_KEY);
            return data ? JSON.parse(data).map((item: any) => ({
                ...item,
                timestamp: new Date(item.timestamp)
            })) : [];
        } catch {
            return [];
        }
    }

    static setQueue(queue: QueuedAction[]): void {
        try {
            localStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));
        } catch (error) {
            console.warn('Failed to save offline queue:', error);
        }
    }

    static addToQueue(action: QueuedAction): void {
        const queue = this.getQueue();
        queue.push(action);
        this.setQueue(queue);
    }

    static removeFromQueue(id: string): void {
        const queue = this.getQueue().filter(action => action.id !== id);
        this.setQueue(queue);
    }

    static clearQueue(): void {
        try {
            localStorage.removeItem(this.QUEUE_KEY);
        } catch (error) {
            console.warn('Failed to clear offline queue:', error);
        }
    }

    static cacheData(key: string, data: any): void {
        try {
            const cache = this.getCache();
            cache[key] = {
                data,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
        } catch (error) {
            console.warn('Failed to cache data:', error);
        }
    }

    static getCachedData(key: string, maxAge: number = 24 * 60 * 60 * 1000): any {
        try {
            const cache = this.getCache();
            const cached = cache[key];
            
            if (cached) {
                const age = Date.now() - new Date(cached.timestamp).getTime();
                if (age < maxAge) {
                    return cached.data;
                }
            }
            
            return null;
        } catch {
            return null;
        }
    }

    private static getCache(): Record<string, any> {
        try {
            const data = localStorage.getItem(this.CACHE_KEY);
            return data ? JSON.parse(data) : {};
        } catch {
            return {};
        }
    }
}

// Offline Provider
interface OfflineProviderProps {
    children: React.ReactNode;
    autoSync?: boolean;
    syncInterval?: number;
}

export const OfflineProvider: React.FC<OfflineProviderProps> = ({ 
    children, 
    autoSync = true,
    syncInterval = 30000 // 30 seconds
}) => {
    const { isOnline } = useNetworkStatus();
    const [lastOnline, setLastOnline] = useState<Date | null>(
        isOnline ? new Date() : null
    );
    const [queuedActions, setQueuedActions] = useState<QueuedAction[]>([]);

    // Load queue from storage on mount
    useEffect(() => {
        setQueuedActions(OfflineStorage.getQueue());
    }, []);

    // Update last online time
    useEffect(() => {
        if (isOnline) {
            setLastOnline(new Date());
            
            // Auto sync when coming back online
            if (autoSync && queuedActions.length > 0) {
                syncPending();
            }
        }
    }, [isOnline]);

    // Auto sync interval
    useEffect(() => {
        if (autoSync && isOnline && queuedActions.length > 0) {
            const interval = setInterval(syncPending, syncInterval);
            return () => clearInterval(interval);
        }
    }, [autoSync, isOnline, queuedActions.length, syncInterval]);

    const addToQueue = useCallback((actionData: Omit<QueuedAction, 'id' | 'timestamp'>) => {
        const action: QueuedAction = {
            ...actionData,
            id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date(),
            retryCount: 0,
            maxRetries: actionData.maxRetries || 3
        };

        setQueuedActions(prev => {
            const updated = [...prev, action];
            OfflineStorage.setQueue(updated);
            return updated;
        });
    }, []);

    const removeFromQueue = useCallback((id: string) => {
        setQueuedActions(prev => {
            const updated = prev.filter(action => action.id !== id);
            OfflineStorage.setQueue(updated);
            return updated;
        });
    }, []);

    const retryAction = useCallback(async (id: string) => {
        const action = queuedActions.find(a => a.id === id);
        if (!action || !isOnline) return;

        try {
            // Simulate API call based on action
            if (action.endpoint) {
                const response = await fetch(action.endpoint, {
                    method: action.method || 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: action.method !== 'GET' ? JSON.stringify(action.payload) : undefined
                });

                if (response.ok) {
                    removeFromQueue(id);
                } else {
                    throw new Error(`HTTP ${response.status}`);
                }
            } else {
                // Handle custom action types
                console.log('Retrying action:', action);
                removeFromQueue(id);
            }
        } catch (error) {
            // Increment retry count
            setQueuedActions(prev => {
                const updated = prev.map(a => 
                    a.id === id 
                        ? { ...a, retryCount: a.retryCount + 1 }
                        : a
                );
                
                // Remove if max retries reached
                const filteredUpdated = updated.filter(a => 
                    a.id !== id || a.retryCount < a.maxRetries
                );
                
                OfflineStorage.setQueue(filteredUpdated);
                return filteredUpdated;
            });
        }
    }, [queuedActions, isOnline, removeFromQueue]);

    const clearQueue = useCallback(() => {
        setQueuedActions([]);
        OfflineStorage.clearQueue();
    }, []);

    const syncPending = useCallback(async () => {
        if (!isOnline || queuedActions.length === 0) return;

        const promises = queuedActions.map(action => retryAction(action.id));
        await Promise.allSettled(promises);
    }, [isOnline, queuedActions, retryAction]);

    const contextValue: OfflineContextType = {
        isOnline,
        lastOnline,
        queuedActions,
        addToQueue,
        removeFromQueue,
        retryAction,
        clearQueue,
        syncPending
    };

    return (
        <OfflineContext.Provider value={contextValue}>
            {children}
        </OfflineContext.Provider>
    );
};

// Offline Indicator Component
interface OfflineIndicatorProps {
    position?: 'top' | 'bottom';
    className?: string;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ 
    position = 'top',
    className = '' 
}) => {
    const { isOnline, lastOnline, queuedActions } = useOffline();
    const [show, setShow] = useState(!isOnline);

    useEffect(() => {
        setShow(!isOnline);
    }, [isOnline]);

    if (isOnline && queuedActions.length === 0) return null;

    const positionClasses = position === 'top' 
        ? 'top-0' 
        : 'bottom-0';

    return (
        <div className={`
            fixed left-0 right-0 z-50 
            ${positionClasses}
            ${show ? 'translate-y-0' : position === 'top' ? '-translate-y-full' : 'translate-y-full'}
            transition-transform duration-300
            ${className}
        `}>
            {!isOnline ? (
                <div className="bg-red-600 text-white px-4 py-2 text-sm">
                    <div className="flex items-center justify-center gap-2">
                        <ExclamationTriangleIcon className="w-4 h-4" />
                        <span>You're offline</span>
                        {lastOnline && (
                            <span className="opacity-80">
                                (last online: {lastOnline.toLocaleTimeString()})
                            </span>
                        )}
                    </div>
                </div>
            ) : queuedActions.length > 0 ? (
                <div className="bg-yellow-600 text-white px-4 py-2 text-sm">
                    <div className="flex items-center justify-center gap-2">
                        <ArrowUpTrayIcon className="w-4 h-4 animate-bounce" />
                        <span>Syncing {queuedActions.length} pending action(s)...</span>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

// Offline Status Badge
export const OfflineStatusBadge: React.FC<{ className?: string }> = ({ className = '' }) => {
    const { isOnline, queuedActions } = useOffline();

    return (
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${className}`}>
            {isOnline ? (
                <>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <WifiIcon className="w-4 h-4 text-green-600" />
                    <span className="text-green-800">Online</span>
                    {queuedActions.length > 0 && (
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs">
                            {queuedActions.length} pending
                        </span>
                    )}
                </>
            ) : (
                <>
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />
                    <span className="text-red-800">Offline</span>
                </>
            )}
        </div>
    );
};

// Offline Actions Queue Component
export const OfflineActionsQueue: React.FC<{ className?: string }> = ({ className = '' }) => {
    const { queuedActions, retryAction, removeFromQueue, clearQueue, syncPending } = useOffline();

    if (queuedActions.length === 0) {
        return (
            <div className={`text-center p-6 text-gray-500 ${className}`}>
                <CheckCircleIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No pending actions</p>
            </div>
        );
    }

    return (
        <div className={`space-y-4 ${className}`}>
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Pending Actions ({queuedActions.length})</h3>
                <div className="flex gap-2">
                    <button
                        onClick={syncPending}
                        className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                    >
                        Sync All
                    </button>
                    <button
                        onClick={clearQueue}
                        className="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
                    >
                        Clear All
                    </button>
                </div>
            </div>

            <div className="space-y-2">
                {queuedActions.map(action => (
                    <div key={action.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-medium">{action.type}</div>
                                <div className="text-sm text-gray-500">
                                    {action.timestamp.toLocaleString()}
                                </div>
                                <div className="text-xs text-gray-400">
                                    Retries: {action.retryCount}/{action.maxRetries}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => retryAction(action.id)}
                                    className="px-2 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                                >
                                    Retry
                                </button>
                                <button
                                    onClick={() => removeFromQueue(action.id)}
                                    className="px-2 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// HOC for offline-aware components
export function withOfflineSupport<T extends object>(
    Component: React.ComponentType<T>,
    options: {
        fallback?: React.ComponentType<T>;
        cacheKey?: string;
        maxCacheAge?: number;
    } = {}
) {
    return function OfflineAwareComponent(props: T) {
        const { isOnline } = useOffline();
        const { fallback: FallbackComponent, cacheKey, maxCacheAge } = options;

        if (!isOnline && FallbackComponent) {
            return <FallbackComponent {...props} />;
        }

        return <Component {...props} />;
    };
}

export default {
    OfflineProvider,
    useOffline,
    useNetworkStatus,
    OfflineIndicator,
    OfflineStatusBadge,
    OfflineActionsQueue,
    withOfflineSupport,
    OfflineStorage
};