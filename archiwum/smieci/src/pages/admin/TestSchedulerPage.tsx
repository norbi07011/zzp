// @ts-nocheck
/**
 * TestSchedulerPage
 * Admin panel for managing test appointments and schedules
 */

import React, { useState } from 'react';

interface TimeSlot {
  id: string;
  date: string;
  time: string;
  capacity: number;
  booked: number;
  status: 'available' | 'full' | 'blocked';
}

export const TestSchedulerPage: React.FC = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [slots, setSlots] = useState<TimeSlot[]>([
    { id: '1', date: '2025-10-09', time: '09:00', capacity: 10, booked: 3, status: 'available' },
    { id: '2', date: '2025-10-09', time: '11:00', capacity: 10, booked: 10, status: 'full' },
    { id: '3', date: '2025-10-09', time: '14:00', capacity: 10, booked: 7, status: 'available' },
    { id: '4', date: '2025-10-10', time: '09:00', capacity: 10, booked: 0, status: 'available' },
    { id: '5', date: '2025-10-10', time: '11:00', capacity: 10, booked: 5, status: 'available' },
    { id: '6', date: '2025-10-10', time: '14:00', capacity: 10, booked: 2, status: 'available' },
  ]);

  const getStatusColor = (status: string) => {
    const colors = {
      available: 'bg-green-100 text-green-800 border-green-200',
      full: 'bg-red-100 text-red-800 border-red-200',
      blocked: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getCapacityPercentage = (booked: number, capacity: number) => {
    return (booked / capacity) * 100;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🗓️ Test Scheduler</h1>
          <p className="text-gray-600">Manage test appointment slots, capacity, and availability</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Slots This Week</h3>
            <p className="text-3xl font-bold text-gray-900">{slots.length}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Available</h3>
            <p className="text-3xl font-bold text-green-600">
              {slots.filter(s => s.status === 'available').length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Full</h3>
            <p className="text-3xl font-bold text-red-600">
              {slots.filter(s => s.status === 'full').length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Bookings</h3>
            <p className="text-3xl font-bold text-blue-600">
              {slots.reduce((sum, s) => sum + s.booked, 0)}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="flex gap-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              + Add New Slot
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              Generate Week Schedule
            </button>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
              Export Schedule
            </button>
            <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
              View Calendar
            </button>
          </div>
        </div>

        {/* Slots Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Test Slots</h2>
          </div>
          
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booked</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Availability</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {slots.map(slot => (
                <tr key={slot.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {new Date(slot.date).toLocaleDateString('nl-NL', { 
                      weekday: 'short', 
                      day: 'numeric', 
                      month: 'short' 
                    })}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {slot.time}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {slot.capacity}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {slot.booked} / {slot.capacity}
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          getCapacityPercentage(slot.booked, slot.capacity) === 100
                            ? 'bg-red-600'
                            : getCapacityPercentage(slot.booked, slot.capacity) > 70
                            ? 'bg-yellow-600'
                            : 'bg-green-600'
                        }`}
                        style={{ width: `${getCapacityPercentage(slot.booked, slot.capacity)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {getCapacityPercentage(slot.booked, slot.capacity).toFixed(0)}% filled
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(slot.status)}`}>
                      {slot.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="text-sm text-blue-600 hover:text-blue-800">
                        Edit
                      </button>
                      <button className="text-sm text-red-600 hover:text-red-800">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Weekly Calendar View */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Week View</h2>
          <div className="grid grid-cols-7 gap-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
              <div key={day} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{day}</h3>
                <div className="space-y-2">
                  {slots
                    .filter(s => new Date(s.date).getDay() === (index + 1) % 7)
                    .map(s => (
                      <div
                        key={s.id}
                        className={`p-2 rounded text-xs ${
                          s.status === 'full' ? 'bg-red-100' : 'bg-green-100'
                        }`}
                      >
                        <div className="font-medium">{s.time}</div>
                        <div className="text-gray-600">
                          {s.booked}/{s.capacity}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestSchedulerPage;
