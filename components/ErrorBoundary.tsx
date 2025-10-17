import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon, ChatBubbleLeftEllipsisIcon } from '@heroicons/react/24/outline';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    showDetails?: boolean;
    enableReporting?: boolean;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
    errorId: string | null;
    isReporting: boolean;
    reportSent: boolean;
}

/**
 * Enhanced Error Boundary Component
 * Enterprise-grade error handling with reporting, recovery options, and professional UI
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: null,
            isReporting: false,
            reportSent: false
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        // Generate unique error ID for tracking
        const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        return {
            hasError: true,
            error,
            errorId
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        this.setState({ errorInfo });

        // Log error to console in development
        if (process.env.NODE_ENV === 'development') {
            console.group('🚨 Error Boundary Caught an Error');
            console.error('Error:', error);
            console.error('Error Info:', errorInfo);
            console.error('Component Stack:', errorInfo.componentStack);
            console.groupEnd();
        }

        // Store error details in localStorage for debugging
        try {
            const errorDetails = {
                timestamp: new Date().toISOString(),
                errorId: this.state.errorId,
                message: error.message,
                stack: error.stack,
                componentStack: errorInfo.componentStack,
                userAgent: navigator.userAgent,
                url: window.location.href
            };
            
            const existingErrors = JSON.parse(localStorage.getItem('app-errors') || '[]');
            existingErrors.push(errorDetails);
            
            // Keep only last 10 errors
            if (existingErrors.length > 10) {
                existingErrors.splice(0, existingErrors.length - 10);
            }
            
            localStorage.setItem('app-errors', JSON.stringify(existingErrors));
        } catch (storageError) {
            console.warn('Failed to store error details:', storageError);
        }

        // Call custom error handler if provided
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }

        // Auto-report critical errors in production
        if (process.env.NODE_ENV === 'production' && this.props.enableReporting) {
            this.reportError(error, errorInfo);
        }
    }

    reportError = async (error: Error, errorInfo: ErrorInfo) => {
        if (this.state.isReporting || this.state.reportSent) return;

        this.setState({ isReporting: true });

        try {
            // Simulate error reporting to admin panel
            const errorReport = {
                errorId: this.state.errorId,
                timestamp: new Date().toISOString(),
                message: error.message,
                stack: error.stack,
                componentStack: errorInfo.componentStack,
                userAgent: navigator.userAgent,
                url: window.location.href,
                userId: 'current-user-id', // Get from auth context
                sessionId: sessionStorage.getItem('session-id') || 'unknown'
            };

            // In real app, send to your error reporting service
            console.log('Reporting error to admin:', errorReport);
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            this.setState({ reportSent: true });
        } catch (reportingError) {
            console.warn('Failed to report error:', reportingError);
        } finally {
            this.setState({ isReporting: false });
        }
    };

    handleReload = () => {
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    handleRetry = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: null,
            isReporting: false,
            reportSent: false
        });
    };

    handleReportBug = () => {
        if (!this.state.isReporting && !this.state.reportSent && this.state.error && this.state.errorInfo) {
            this.reportError(this.state.error, this.state.errorInfo);
        }
    };

    render() {
        if (this.state.hasError) {
            // Use custom fallback if provided
            if (this.props.fallback) {
                return this.props.fallback;
            }

            const { error, errorInfo, errorId, isReporting, reportSent } = this.state;
            const isDev = process.env.NODE_ENV === 'development';

            return (
                <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                    <div className="sm:mx-auto sm:w-full sm:max-w-md">
                        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
                            {/* Error Icon */}
                            <div className="flex justify-center mb-6">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                                    <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
                                </div>
                            </div>

                            {/* Error Message */}
                            <div className="text-center mb-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                    Er is iets misgegaan
                                </h2>
                                <p className="text-gray-600">
                                    We hebben een onverwachte fout ondervonden. Onze excuses voor het ongemak.
                                </p>
                                {errorId && (
                                    <p className="text-xs text-gray-400 mt-2">
                                        Error ID: {errorId}
                                    </p>
                                )}
                            </div>

                            {/* Error Details (Development only) */}
                            {isDev && this.props.showDetails && error && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                                    <h3 className="text-sm font-medium text-red-800 mb-2">Development Details:</h3>
                                    <div className="text-xs text-red-700 space-y-2">
                                        <div>
                                            <strong>Error:</strong> {error.message}
                                        </div>
                                        {error.stack && (
                                            <div>
                                                <strong>Stack:</strong>
                                                <pre className="mt-1 whitespace-pre-wrap overflow-auto max-h-32 text-xs">
                                                    {error.stack}
                                                </pre>
                                            </div>
                                        )}
                                        {errorInfo?.componentStack && (
                                            <div>
                                                <strong>Component Stack:</strong>
                                                <pre className="mt-1 whitespace-pre-wrap overflow-auto max-h-32 text-xs">
                                                    {errorInfo.componentStack}
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                <button
                                    onClick={this.handleRetry}
                                    className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                >
                                    <ArrowPathIcon className="w-4 h-4 mr-2" />
                                    Opnieuw Proberen
                                </button>

                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={this.handleGoHome}
                                        className="flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                    >
                                        Naar Home
                                    </button>
                                    <button
                                        onClick={this.handleReload}
                                        className="flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                    >
                                        Herlaad Pagina
                                    </button>
                                </div>

                                {/* Error Reporting */}
                                {this.props.enableReporting && (
                                    <div className="pt-3 border-t border-gray-200">
                                        {reportSent ? (
                                            <div className="text-center py-2">
                                                <p className="text-sm text-green-600">
                                                    ✓ Foutrapport verzonden. Bedankt voor je hulp!
                                                </p>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={this.handleReportBug}
                                                disabled={isReporting}
                                                className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <ChatBubbleLeftEllipsisIcon className="w-4 h-4 mr-2" />
                                                {isReporting ? 'Verzenden...' : 'Rapporteer Bug'}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Recovery Tips */}
                            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                                <h3 className="text-sm font-medium text-blue-800 mb-2">Tips om het probleem op te lossen:</h3>
                                <ul className="text-xs text-blue-700 space-y-1">
                                    <li>• Controleer je internetverbinding</li>
                                    <li>• Wis je browser cache en cookies</li>
                                    <li>• Probeer de pagina opnieuw te laden</li>
                                    <li>• Contact support als het probleem aanhoudt</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
