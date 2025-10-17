import React from 'react';
import { useNotifications } from '../contexts/RealTimeNotificationContext';

// 🧪 **NOTIFICATION TEST COMPONENT**
// Component for testing real-time notification system

export const NotificationTest: React.FC = () => {
    const { addNotification, isConnected } = useNotifications();

    const testNotifications = [
        {
            type: 'NEW_JOB' as const,
            message: 'Nieuwe afspraak aanvraag van John Smith voor morgen 14:00',
            link: '/admin/appointments',
            userId: 1
        },
        {
            type: 'NEW_APPLICATION' as const,
            message: 'Nieuwe ZZPer heeft zich geregistreerd: Maria van der Berg',
            link: '/admin/workers',
            userId: 1
        },
        {
            type: 'PAYMENT_RECEIVED' as const,
            message: 'Betaling van €299 ontvangen voor Pro abonnement',
            link: '/admin/billing',
            userId: 1
        },
        {
            type: 'STATUS_CHANGE' as const,
            message: 'Fout bij verwerken van certificaat upload voor worker ID 123',
            userId: 1
        },
        {
            type: 'NEW_MESSAGE' as const,
            message: 'Systeem onderhoud gepland voor vanavond 23:00 - 01:00',
            userId: 1
        }
    ];

    const sendTestNotification = async (notification: typeof testNotifications[0]) => {
        await addNotification(notification);
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    🔔 Real-Time Notification Test
                </h2>

                {/* Connection Status */}
                <div className="mb-6 p-4 rounded-lg bg-gray-50 border">
                    <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className={`font-semibold ${isConnected ? 'text-green-700' : 'text-red-700'}`}>
                            Status: {isConnected ? 'Connected' : 'Disconnected'}
                        </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                        {isConnected 
                            ? 'Real-time notification system is running!' 
                            : 'Connection failed - using fallback mode'
                        }
                    </p>
                </div>

                {/* Test Buttons */}
                <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                        Test Notifications:
                    </h3>
                    
                    {testNotifications.map((notification, index) => (
                        <button
                            key={index}
                            onClick={() => sendTestNotification(notification)}
                            className={`w-full text-left p-4 rounded-lg border transition-all hover:shadow-md ${
                                notification.type === 'NEW_JOB' ? 'border-blue-200 hover:bg-blue-50' :
                                notification.type === 'NEW_APPLICATION' ? 'border-green-200 hover:bg-green-50' :
                                notification.type === 'PAYMENT_RECEIVED' ? 'border-yellow-200 hover:bg-yellow-50' :
                                notification.type === 'STATUS_CHANGE' ? 'border-red-200 hover:bg-red-50' :
                                'border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                {/* Type Icon */}
                                <div className={`p-2 rounded-full ${
                                    notification.type === 'NEW_JOB' ? 'bg-blue-100 text-blue-600' :
                                    notification.type === 'NEW_APPLICATION' ? 'bg-green-100 text-green-600' :
                                    notification.type === 'PAYMENT_RECEIVED' ? 'bg-yellow-100 text-yellow-600' :
                                    notification.type === 'STATUS_CHANGE' ? 'bg-red-100 text-red-600' :
                                    'bg-gray-100 text-gray-600'
                                }`}>
                                    {notification.type === 'NEW_JOB' && (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    )}
                                    {notification.type === 'NEW_APPLICATION' && (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    )}
                                    {notification.type === 'PAYMENT_RECEIVED' && (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                        </svg>
                                    )}
                                    {notification.type === 'STATUS_CHANGE' && (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    )}
                                    {notification.type === 'NEW_MESSAGE' && (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-xs font-semibold uppercase tracking-wide ${
                                            notification.type === 'NEW_JOB' ? 'text-blue-600' :
                                            notification.type === 'NEW_APPLICATION' ? 'text-green-600' :
                                            notification.type === 'PAYMENT_RECEIVED' ? 'text-yellow-600' :
                                            notification.type === 'STATUS_CHANGE' ? 'text-red-600' :
                                            'text-gray-600'
                                        }`}>
                                            {notification.type}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-700">
                                        {notification.message}
                                    </p>
                                </div>

                                {/* Send Button */}
                                <div className="text-blue-600 font-medium text-sm">
                                    Verzend →
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Instructions */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-2">Hoe te testen:</h4>
                    <ol className="text-sm text-blue-800 space-y-1">
                        <li>1. Klik op een test notificatie hierboven</li>
                        <li>2. Kijk naar de bel-icoon in de navigatie voor de rode badge</li>
                        <li>3. Klik op de bel om je notificaties te bekijken</li>
                        <li>4. Let op browser notificaties (als toegestaan)</li>
                        <li>5. Test markeren als gelezen en verwijderen</li>
                    </ol>
                </div>
            </div>
        </div>
    );
};