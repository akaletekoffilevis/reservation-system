import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card, Badge } from '../../components/ui/Elements';
import { PageLoader, CardSkeleton } from '../../components/ui/Loading';

export default function DashboardHomePage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/pro/appointments')
      .then(({ data }) => setAppointments(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[1,2,3].map(i => <CardSkeleton key={i} />)}
      </div>
      <CardSkeleton />
    </div>
  );

  const today = new Date().toDateString();
  const todayApps = appointments.filter(a => new Date(a.startUtc).toDateString() === today);
  const pending = appointments.filter(a => a.status === 'Pending');
  const upcoming = appointments
    .filter(a => a.status !== 'Cancelled' && new Date(a.startUtc) > new Date())
    .sort((a, b) => new Date(a.startUtc) - new Date(b.startUtc));

  const statusBadge = (status) => {
    const map = { Pending: 'warning', Confirmed: 'success', Completed: 'default', Cancelled: 'danger' };
    return <Badge variant={map[status]}>{status}</Badge>;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-500 mt-1">Vue d'ensemble de votre activité</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: "Aujourd'hui", value: todayApps.length, icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', color: 'text-brand-600 bg-brand-100' },
          { label: 'En attente', value: pending.length, icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-yellow-600 bg-yellow-100' },
          { label: 'Total', value: appointments.length, icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', color: 'text-purple-600 bg-purple-100' },
        ].map((s, i) => (
          <Card key={i} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{s.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{s.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl ${s.color} flex items-center justify-center`}>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={s.icon} />
                </svg>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Upcoming */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Prochains rendez-vous</h2>
        </div>
        {upcoming.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500">Aucun rendez-vous à venir</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {upcoming.slice(0, 10).map((a) => (
              <div key={a.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="font-semibold text-gray-600">{a.clientName.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{a.clientName}</p>
                    <p className="text-sm text-gray-500">{a.serviceName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(a.startUtc).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(a.startUtc).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div>{statusBadge(a.status)}</div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
