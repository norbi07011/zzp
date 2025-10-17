/**
 * JobForm Component
 * Create/Edit job posting form
 */

import React, { useState, useEffect } from 'react';
import { Job } from '../../services/job';

interface JobFormProps {
  initialData?: Partial<Job>;
  onSubmit: (data: Partial<Job>) => Promise<void>;
  onCancel?: () => void;
  isEditing?: boolean;
}

const CATEGORIES = [
  'Development',
  'Design',
  'Marketing',
  'Sales',
  'Project Management',
  'Data Analysis',
  'Content Writing',
  'Customer Service',
  'Other'
];

const JOB_TYPES = [
  { value: 'freelance', label: 'Freelance' },
  { value: 'contract', label: 'Contract' },
  { value: 'project', label: 'Project' },
  { value: 'part-time', label: 'Part-time' }
];

const EXPERIENCE_LEVELS = [
  { value: 'junior', label: 'Junior (0-2 years)' },
  { value: 'medior', label: 'Medior (2-5 years)' },
  { value: 'senior', label: 'Senior (5+ years)' },
  { value: 'expert', label: 'Expert (10+ years)' }
];

const WORK_LOCATIONS = [
  { value: 'remote', label: 'Remote' },
  { value: 'onsite', label: 'On-site' },
  { value: 'hybrid', label: 'Hybrid' }
];

export const JobForm: React.FC<JobFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isEditing = false
}) => {
  const [formData, setFormData] = useState<Partial<Job>>({
    title: '',
    description: '',
    requirements: '',
    responsibilities: '',
    benefits: '',
    category: '',
    job_type: 'freelance',
    experience_level: 'medior',
    work_location: 'remote',
    city: '',
    province: '',
    hourly_rate_min: undefined,
    hourly_rate_max: undefined,
    required_skills: [],
    preferred_skills: [],
    ...initialData
  });

  const [skillInput, setSkillInput] = useState('');
  const [preferredSkillInput, setPreferredSkillInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof Job, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when field is edited
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addSkill = (skill: string, isPreferred: boolean = false) => {
    const trimmed = skill.trim();
    if (!trimmed) return;

    const field = isPreferred ? 'preferred_skills' : 'required_skills';
    const currentSkills = formData[field] || [];

    if (!currentSkills.includes(trimmed)) {
      handleChange(field, [...currentSkills, trimmed]);
    }

    if (isPreferred) {
      setPreferredSkillInput('');
    } else {
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string, isPreferred: boolean = false) => {
    const field = isPreferred ? 'preferred_skills' : 'required_skills';
    const currentSkills = formData[field] || [];
    handleChange(field, currentSkills.filter(s => s !== skill));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.description?.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    if (formData.hourly_rate_min && formData.hourly_rate_max) {
      if (formData.hourly_rate_min > formData.hourly_rate_max) {
        newErrors.hourly_rate_max = 'Max rate must be greater than min rate';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Job Title *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="e.g. Senior React Developer"
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
            errors.title ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title}</p>}
      </div>

      {/* Category & Job Type */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category *
          </label>
          <select
            value={formData.category}
            onChange={(e) => handleChange('category', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              errors.category ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select Category</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {errors.category && <p className="text-sm text-red-600 mt-1">{errors.category}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Job Type *
          </label>
          <select
            value={formData.job_type}
            onChange={(e) => handleChange('job_type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {JOB_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Experience Level & Work Location */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Experience Level *
          </label>
          <select
            value={formData.experience_level}
            onChange={(e) => handleChange('experience_level', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {EXPERIENCE_LEVELS.map(level => (
              <option key={level.value} value={level.value}>{level.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Work Location *
          </label>
          <select
            value={formData.work_location}
            onChange={(e) => handleChange('work_location', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {WORK_LOCATIONS.map(location => (
              <option key={location.value} value={location.value}>{location.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* City & Province */}
      {formData.work_location !== 'remote' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              value={formData.city || ''}
              onChange={(e) => handleChange('city', e.target.value)}
              placeholder="e.g. Amsterdam"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Province
            </label>
            <input
              type="text"
              value={formData.province || ''}
              onChange={(e) => handleChange('province', e.target.value)}
              placeholder="e.g. Noord-Holland"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* Hourly Rate Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Hourly Rate Range (€)
        </label>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="number"
            value={formData.hourly_rate_min || ''}
            onChange={(e) => handleChange('hourly_rate_min', e.target.value ? parseFloat(e.target.value) : undefined)}
            placeholder="Min rate"
            min="0"
            step="5"
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            value={formData.hourly_rate_max || ''}
            onChange={(e) => handleChange('hourly_rate_max', e.target.value ? parseFloat(e.target.value) : undefined)}
            placeholder="Max rate"
            min="0"
            step="5"
            className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              errors.hourly_rate_max ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        </div>
        {errors.hourly_rate_max && <p className="text-sm text-red-600 mt-1">{errors.hourly_rate_max}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={4}
          placeholder="Describe the job..."
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description}</p>}
      </div>

      {/* Requirements */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Requirements
        </label>
        <textarea
          value={formData.requirements || ''}
          onChange={(e) => handleChange('requirements', e.target.value)}
          rows={3}
          placeholder="List the requirements..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Responsibilities */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Responsibilities
        </label>
        <textarea
          value={formData.responsibilities || ''}
          onChange={(e) => handleChange('responsibilities', e.target.value)}
          rows={3}
          placeholder="List the responsibilities..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Benefits */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Benefits
        </label>
        <textarea
          value={formData.benefits || ''}
          onChange={(e) => handleChange('benefits', e.target.value)}
          rows={3}
          placeholder="List the benefits..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Required Skills */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Required Skills
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addSkill(skillInput);
              }
            }}
            placeholder="Add a required skill..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={() => addSkill(skillInput)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.required_skills?.map(skill => (
            <span
              key={skill}
              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center"
            >
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Preferred Skills */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Preferred Skills (Optional)
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={preferredSkillInput}
            onChange={(e) => setPreferredSkillInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addSkill(preferredSkillInput, true);
              }
            }}
            placeholder="Add a preferred skill..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={() => addSkill(preferredSkillInput, true)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.preferred_skills?.map(skill => (
            <span
              key={skill}
              className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm flex items-center"
            >
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(skill, true)}
                className="ml-2 text-gray-600 hover:text-gray-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : isEditing ? 'Update Job' : 'Create Job'}
        </button>
      </div>
    </form>
  );
};

export default JobForm;
