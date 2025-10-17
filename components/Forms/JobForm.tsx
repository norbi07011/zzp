import React, { useState } from 'react';
import { Job, JobRateType } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { HelpIcon } from '../OnboardingComponents';

interface JobFormProps {
    onSave: () => void;
    onCancel: () => void;
}

const ALL_CERTS = ['VCA', 'NEN 3140', 'SEP E1', 'F-Gazy'];

export const JobForm: React.FC<JobFormProps> = ({ onSave, onCancel }) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        title: '',
        location: '',
        startDate: '',
        endDate: '',
        rateType: JobRateType.Hourly,
        rateValue: 40,
        peopleNeeded: 1,
        requiredCerts: [] as string[],
        description: '',
        isPriority: false,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            if (name === 'isPriority') {
                 setFormData(prev => ({ ...prev, isPriority: checked }));
            } else {
                setFormData(prev => ({
                    ...prev,
                    requiredCerts: checked
                        ? [...prev.requiredCerts, value]
                        : prev.requiredCerts.filter(c => c !== value)
                }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.title.trim() || formData.title.length < 10) newErrors.title = 'Tytuł musi mieć co najmniej 10 znaków.';
        if (!formData.location.trim()) newErrors.location = 'Lokalizacja jest wymagana.';
        if (!formData.startDate) newErrors.startDate = 'Data rozpoczęcia jest wymagana.';
        if (!formData.endDate) newErrors.endDate = 'Data zakończenia jest wymagana.';
        if (new Date(formData.endDate) < new Date(formData.startDate)) newErrors.endDate = 'Data zakończenia nie może być wcześniejsza niż rozpoczęcia.';
        if (formData.rateValue <= 0) newErrors.rateValue = 'Stawka musi być większa od 0.';
        if (formData.peopleNeeded <= 0) newErrors.peopleNeeded = 'Liczba osób musi być większa od 0.';
        if (!formData.description.trim() || formData.description.length < 50) newErrors.description = 'Opis musi mieć co najmniej 50 znaków.';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate() && user) {
            const newJob: Job = {
                ...formData,
                id: Date.now(),
                clientId: user?.id ? parseInt(user.id, 10) : 0,
                clientName: user?.fullName || '',
                logoUrl: 'https://picsum.photos/seed/new_client/100', // Mock logo
                rateValue: Number(formData.rateValue),
                peopleNeeded: Number(formData.peopleNeeded),
            };
            const existingJobs: Job[] = JSON.parse(localStorage.getItem('zzp-jobs') || '[]');
            localStorage.setItem('zzp-jobs', JSON.stringify([...existingJobs, newJob]));
            onSave();
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tytuł ogłoszenia</label>
                    <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500"/>
                    {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
                </div>
                <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Lokalizacja</label>
                    <input type="text" name="location" id="location" value={formData.location} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500"/>
                    {errors.location && <p className="text-sm text-red-500 mt-1">{errors.location}</p>}
                </div>
                <div>
                     <label htmlFor="peopleNeeded" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Liczba osób</label>
                    <input type="number" name="peopleNeeded" id="peopleNeeded" value={formData.peopleNeeded} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500"/>
                    {errors.peopleNeeded && <p className="text-sm text-red-500 mt-1">{errors.peopleNeeded}</p>}
                </div>
                 <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data rozpoczęcia</label>
                    <input type="date" name="startDate" id="startDate" value={formData.startDate} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500"/>
                     {errors.startDate && <p className="text-sm text-red-500 mt-1">{errors.startDate}</p>}
                </div>
                 <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data zakończenia</label>
                    <input type="date" name="endDate" id="endDate" value={formData.endDate} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500"/>
                    {errors.endDate && <p className="text-sm text-red-500 mt-1">{errors.endDate}</p>}
                </div>
                 <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Stawka
                        <HelpIcon content="Wybierz typ stawki (godzinowa, dzienna, ryczałt) i podaj wartość. Konkurencyjna stawka zwiększa szanse na znalezienie specjalistów." />
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                        <select name="rateType" value={formData.rateType} onChange={handleChange} aria-label="Typ stawki" className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400">
                            <option value={JobRateType.Hourly}>€/h</option>
                            <option value={JobRateType.Daily}>€/dzień</option>
                            <option value={JobRateType.Fixed}>€ ryczałt</option>
                        </select>
                        <input type="number" name="rateValue" value={formData.rateValue} onChange={handleChange} aria-label="Wartość stawki" placeholder="0" className="block w-full min-w-0 flex-1 rounded-none rounded-r-md border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-primary-500"/>
                    </div>
                    {errors.rateValue && <p className="text-sm text-red-500 mt-1">{errors.rateValue}</p>}
                </div>
                 <div className="md:col-span-2">
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Wymagane certyfikaty</label>
                     <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                        {ALL_CERTS.map(cert => (
                            <div key={cert} className="flex items-center">
                                <input id={cert} value={cert} type="checkbox" onChange={handleChange} checked={formData.requiredCerts.includes(cert)} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                                <label htmlFor={cert} className="ml-2 block text-sm text-gray-900 dark:text-gray-300">{cert}</label>
                            </div>
                        ))}
                     </div>
                 </div>
                 <div className="md:col-span-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Opis stanowiska</label>
                    <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={6} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500"></textarea>
                    {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
                </div>
                 <div className="md:col-span-2 flex items-center">
                    <input id="isPriority" name="isPriority" type="checkbox" onChange={handleChange} checked={formData.isPriority} className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500" />
                    <label htmlFor="isPriority" className="ml-2 block text-sm font-medium text-orange-600 dark:text-orange-400">Oznacz jako ogłoszenie priorytetowe</label>
                </div>
            </div>
             <div className="flex justify-end gap-4 pt-5 border-t border-gray-200 dark:border-gray-700">
                <button type="button" onClick={onCancel} className="rounded-md border border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600 py-2 px-4 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none">
                    Anuluj
                </button>
                <button type="submit" className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none">
                    Opublikuj ogłoszenie
                </button>
            </div>
        </form>
    )
}
