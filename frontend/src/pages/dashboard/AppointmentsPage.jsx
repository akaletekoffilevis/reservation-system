import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card, Badge, Button, EmptyState } from '../../components/ui/Elements';
import { PageLoader } from '../../components/ui/Loading';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState('');

  const load = async () => {
    const params = date ? `?date=${date}` : '';
    const { data } = await api.get(`/pro/appointments${params}`);
    setAppointments(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [date]);

  const handleAction = async (id, action) => {
    await api.put(`/pro/appointments/${id}/${action}`);
    load();
  };

  if (loading) return <PageLoader />;

  const statusBadge = (status) => {
    const map = { Pending: 'warning', Confirmed: 'success', Completed: 'default', Cancelled: 'danger' };
    return <Badge variant={map[status]}>{status}</Badge>;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rendez-vous</h1>
          <p className="text-gray-500 mt-1">Gérez les demandes de réservation</p>
        </div>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
      </div>

      {appointments.length === 0 ? (
        <EmptyState
          title="Aucun rendez-vous"
          description={date ? "Aucun rendez-vous pour cette date." : "Vous n'avez pas encore de rendez-vous."}
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="text-right px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {appointments.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-brand-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-brand-600">{a.clientName.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{a.clientName}</p>
                          <p className="text-sm text-gray-500">{a.clientEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{a.serviceName}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(a.startUtc).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(a.startUtc).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </td>
                    <td className="px-6 py-4">{statusBadge(a.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {a.status === 'Pending' && (
                          <>
                            <Button size="sm" variant="success" onClick={() => handleAction(a.id, 'confirm')}>Confirmer</Button>
                            <Button size="sm" variant="danger" onClick={() => handleAction(a.id, 'cancel')}>Annuler</Button>
                          </>
                        )}
                        {a.status === 'Confirmed' && (
                          <Button size="sm" onClick={() => handleAction(a.id, 'complete')}>Terminer</Button>
                        )}
                        {a.status === 'Completed' && (
                          <span className="text-xs text-gray-400">Terminé</span>
                        )}
                        {a.status === 'Cancelled' && (
                          <span className="text-xs text-red-400">Annulé</span>
                        )}
                      </div>
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
