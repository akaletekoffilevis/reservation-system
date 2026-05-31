import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Card, Button } from '../../components/ui/Elements';
import { PageLoader } from '../../components/ui/Loading';

const cardStyles = {
  blue: 'bg-blue-50 border-blue-200 text-blue-600',
  green: 'bg-green-50 border-green-200 text-green-600',
  purple: 'bg-purple-50 border-purple-200 text-purple-600',
  amber: 'bg-amber-50 border-amber-200 text-amber-600',
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/admin/dashboard').then(({ data }) => setStats(data)).catch(() => {});
  }, []);

  if (!stats) return <PageLoader />;

  const cards = [
    { label: 'Professionnels', value: stats.totalProfessionals, sub: `${stats.activeProfessionals} actifs`, color: 'blue' },
    { label: 'Clients', value: stats.totalClients, color: 'green' },
    { label: 'Rendez-vous', value: stats.totalAppointments, sub: `${stats.todayAppointments} aujourd'hui`, color: 'purple' },
    { label: 'Avis en attente', value: stats.pendingReviews, color: 'amber' },
  ];

  return (
    <div className="p-6 animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">Tableau de bord Admin</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card, i) => (
          <div key={i} className={`rounded-xl p-5 border ${cardStyles[card.color]}`}>
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className={`text-3xl font-bold ${cardStyles[card.color].split(' ')[2]}`}>{card.value}</p>
            {card.sub && <p className="text-xs text-gray-400 mt-1">{card.sub}</p>}
          </div>
        ))}
      </div>
      <div className="flex gap-4">
        <Link to="/admin/professionals"><Button variant="primary">Gérer les pros</Button></Link>
        <Link to="/admin/reviews"><Button variant="secondary">Modérer les avis ({stats.pendingReviews})</Button></Link>
      </div>
    </div>
  );
}
