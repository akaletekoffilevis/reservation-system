import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card, Button, Badge, Input, EmptyState } from '../../components/ui/Elements';
import { PageLoader } from '../../components/ui/Loading';

const typeStyles = {
  Vacation: 'success',
  Sick: 'danger',
  Training: 'primary',
  Holiday: 'warning',
  Other: 'default',
};

const typeLabels = {
  Vacation: 'Vacances',
  Sick: 'Maladie',
  Training: 'Formation',
  Holiday: 'Férié',
  Other: 'Autre',
};

const typeOptions = Object.entries(typeLabels).map(([value, label]) => ({ value, label }));

const emptyForm = { type: 'Vacation', startDate: '', endDate: '', reason: '' };

export default function TimeOffPage() {
  const [timeOffs, setTimeOffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });

  const fetchTimeOffs = () => {
    api.get('/pro/timeoffs')
      .then(({ data }) => setTimeOffs(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTimeOffs(); }, []);

  const create = async () => {
    if (!form.startDate || !form.endDate) return;
    await api.post('/pro/timeoffs', form);
    await fetchTimeOffs();
    setShowForm(false);
    setForm({ ...emptyForm });
  };

  const cancel = async (id) => {
    await api.delete(`/pro/timeoffs/${id}`);
    setTimeOffs(prev => prev.filter(t => t.id !== id));
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Congés & Absences</h1>
          <p className="text-surface-500 mt-1">Gérez vos périodes d'indisponibilité</p>
        </div>
        <Button
          variant={showForm ? 'secondary' : 'primary'}
          onClick={() => { setShowForm(!showForm); if (!showForm) setForm({ ...emptyForm }); }}
        >
          {showForm ? 'Annuler' : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Ajouter un congé
            </>
          )}
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 border-2 border-brand-200 animate-slide-up bg-gradient-to-br from-white to-brand-50/30">
          <h2 className="text-lg font-semibold text-surface-900 mb-4">Nouvelle période d'absence</h2>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-surface-700">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="input-base"
              >
                {typeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                type="date"
                label="Date de début"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
              <Input
                type="date"
                label="Date de fin"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </div>
            <Input
              placeholder="Motif (optionnel)"
              label="Motif"
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
            />
            <Button variant="primary" className="w-full" onClick={create}>
              Enregistrer
            </Button>
          </div>
        </Card>
      )}

      {timeOffs.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-8 h-8 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
          title="Aucun congé enregistré"
          description="Ajoutez vos périodes d'absence pour que vos clients ne puissent pas réserver."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {timeOffs.map((t) => (
            <Card key={t.id} className="p-5 card-hover animate-fade-in-up" hover>
              <div className="flex items-start justify-between mb-3">
                <Badge variant={typeStyles[t.type] || 'default'}>
                  {typeLabels[t.type] || t.type}
                </Badge>
                <Button size="sm" variant="danger" onClick={() => cancel(t.id)}>
                  Annuler
                </Button>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-surface-900">
                <svg className="w-4 h-4 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatDate(t.startDate)} — {formatDate(t.endDate)}
              </div>
              {t.reason && (
                <p className="text-sm text-surface-500 mt-2 pl-6">{t.reason}</p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
