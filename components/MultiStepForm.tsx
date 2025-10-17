import React, { useState, useCallback, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, CheckIcon, CloudArrowUpIcon, XMarkIcon } from '@heroicons/react/24/outline';

export interface FormStep {
    id: string;
    title: string;
    description?: string;
    fields: FormField[];
    validation?: (values: Record<string, any>) => Record<string, string>;
}

export interface FormField {
    name: string;
    label: string;
    type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'textarea' | 'select' | 'multiselect' | 'checkbox' | 'radio' | 'file' | 'date' | 'time' | 'datetime-local';
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    options?: Array<{ label: string; value: any }>;
    accept?: string; // for file inputs
    multiple?: boolean;
    rows?: number; // for textarea
    min?: number | string;
    max?: number | string;
    pattern?: string;
    validation?: (value: any) => string | null;
    conditional?: {
        field: string;
        value: any;
        operator?: 'equals' | 'not-equals' | 'contains' | 'greater-than' | 'less-than';
    };
    description?: string;
    className?: string;
}

export interface MultiStepFormProps {
    steps: FormStep[];
    onSubmit: (values: Record<string, any>) => Promise<void> | void;
    onCancel?: () => void;
    initialValues?: Record<string, any>;
    autoSave?: boolean;
    autoSaveKey?: string;
    className?: string;
    submitButtonText?: string;
    allowStepNavigation?: boolean;
}

export function MultiStepForm({
    steps,
    onSubmit,
    onCancel,
    initialValues = {},
    autoSave = false,
    autoSaveKey = 'form-draft',
    className = '',
    submitButtonText = 'Voltooien',
    allowStepNavigation = true
}: MultiStepFormProps) {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [values, setValues] = useState<Record<string, any>>(initialValues);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

    const currentStep = steps[currentStepIndex];
    const isLastStep = currentStepIndex === steps.length - 1;

    // Auto-save functionality
    useEffect(() => {
        if (autoSave && autoSaveKey) {
            const savedData = localStorage.getItem(`form-draft-${autoSaveKey}`);
            if (savedData) {
                try {
                    const parsed = JSON.parse(savedData);
                    setValues(prev => ({ ...prev, ...parsed }));
                } catch (error) {
                    console.warn('Failed to parse saved form data:', error);
                }
            }
        }
    }, [autoSave, autoSaveKey]);

    useEffect(() => {
        if (autoSave && autoSaveKey && Object.keys(values).length > 0) {
            const timeoutId = setTimeout(() => {
                localStorage.setItem(`form-draft-${autoSaveKey}`, JSON.stringify(values));
            }, 1000);
            return () => clearTimeout(timeoutId);
        }
    }, [values, autoSave, autoSaveKey]);

    // Field visibility logic
    const isFieldVisible = useCallback((field: FormField) => {
        if (!field.conditional) return true;

        const { field: conditionField, value: conditionValue, operator = 'equals' } = field.conditional;
        const fieldValue = values[conditionField];

        switch (operator) {
            case 'equals':
                return fieldValue === conditionValue;
            case 'not-equals':
                return fieldValue !== conditionValue;
            case 'contains':
                return Array.isArray(fieldValue) && fieldValue.includes(conditionValue);
            case 'greater-than':
                return Number(fieldValue) > Number(conditionValue);
            case 'less-than':
                return Number(fieldValue) < Number(conditionValue);
            default:
                return true;
        }
    }, [values]);

    // Validation
    const validateStep = useCallback((stepIndex: number) => {
        const step = steps[stepIndex];
        const stepErrors: Record<string, string> = {};

        // Field-level validation
        step.fields.forEach(field => {
            if (!isFieldVisible(field)) return;

            const value = values[field.name];
            
            // Required validation
            if (field.required && (!value || (Array.isArray(value) && value.length === 0))) {
                stepErrors[field.name] = `${field.label} is verplicht`;
                return;
            }

            // Custom field validation
            if (field.validation && value) {
                const error = field.validation(value);
                if (error) {
                    stepErrors[field.name] = error;
                }
            }

            // Type-specific validation
            if (value) {
                switch (field.type) {
                    case 'email':
                        const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
                        if (!emailRegex.test(value)) {
                            stepErrors[field.name] = 'Ongeldig e-mailadres';
                        }
                        break;
                    case 'tel':
                        const phoneRegex = /^[\\+]?[1-9][\\d\\s\\-\\(\\)]{8,}$/;
                        if (!phoneRegex.test(value)) {
                            stepErrors[field.name] = 'Ongeldig telefoonnummer';
                        }
                        break;
                    case 'url':
                        try {
                            new URL(value);
                        } catch {
                            stepErrors[field.name] = 'Ongeldige URL';
                        }
                        break;
                    case 'number':
                        if (isNaN(Number(value))) {
                            stepErrors[field.name] = 'Moet een geldig nummer zijn';
                        } else {
                            if (field.min !== undefined && Number(value) < Number(field.min)) {
                                stepErrors[field.name] = `Moet minimaal ${field.min} zijn`;
                            }
                            if (field.max !== undefined && Number(value) > Number(field.max)) {
                                stepErrors[field.name] = `Mag maximaal ${field.max} zijn`;
                            }
                        }
                        break;
                }
            }
        });

        // Step-level validation
        if (step.validation) {
            const stepLevelErrors = step.validation(values);
            Object.assign(stepErrors, stepLevelErrors);
        }

        return stepErrors;
    }, [steps, values, isFieldVisible]);

    // Handle input changes
    const handleChange = useCallback((fieldName: string, value: any) => {
        setValues(prev => ({ ...prev, [fieldName]: value }));
        setTouched(prev => ({ ...prev, [fieldName]: true }));
        
        // Clear error when user starts typing
        if (errors[fieldName]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[fieldName];
                return newErrors;
            });
        }
    }, [errors]);

    // File upload handler
    const handleFileUpload = useCallback(async (fieldName: string, files: FileList) => {
        const field = currentStep.fields.find(f => f.name === fieldName);
        if (!field) return;

        const uploadedFiles: File[] = [];
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            uploadedFiles.push(file);
            
            // Simulate upload progress
            setUploadProgress(prev => ({ ...prev, [`${fieldName}_${i}`]: 0 }));
            
            // Simulate upload (replace with real upload logic)
            for (let progress = 0; progress <= 100; progress += 20) {
                await new Promise(resolve => setTimeout(resolve, 100));
                setUploadProgress(prev => ({ ...prev, [`${fieldName}_${i}`]: progress }));
            }
        }

        handleChange(fieldName, field.multiple ? uploadedFiles : uploadedFiles[0]);
        setUploadProgress(prev => {
            const newProgress = { ...prev };
            for (let i = 0; i < files.length; i++) {
                delete newProgress[`${fieldName}_${i}`];
            }
            return newProgress;
        });
    }, [currentStep.fields, handleChange]);

    // Navigation
    const goToStep = useCallback((stepIndex: number) => {
        if (!allowStepNavigation) return;
        
        // Validate all previous steps
        for (let i = 0; i < stepIndex; i++) {
            const stepErrors = validateStep(i);
            if (Object.keys(stepErrors).length > 0) {
                setErrors(stepErrors);
                return;
            }
        }
        
        setCurrentStepIndex(stepIndex);
        setErrors({});
    }, [allowStepNavigation, validateStep]);

    const nextStep = useCallback(() => {
        const stepErrors = validateStep(currentStepIndex);
        if (Object.keys(stepErrors).length > 0) {
            setErrors(stepErrors);
            return;
        }
        
        setErrors({});
        if (!isLastStep) {
            setCurrentStepIndex(prev => prev + 1);
        }
    }, [currentStepIndex, validateStep, isLastStep]);

    const prevStep = useCallback(() => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(prev => prev - 1);
            setErrors({});
        }
    }, [currentStepIndex]);

    // Form submission
    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate all steps
        let allErrors: Record<string, string> = {};
        for (let i = 0; i < steps.length; i++) {
            const stepErrors = validateStep(i);
            allErrors = { ...allErrors, ...stepErrors };
        }
        
        if (Object.keys(allErrors).length > 0) {
            setErrors(allErrors);
            // Go to first step with errors
            for (let i = 0; i < steps.length; i++) {
                const stepFields = steps[i].fields.map(f => f.name);
                if (stepFields.some(fieldName => allErrors[fieldName])) {
                    setCurrentStepIndex(i);
                    break;
                }
            }
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit(values);
            // Clear auto-saved data on successful submission
            if (autoSave && autoSaveKey) {
                localStorage.removeItem(`form-draft-${autoSaveKey}`);
            }
        } catch (error) {
            console.error('Form submission error:', error);
        } finally {
            setIsSubmitting(false);
        }
    }, [steps, validateStep, values, onSubmit, autoSave, autoSaveKey]);

    // Render field
    const renderField = useCallback((field: FormField) => {
        if (!isFieldVisible(field)) return null;

        const value = values[field.name] || '';
        const error = errors[field.name];
        const isTouched = touched[field.name];

        const baseClasses = `w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            error && isTouched ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
        } ${field.disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`;

        const renderInput = () => {
            switch (field.type) {
                case 'textarea':
                    return (
                        <textarea
                            id={field.name}
                            name={field.name}
                            value={value}
                            onChange={(e) => handleChange(field.name, e.target.value)}
                            placeholder={field.placeholder}
                            required={field.required}
                            disabled={field.disabled}
                            rows={field.rows || 3}
                            className={baseClasses}
                        />
                    );

                case 'select':
                    return (
                        <select
                            id={field.name}
                            name={field.name}
                            value={value}
                            onChange={(e) => handleChange(field.name, e.target.value)}
                            required={field.required}
                            disabled={field.disabled}
                            className={baseClasses}
                        >
                            <option value="">Selecteer...</option>
                            {field.options?.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    );

                case 'multiselect':
                    return (
                        <div className="space-y-2">
                            {field.options?.map(option => (
                                <label key={option.value} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={Array.isArray(value) && value.includes(option.value)}
                                        onChange={(e) => {
                                            const currentArray = Array.isArray(value) ? value : [];
                                            if (e.target.checked) {
                                                handleChange(field.name, [...currentArray, option.value]);
                                            } else {
                                                handleChange(field.name, currentArray.filter(v => v !== option.value));
                                            }
                                        }}
                                        disabled={field.disabled}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                                </label>
                            ))}
                        </div>
                    );

                case 'radio':
                    return (
                        <div className="space-y-2">
                            {field.options?.map(option => (
                                <label key={option.value} className="flex items-center">
                                    <input
                                        type="radio"
                                        name={field.name}
                                        value={option.value}
                                        checked={value === option.value}
                                        onChange={(e) => handleChange(field.name, e.target.value)}
                                        required={field.required}
                                        disabled={field.disabled}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                                </label>
                            ))}
                        </div>
                    );

                case 'checkbox':
                    return (
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={!!value}
                                onChange={(e) => handleChange(field.name, e.target.checked)}
                                required={field.required}
                                disabled={field.disabled}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">{field.label}</span>
                        </label>
                    );

                case 'file':
                    return (
                        <div>
                            <input
                                id={field.name}
                                type="file"
                                accept={field.accept}
                                multiple={field.multiple}
                                onChange={(e) => e.target.files && handleFileUpload(field.name, e.target.files)}
                                disabled={field.disabled}
                                className="hidden"
                            />
                            <label
                                htmlFor={field.name}
                                className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                                    field.disabled ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                <CloudArrowUpIcon className="h-5 w-5 mr-2" />
                                {field.placeholder || 'Bestand kiezen'}
                            </label>
                            {value && (
                                <div className="mt-2 space-y-1">
                                    {Array.isArray(value) ? value.map((file: File, index: number) => (
                                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                            <span className="text-sm text-gray-700">{file.name}</span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newFiles = value.filter((_: any, i: number) => i !== index);
                                                    handleChange(field.name, newFiles.length > 0 ? newFiles : null);
                                                }}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <XMarkIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    )) : (
                                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                            <span className="text-sm text-gray-700">{(value as File).name}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleChange(field.name, null)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <XMarkIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );

                default:
                    return (
                        <input
                            id={field.name}
                            type={field.type}
                            name={field.name}
                            value={value}
                            onChange={(e) => handleChange(field.name, e.target.value)}
                            placeholder={field.placeholder}
                            required={field.required}
                            disabled={field.disabled}
                            min={field.min}
                            max={field.max}
                            pattern={field.pattern}
                            className={baseClasses}
                        />
                    );
            }
        };

        if (field.type === 'checkbox') {
            return (
                <div key={field.name} className={`${field.className || ''}`}>
                    {renderInput()}
                    {field.description && (
                        <p className="mt-1 text-sm text-gray-500">{field.description}</p>
                    )}
                    {error && isTouched && (
                        <p className="mt-1 text-sm text-red-600">{error}</p>
                    )}
                </div>
            );
        }

        return (
            <div key={field.name} className={`${field.className || ''}`}>
                <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {renderInput()}
                {field.description && (
                    <p className="mt-1 text-sm text-gray-500">{field.description}</p>
                )}
                {error && isTouched && (
                    <p className="mt-1 text-sm text-red-600">{error}</p>
                )}
            </div>
        );
    }, [values, errors, touched, isFieldVisible, handleChange, handleFileUpload]);

    return (
        <div className={`max-w-2xl mx-auto bg-white rounded-lg shadow-sm border ${className}`}>
            {/* Progress indicator */}
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center">
                    {steps.map((step, index) => (
                        <React.Fragment key={step.id}>
                            <button
                                type="button"
                                onClick={() => goToStep(index)}
                                disabled={!allowStepNavigation}
                                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                                    index < currentStepIndex
                                        ? 'bg-green-600 text-white'
                                        : index === currentStepIndex
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-200 text-gray-600'
                                } ${allowStepNavigation ? 'hover:bg-opacity-80 cursor-pointer' : 'cursor-default'}`}
                            >
                                {index < currentStepIndex ? (
                                    <CheckIcon className="h-5 w-5" />
                                ) : (
                                    index + 1
                                )}
                            </button>
                            {index < steps.length - 1 && (
                                <div className={`flex-1 h-0.5 mx-2 ${
                                    index < currentStepIndex ? 'bg-green-600' : 'bg-gray-200'
                                }`} />
                            )}
                        </React.Fragment>
                    ))}
                </div>
                <div className="mt-4">
                    <h2 className="text-lg font-medium text-gray-900">{currentStep.title}</h2>
                    {currentStep.description && (
                        <p className="text-sm text-gray-500 mt-1">{currentStep.description}</p>
                    )}
                </div>
            </div>

            {/* Form content */}
            <form onSubmit={handleSubmit} className="px-6 py-6">
                <div className="space-y-6">
                    {currentStep.fields.map(renderField)}
                </div>

                {/* Auto-save indicator */}
                {autoSave && Object.keys(values).length > 0 && (
                    <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-sm text-blue-700">
                            <CheckIcon className="h-4 w-4 inline mr-1" />
                            Concept automatisch opgeslagen
                        </p>
                    </div>
                )}

                {/* Navigation buttons */}
                <div className="mt-8 flex items-center justify-between">
                    <div>
                        {currentStepIndex > 0 && (
                            <button
                                type="button"
                                onClick={prevStep}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <ChevronLeftIcon className="h-4 w-4 mr-1" />
                                Vorige
                            </button>
                        )}
                    </div>

                    <div className="flex gap-3">
                        {onCancel && (
                            <button
                                type="button"
                                onClick={onCancel}
                                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                Annuleren
                            </button>
                        )}
                        {isLastStep ? (
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Verwerken...
                                    </>
                                ) : (
                                    submitButtonText
                                )}
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={nextStep}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                Volgende
                                <ChevronRightIcon className="h-4 w-4 ml-1" />
                            </button>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
}

export default MultiStepForm;