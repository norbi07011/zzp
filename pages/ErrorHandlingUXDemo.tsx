import React, { useState } from 'react';
import { 
    useToast, 
    useToastHelpers,
    ToastType 
} from '../components/ToastProvider';
import { 
    useLoadingState, 
    LoadingSpinner, 
    Skeleton, 
    TextSkeleton, 
    TableSkeleton,
    AsyncWrapper,
    LoadingButton,
    FullPageLoading,
    SkeletonCard
} from '../components/LoadingStates';
import {
    useOffline,
    useNetworkStatus,
    OfflineStatusBadge,
    OfflineActionsQueue
} from '../components/OfflineHandler';
import { 
    ExclamationTriangleIcon, 
    CheckCircleIcon, 
    InformationCircleIcon,
    WifiIcon,
    CloudArrowUpIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';

export const ErrorHandlingUXDemo: React.FC = () => {
    const { addToast } = useToast();
    const { success, error, warning, info, promise } = useToastHelpers();
    const loadingState = useLoadingState();
    const { isOnline, connectionType } = useNetworkStatus();
    const { addToQueue, queuedActions, syncPending } = useOffline();
    
    const [showFullPageLoading, setShowFullPageLoading] = useState(false);
    const [simulatedProgress, setSimulatedProgress] = useState(0);

    // Toast Demonstrations
    const showToastExamples = () => {
        success('Success!', 'Operation completed successfully');
        
        setTimeout(() => {
            warning('Warning', 'This action cannot be undone');
        }, 1000);
        
        setTimeout(() => {
            info('Information', 'New features are available');
        }, 2000);
        
        setTimeout(() => {
            error('Error', 'Something went wrong. Please try again.');
        }, 3000);
    };

    const showCustomToast = () => {
        addToast({
            type: 'info',
            title: 'Custom Toast',
            message: 'This toast has custom configuration',
            duration: 8000,
            action: {
                label: 'Learn More',
                onClick: () => alert('Action clicked!')
            }
        });
    };

    const showPromiseToast = async () => {
        const simulateAsyncOperation = () => new Promise((resolve, reject) => {
            setTimeout(() => {
                Math.random() > 0.5 ? resolve('Success!') : reject(new Error('Failed'));
            }, 3000);
        });

        promise(simulateAsyncOperation(), {
            loading: { 
                title: 'Processing...', 
                message: 'Please wait while we process your request' 
            },
            success: { 
                title: 'Complete!', 
                message: 'Operation finished successfully' 
            },
            error: { 
                title: 'Failed', 
                message: 'Operation failed. Please try again.' 
            }
        });
    };

    // Loading State Demonstrations
    const simulateLoading = async () => {
        loadingState.setLoading(true);
        loadingState.setProgress(0);
        
        for (let i = 0; i <= 100; i += 10) {
            await new Promise(resolve => setTimeout(resolve, 200));
            loadingState.setProgress(i);
        }
        
        loadingState.setSuccess();
        
        setTimeout(() => {
            loadingState.reset();
        }, 2000);
    };

    const simulateError = () => {
        loadingState.setLoading(true);
        setTimeout(() => {
            loadingState.setError('Network connection failed');
        }, 2000);
    };

    const showFullPageLoader = () => {
        setShowFullPageLoading(true);
        setSimulatedProgress(0);
        
        const interval = setInterval(() => {
            setSimulatedProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => setShowFullPageLoading(false), 1000);
                    return 100;
                }
                return prev + 10;
            });
        }, 300);
    };

    // Offline Handling Demonstrations
    const simulateOfflineAction = () => {
        addToQueue({
            type: 'SAVE_DOCUMENT',
            payload: { 
                documentId: '123',
                content: 'Sample document content',
                timestamp: new Date().toISOString()
            },
            endpoint: '/api/documents',
            method: 'POST',
            maxRetries: 3,
            retryCount: 0
        });
        
        info('Action Queued', 'Your action will be processed when connection is restored');
    };

    const triggerError = () => {
        throw new Error('This is a test error for the Error Boundary');
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            {showFullPageLoading && (
                <FullPageLoading
                    message="Loading Application..."
                    progress={simulatedProgress}
                    showProgress={true}
                />
            )}
            
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    Error Handling & UX Demo
                </h1>
                <p className="text-gray-600">
                    Comprehensive demonstration of error handling, loading states, and user experience improvements.
                </p>
            </div>

            {/* System Status */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-lg border p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <WifiIcon className="w-5 h-5" />
                        Network Status
                    </h3>
                    <div className="space-y-3">
                        <OfflineStatusBadge className="bg-gray-100" />
                        <div className="text-sm text-gray-600">
                            <p><strong>Connection:</strong> {connectionType}</p>
                            <p><strong>Status:</strong> {isOnline ? 'Online' : 'Offline'}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <CloudArrowUpIcon className="w-5 h-5" />
                        Loading State
                    </h3>
                    <div className="space-y-3">
                        <div className="text-sm">
                            <p><strong>Status:</strong> {loadingState.status}</p>
                            <p><strong>Progress:</strong> {loadingState.progress}%</p>
                            {loadingState.error && (
                                <p className="text-red-600"><strong>Error:</strong> {loadingState.error}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Toast Notifications */}
            <div className="bg-white rounded-lg border p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Toast Notifications</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button
                        onClick={showToastExamples}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Show All Types
                    </button>
                    <button
                        onClick={showCustomToast}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        Custom Toast
                    </button>
                    <button
                        onClick={showPromiseToast}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        Promise Toast
                    </button>
                    <button
                        onClick={() => info('Quick Info', 'This is a quick notification')}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        Quick Info
                    </button>
                </div>
            </div>

            {/* Loading States */}
            <div className="bg-white rounded-lg border p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Loading States</h2>
                
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <h3 className="text-lg font-medium mb-3">Loading Controls</h3>
                        <div className="space-y-3">
                            <LoadingButton
                                onClick={simulateLoading}
                                loading={loadingState.isLoading}
                                loadingText="Processing..."
                                className="w-full"
                            >
                                Simulate Loading
                            </LoadingButton>
                            
                            <button
                                onClick={simulateError}
                                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Simulate Error
                            </button>
                            
                            <button
                                onClick={showFullPageLoader}
                                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                Full Page Loading
                            </button>
                            
                            <button
                                onClick={loadingState.reset}
                                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                Reset State
                            </button>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-medium mb-3">Spinner Examples</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <LoadingSpinner size="sm" />
                                <span>Small</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <LoadingSpinner size="md" />
                                <span>Medium</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <LoadingSpinner size="lg" />
                                <span>Large</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <LoadingSpinner size="xl" />
                                <span>Extra Large</span>
                            </div>
                        </div>
                    </div>
                </div>

                <AsyncWrapper
                    loadingState={loadingState}
                    loading={
                        <div className="p-4 text-center">
                            <LoadingSpinner size="lg" className="mb-4" />
                            <p>Loading content...</p>
                        </div>
                    }
                    error={
                        <div className="p-4 text-center text-red-600">
                            <ExclamationTriangleIcon className="w-8 h-8 mx-auto mb-2" />
                            <p>Failed to load content</p>
                            <button
                                onClick={loadingState.reset}
                                className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                            >
                                Retry
                            </button>
                        </div>
                    }
                >
                    <div className="p-4 bg-green-50 rounded-lg text-center">
                        <CheckCircleIcon className="w-8 h-8 mx-auto mb-2 text-green-600" />
                        <p className="text-green-800">Content loaded successfully!</p>
                    </div>
                </AsyncWrapper>
            </div>

            {/* Skeleton Loaders */}
            <div className="bg-white rounded-lg border p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Skeleton Loaders</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="text-lg font-medium mb-3">Text Skeleton</h3>
                        <TextSkeleton lines={4} />
                    </div>
                    
                    <div>
                        <h3 className="text-lg font-medium mb-3">Custom Skeletons</h3>
                        <div className="space-y-2">
                            <Skeleton height="2rem" width="60%" variant="rounded" />
                            <Skeleton height="1rem" width="100%" variant="text" />
                            <Skeleton height="1rem" width="80%" variant="text" />
                            <div className="flex gap-2">
                                <Skeleton height="2rem" width="2rem" variant="circular" />
                                <Skeleton height="2rem" width="8rem" variant="rounded" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6">
                    <h3 className="text-lg font-medium mb-3">Card Skeleton</h3>
                    <SkeletonCard />
                </div>

                <div className="mt-6">
                    <h3 className="text-lg font-medium mb-3">Table Skeleton</h3>
                    <TableSkeleton rows={3} columns={4} />
                </div>
            </div>

            {/* Offline Handling */}
            <div className="bg-white rounded-lg border p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Offline Handling</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="text-lg font-medium mb-3">Offline Actions</h3>
                        <div className="space-y-3">
                            <button
                                onClick={simulateOfflineAction}
                                className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                            >
                                Add Offline Action
                            </button>
                            
                            <button
                                onClick={syncPending}
                                disabled={!isOnline || queuedActions.length === 0}
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Sync Pending ({queuedActions.length})
                            </button>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-medium mb-3">Network Simulation</h3>
                        <div className="space-y-2">
                            <p className="text-sm text-gray-600">
                                Test offline functionality by disabling your network connection
                                or using browser developer tools.
                            </p>
                            <div className={`text-sm p-2 rounded ${
                                isOnline 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                            }`}>
                                Current Status: {isOnline ? 'Online' : 'Offline'}
                            </div>
                        </div>
                    </div>
                </div>

                {queuedActions.length > 0 && (
                    <div className="mt-6">
                        <OfflineActionsQueue />
                    </div>
                )}
            </div>

            {/* Error Boundary Test */}
            <div className="bg-white rounded-lg border p-6">
                <h2 className="text-xl font-semibold mb-4">Error Boundary Test</h2>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-3">
                        <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div>
                            <h3 className="text-sm font-medium text-yellow-800">Warning</h3>
                            <p className="text-sm text-yellow-700 mt-1">
                                This button will trigger an error to test the Error Boundary component.
                                The error will be caught and displayed professionally.
                            </p>
                        </div>
                    </div>
                </div>
                
                <button
                    onClick={triggerError}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                    Trigger Error Boundary
                </button>
            </div>
        </div>
    );
};

export default ErrorHandlingUXDemo;