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

export default function TimeOffPage() {
  const [timeOffs, setTimeOffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: 'Vacation', startDate: '', endDate: '', reason: '' });

  const fetchTimeOffs = async () => {
    try {
      const { data } = await api.get('/pro/timeoffs');
      setTimeOffs(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchTimeOffs(); }, []);

  const create = async () => {
    if (!form.startDate || !form.endDate) return;
    await api.post('/pro/timeoffs', form);
    await fetchTimeOffs();
    setShowForm(false);
    setForm({ type: 'Vacation', startDate: '', endDate: '', reason: '' });
  };

  const cancel = async (id) => {
    await api.delete(`/pro/timeoffs/${id}`);
    setTimeOffs(timeOffs.filter(t => t.id !== id));
  };

  if (loading) return <PageLoader />;

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Congés & Absences</h2>
        <Button variant={showForm ? 'secondary' : 'primary'} onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Annuler' : 'Ajouter un congé'}
        </Button>
      </div>

      {showForm && (
        <Card className="p-4 mb-6 space-y-3">
          <select className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
            value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
            {Object.entries(typeLabels).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <div className="flex gap-3">
            <Input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} className="flex-1" />
            <Input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} className="flex-1" />
          </div>
          <Input placeholder="Motif (optionnel)" value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} />
          <Button variant="primary" className="w-full" onClick={create}>Enregistrer</Button>
        </Card>
      )}

      {timeOffs.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
          title="Aucun congé enregistré"
          description="Ajoutez vos périodes d'absence pour que vos clients ne puissent pas réserver."
        />
      ) : (
        <div className="space-y-2">
          {timeOffs.map(t => (
            <Card key={t.id} className="p-4 flex justify-between items-center">
              <div>
                <Badge variant={typeStyles[t.type] || 'default'}>{typeLabels[t.type] || t.type}</Badge>
                <span className="ml-2 text-sm font-medium">
                  {new Date(t.startDate).toLocaleDateString('fr-FR')} → {new Date(t.endDate).toLocaleDateString('fr-FR')}
                </span>
                {t.reason && <p className="text-xs text-gray-500 mt-1">{t.reason}</p>}
              </div>
              <Button variant="danger" size="sm" onClick={() => cancel(t.id)}>Annuler</Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
