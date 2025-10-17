// @ts-nocheck
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useToasts } from '../../contexts/ToastContext';
import { useAppointments } from '../../src/hooks/useAppointments';
import { AppointmentCalendarModal } from '../../components/Admin/AppointmentCalendarModal';
import { VideoCallIntegrationModal } from '../../components/Admin/VideoCallIntegrationModal';
import { SmartReminderModal } from '../../components/Admin/SmartReminderModal';
import { AppointmentAnalyticsModal } from '../../components/Admin/AppointmentAnalyticsModal';
import { RefreshCw, Calendar, Video, Bell, BarChart, CheckCircle, XCircle, Clock } from 'lucide-react';
import type { Appointment, AppointmentStatus, AppointmentPriority } from '../../src/services/appointments';

export const AppointmentsManager = () => {
  const { addToast } = useToasts();

  // Use Supabase data via custom hook
  const {
    appointments: allAppointments,
    pendingAppointments,
    confirmedAppointments,
    todayAppointments,
    appointmentsNeedingAttention,
    stats: appointmentStats,
    loading,
    error,
    refreshAppointments,
    confirm: confirmAppointment,
    cancel: cancelAppointment,
    complete: completeAppointment,
    remove: removeAppointment,
    update: updateAppointment,
  } = useAppointments();

  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | AppointmentStatus>('all');
  const [selectedDate, setSelectedDate] = useState('');
  
  // Enterprise Modal States
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showVideoCallModal, setShowVideoCallModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const filteredAppointments = useMemo(() => {
    return allAppointments.filter(apt => {
      const clientName = apt.client?.profile?.full_name || '';
      const workerName = apt.worker?.profile?.full_name || '';
      const location = apt.location || '';
      
      const matchesSearch = 
        clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        workerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || apt.status === filterStatus;
      const matchesDate = !selectedDate || apt.appointment_date === selectedDate;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [allAppointments, searchTerm, filterStatus, selectedDate]);

  const handleUpdateStatus = async (aptId: string, newStatus: AppointmentStatus) => {
    let success = false;
    
    if (newStatus === 'confirmed') {
      success = await confirmAppointment(aptId);
    } else if (newStatus === 'cancelled') {
      success = await cancelAppointment(aptId);
    } else if (newStatus === 'completed') {
      success = await completeAppointment(aptId);
    } else {
      success = await updateAppointment(aptId, { status: newStatus });
    }
    
    if (success) {
      addToast(`Status zmieniony na: ${newStatus}`, 'success');
    } else {
      addToast('Błąd podczas zmiany statusu', 'error');
    }
  };

  const handleDeleteAppointment = async (aptId: string) => {
    if (confirm('Czy na pewno chcesz usunąć to spotkanie?')) {
      const success = await removeAppointment(aptId);
      if (success) {
        addToast('Spotkanie usunięte', 'success');
      } else {
        addToast('Błąd podczas usuwania spotkania', 'error');
      }
    }
  };

  // Enterprise Handlers
  const handleScheduleAppointment = async (appointmentData: any) => {
    const success = await createAppointment(appointmentData);
    if (success) {
      addToast('Nowe spotkanie zaplanowane!', 'success');
      setShowCalendarModal(false);
    } else {
      addToast('Błąd podczas planowania spotkania', 'error');
    }
  };

  const handleVideoCallCreated = async (callData: any) => {
    if (selectedAppointment) {
      const success = await updateAppointment(selectedAppointment.id, {
        video_call_provider: callData.provider,
        video_call_meeting_id: callData.meetingId,
        video_call_join_url: callData.joinUrl,
        video_call_password: callData.password
      });
      
      if (success) {
        addToast('Video call utworzony!', 'success');
        setShowVideoCallModal(false);
      } else {
        addToast('Błąd podczas tworzenia video call', 'error');
      }
    }
  };

  const handleReminderScheduled = async (reminderData: any) => {
    if (selectedAppointment) {
      const success = await updateAppointment(selectedAppointment.id, {
        reminder_sms: reminderData.settings.types.includes('sms'),
        reminder_email: reminderData.settings.types.includes('email')
      });
      
      if (success) {
        addToast('Przypomnienia zaplanowane!', 'success');
        setShowReminderModal(false);
      } else {
        addToast('Błąd podczas planowania przypomnień', 'error');
      }
    }
  };

  const handleOpenVideoCall = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowVideoCallModal(true);
  };

  const handleOpenReminders = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowReminderModal(true);
  };

  const handleReschedule = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowCalendarModal(true);
  };

  const stats = {
    total: appointmentStats.total,
    pending: appointmentStats.pending,
    confirmed: appointmentStats.confirmed,
    completed: appointmentStats.completed,
    withVideo: appointmentStats.withVideoCall,
    withReminders: appointmentStats.withReminders,
    urgentPriority: appointmentStats.urgent,
    totalRevenue: appointmentStats.completed * 150 // Mock revenue calculation
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'pending':
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-300">⏳ Oczekujące</span>;
      case 'confirmed':
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300">✓ Potwierdzone</span>;
      case 'completed':
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-300">✓ Ukończone</span>;
      case 'cancelled':
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-300">✗ Anulowane</span>;
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority?: AppointmentPriority) => {
    if (!priority || priority === 'normal') return null;
    
    switch (priority) {
      case 'low':
        return <span className="px-2 py-1 rounded text-xs bg-gray-500/20 text-gray-300">🟢 Niski</span>;
      case 'high':
        return <span className="px-2 py-1 rounded text-xs bg-orange-500/20 text-orange-300">🟠 Wysoki</span>;
      case 'urgent':
        return <span className="px-2 py-1 rounded text-xs bg-red-500/20 text-red-300">🔴 Pilny</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">📅 Zarządzanie Spotkaniami</h1>
            <p className="text-gray-300">Kalendarz i harmonogram spotkań pracowników z klientami</p>
          </div>
          <Link to="/admin" className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-medium transition-all">
            ← Powrót
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            <span className="ml-4 text-white text-lg">Ładowanie spotkań...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-6 mb-6">
            <h3 className="text-red-300 font-semibold mb-2">❌ Błąd podczas ładowania danych</h3>
            <p className="text-red-200 mb-4">{error}</p>
            <button
              onClick={refreshAppointments}
              className="bg-red-500/30 hover:bg-red-500/50 text-white px-4 py-2 rounded-lg transition-all"
            >
              🔄 Spróbuj ponownie
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
        {/* Enhanced Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-md rounded-2xl p-4 border border-blue-400/30">
            <div className="text-blue-300 text-sm font-medium mb-2">Wszystkie</div>
            <div className="text-3xl font-bold text-white">{stats.total}</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 backdrop-blur-md rounded-2xl p-4 border border-yellow-400/30">
            <div className="text-yellow-300 text-sm font-medium mb-2">Oczekujące</div>
            <div className="text-3xl font-bold text-white">{stats.pending}</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-600/20 backdrop-blur-md rounded-2xl p-4 border border-cyan-400/30">
            <div className="text-cyan-300 text-sm font-medium mb-2">Potwierdzone</div>
            <div className="text-3xl font-bold text-white">{stats.confirmed}</div>
          </div>
          <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-md rounded-2xl p-4 border border-green-400/30">
            <div className="text-green-300 text-sm font-medium mb-2">Ukończone</div>
            <div className="text-3xl font-bold text-white">{stats.completed}</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-md rounded-2xl p-4 border border-purple-400/30">
            <div className="text-purple-300 text-sm font-medium mb-2">Video</div>
            <div className="text-3xl font-bold text-white">{stats.withVideo}</div>
          </div>
          <div className="bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 backdrop-blur-md rounded-2xl p-4 border border-indigo-400/30">
            <div className="text-indigo-300 text-sm font-medium mb-2">Przypomnienia</div>
            <div className="text-3xl font-bold text-white">{stats.withReminders}</div>
          </div>
          <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 backdrop-blur-md rounded-2xl p-4 border border-red-400/30">
            <div className="text-red-300 text-sm font-medium mb-2">Pilne</div>
            <div className="text-3xl font-bold text-white">{stats.urgentPriority}</div>
          </div>
          <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 backdrop-blur-md rounded-2xl p-4 border border-emerald-400/30">
            <div className="text-emerald-300 text-sm font-medium mb-2">Przychód</div>
            <div className="text-2xl font-bold text-white">{(stats.totalRevenue / 1000).toFixed(1)}k</div>
          </div>
        </div>

        {/* Enterprise Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={() => setShowCalendarModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl font-medium transition-all flex items-center gap-2"
          >
            📅 Smart Calendar
          </button>
          <button
            onClick={() => setShowAnalyticsModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl font-medium transition-all flex items-center gap-2"
          >
            📊 Analytics Dashboard
          </button>
          <button
            onClick={() => {
              const sample = allAppointments.find(a => a.status === 'confirmed');
              if (sample) {
                setSelectedAppointment(sample);
                setShowVideoCallModal(true);
              }
            }}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-xl font-medium transition-all flex items-center gap-2"
          >
            🎥 Video Integration
          </button>
          <button
            onClick={() => {
              const sample = allAppointments.find(a => a.status === 'confirmed');
              if (sample) {
                setSelectedAppointment(sample);
                setShowReminderModal(true);
              }
            }}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl font-medium transition-all flex items-center gap-2"
          >
            📱 Smart Reminders
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8 border border-white/20">
          <div className="flex flex-col lg:flex-row gap-4">
            <input
              type="text"
              placeholder="🔍 Szukaj po kliencie, pracowniku lub lokalizacji..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-label="Wybierz datę"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-label="Filtruj po statusie"
            >
              <option value="all" className="bg-slate-800">Wszystkie statusy</option>
              <option value="pending" className="bg-slate-800">Oczekujące</option>
              <option value="confirmed" className="bg-slate-800">Potwierdzone</option>
              <option value="completed" className="bg-slate-800">Ukończone</option>
              <option value="cancelled" className="bg-slate-800">Anulowane</option>
            </select>
            {selectedDate && (
              <button
                onClick={() => setSelectedDate('')}
                className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl font-semibold transition-all"
              >
                Wyczyść datę
              </button>
            )}
          </div>
        </div>

        {/* Enhanced Appointments Table */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Data & Czas</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Klient</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Pracownik</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Usługa</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Video/Remind</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Akcje</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="text-6xl mb-4">📅</div>
                    <p className="text-xl text-gray-400">Brak spotkań</p>
                  </td>
                </tr>
              ) : (
                filteredAppointments.map(apt => (
                  <tr key={apt.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{apt.appointment_date}</div>
                      <div className="text-sm text-gray-400">{apt.appointment_time} ({apt.duration} min)</div>
                      {getPriorityBadge(apt.priority)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{apt.client?.profile?.full_name || 'Brak danych'}</div>
                      {apt.client?.profile?.phone && (
                        <div className="text-sm text-gray-400">📱 {apt.client.profile.phone}</div>
                      )}
                      {apt.client?.email && (
                        <div className="text-sm text-gray-400">📧 {apt.client.email}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-300">{apt.worker?.profile?.full_name || 'Nieprzypisany'}</div>
                      <div className="text-xs text-gray-500">ID: {apt.worker_id?.substring(0, 8) || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4">
                      {apt.service_type && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300">
                          {apt.service_type}
                        </span>
                      )}
                      <div className="text-sm text-gray-400 mt-1">{apt.location}</div>
                      {apt.notes && <div className="text-xs text-gray-500 mt-1">{apt.notes}</div>}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(apt.status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        {apt.video_call_provider && (
                          <div className="flex items-center gap-2">
                            <span className="text-green-400">🎥</span>
                            <span className="text-green-300 text-xs">{apt.video_call_provider}</span>
                          </div>
                        )}
                        {(apt.reminder_sms || apt.reminder_email) && (
                          <div className="flex items-center gap-2">
                            <span className="text-blue-400">🔔</span>
                            <span className="text-blue-300 text-xs">
                              {apt.reminder_sms && apt.reminder_email ? 'SMS+Email' : 
                               apt.reminder_sms ? 'SMS' : 'Email'}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        {apt.status === 'pending' && (
                          <button
                            onClick={() => handleUpdateStatus(apt.id, 'confirmed')}
                            className="px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg text-sm transition-all"
                            title="Potwierdź"
                          >
                            ✓
                          </button>
                        )}
                        {apt.status === 'confirmed' && (
                          <button
                            onClick={() => handleUpdateStatus(apt.id, 'completed')}
                            className="px-3 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg text-sm transition-all"
                            title="Ukończ"
                          >
                            ✓
                          </button>
                        )}
                        
                        {/* Video Call Button */}
                        <button
                          onClick={() => handleOpenVideoCall(apt)}
                          className="px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg text-sm transition-all"
                          title="Video Call"
                        >
                          🎥
                        </button>
                        
                        {/* Reminders Button */}
                        <button
                          onClick={() => handleOpenReminders(apt)}
                          className="px-3 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 rounded-lg text-sm transition-all"
                          title="Przypomnienia"
                        >
                          🔔
                        </button>
                        
                        {/* Reschedule Button */}
                        <button
                          onClick={() => handleReschedule(apt)}
                          className="px-3 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-lg text-sm transition-all"
                          title="Przełóż termin"
                        >
                          📅
                        </button>
                        
                        {/* Copy Link */}
                        {apt.video_call_join_url && (
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(apt.video_call_join_url!);
                              addToast('Link skopiowany!', 'success');
                            }}
                            className="px-3 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg text-sm transition-all"
                            title="Kopiuj link video"
                          >
                            📋
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleDeleteAppointment(apt.id)}
                          className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-sm transition-all"
                          title="Usuń"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-center text-gray-400">
          Wyświetlono {filteredAppointments.length} z {allAppointments.length} spotkań
        </div>

      {/* Enterprise Modals */}
      {showCalendarModal && (
        <AppointmentCalendarModal
          isOpen={showCalendarModal}
          onClose={() => {
            setShowCalendarModal(false);
            setSelectedAppointment(null);
          }}
          onScheduleAppointment={handleScheduleAppointment}
          existingAppointments={allAppointments}
        />
      )}

      {showVideoCallModal && (
        <VideoCallIntegrationModal
          isOpen={showVideoCallModal}
          onClose={() => {
            setShowVideoCallModal(false);
            setSelectedAppointment(null);
          }}
          appointmentId={selectedAppointment?.id}
          appointmentData={selectedAppointment}
          onVideoCallCreated={handleVideoCallCreated}
        />
      )}

      {showReminderModal && (
        <SmartReminderModal
          isOpen={showReminderModal}
          onClose={() => {
            setShowReminderModal(false);
            setSelectedAppointment(null);
          }}
          appointmentId={selectedAppointment?.id}
          appointmentData={selectedAppointment}
          onReminderScheduled={handleReminderScheduled}
        />
      )}

      {showAnalyticsModal && (
        <AppointmentAnalyticsModal
          isOpen={showAnalyticsModal}
          onClose={() => setShowAnalyticsModal(false)}
          appointmentData={allAppointments}
        />
      )}
        </>
        )}
      </div>
    </div>
  );
};
