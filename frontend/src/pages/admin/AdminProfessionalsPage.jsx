import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Button, Card, Badge, EmptyState } from '../../components/ui/Elements';
import { PageLoader } from '../../components/ui/Loading';

const statusColors = {
  true: 'success',
  false: 'danger',
};

export default function AdminProfessionalsPage() {
  const [pros, setPros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(null);

  useEffect(() => {
    api.get('/admin/professionals').then(({ data }) => setPros(data)).catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggle = async (id, current) => {
    setToggling(id);
    try {
      await api.put(`/admin/professionals/${id}/toggle`, { isActive: !current });
      setPros(pros.map(p => p.id === id ? { ...p, isActive: !current } : p));
    } catch {}
    setToggling(null);
  };

  if (loading) return <PageLoader />;

  return (
    <div className="p-6 lg:p-8 animate-fade-in max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-surface-900">Gestion des professionnels</h1>
        <p className="text-surface-500 mt-1">{pros.length} professionnel{pros.length !== 1 ? 's' : ''} inscrit{pros.length !== 1 ? 's' : ''}</p>
      </div>

      {pros.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-8 h-8 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
          title="Aucun professionnel"
          description="Aucun professionnel n'est encore inscrit sur la plateforme."
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-200 bg-surface-50/50">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-surface-500 uppercase tracking-wider">Nom</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-surface-500 uppercase tracking-wider">Ville</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-surface-500 uppercase tracking-wider">Email</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-surface-500 uppercase tracking-wider">Statut</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-surface-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {pros.map(pro => (
                  <tr key={pro.id} className="hover:bg-surface-50/50 transition-colors duration-150">
                    <td className="px-5 py-4">
                      <span className="font-medium text-surface-900">{pro.businessName}</span>
                    </td>
                    <td className="px-5 py-4 text-surface-500">{pro.city || '—'}</td>
                    <td className="px-5 py-4 text-surface-500 text-sm">{pro.email || '—'}</td>
                    <td className="px-5 py-4">
                      <Badge variant={statusColors[pro.isActive]}>
                        {pro.isActive ? 'Actif' : 'Suspendu'}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Button
                        variant={pro.isActive ? 'danger' : 'success'}
                        size="sm"
                        loading={toggling === pro.id}
                        onClick={() => toggle(pro.id, pro.isActive)}
                      >
                        {pro.isActive ? 'Suspendre' : 'Activer'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
