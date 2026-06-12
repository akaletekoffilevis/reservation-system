import { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../../services/api';
import { Card, Badge } from '../../components/ui/Elements';
import { CardSkeleton } from '../../components/ui/Loading';

const statCards = [
  {
    label: "Aujourd'hui",
    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    bg: 'bg-brand-100',
    iconColor: 'text-brand-600',
  },
  {
    label: 'En attente',
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    bg: 'bg-amber-100',
    iconColor: 'text-amber-600',
  },
  {
    label: 'Total',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
    bg: 'bg-purple-100',
    iconColor: 'text-purple-600',
  },
];

const statusMap = { Pending: 'warning', Confirmed: 'success', Completed: 'default', Cancelled: 'danger' };

function StatusBadge({ status }) {
  return <Badge variant={statusMap[status]}>{status}</Badge>;
}

export default function DashboardHomePage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/pro/appointments')
      .then(({ data }) => setAppointments(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const todayStr = useMemo(() => new Date().toDateString(), []);

  const { todayApps, pending, upcoming } = useMemo(() => {
    const todayApps = appointments.filter(a => new Date(a.startUtc).toDateString() === todayStr);
    const pending = appointments.filter(a => a.status === 'Pending');
    const upcoming = appointments
      .filter(a => a.status !== 'Cancelled' && new Date(a.startUtc) > new Date())
      .sort((a, b) => new Date(a.startUtc) - new Date(b.startUtc));
    return { todayApps, pending, upcoming };
  }, [appointments, todayStr]);

  const formatDate = useCallback((d) =>
    new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }), []);

  const formatTime = useCallback((d) =>
    new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }), []);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <div className="h-8 w-48 bg-surface-200 rounded-lg animate-pulse" />
          <div className="h-4 w-64 bg-surface-100 rounded-lg animate-pulse mt-2" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
        </div>
        <CardSkeleton />
      </div>
    );
  }

  const stats = [
    { ...statCards[0], value: todayApps.length },
    { ...statCards[1], value: pending.length },
    { ...statCards[2], value: appointments.length },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Tableau de bord</h1>
        <p className="text-surface-500 mt-1">Vue d'ensemble de votre activité</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {stats.map((s, i) => (
          <Card key={i} className="p-6 card-hover" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-surface-500">{s.label}</p>
                <p className="text-3xl font-bold text-surface-900 mt-1.5 tabular-nums">{s.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center`}>
                <svg className={`w-6 h-6 ${s.iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={s.icon} />
                </svg>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="px-6 py-5 border-b border-surface-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-surface-900">Prochains rendez-vous</h2>
            {upcoming.length > 0 && (
              <span className="text-xs text-surface-400 font-medium">{upcoming.length} à venir</span>
            )}
          </div>
        </div>
        {upcoming.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 animate-fade-in">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-100">
              <svg className="h-7 w-7 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-surface-900 font-medium">Aucun rendez-vous à venir</p>
            <p className="text-surface-400 text-sm mt-1">Les prochaines réservations apparaîtront ici</p>
          </div>
        ) : (
          <div className="divide-y divide-surface-100">
            {upcoming.slice(0, 10).map((a, i) => (
              <div
                key={a.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-surface-50 transition-colors duration-150 animate-fade-in"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-white">{a.clientName?.charAt(0) || '?'}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-surface-900 truncate">{a.clientName}</p>
                    <p className="text-sm text-surface-500 truncate">{a.serviceName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-medium text-surface-900">{formatDate(a.startUtc)}</p>
                    <p className="text-xs text-surface-400">{formatTime(a.startUtc)}</p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
