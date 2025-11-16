// @ts-nocheck
import React, { useState } from 'react';
import { useTestSlots } from '../../src/hooks/useTestSlots';
import { Calendar, Clock, Users, Plus, Search, Filter, Check, X, Edit2, Trash2, TrendingUp } from 'lucide-react';

export default function TestSlotsManager() {
  const {
    slots,
    stats,
    loading,
    error,
    availableSlots,
    bookedSlots,
    upcomingSlots,
    createSlot,
    updateSlot,
    deleteSlot,
    bookSlot,
    cancelBooking,
    completeSlot,
    bulkCreateSlots,
    searchSlots,
  } = useTestSlots();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);

  const [formData, setFormData] = useState({
    date: '',
    time_start: '',
    time_end: '',
    capacity: 10,
    location: '',
    test_type: 'driving',
    price: 50.00,
    notes: '',
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchSlots(searchQuery);
    }
  };

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSlot(formData);
      setShowAddModal(false);
      setFormData({
        date: '',
        time_start: '',
        time_end: '',
        capacity: 10,
        location: '',
        test_type: 'driving',
        price: 50.00,
        notes: '',
      });
    } catch (err) {
      console.error('Error creating slot:', err);
    }
  };

  const handleUpdateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlot) return;
    try {
      await updateSlot(editingSlot.id, formData);
      setEditingSlot(null);
      setFormData({
        date: '',
        time_start: '',
        time_end: '',
        capacity: 10,
        location: '',
        test_type: 'driving',
        price: 50.00,
        notes: '',
      });
    } catch (err) {
      console.error('Error updating slot:', err);
    }
  };

  const handleDeleteSlot = async (id: string) => {
    if (window.confirm('Czy na pewno chcesz usunąć ten slot?')) {
      try {
        await deleteSlot(id);
      } catch (err) {
        console.error('Error deleting slot:', err);
      }
    }
  };

  const handleBookSlot = async (slotId: string) => {
    const userId = prompt('Podaj ID użytkownika:');
    if (userId) {
      try {
        await bookSlot(slotId, userId);
      } catch (err) {
        console.error('Error booking slot:', err);
      }
    }
  };

  const handleCompleteSlot = async (slotId: string) => {
    if (window.confirm('Oznaczyć slot jako ukończony?')) {
      try {
        await completeSlot(slotId);
      } catch (err) {
        console.error('Error completing slot:', err);
      }
    }
  };

  const handleBulkCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const startDate = prompt('Data rozpoczęcia (YYYY-MM-DD):');
    const endDate = prompt('Data zakończenia (YYYY-MM-DD):');
    const timeStart = prompt('Godzina rozpoczęcia (HH:MM):');
    const timeEnd = prompt('Godzina zakończenia (HH:MM):');
    
    if (startDate && endDate && timeStart && timeEnd) {
      // Generate slots for each day
      const slots = [];
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
        slots.push({
          date: d.toISOString().split('T')[0],
          time_start: timeStart,
          time_end: timeEnd,
          capacity: formData.capacity,
          location: formData.location,
          test_type: formData.test_type,
          price: formData.price,
        });
      }
      
      try {
        await bulkCreateSlots(slots);
        setShowBulkModal(false);
      } catch (err) {
        console.error('Error bulk creating slots:', err);
      }
    }
  };

  const filteredSlots = slots.filter(slot => {
    if (filterStatus !== 'all' && slot.status !== filterStatus) return false;
    return true;
  });

  const getStatusBadge = (status: string) => {
    const badges = {
      available: 'bg-green-100 text-green-800',
      booked: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Zarządzanie Slotami Testowymi</h1>
          <p className="text-gray-600">Zarządzaj harmonogramem testów i rezerwacjami</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Wszystkie Sloty</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.total_slots || 0}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Dostępne</p>
                <p className="text-2xl font-bold text-green-600">{availableSlots.length}</p>
              </div>
              <Check className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Zarezerwowane</p>
                <p className="text-2xl font-bold text-yellow-600">{bookedSlots.length}</p>
              </div>
              <Users className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Wykorzystanie</p>
                <p className="text-2xl font-bold text-purple-600">{stats?.utilization_rate || 0}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Szukaj po lokalizacji, typie..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Szukaj
              </button>
            </form>

            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Wszystkie</option>
                <option value="available">Dostępne</option>
                <option value="booked">Zarezerwowane</option>
                <option value="completed">Ukończone</option>
                <option value="cancelled">Anulowane</option>
              </select>

              <button
                onClick={() => setShowBulkModal(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Bulk Create
              </button>

              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Dodaj Slot
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Slots Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data i Czas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lokalizacja
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Typ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Miejsca
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cena
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Akcje
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSlots.map((slot) => (
                  <tr key={slot.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{slot.date}</div>
                        <div className="text-sm text-gray-500">{slot.time_start} - {slot.time_end}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {slot.location || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {slot.test_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {slot.booked_count || 0} / {slot.capacity}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${((slot.booked_count || 0) / slot.capacity) * 100}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      €{slot.price?.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(slot.status)}`}>
                        {slot.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        {slot.status === 'available' && (
                          <button
                            onClick={() => handleBookSlot(slot.id)}
                            className="text-green-600 hover:text-green-900"
                            title="Zarezerwuj"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        {slot.status === 'booked' && (
                          <>
                            <button
                              onClick={() => handleCompleteSlot(slot.id)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Oznacz jako ukończony"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => cancelBooking(slot.id)}
                              className="text-yellow-600 hover:text-yellow-900"
                              title="Anuluj rezerwację"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => {
                            setEditingSlot(slot);
                            setFormData({
                              date: slot.date,
                              time_start: slot.time_start,
                              time_end: slot.time_end,
                              capacity: slot.capacity,
                              location: slot.location,
                              test_type: slot.test_type,
                              price: slot.price,
                              notes: slot.notes || '',
                            });
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edytuj"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSlot(slot.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Usuń"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredSlots.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Brak slotów</h3>
              <p className="mt-1 text-sm text-gray-500">Dodaj pierwszy slot testowy</p>
            </div>
          )}
        </div>

        {/* Add/Edit Modal */}
        {(showAddModal || editingSlot) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-6">
                {editingSlot ? 'Edytuj Slot' : 'Dodaj Nowy Slot'}
              </h2>
              
              <form onSubmit={editingSlot ? handleUpdateSlot : handleCreateSlot}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Typ Testu
                    </label>
                    <select
                      value={formData.test_type}
                      onChange={(e) => setFormData({ ...formData, test_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="driving">Jazda</option>
                      <option value="theory">Teoria</option>
                      <option value="practical">Praktyka</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Godzina Rozpoczęcia
                    </label>
                    <input
                      type="time"
                      value={formData.time_start}
                      onChange={(e) => setFormData({ ...formData, time_start: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Godzina Zakończenia
                    </label>
                    <input
                      type="time"
                      value={formData.time_end}
                      onChange={(e) => setFormData({ ...formData, time_end: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pojemność
                    </label>
                    <input
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      min="1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cena (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lokalizacja
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="np. Warsaw Center"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notatki
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Dodatkowe informacje..."
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingSlot(null);
                      setFormData({
                        date: '',
                        time_start: '',
                        time_end: '',
                        capacity: 10,
                        location: '',
                        test_type: 'driving',
                        price: 50.00,
                        notes: '',
                      });
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Anuluj
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    {editingSlot ? 'Zapisz Zmiany' : 'Dodaj Slot'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
