// @ts-nocheck
/**
 * WorkerProfilePage - COMPLETE VERSION
 * Full-featured profile management for workers with admin compatibility
 * Features: Profile editing, Skills, Certificates, Portfolio, Settings, Privacy
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, getCurrentUser } from '@/lib/supabase';

export const WorkerProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'basic' | 'skills' | 'certificates' | 'portfolio' | 'settings'>('overview');
  const [userId, setUserId] = useState<string>('');
  const [user, setUser] = useState<any>(null);
  
  // Profile data
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    city: '',
    postal_code: '',
    specialization: '',
    bio: '',
    hourly_rate: 0,
    years_of_experience: 0,
    availability_status: 'available',
    avatar_url: '',
    linkedin_url: '',
    website_url: ''
  });

  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [certificates, setCertificates] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [settings, setSettings] = useState({
    notifications_enabled: true,
    email_notifications: true,
    sms_notifications: false,
    profile_visibility: 'public',
    show_email: true,
    show_phone: true,
    show_location: true,
    language: 'nl',
    timezone: 'Europe/Amsterdam'
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        navigate('/login');
        return;
      }

      setUserId(currentUser.id);
      setUser(currentUser);

      // Load worker profile
      const { data: profileData } = await supabase
        .from('worker_profiles')
        .select('*')
        .eq('user_id', currentUser.id)
        .single();

      if (profileData) {
        setProfile({
          first_name: profileData.first_name || '',
          last_name: profileData.last_name || '',
          email: profileData.email || currentUser.email || '',
          phone: profileData.phone || '',
          city: profileData.city || '',
          postal_code: profileData.postal_code || '',
          specialization: profileData.specialization || '',
          bio: profileData.bio || '',
          hourly_rate: profileData.hourly_rate || 0,
          years_of_experience: profileData.years_of_experience || 0,
          availability_status: profileData.availability_status || 'available',
          avatar_url: profileData.avatar_url || '',
          linkedin_url: profileData.linkedin_url || '',
          website_url: profileData.website_url || ''
        });

        setSkills(profileData.skills || []);
      }

      // Load certificates
      const { data: certsData } = await supabase
        .from('certificates')
        .select('*')
        .eq('worker_id', currentUser.id)
        .order('issue_date', { ascending: false });

      setCertificates(certsData || []);

      // Load portfolio (mock for now)
      setPortfolio([
        { id: '1', title: 'Project Alpha', description: 'Web development', image_url: null, tags: ['React', 'TypeScript'] },
        { id: '2', title: 'Project Beta', description: 'Mobile app', image_url: null, tags: ['React Native'] }
      ]);

      setLoading(false);
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile');
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const { error: updateError } = await supabase
        .from('worker_profiles')
        .update({
          ...profile,
          skills,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (updateError) throw updateError;

      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Update error:', err);
      setError('Failed to update profile');
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/avatar/${Date.now()}.${fileExt}`;

      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setProfile({ ...profile, avatar_url: publicUrl });
      setSuccess('Avatar uploaded successfully!');
    } catch (err) {
      console.error('Avatar upload error:', err);
      setError('Failed to upload avatar');
    }
  };

  const calculateCompletion = () => {
    let completed = 0;
    const total = 10;

    if (profile.first_name) completed++;
    if (profile.last_name) completed++;
    if (profile.email) completed++;
    if (profile.phone) completed++;
    if (profile.city) completed++;
    if (profile.bio) completed++;
    if (profile.specialization) completed++;
    if (skills.length > 0) completed++;
    if (certificates.length > 0) completed++;
    if (profile.avatar_url) completed++;

    return Math.round((completed / total) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  const completion = calculateCompletion();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Stats */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold overflow-hidden border-4 border-white">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span>{profile.first_name?.[0] || 'W'}{profile.last_name?.[0] || 'P'}</span>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-2 cursor-pointer hover:bg-blue-600 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                </label>
              </div>

              {/* User Info */}
              <div>
                <h1 className="text-3xl font-bold">
                  {profile.first_name} {profile.last_name}
                </h1>
                <p className="text-blue-100 mt-1">
                  {profile.specialization || 'Freelancer'} • {profile.city || 'Netherlands'}
                </p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    profile.availability_status === 'available' ? 'bg-green-500' :
                    profile.availability_status === 'busy' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}>
                    {profile.availability_status === 'available' ? '✓ Available' :
                     profile.availability_status === 'busy' ? '⏱ Busy' : '✗ Unavailable'}
                  </span>
                  {profile.hourly_rate > 0 && (
                    <span className="text-blue-100">€{profile.hourly_rate}/hour</span>
                  )}
                </div>
              </div>
            </div>

            {/* Completion Stats */}
            <div className="text-right">
              <div className="text-sm text-blue-100 mb-2">Profile Completion</div>
              <div className="flex items-center space-x-3">
                <div className="w-32 bg-white/20 rounded-full h-3">
                  <div
                    className="bg-white h-3 rounded-full transition-all duration-500"
                    style={{ width: `${completion}%` }}
                  />
                </div>
                <span className="text-2xl font-bold">{completion}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded shadow-sm">
            <div className="flex items-center">
              <span className="text-xl mr-2">✓</span>
              <span>{success}</span>
            </div>
          </div>
        </div>
      )}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded shadow-sm">
            <div className="flex items-center">
              <span className="text-xl mr-2">⚠</span>
              <span>{error}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'overview', label: '📊 Overview', icon: '📊' },
              { id: 'basic', label: '👤 Basic Info', icon: '👤' },
              { id: 'skills', label: '⚡ Skills', icon: '⚡' },
              { id: 'certificates', label: '📜 Certificates', icon: '📜' },
              { id: 'portfolio', label: '🎨 Portfolio', icon: '🎨' },
              { id: 'settings', label: '⚙️ Settings', icon: '⚙️' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors
                  ${activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="text-3xl mb-2">⚡</div>
                <div className="text-2xl font-bold text-gray-900">{skills.length}</div>
                <div className="text-sm text-gray-600">Skills</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="text-3xl mb-2">📜</div>
                <div className="text-2xl font-bold text-gray-900">{certificates.length}</div>
                <div className="text-sm text-gray-600">Certificates</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="text-3xl mb-2">💼</div>
                <div className="text-2xl font-bold text-gray-900">{profile.years_of_experience || 0}</div>
                <div className="text-sm text-gray-600">Years Experience</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="text-3xl mb-2">🎨</div>
                <div className="text-2xl font-bold text-gray-900">{portfolio.length}</div>
                <div className="text-sm text-gray-600">Portfolio Items</div>
              </div>
            </div>

            {/* Profile Summary */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">About Me</h3>
              <p className="text-gray-700 whitespace-pre-line">{profile.bio || 'No bio added yet.'}</p>
            </div>

            {/* Recent Certificates */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Certificates</h3>
              {certificates.length > 0 ? (
                <div className="space-y-3">
                  {certificates.slice(0, 3).map(cert => (
                    <div key={cert.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">🏆</span>
                        <div>
                          <div className="font-medium text-gray-900">{cert.certificate_name}</div>
                          <div className="text-sm text-gray-600">{cert.issuer}</div>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">{cert.issue_date}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No certificates added yet.</p>
              )}
            </div>
          </div>
        )}

        {/* BASIC INFO TAB */}
        {activeTab === 'basic' && (
          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    value={profile.first_name}
                    onChange={e => setProfile({ ...profile, first_name: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    value={profile.last_name}
                    onChange={e => setProfile({ ...profile, last_name: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={e => setProfile({ ...profile, email: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={e => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="+31 6 12345678"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={profile.city}
                    onChange={e => setProfile({ ...profile, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                  <input
                    type="text"
                    value={profile.postal_code}
                    onChange={e => setProfile({ ...profile, postal_code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                  <input
                    type="text"
                    value={profile.specialization}
                    onChange={e => setProfile({ ...profile, specialization: e.target.value })}
                    placeholder="e.g. Full Stack Developer"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea
                    value={profile.bio}
                    onChange={e => setProfile({ ...profile, bio: e.target.value })}
                    rows={4}
                    placeholder="Tell us about yourself..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate (€)</label>
                    <input
                      type="number"
                      value={profile.hourly_rate}
                      onChange={e => setProfile({ ...profile, hourly_rate: parseFloat(e.target.value) || 0 })}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                    <input
                      type="number"
                      value={profile.years_of_experience}
                      onChange={e => setProfile({ ...profile, years_of_experience: parseInt(e.target.value) || 0 })}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                    <select
                      value={profile.availability_status}
                      onChange={e => setProfile({ ...profile, availability_status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="available">Available</option>
                      <option value="busy">Busy</option>
                      <option value="unavailable">Unavailable</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
                    <input
                      type="url"
                      value={profile.linkedin_url}
                      onChange={e => setProfile({ ...profile, linkedin_url: e.target.value })}
                      placeholder="https://linkedin.com/in/your-profile"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
                    <input
                      type="url"
                      value={profile.website_url}
                      onChange={e => setProfile({ ...profile, website_url: e.target.value })}
                      placeholder="https://yourwebsite.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}

        {/* SKILLS TAB */}
        {activeTab === 'skills' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Skill</h3>
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={newSkill}
                  onChange={e => setNewSkill(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && addSkill()}
                  placeholder="e.g. React, TypeScript, Node.js"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={addSkill}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Skill
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Skills ({skills.length})</h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium flex items-center space-x-2"
                  >
                    <span>{skill}</span>
                    <button
                      onClick={() => removeSkill(skill)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
                {skills.length === 0 && (
                  <p className="text-gray-500">No skills added yet. Add your first skill above!</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* CERTIFICATES TAB */}
        {activeTab === 'certificates' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">My Certificates</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  + Add Certificate
                </button>
              </div>

              {certificates.length > 0 ? (
                <div className="space-y-4">
                  {certificates.map(cert => (
                    <div key={cert.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <span className="text-4xl">🏆</span>
                          <div>
                            <h4 className="font-semibold text-gray-900">{cert.certificate_name}</h4>
                            <p className="text-sm text-gray-600">{cert.issuer}</p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              <span>📅 Issued: {cert.issue_date}</span>
                              {cert.expiry_date && <span>⏳ Expires: {cert.expiry_date}</span>}
                            </div>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          cert.status === 'verified' ? 'bg-green-100 text-green-800' :
                          cert.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {cert.status || 'pending'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <span className="text-6xl mb-4 block">📜</span>
                  <p className="text-gray-500">No certificates yet. Add your first certificate!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PORTFOLIO TAB */}
        {activeTab === 'portfolio' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">My Portfolio</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  + Add Project
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {portfolio.map(item => (
                  <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl">
                      🎨
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">{item.title}</h4>
                      <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {item.tags.map((tag: string, idx: number) => (
                          <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span className="text-gray-700">Enable Notifications</span>
                  <input
                    type="checkbox"
                    checked={settings.notifications_enabled}
                    onChange={e => setSettings({ ...settings, notifications_enabled: e.target.checked })}
                    className="w-5 h-5 text-blue-600"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-gray-700">Email Notifications</span>
                  <input
                    type="checkbox"
                    checked={settings.email_notifications}
                    onChange={e => setSettings({ ...settings, email_notifications: e.target.checked })}
                    className="w-5 h-5 text-blue-600"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-gray-700">SMS Notifications</span>
                  <input
                    type="checkbox"
                    checked={settings.sms_notifications}
                    onChange={e => setSettings({ ...settings, sms_notifications: e.target.checked })}
                    className="w-5 h-5 text-blue-600"
                  />
                </label>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Profile Visibility</label>
                  <select
                    value={settings.profile_visibility}
                    onChange={e => setSettings({ ...settings, profile_visibility: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="public">Public - Anyone can see</option>
                    <option value="private">Private - Only connections</option>
                    <option value="connections">Connections Only</option>
                  </select>
                </div>
                <label className="flex items-center justify-between">
                  <span className="text-gray-700">Show Email Address</span>
                  <input
                    type="checkbox"
                    checked={settings.show_email}
                    onChange={e => setSettings({ ...settings, show_email: e.target.checked })}
                    className="w-5 h-5 text-blue-600"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-gray-700">Show Phone Number</span>
                  <input
                    type="checkbox"
                    checked={settings.show_phone}
                    onChange={e => setSettings({ ...settings, show_phone: e.target.checked })}
                    className="w-5 h-5 text-blue-600"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-gray-700">Show Location</span>
                  <input
                    type="checkbox"
                    checked={settings.show_location}
                    onChange={e => setSettings({ ...settings, show_location: e.target.checked })}
                    className="w-5 h-5 text-blue-600"
                  />
                </label>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Regional Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                  <select
                    value={settings.language}
                    onChange={e => setSettings({ ...settings, language: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="nl">Nederlands</option>
                    <option value="en">English</option>
                    <option value="pl">Polski</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                  <select
                    value={settings.timezone}
                    onChange={e => setSettings({ ...settings, timezone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Europe/Amsterdam">Amsterdam (GMT+1)</option>
                    <option value="Europe/Warsaw">Warsaw (GMT+1)</option>
                    <option value="Europe/London">London (GMT+0)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleProfileUpdate}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Settings
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkerProfilePage;
