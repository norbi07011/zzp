import React, { useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  CurrencyEuroIcon,
  BriefcaseIcon,
  StarIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

// Mock data
const earningsData = [
  { month: 'Sty', earnings: 4200 },
  { month: 'Lut', earnings: 5100 },
  { month: 'Mar', earnings: 4800 },
  { month: 'Kwi', earnings: 6200 },
  { month: 'Maj', earnings: 7500 },
  { month: 'Cze', earnings: 6800 },
  { month: 'Lip', earnings: 8200 },
  { month: 'Sie', earnings: 7900 },
  { month: 'Wrz', earnings: 8500 },
  { month: 'Paź', earnings: 9100 },
  { month: 'Lis', earnings: 8800 },
  { month: 'Gru', earnings: 9500 },
];

const jobsByCategory = [
  { category: 'Elektryka', count: 45, color: '#3b82f6' },
  { category: 'Hydraulika', count: 32, color: '#10b981' },
  { category: 'Stolarka', count: 28, color: '#f59e0b' },
  { category: 'Malowanie', count: 18, color: '#8b5cf6' },
  { category: 'Inne', count: 12, color: '#6b7280' },
];

const ratingTrend = [
  { month: 'Sty', rating: 4.5 },
  { month: 'Lut', rating: 4.6 },
  { month: 'Mar', rating: 4.7 },
  { month: 'Kwi', rating: 4.8 },
  { month: 'Maj', rating: 4.9 },
  { month: 'Cze', rating: 4.9 },
  { month: 'Lip', rating: 5.0 },
  { month: 'Sie', rating: 4.9 },
  { month: 'Wrz', rating: 4.9 },
  { month: 'Paź', rating: 5.0 },
  { month: 'Lis', rating: 5.0 },
  { month: 'Gru', rating: 5.0 },
];

const weeklyActivity = [
  { day: 'Pon', hours: 8 },
  { day: 'Wt', hours: 7 },
  { day: 'Śr', hours: 9 },
  { day: 'Czw', hours: 8 },
  { day: 'Pt', hours: 6 },
  { day: 'Sob', hours: 4 },
  { day: 'Nd', hours: 0 },
];

type Period = 'week' | 'month' | 'quarter' | 'year';

export const Analytics: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('month');

  const periods = [
    { value: 'week', label: 'Tydzień' },
    { value: 'month', label: 'Miesiąc' },
    { value: 'quarter', label: 'Kwartał' },
    { value: 'year', label: 'Rok' },
  ];

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    change?: number;
    icon: React.ComponentType<{ className?: string }>;
    iconColor: string;
  }> = ({ title, value, change, icon: Icon, iconColor }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:-translate-y-1 transition-transform duration-300">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center gap-1 text-sm ${change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {change >= 0 ? (
                <ArrowTrendingUpIcon className="w-4 h-4" />
              ) : (
                <ArrowTrendingDownIcon className="w-4 h-4" />
              )}
              <span className="font-medium">{Math.abs(change)}%</span>
              <span className="text-gray-600">vs poprzedni okres</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg ${iconColor} bg-opacity-10 flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-5 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analityka</h1>
          <p className="text-gray-600">Przegląd Twoich statystyk i wydajności</p>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2 bg-white rounded-lg shadow-lg p-1">
          {periods.map((period) => (
            <button
              key={period.value}
              onClick={() => setSelectedPeriod(period.value as Period)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedPeriod === period.value
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="Całkowite zarobki"
          value="€82,400"
          change={12.5}
          icon={CurrencyEuroIcon}
          iconColor="text-emerald-600"
        />
        <StatCard
          title="Ukończone zlecenia"
          value={135}
          change={8.3}
          icon={BriefcaseIcon}
          iconColor="text-blue-600"
        />
        <StatCard
          title="Średnia ocena"
          value="4.9"
          change={2.1}
          icon={StarIcon}
          iconColor="text-amber-600"
        />
        <StatCard
          title="Wyświetlenia profilu"
          value="2,847"
          change={-3.2}
          icon={EyeIcon}
          iconColor="text-purple-600"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        {/* Earnings Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Zarobki w czasie</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={earningsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="earnings"
                name="Zarobki (€)"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Jobs by Category */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Zlecenia według kategorii</h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={jobsByCategory}
                  dataKey="count"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.category} (${entry.count})`}
                >
                  {jobsByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Rating Trend */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Trend ocen</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={ratingTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis domain={[4, 5]} stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="rating"
                name="Średnia ocena"
                stroke="#f59e0b"
                strokeWidth={3}
                dot={{ fill: '#f59e0b', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Activity */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Aktywność w tygodniu</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="hours" name="Godziny pracy" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Wskaźnik akceptacji</h3>
          <div className="flex items-end gap-4">
            <div>
              <p className="text-4xl font-bold text-blue-600">87%</p>
              <p className="text-sm text-gray-600 mt-1">aplikacji zaakceptowanych</p>
            </div>
            <div className="flex-1 h-32">
              <div className="h-full flex items-end gap-1">
                {[65, 72, 78, 81, 85, 87].map((value, idx) => (
                  <div
                    key={idx}
                    className="flex-1 bg-blue-600 rounded-t"
                    title={`${value}%`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Czas odpowiedzi</h3>
          <div className="flex items-end gap-4">
            <div>
              <p className="text-4xl font-bold text-emerald-600">&lt; 2h</p>
              <p className="text-sm text-gray-600 mt-1">średni czas odpowiedzi</p>
            </div>
            <ChartBarIcon className="w-24 h-24 text-emerald-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Powtórni klienci</h3>
          <div className="flex items-end gap-4">
            <div>
              <p className="text-4xl font-bold text-purple-600">64%</p>
              <p className="text-sm text-gray-600 mt-1">klientów wraca</p>
            </div>
            <UserGroupIcon className="w-24 h-24 text-purple-200" />
          </div>
        </div>
      </div>
    </div>
  );
};
