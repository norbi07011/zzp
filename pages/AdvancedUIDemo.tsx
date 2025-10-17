import React, { useState } from 'react';
import DataTable, { TableColumn } from '../components/DataTable';
import MultiStepForm, { FormStep } from '../components/MultiStepForm';
import { KPICard, ChartWidget, ActivityFeed, QuickActions } from '../components/DashboardWidgets';
import { 
    UserGroupIcon, 
    CurrencyEuroIcon, 
    BriefcaseIcon,
    PlusIcon,
    DocumentTextIcon,
    AdjustmentsHorizontalIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';

// Sample data for demonstrations
const sampleWorkers = [
    { id: 1, name: 'Jan de Vries', email: 'jan@example.com', specialization: 'Frontend', rate: 85, status: 'Actief', registrationDate: '2024-01-15' },
    { id: 2, name: 'Maria van den Berg', email: 'maria@example.com', specialization: 'Backend', rate: 90, status: 'Actief', registrationDate: '2024-02-10' },
    { id: 3, name: 'Pieter Jansen', email: 'pieter@example.com', specialization: 'Full Stack', rate: 95, status: 'Inactief', registrationDate: '2024-01-28' },
    { id: 4, name: 'Emma Bakker', email: 'emma@example.com', specialization: 'Design', rate: 75, status: 'Actief', registrationDate: '2024-03-05' },
    { id: 5, name: 'Tom van der Meer', email: 'tom@example.com', specialization: 'DevOps', rate: 100, status: 'Actief', registrationDate: '2024-02-20' }
];

const chartData = [
    { label: 'Frontend', value: 45, color: 'bg-blue-500' },
    { label: 'Backend', value: 30, color: 'bg-green-500' },
    { label: 'Full Stack', value: 25, color: 'bg-purple-500' },
    { label: 'Design', value: 20, color: 'bg-yellow-500' },
    { label: 'DevOps', value: 15, color: 'bg-red-500' }
];

const sampleActivities = [
    {
        id: '1',
        type: 'user' as const,
        title: 'Nieuwe ZZP\'er geregistreerd',
        description: 'Emma Bakker heeft zich aangemeld als Design specialist',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString()
    },
    {
        id: '2',
        type: 'job' as const,
        title: 'Nieuwe opdracht geplaatst',
        description: 'Frontend ontwikkelaar gezocht voor e-commerce project',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString()
    },
    {
        id: '3',
        type: 'payment' as const,
        title: 'Betaling ontvangen',
        description: '€299 voor Pro abonnement van TechCorp BV',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    }
];

const formSteps: FormStep[] = [
    {
        id: 'personal',
        title: 'Persoonlijke Gegevens',
        description: 'Vul je basisgegevens in',
        fields: [
            {
                name: 'firstName',
                label: 'Voornaam',
                type: 'text',
                required: true,
                placeholder: 'Vul je voornaam in'
            },
            {
                name: 'lastName',
                label: 'Achternaam',
                type: 'text',
                required: true,
                placeholder: 'Vul je achternaam in'
            },
            {
                name: 'email',
                label: 'E-mailadres',
                type: 'email',
                required: true,
                placeholder: 'naam@example.com'
            },
            {
                name: 'phone',
                label: 'Telefoonnummer',
                type: 'tel',
                required: true,
                placeholder: '+31 6 12345678'
            }
        ]
    },
    {
        id: 'professional',
        title: 'Professionele Informatie',
        description: 'Vertel ons over je expertise',
        fields: [
            {
                name: 'specialization',
                label: 'Specialisatie',
                type: 'select',
                required: true,
                options: [
                    { label: 'Frontend Ontwikkelaar', value: 'frontend' },
                    { label: 'Backend Ontwikkelaar', value: 'backend' },
                    { label: 'Full Stack Ontwikkelaar', value: 'fullstack' },
                    { label: 'UI/UX Designer', value: 'design' },
                    { label: 'DevOps Engineer', value: 'devops' }
                ]
            },
            {
                name: 'experience',
                label: 'Jaren ervaring',
                type: 'number',
                required: true,
                min: 0,
                max: 50
            },
            {
                name: 'hourlyRate',
                label: 'Uurtarief (€)',
                type: 'number',
                required: true,
                min: 25,
                max: 200,
                description: 'Je gewenste uurtarief exclusief BTW'
            },
            {
                name: 'skills',
                label: 'Vaardigheden',
                type: 'multiselect',
                options: [
                    { label: 'React', value: 'react' },
                    { label: 'Vue.js', value: 'vue' },
                    { label: 'Angular', value: 'angular' },
                    { label: 'Node.js', value: 'nodejs' },
                    { label: 'Python', value: 'python' },
                    { label: 'Java', value: 'java' },
                    { label: 'PHP', value: 'php' },
                    { label: 'TypeScript', value: 'typescript' }
                ]
            }
        ]
    },
    {
        id: 'documents',
        title: 'Documenten',
        description: 'Upload je documenten',
        fields: [
            {
                name: 'cv',
                label: 'Curriculum Vitae',
                type: 'file',
                required: true,
                accept: '.pdf,.doc,.docx',
                placeholder: 'Upload je CV'
            },
            {
                name: 'portfolio',
                label: 'Portfolio',
                type: 'file',
                accept: '.pdf,.zip',
                multiple: true,
                placeholder: 'Upload je portfolio (optioneel)'
            },
            {
                name: 'availability',
                label: 'Beschikbaarheid',
                type: 'radio',
                required: true,
                options: [
                    { label: 'Direct beschikbaar', value: 'immediate' },
                    { label: 'Binnen 2 weken', value: 'two_weeks' },
                    { label: 'Binnen 1 maand', value: 'one_month' },
                    { label: 'Op afspraak', value: 'on_request' }
                ]
            },
            {
                name: 'terms',
                label: 'Ik ga akkoord met de algemene voorwaarden',
                type: 'checkbox',
                required: true
            }
        ]
    }
];

export default function AdvancedUIDemo() {
    const [activeTab, setActiveTab] = useState<'datatable' | 'forms' | 'dashboard'>('datatable');
    const [formData, setFormData] = useState<Record<string, any>>({});

    // Table columns configuration
    const workerColumns: TableColumn<typeof sampleWorkers[0]>[] = [
        {
            key: 'name',
            title: 'Naam',
            sortable: true,
            filterable: true,
            render: (value, row) => (
                <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-medium text-blue-600">
                            {row.name.split(' ').map(n => n[0]).join('')}
                        </span>
                    </div>
                    <div>
                        <div className="font-medium text-gray-900">{value}</div>
                        <div className="text-sm text-gray-500">{row.email}</div>
                    </div>
                </div>
            )
        },
        {
            key: 'specialization',
            title: 'Specialisatie',
            sortable: true,
            filterable: true,
            filter: {
                type: 'select',
                options: [
                    { label: 'Frontend', value: 'Frontend' },
                    { label: 'Backend', value: 'Backend' },
                    { label: 'Full Stack', value: 'Full Stack' },
                    { label: 'Design', value: 'Design' },
                    { label: 'DevOps', value: 'DevOps' }
                ]
            }
        },
        {
            key: 'rate',
            title: 'Uurtarief',
            sortable: true,
            render: (value) => <span className="font-medium">€{value}/uur</span>
        },
        {
            key: 'status',
            title: 'Status',
            sortable: true,
            filterable: true,
            filter: {
                type: 'select',
                options: [
                    { label: 'Actief', value: 'Actief' },
                    { label: 'Inactief', value: 'Inactief' }
                ]
            },
            render: (value) => (
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    value === 'Actief' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                }`}>
                    {value}
                </span>
            )
        },
        {
            key: 'registrationDate',
            title: 'Registratie',
            sortable: true,
            render: (value) => new Date(value).toLocaleDateString('nl-NL')
        }
    ];

    const quickActions = [
        {
            id: 'add-worker',
            title: 'Nieuwe ZZP\'er',
            description: 'Voeg een nieuwe freelancer toe',
            icon: PlusIcon,
            color: 'green' as const,
            onClick: () => alert('Nieuwe ZZP\'er toevoegen')
        },
        {
            id: 'create-job',
            title: 'Opdracht Plaatsen',
            description: 'Plaats een nieuwe vacature',
            icon: BriefcaseIcon,
            color: 'blue' as const,
            onClick: () => alert('Nieuwe opdracht plaatsen')
        },
        {
            id: 'generate-report',
            title: 'Rapport Genereren',
            description: 'Maak een overzichtsrapport',
            icon: DocumentTextIcon,
            color: 'purple' as const,
            onClick: () => alert('Rapport genereren')
        },
        {
            id: 'settings',
            title: 'Instellingen',
            description: 'Beheer platforminstellingen',
            icon: AdjustmentsHorizontalIcon,
            color: 'yellow' as const,
            onClick: () => alert('Instellingen openen')
        }
    ];

    const handleFormSubmit = async (data: Record<string, any>) => {
        console.log('Form submitted:', data);
        setFormData(data);
        alert('Formulier succesvol verzonden! Check de console voor data.');
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Advanced UI Components Demo</h1>
                    <p className="mt-2 text-lg text-gray-600">
                        Demonstratie van enterprise-grade UI componenten voor de ZZP Werkplaats
                    </p>
                </div>

                {/* Navigation Tabs */}
                <div className="border-b border-gray-200 mb-8">
                    <nav className="-mb-px flex space-x-8">
                        {[
                            { key: 'datatable', label: 'Enhanced Data Tables', icon: ChartBarIcon },
                            { key: 'forms', label: 'Multi-Step Forms', icon: DocumentTextIcon },
                            { key: 'dashboard', label: 'Dashboard Widgets', icon: AdjustmentsHorizontalIcon }
                        ].map(({ key, label, icon: Icon }) => (
                            <button
                                key={key}
                                onClick={() => setActiveTab(key as any)}
                                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === key
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <Icon className="h-5 w-5 mr-2" />
                                {label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content */}
                {activeTab === 'datatable' && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Enhanced Data Table</h2>
                            <p className="text-gray-600 mb-6">
                                Professional data table met sorting, filtering, pagination, search en export functionaliteit.
                            </p>
                        </div>
                        <DataTable
                            data={sampleWorkers}
                            columns={workerColumns}
                            title="ZZP'ers Overzicht"
                            searchable={true}
                            exportable={true}
                            pagination={{
                                enabled: true,
                                pageSize: 3,
                                pageSizeOptions: [3, 5, 10, 25]
                            }}
                            onRowClick={(worker) => alert(`Geselecteerd: ${worker.name}`)}
                        />
                    </div>
                )}

                {activeTab === 'forms' && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Multi-Step Form</h2>
                            <p className="text-gray-600 mb-6">
                                Geavanceerd multi-step formulier met validatie, conditional fields, file upload en auto-save.
                            </p>
                        </div>
                        <MultiStepForm
                            steps={formSteps}
                            onSubmit={handleFormSubmit}
                            autoSave={true}
                            autoSaveKey="worker-registration"
                            submitButtonText="Registratie Voltooien"
                            allowStepNavigation={true}
                        />
                        
                        {Object.keys(formData).length > 0 && (
                            <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
                                <h3 className="text-lg font-medium text-green-900 mb-4">Verzonden Data:</h3>
                                <pre className="text-sm text-green-700 overflow-auto">
                                    {JSON.stringify(formData, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'dashboard' && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Dashboard Widgets</h2>
                            <p className="text-gray-600 mb-6">
                                Interactieve dashboard componenten voor KPI's, charts, activiteiten en quick actions.
                            </p>
                        </div>

                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <KPICard
                                title="Totaal ZZP'ers"
                                value={247}
                                change={{ value: 12.5, period: 'vorige maand', type: 'increase' }}
                                icon={UserGroupIcon}
                                color="blue"
                            />
                            <KPICard
                                title="Actieve Opdrachten"
                                value={89}
                                change={{ value: 8.2, period: 'vorige week', type: 'increase' }}
                                icon={BriefcaseIcon}
                                color="green"
                            />
                            <KPICard
                                title="Maandelijkse Omzet"
                                value="€24,583"
                                change={{ value: 3.1, period: 'vorige maand', type: 'decrease' }}
                                icon={CurrencyEuroIcon}
                                color="yellow"
                            />
                            <KPICard
                                title="Gemiddeld Uurtarief"
                                value="€87"
                                change={{ value: 5.7, period: 'vorige maand', type: 'increase' }}
                                icon={ChartBarIcon}
                                color="purple"
                            />
                        </div>

                        {/* Charts and Activities */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <ChartWidget
                                title="Specialisaties Verdeling"
                                subtitle="Aantal ZZP'ers per specialisatie"
                                data={chartData}
                                type="pie"
                                onRefresh={async () => {
                                    await new Promise(resolve => setTimeout(resolve, 1000));
                                }}
                            />
                            
                            <ActivityFeed
                                title="Recente Activiteiten"
                                activities={sampleActivities}
                                hasMore={true}
                                onLoadMore={() => alert('Meer activiteiten laden...')}
                            />
                        </div>

                        {/* Quick Actions */}
                        <QuickActions
                            title="Snelle Acties"
                            actions={quickActions}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}