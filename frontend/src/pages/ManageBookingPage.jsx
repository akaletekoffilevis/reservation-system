import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Card, Button, Badge } from '../components/ui/Elements';
import { PageLoader } from '../components/ui/Loading';

export default function ManageBookingPage() {
  const { token } = useParams();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [done, setDone] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get(`/appointments/${token}`);
      setAppointment(data);
    } catch { setAppointment(null); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [token]);

  const handleCancel = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) return;
    setCancelling(true);
    try {
      await api.put(`/appointments/${token}/cancel`, { reason: 'Annulé par le client' });
      setDone(true);
      load();
    } finally { setCancelling(false); }
  };

  if (loading) return <PageLoader />;
  if (!appointment) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Card className="p-8 text-center max-w-md">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold mb-2">Rendez-vous introuvable</h2>
        <p className="text-gray-500 text-sm mb-6">Le lien que vous utilisez est invalide ou a expiré.</p>
        <Link to="/"><Button>Retour à l'accueil</Button></Link>
      </Card>
    </div>
  );

  const statusVariant = {
    Pending: 'warning',
    Confirmed: 'success',
    Completed: 'default',
    Cancelled: 'danger',
  };

  const statusLabel = {
    Pending: 'En attente de confirmation',
    Confirmed: 'Confirmé',
    Completed: 'Terminé',
    Cancelled: 'Annulé',
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <Card className="max-w-lg w-full p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Mon rendez-vous</h1>
          <Badge variant={statusVariant[appointment.status]}>{statusLabel[appointment.status]}</Badge>
        </div>

        {done && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg mb-6 text-emerald-700 text-sm flex items-center gap-3">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Votre rendez-vous a été annulé.
          </div>
        )}

        <div className="space-y-5">
          <div className="flex items-center gap-4 pb-5 border-b border-gray-100">
            <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center">
              <span className="text-lg font-bold text-brand-600">{appointment.businessName?.charAt(0)}</span>
            </div>
            <div>
              <p className="font-semibold text-gray-900">{appointment.businessName}</p>
              <p className="text-sm text-gray-500">{appointment.serviceName}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Date</p>
              <p className="font-medium text-gray-900">
                {new Date(appointment.startUtc).toLocaleDateString('fr-FR', {
                  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                })}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Heure</p>
              <p className="font-medium text-gray-900">
                {new Date(appointment.startUtc).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                {' — '}
                {new Date(appointment.endUtc).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          {appointment.notes && (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Notes</p>
              <p className="text-sm text-gray-600">{appointment.notes}</p>
            </div>
          )}
        </div>

        {appointment.status !== 'Cancelled' && appointment.status !== 'Completed' && (
          <div className="mt-8 pt-6 border-t border-gray-100">
            <Button variant="danger" onClick={handleCancel} loading={cancelling} className="w-full">
              Annuler ce rendez-vous
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
