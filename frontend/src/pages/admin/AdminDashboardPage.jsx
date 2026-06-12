import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Button, Card } from '../../components/ui/Elements';
import { PageLoader } from '../../components/ui/Loading';

const statIcons = {
  professionals: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  clients: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  appointments: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  reviews: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ),
};

const cardConfig = [
  {
    key: 'professionals',
    label: 'Professionnels',
    valueKey: 'totalProfessionals',
    subKey: 'activeProfessionals',
    subFormat: (v) => `${v} actifs`,
    color: 'brand',
    borderColor: 'border-l-brand-500',
    bgIcon: 'bg-brand-50 text-brand-600',
  },
  {
    key: 'clients',
    label: 'Clients',
    valueKey: 'totalClients',
    color: 'emerald',
    borderColor: 'border-l-emerald-500',
    bgIcon: 'bg-emerald-50 text-emerald-600',
  },
  {
    key: 'appointments',
    label: 'Rendez-vous',
    valueKey: 'totalAppointments',
    subKey: 'todayAppointments',
    subFormat: (v) => `${v} aujourd'hui`,
    color: 'violet',
    borderColor: 'border-l-violet-500',
    bgIcon: 'bg-violet-50 text-violet-600',
  },
  {
    key: 'reviews',
    label: 'Avis en attente',
    valueKey: 'pendingReviews',
    color: 'amber',
    borderColor: 'border-l-amber-500',
    bgIcon: 'bg-amber-50 text-amber-600',
  },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/admin/dashboard').then(({ data }) => setStats(data)).catch(() => {});
  }, []);

  if (!stats) return <PageLoader />;

  return (
    <div className="p-6 lg:p-8 animate-fade-in max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-surface-900">Tableau de bord Admin</h1>
        <p className="text-surface-500 mt-1">Vue d'ensemble de la plateforme</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {cardConfig.map((cfg) => {
          const value = stats[cfg.valueKey];
          const sub = cfg.subKey ? cfg.subFormat(stats[cfg.subKey]) : null;
          return (
            <div
              key={cfg.key}
              className={`bg-white rounded-2xl border border-surface-200 border-l-4 ${cfg.borderColor} shadow-sm hover:shadow-md transition-all duration-200 p-5`}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-sm font-medium text-surface-500">{cfg.label}</span>
                <div className={`rounded-xl p-2 ${cfg.bgIcon}`}>
                  {statIcons[cfg.key]}
                </div>
              </div>
              <p className="text-3xl font-bold text-surface-900">{value}</p>
              {sub && <p className="text-sm text-surface-500 mt-1">{sub}</p>}
            </div>
          );
        })}
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-surface-900 mb-4">Actions rapides</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/admin/professionals">
            <Button variant="primary" size="lg">
              Gérer les pros
            </Button>
          </Link>
          <Link to="/admin/reviews">
            <Button variant="secondary" size="lg">
              Modérer les avis
              {stats.pendingReviews > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center h-5 min-w-[20px] rounded-full bg-amber-100 text-amber-700 text-xs font-semibold px-1.5">
                  {stats.pendingReviews}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
