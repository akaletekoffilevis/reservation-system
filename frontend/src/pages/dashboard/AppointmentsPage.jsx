import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card, Badge, Button, EmptyState } from '../../components/ui/Elements';
import { PageLoader } from '../../components/ui/Loading';

const statusMap = { Pending: 'warning', Confirmed: 'success', Completed: 'default', Cancelled: 'danger' };

function StatusBadge({ status }) {
  return <Badge variant={statusMap[status]}>{status}</Badge>;
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState('');
  const [refresh, setRefresh] = useState(0);

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const params = date ? `?date=${date}` : '';
    api.get(`/pro/appointments${params}`)
      .then(({ data }) => setAppointments(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [date, refresh]);

  const handleAction = async (id, action) => {
    await api.put(`/pro/appointments/${id}/${action}`);
    setRefresh(r => r + 1);
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

  const formatTime = (d) =>
    new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Rendez-vous</h1>
          <p className="text-surface-500 mt-1">Gérez les demandes de réservation</p>
        </div>
        <input
          type="date"
          value={date}
          max={todayStr}
          onChange={(e) => setDate(e.target.value)}
          className="input-base w-full sm:w-auto"
        />
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
                <tr className="bg-surface-50 border-b border-surface-200">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">Client</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">Service</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">Date & Heure</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">Statut</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {appointments.map((a) => (
                  <tr key={a.id} className="hover:bg-surface-50 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-white">{a.clientName?.charAt(0) || '?'}</span>
                        </div>
                        <div>
                          <p className="font-medium text-surface-900">{a.clientName}</p>
                          <p className="text-sm text-surface-400">{a.clientEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-surface-700">{a.serviceName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-medium text-surface-900">{formatDate(a.startUtc)}</p>
                      <p className="text-xs text-surface-400">{formatTime(a.startUtc)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={a.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {a.status === 'Pending' && (
                          <>
                            <Button size="sm" variant="success" onClick={() => handleAction(a.id, 'confirm')}>
                              Confirmer
                            </Button>
                            <Button size="sm" variant="danger" onClick={() => handleAction(a.id, 'cancel')}>
                              Annuler
                            </Button>
                          </>
                        )}
                        {a.status === 'Confirmed' && (
                          <Button size="sm" onClick={() => handleAction(a.id, 'complete')}>
                            Terminer
                          </Button>
                        )}
                        {a.status === 'Completed' && (
                          <span className="inline-flex items-center gap-1.5 text-xs text-surface-400">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Terminé
                          </span>
                        )}
                        {a.status === 'Cancelled' && (
                          <span className="inline-flex items-center gap-1.5 text-xs text-red-400">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Annulé
                          </span>
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
