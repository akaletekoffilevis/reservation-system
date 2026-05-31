import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Button, Card, Badge, EmptyState } from '../../components/ui/Elements';
import { PageLoader, ListSkeleton } from '../../components/ui/Loading';

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
    <div className="p-6 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Gestion des professionnels</h1>
          <p className="text-gray-500 mt-1">{pros.length} professionnels inscrits</p>
        </div>
      </div>

      {pros.length === 0 ? (
        <EmptyState title="Aucun professionnel" description="Aucun professionnel n'est encore inscrit sur la plateforme." />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Nom</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Ville</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {pros.map(pro => (
                  <tr key={pro.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 font-medium">{pro.businessName}</td>
                    <td className="px-4 py-4 text-gray-600">{pro.city || '—'}</td>
                    <td className="px-4 py-4 text-gray-600 text-sm">{pro.email || '—'}</td>
                    <td className="px-4 py-4">
                      <Badge variant={pro.isActive ? 'success' : 'danger'}>{pro.isActive ? 'Actif' : 'Suspendu'}</Badge>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Button variant={pro.isActive ? 'danger' : 'success'} size="sm"
                        loading={toggling === pro.id}
                        onClick={() => toggle(pro.id, pro.isActive)}>
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
