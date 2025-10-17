import React, { useState, useMemo } from 'react';
import { useToasts } from '../../contexts/ToastContext';

type MetricType = 'appointments' | 'revenue' | 'efficiency' | 'satisfaction' | 'noshow';
type TimeRange = '7d' | '30d' | '90d' | '1y' | 'custom';
type ChartType = 'line' | 'bar' | 'pie' | 'area';

type AnalyticsData = {
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  noShowRate: number;
  averageDuration: number;
  totalRevenue: number;
  topWorker: string;
  busyHour: string;
  satisfactionScore: number;
  rebookingRate: number;
};

type TrendData = {
  date: string;
  appointments: number;
  revenue: number;
  noShows: number;
  satisfaction: number;
  efficiency: number;
};

interface AppointmentAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentData?: any[];
}

export const AppointmentAnalyticsModal: React.FC<AppointmentAnalyticsModalProps> = ({
  isOpen,
  onClose,
  appointmentData = []
}) => {
  const { addToast } = useToasts();

  // State management
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('appointments');
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [chartType, setChartType] = useState<ChartType>('line');
  const [selectedWorkers, setSelectedWorkers] = useState<string[]>([]);
  const [customDateRange, setCustomDateRange] = useState({
    from: '',
    to: ''
  });

  // Mock analytics data
  const analyticsData: AnalyticsData = {
    totalAppointments: 287,
    completedAppointments: 245,
    cancelledAppointments: 28,
    noShowRate: 4.9,
    averageDuration: 145,
    totalRevenue: 34250,
    topWorker: 'Piotr Malarz',
    busyHour: '14:00-15:00',
    satisfactionScore: 4.7,
    rebookingRate: 23.4
  };

  // Mock trend data
  const trendData: TrendData[] = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    
    return {
      date: date.toISOString().split('T')[0],
      appointments: Math.floor(Math.random() * 15) + 5,
      revenue: Math.floor(Math.random() * 2000) + 800,
      noShows: Math.floor(Math.random() * 3),
      satisfaction: Math.random() * 1 + 4,
      efficiency: Math.random() * 20 + 75
    };
  });

  // Workers data
  const workers = [
    { name: 'Piotr Malarz', appointments: 78, revenue: 12400, rating: 4.8, efficiency: 92 },
    { name: 'Tomasz Stolarz', appointments: 65, revenue: 10950, rating: 4.6, efficiency: 88 },
    { name: 'Marek Elektryk', appointments: 71, revenue: 11800, rating: 4.9, efficiency: 95 },
    { name: 'Adam Hydraulik', appointments: 58, revenue: 9650, rating: 4.5, efficiency: 85 },
    { name: 'Robert Dekarz', appointments: 45, revenue: 8250, rating: 4.7, efficiency: 90 }
  ];

  // Metrics configuration
  const metrics = {
    appointments: {
      title: 'Spotkania',
      icon: '📅',
      color: 'blue',
      format: (value: number) => value.toString(),
      unit: 'szt.'
    },
    revenue: {
      title: 'Przychody',
      icon: '💰',
      color: 'green',
      format: (value: number) => `${(value / 1000).toFixed(1)}k`,
      unit: 'PLN'
    },
    efficiency: {
      title: 'Efektywność',
      icon: '⚡',
      color: 'yellow',
      format: (value: number) => `${value.toFixed(1)}`,
      unit: '%'
    },
    satisfaction: {
      title: 'Satysfakcja',
      icon: '😊',
      color: 'purple',
      format: (value: number) => value.toFixed(1),
      unit: '/5'
    },
    noshow: {
      title: 'No-show',
      icon: '❌',
      color: 'red',
      format: (value: number) => value.toFixed(1),
      unit: '%'
    }
  };

  // Generate chart data based on selected metric
  const chartData = useMemo(() => {
    return trendData.map(item => ({
      date: item.date,
      value: selectedMetric === 'noshow' ? item.noShows : item[selectedMetric] || item.appointments,
      label: new Date(item.date).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' })
    }));
  }, [selectedMetric, trendData]);

  // Calculate statistics
  const stats = useMemo(() => {
    const currentValue = chartData[chartData.length - 1]?.value || 0;
    const previousValue = chartData[chartData.length - 2]?.value || 0;
    const change = previousValue > 0 ? ((currentValue - previousValue) / previousValue) * 100 : 0;
    
    const total = chartData.reduce((sum, item) => sum + item.value, 0);
    const average = total / chartData.length;
    const max = Math.max(...chartData.map(item => item.value));
    const min = Math.min(...chartData.map(item => item.value));

    return { change, average, max, min, total };
  }, [chartData]);

  // Export data
  const exportData = (format: 'csv' | 'excel' | 'pdf') => {
    addToast(`Eksportowanie danych do ${format.toUpperCase()}...`, 'info');
    
    // Mock export process
    setTimeout(() => {
      addToast(`Raport ${format.toUpperCase()} został pobrany!`, 'success');
    }, 2000);
  };

  // Simple chart component
  const SimpleChart: React.FC<{ data: any[], type: ChartType }> = ({ data, type }) => {
    const maxValue = Math.max(...data.map(item => item.value));
    const metric = metrics[selectedMetric];

    if (type === 'bar' || type === 'line') {
      return (
        <div className="h-64 flex items-end justify-between gap-1 p-4">
          {data.slice(-14).map((item, index) => {
            const height = (item.value / maxValue) * 100;
            return (
              <div key={index} className="flex flex-col items-center flex-1 max-w-8">
                <div className="text-xs text-gray-400 mb-1">
                  {metric.format(item.value)}
                </div>
                <div
                  className={`w-full bg-${metric.color}-500 rounded-t transition-all hover:bg-${metric.color}-400 cursor-pointer h-full`}
                  data-height={Math.max(height, 5)}
                  title={`${item.label}: ${metric.format(item.value)} ${metric.unit}`}
                />
                <div className="text-xs text-gray-500 mt-1 transform -rotate-45 origin-top-left">
                  {item.label}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    if (type === 'pie') {
      const total = data.reduce((sum, item) => sum + item.value, 0);
      const segments = workers.slice(0, 5).map((worker, index) => ({
        label: worker.name,
        value: worker.appointments,
        percentage: (worker.appointments / workers.reduce((sum, w) => sum + w.appointments, 0)) * 100,
        color: ['blue', 'green', 'yellow', 'purple', 'red'][index]
      }));

      return (
        <div className="h-64 flex items-center justify-center">
          <div className="relative w-48 h-48">
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              {segments.map((segment, index) => {
                const startAngle = segments.slice(0, index).reduce((sum, s) => sum + (s.percentage * 3.6), 0);
                const endAngle = startAngle + (segment.percentage * 3.6);
                const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
                const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
                const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
                const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);
                const largeArc = segment.percentage > 50 ? 1 : 0;

                return (
                  <path
                    key={index}
                    d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                    fill={`rgb(var(--color-${segment.color}-500))`}
                    className={`fill-${segment.color}-500 hover:opacity-80 cursor-pointer`}
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{total}</div>
                <div className="text-gray-400 text-sm">Total</div>
              </div>
            </div>
          </div>
          
          <div className="ml-6 space-y-2">
            {segments.map((segment, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded bg-${segment.color}-500`} />
                <span className="text-gray-300 text-sm">{segment.label}</span>
                <span className="text-gray-400 text-sm">({segment.percentage.toFixed(1)}%)</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return <div className="h-64 flex items-center justify-center text-gray-400">Chart type not implemented</div>;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-3xl w-full max-w-7xl h-[90vh] overflow-hidden shadow-2xl border border-white/20">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">📊 Appointment Analytics</h2>
              <p className="text-indigo-100">Zaawansowana analityka spotkań z AI insights</p>
            </div>
            <button
              onClick={onClose}
              className="bg-white/20 hover:bg-white/30 rounded-xl p-3 transition-all"
            >
              ✕
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
            {[
              { label: 'Spotkania', value: analyticsData.totalAppointments, icon: '📅', color: 'blue' },
              { label: 'Ukończone', value: `${((analyticsData.completedAppointments / analyticsData.totalAppointments) * 100).toFixed(1)}%`, icon: '✅', color: 'green' },
              { label: 'No-show', value: `${analyticsData.noShowRate}%`, icon: '❌', color: 'red' },
              { label: 'Przychód', value: `${(analyticsData.totalRevenue / 1000).toFixed(1)}k PLN`, icon: '💰', color: 'yellow' },
              { label: 'Ocena', value: analyticsData.satisfactionScore.toFixed(1), icon: '⭐', color: 'purple' }
            ].map((stat, index) => (
              <div key={index} className={`bg-${stat.color}-500/20 border border-${stat.color}-400/30 rounded-xl p-4`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{stat.icon}</span>
                  <span className={`text-${stat.color}-300 text-sm font-medium`}>{stat.label}</span>
                </div>
                <div className="text-white text-xl font-bold">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex h-full">
          {/* Sidebar - Controls */}
          <div className="w-80 bg-slate-700 p-6 overflow-y-auto">
            
            {/* Metric Selection */}
            <div className="mb-6">
              <label className="block text-white text-sm font-medium mb-3">Metryka</label>
              <div className="space-y-2">
                {Object.entries(metrics).map(([key, metric]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedMetric(key as MetricType)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                      selectedMetric === key
                        ? `bg-${metric.color}-500/20 border-2 border-${metric.color}-400`
                        : 'bg-slate-600 border-2 border-transparent hover:bg-slate-500'
                    }`}
                  >
                    <span className="text-xl">{metric.icon}</span>
                    <span className="text-white font-medium">{metric.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Range */}
            <div className="mb-6">
              <label className="block text-white text-sm font-medium mb-3">Okres</label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                className="w-full px-4 py-3 bg-slate-600 border border-slate-500 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                aria-label="Wybierz okres analizy"
              >
                <option value="7d">Ostatnie 7 dni</option>
                <option value="30d">Ostatnie 30 dni</option>
                <option value="90d">Ostatnie 90 dni</option>
                <option value="1y">Ostatni rok</option>
                <option value="custom">Niestandardowy</option>
              </select>
              
              {timeRange === 'custom' && (
                <div className="mt-3 space-y-3">
                  <input
                    type="date"
                    value={customDateRange.from}
                    onChange={(e) => setCustomDateRange(prev => ({ ...prev, from: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm"
                    aria-label="Data początkowa"
                  />
                  <input
                    type="date"
                    value={customDateRange.to}
                    onChange={(e) => setCustomDateRange(prev => ({ ...prev, to: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm"
                    aria-label="Data końcowa"
                  />
                </div>
              )}
            </div>

            {/* Chart Type */}
            <div className="mb-6">
              <label className="block text-white text-sm font-medium mb-3">Typ wykresu</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { type: 'line' as ChartType, icon: '📈', label: 'Linia' },
                  { type: 'bar' as ChartType, icon: '📊', label: 'Słupki' },
                  { type: 'pie' as ChartType, icon: '🥧', label: 'Kołowy' },
                  { type: 'area' as ChartType, icon: '🌊', label: 'Obszar' }
                ].map(({ type, icon, label }) => (
                  <button
                    key={type}
                    onClick={() => setChartType(type)}
                    className={`p-3 rounded-xl text-sm font-medium transition-all ${
                      chartType === type
                        ? 'bg-indigo-500/20 border-2 border-indigo-400 text-white'
                        : 'bg-slate-600 border-2 border-transparent text-gray-300 hover:bg-slate-500'
                    }`}
                  >
                    <div className="text-lg mb-1">{icon}</div>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Workers Filter */}
            <div className="mb-6">
              <label className="block text-white text-sm font-medium mb-3">Filtruj pracowników</label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {workers.map(worker => (
                  <label key={worker.name} className="flex items-center gap-3 p-2 hover:bg-slate-600 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedWorkers.includes(worker.name)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedWorkers(prev => [...prev, worker.name]);
                        } else {
                          setSelectedWorkers(prev => prev.filter(w => w !== worker.name));
                        }
                      }}
                      className="w-4 h-4 text-indigo-600"
                    />
                    <span className="text-white text-sm">{worker.name}</span>
                    <span className="text-gray-400 text-xs ml-auto">{worker.appointments}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Export Options */}
            <div className="mb-6">
              <label className="block text-white text-sm font-medium mb-3">Eksport danych</label>
              <div className="space-y-2">
                {[
                  { format: 'csv' as const, icon: '📄', label: 'CSV' },
                  { format: 'excel' as const, icon: '📊', label: 'Excel' },
                  { format: 'pdf' as const, icon: '📋', label: 'PDF' }
                ].map(({ format, icon, label }) => (
                  <button
                    key={format}
                    onClick={() => exportData(format)}
                    className="w-full flex items-center gap-3 p-3 bg-slate-600 hover:bg-slate-500 rounded-xl text-white text-sm font-medium transition-all"
                  >
                    <span className="text-lg">{icon}</span>
                    Eksportuj {label}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            
            {/* Chart Section */}
            <div className="bg-slate-700 rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {metrics[selectedMetric].icon} {metrics[selectedMetric].title}
                  </h3>
                  <p className="text-gray-400">
                    Trend w ciągu ostatnich {timeRange === '7d' ? '7 dni' : timeRange === '30d' ? '30 dni' : 'wybranego okresu'}
                  </p>
                </div>

                {/* Chart Stats */}
                <div className="flex gap-4">
                  <div className="text-center">
                    <div className={`text-2xl font-bold text-${metrics[selectedMetric].color}-400`}>
                      {stats.change > 0 ? '+' : ''}{stats.change.toFixed(1)}%
                    </div>
                    <div className="text-gray-400 text-sm">Zmiana</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {metrics[selectedMetric].format(stats.average)}
                    </div>
                    <div className="text-gray-400 text-sm">Średnia</div>
                  </div>
                </div>
              </div>

              <SimpleChart data={chartData} type={chartType} />
            </div>

            {/* Detailed Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              
              {/* Worker Performance */}
              <div className="bg-slate-700 rounded-2xl p-6">
                <h4 className="text-lg font-bold text-white mb-4">👥 Wydajność pracowników</h4>
                
                <div className="space-y-4">
                  {workers.slice(0, 5).map((worker, index) => (
                    <div key={worker.name} className="flex items-center gap-4 p-3 bg-slate-600 rounded-xl">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      
                      <div className="flex-1">
                        <div className="text-white font-medium">{worker.name}</div>
                        <div className="text-gray-400 text-sm">
                          {worker.appointments} spotkań • {(worker.revenue / 1000).toFixed(1)}k PLN
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-yellow-400 font-semibold">⭐ {worker.rating}</div>
                        <div className="text-gray-400 text-sm">{worker.efficiency}% efekt.</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Time Analysis */}
              <div className="bg-slate-700 rounded-2xl p-6">
                <h4 className="text-lg font-bold text-white mb-4">⏰ Analiza czasowa</h4>
                
                <div className="space-y-4">
                  <div className="p-4 bg-slate-600 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300">Najlepsze godziny</span>
                      <span className="text-green-400 font-semibold">{analyticsData.busyHour}</span>
                    </div>
                    <div className="w-full bg-slate-500 rounded-full h-2">
                      <div className="bg-green-400 h-2 rounded-full w-3/4" />
                    </div>
                  </div>

                  <div className="p-4 bg-slate-600 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300">Średni czas spotkania</span>
                      <span className="text-blue-400 font-semibold">{analyticsData.averageDuration} min</span>
                    </div>
                    <div className="w-full bg-slate-500 rounded-full h-2">
                      <div className="bg-blue-400 h-2 rounded-full w-3/5" />
                    </div>
                  </div>

                  <div className="p-4 bg-slate-600 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300">Wskaźnik rebookingu</span>
                      <span className="text-purple-400 font-semibold">{analyticsData.rebookingRate}%</span>
                    </div>
                    <div className="w-full bg-slate-500 rounded-full h-2">
                      <div className="bg-purple-400 h-2 rounded-full w-2/5" />
                    </div>
                  </div>

                  <div className="p-4 bg-slate-600 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300">Punktualność</span>
                      <span className="text-yellow-400 font-semibold">87%</span>
                    </div>
                    <div className="w-full bg-slate-500 rounded-full h-2">
                      <div className="bg-yellow-400 h-2 rounded-full w-5/6" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Insights */}
            <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-400/30 rounded-2xl p-6">
              <h4 className="text-lg font-bold text-white mb-4">🤖 AI Insights & Rekomendacje</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      ✓
                    </div>
                    <div>
                      <div className="text-green-300 font-semibold">Optymalna godzina</div>
                      <div className="text-gray-300 text-sm">
                        Spotkania między 14:00-15:00 mają najwyższy współczynnik ukończenia (94%)
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      💡
                    </div>
                    <div>
                      <div className="text-blue-300 font-semibold">Przypomnienia</div>
                      <div className="text-gray-300 text-sm">
                        SMS 24h wcześniej zmniejsza no-show o 67%
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      📈
                    </div>
                    <div>
                      <div className="text-yellow-300 font-semibold">Trend wzrostowy</div>
                      <div className="text-gray-300 text-sm">
                        Spotkania wideo zwiększają satysfakcję o 23%
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      ⚠️
                    </div>
                    <div>
                      <div className="text-orange-300 font-semibold">Uwaga</div>
                      <div className="text-gray-300 text-sm">
                        Piątki mają 15% więcej anulacji niż inne dni
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      🎯
                    </div>
                    <div>
                      <div className="text-purple-300 font-semibold">Cel</div>
                      <div className="text-gray-300 text-sm">
                        Zwiększ czas spotkań o 15min dla lepszej jakości
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      🚀
                    </div>
                    <div>
                      <div className="text-red-300 font-semibold">Możliwość</div>
                      <div className="text-gray-300 text-sm">
                        Automatyzacja może zaoszczędzić 12h/tydzień
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};