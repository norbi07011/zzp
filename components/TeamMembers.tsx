import React, { useState } from 'react';
import { useProjectMembers, type TeamMember } from '../hooks/useProjectMembers';
import UserPlus from 'lucide-react/dist/esm/icons/user-plus';
import Mail from 'lucide-react/dist/esm/icons/mail';
import Shield from 'lucide-react/dist/esm/icons/shield';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import MoreVertical from 'lucide-react/dist/esm/icons/more-vertical';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import XCircle from 'lucide-react/dist/esm/icons/x-circle';

interface TeamMembersProps {
  projectId: string;
}

export function TeamMembers({ projectId }: TeamMembersProps) {
  const { 
    members, 
    loading, 
    error, 
    addMember, 
    updateMemberRole, 
    removeMember 
  } = useProjectMembers(projectId);
  
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'manager': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'member': return 'bg-green-100 text-green-800 border-green-200';
      case 'viewer': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'owner': return 'Właściciel';
      case 'admin': return 'Administrator';
      case 'manager': return 'Menedżer';
      case 'member': return 'Członek';
      case 'viewer': return 'Obserwator';
      default: return role;
    }
  };

  const getPermissionLabels = (permissions: string[]) => {
    const labels: { [key: string]: string } = {
      'view': 'Podgląd',
      'edit': 'Edycja',
      'delete': 'Usuwanie',
      'invite': 'Zapraszanie',
      'manage_tasks': 'Zarządzanie zadaniami',
      'manage_files': 'Zarządzanie plikami',
      'manage_team': 'Zarządzanie zespołem'
    };
    return permissions.map(p => labels[p] || p);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
        Error loading team members: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Zespół</h2>
        <button
          onClick={() => setShowAddMemberForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <UserPlus className="w-5 h-5" />
          Dodaj członka
        </button>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map(member => (
          <div
            key={member.id}
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-lg font-semibold">
                  {member.user_id.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    User {member.user_id.substring(0, 8)}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {new Date(member.joined_at).toLocaleDateString('pl-PL')}
                  </p>
                </div>
              </div>
              <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                <MoreVertical className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-gray-400" />
                <span className={`text-xs px-2 py-1 rounded border ${getRoleBadgeColor(member.role)}`}>
                  {getRoleLabel(member.role)}
                </span>
              </div>

              {member.permissions && member.permissions.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {getPermissionLabels(member.permissions).map((permission, index) => (
                    <span
                      key={index}
                      className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded"
                    >
                      {permission}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                {member.is_active ? (
                  <div className="flex items-center gap-1 text-green-600 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    Aktywny
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-gray-400 text-sm">
                    <XCircle className="w-4 h-4" />
                    Nieaktywny
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Members List (Alternative View) */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Członek</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Rola</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Uprawnienia</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Dołączył</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {members.map(member => (
              <tr key={member.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                      {member.user_id.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        User {member.user_id.substring(0, 8)}
                      </p>
                      <p className="text-sm text-gray-500">ID: {member.user_id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded border ${getRoleBadgeColor(member.role)}`}>
                    {getRoleLabel(member.role)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {member.permissions && member.permissions.length > 0 ? (
                      getPermissionLabels(member.permissions).slice(0, 3).map((permission, index) => (
                        <span
                          key={index}
                          className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded"
                        >
                          {permission}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-400">Brak</span>
                    )}
                    {member.permissions && member.permissions.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{member.permissions.length - 3}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    {new Date(member.joined_at).toLocaleDateString('pl-PL')}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {member.is_active ? (
                    <div className="flex items-center gap-1 text-green-600 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      Aktywny
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-gray-400 text-sm">
                      <XCircle className="w-4 h-4" />
                      Nieaktywny
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">Wszyscy członkowie</p>
          <p className="text-2xl font-bold text-gray-900">{members.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">Administratorzy</p>
          <p className="text-2xl font-bold text-red-600">
            {members.filter(m => m.role === 'admin' || m.role === 'owner').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">Menedżerowie</p>
          <p className="text-2xl font-bold text-blue-600">
            {members.filter(m => m.role === 'manager').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">Aktywni</p>
          <p className="text-2xl font-bold text-green-600">
            {members.filter(m => m.is_active).length}
          </p>
        </div>
      </div>

      {/* Role Permissions Guide */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Uprawnienia ról</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <span className="font-medium text-blue-800">Właściciel:</span>
            <span className="text-blue-700 ml-2">Pełna kontrola nad projektem</span>
          </div>
          <div>
            <span className="font-medium text-blue-800">Administrator:</span>
            <span className="text-blue-700 ml-2">Zarządzanie zespołem i ustawieniami</span>
          </div>
          <div>
            <span className="font-medium text-blue-800">Menedżer:</span>
            <span className="text-blue-700 ml-2">Zarządzanie zadaniami i plikami</span>
          </div>
          <div>
            <span className="font-medium text-blue-800">Członek:</span>
            <span className="text-blue-700 ml-2">Edycja i tworzenie treści</span>
          </div>
          <div>
            <span className="font-medium text-blue-800">Obserwator:</span>
            <span className="text-blue-700 ml-2">Tylko podgląd projektu</span>
          </div>
        </div>
      </div>
    </div>
  );
}