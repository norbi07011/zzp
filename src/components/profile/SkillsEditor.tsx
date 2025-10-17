/**
 * SkillsEditor Component
 * Interactive skills management with autocomplete
 */

import React, { useState } from 'react';
import { updateWorkerSkills } from '../../services/profile';

interface SkillsEditorProps {
  userId: string;
  initialSkills: string[];
  onUpdate: (skills: string[]) => void;
}

const POPULAR_SKILLS = [
  // Development
  'React', 'TypeScript', 'JavaScript', 'Node.js', 'Python', 'Java', 'PHP', 'C#',
  'Angular', 'Vue.js', 'Next.js', 'React Native', 'Flutter', 'Swift', 'Kotlin',
  'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'GraphQL', 'REST API',
  'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'CI/CD',
  
  // Design
  'UI/UX Design', 'Figma', 'Adobe XD', 'Sketch', 'Photoshop', 'Illustrator',
  'Wireframing', 'Prototyping', 'User Research', 'Design Systems',
  
  // Marketing
  'SEO', 'Google Analytics', 'Content Marketing', 'Social Media Marketing',
  'Email Marketing', 'PPC', 'Google Ads', 'Facebook Ads', 'Copywriting',
  
  // Project Management
  'Agile', 'Scrum', 'Kanban', 'Jira', 'Asana', 'Trello', 'Project Planning',
  'Risk Management', 'Stakeholder Management',
  
  // Other
  'Data Analysis', 'Excel', 'PowerBI', 'Tableau', 'Machine Learning',
  'Cybersecurity', 'DevOps', 'Cloud Architecture', 'Business Analysis'
];

export const SkillsEditor: React.FC<SkillsEditorProps> = ({
  userId,
  initialSkills,
  onUpdate
}) => {
  const [skills, setSkills] = useState<string[]>(initialSkills);
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    if (value.trim()) {
      const filtered = POPULAR_SKILLS.filter(skill =>
        skill.toLowerCase().includes(value.toLowerCase()) &&
        !skills.includes(skill)
      ).slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const addSkill = (skill: string) => {
    const trimmedSkill = skill.trim();
    if (trimmedSkill && !skills.includes(trimmedSkill)) {
      const updatedSkills = [...skills, trimmedSkill];
      setSkills(updatedSkills);
      setInputValue('');
      setSuggestions([]);
      saveSkills(updatedSkills);
    }
  };

  const removeSkill = (skillToRemove: string) => {
    const updatedSkills = skills.filter(s => s !== skillToRemove);
    setSkills(updatedSkills);
    saveSkills(updatedSkills);
  };

  const saveSkills = async (updatedSkills: string[]) => {
    setLoading(true);
    setError(null);

    try {
      await updateWorkerSkills(userId, updatedSkills);
      onUpdate(updatedSkills);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update skills');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addSkill(inputValue);
    }
  };

  return (
    <div className="space-y-4">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
          {error}
        </div>
      )}

      {/* Input Field */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Add Skills
        </label>
        <div className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type to search skills..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {loading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {/* Suggestions Dropdown */}
        {suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map(skill => (
              <button
                key={skill}
                type="button"
                onClick={() => addSkill(skill)}
                className="w-full px-4 py-2 text-left hover:bg-blue-50 transition-colors text-sm"
              >
                {skill}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Current Skills */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Skills ({skills.length})
        </label>
        <div className="flex flex-wrap gap-2">
          {skills.length === 0 ? (
            <p className="text-gray-500 text-sm italic">
              No skills added yet. Start typing to add skills.
            </p>
          ) : (
            skills.map(skill => (
              <span
                key={skill}
                className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="ml-2 text-blue-600 hover:text-blue-800 font-bold"
                  aria-label={`Remove ${skill}`}
                >
                  ×
                </button>
              </span>
            ))
          )}
        </div>
      </div>

      {/* Popular Skills */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Popular Skills
        </label>
        <div className="flex flex-wrap gap-2">
          {POPULAR_SKILLS.filter(skill => !skills.includes(skill))
            .slice(0, 10)
            .map(skill => (
              <button
                key={skill}
                type="button"
                onClick={() => addSkill(skill)}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
              >
                + {skill}
              </button>
            ))}
        </div>
      </div>

      {/* Tip */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-800">
          💡 <strong>Tip:</strong> Add relevant skills to improve your profile visibility.
          You can type custom skills or select from popular options.
        </p>
      </div>
    </div>
  );
};

export default SkillsEditor;
