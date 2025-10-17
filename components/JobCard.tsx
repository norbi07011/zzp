import React from 'react';
import { Job, JobRateType, UserRole } from '../types';
import { Badge } from './Badge';
import { LocationIcon } from './icons';

interface JobCardProps {
    job: Job;
    viewerRole: UserRole;
    onApply?: (jobId: number) => void;
    hasApplied?: boolean;
}

const getRateLabel = (rateType: JobRateType, rateValue: number) => {
    switch(rateType) {
        case JobRateType.Hourly: return `€${rateValue}/h`;
        case JobRateType.Daily: return `€${rateValue}/dzień`;
        case JobRateType.Fixed: return `€${rateValue} ryczałt`;
    }
}

export const JobCard: React.FC<JobCardProps> = ({ job, viewerRole, onApply, hasApplied }) => {
    return (
        <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-lg border overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group ${
            job.isPriority 
                ? 'border-amber-300 dark:border-amber-700/50 ring-2 ring-amber-100 dark:ring-amber-900/30' 
                : 'border-slate-200/60 dark:border-slate-700/60 hover:border-primary-300/50'
        }`}>
            {job.isPriority && (
                <div className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 px-4 py-2 border-b border-amber-200 dark:border-amber-800/50">
                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs font-semibold uppercase tracking-wide">Priority Job</span>
                    </div>
                </div>
            )}
            
            <div className="p-5">
                <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-slate-50 dark:bg-slate-700 p-2 flex-shrink-0 ring-1 ring-slate-200 dark:ring-slate-600">
                        <img src={job.logoUrl} alt={job.clientName} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
                            {job.title}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{job.clientName}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                        <div className="w-8 h-8 bg-primary-50 dark:bg-primary-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <LocationIcon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                        </div>
                        <span className="text-slate-700 dark:text-slate-300 truncate">{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <span className="text-slate-700 dark:text-slate-300">{job.peopleNeeded} needed</span>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-4 pb-4 border-b border-slate-100 dark:border-slate-700">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{job.startDate}</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span>{job.endDate}</span>
                </div>

                {job.requiredCerts.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                        {job.requiredCerts.map(cert => (
                            <span key={cert} className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-md border border-blue-200 dark:border-blue-800/50">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                {cert}
                            </span>
                        ))}
                    </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                    <div>
                        <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                            {getRateLabel(job.rateType, job.rateValue)}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Rate</div>
                    </div>
                    {viewerRole === 'worker' && (
                        <button
                            onClick={() => onApply?.(job.id)}
                            disabled={hasApplied}
                            className={`inline-flex items-center px-4 h-9 text-sm font-medium rounded-lg transition-all duration-200 ${
                                hasApplied
                                    ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                                    : 'bg-primary-600 hover:bg-primary-700 text-white hover:-translate-y-0.5 shadow-sm hover:shadow-md'
                            }`}
                        >
                            {hasApplied ? (
                                <>
                                    <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Applied
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Apply Now
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};