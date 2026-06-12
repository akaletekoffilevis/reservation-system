import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card, Button, Input, EmptyState } from '../../components/ui/Elements';
import { PageLoader } from '../../components/ui/Loading';

const emptyForm = { name: '', description: '', durationMinutes: 60, price: 0 };

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ ...emptyForm });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = () => {
    api.get('/pro/services')
      .then(({ data }) => setServices(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setForm({ ...emptyForm });
    setEditingId(null);
    setShowForm(false);
  };

  const openNewForm = () => {
    resetForm();
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/pro/services/${editingId}`, form);
      } else {
        await api.post('/pro/services', form);
      }
      resetForm();
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (s) => {
    setForm({
      name: s.name,
      description: s.description || '',
      durationMinutes: s.durationMinutes,
      price: s.price,
    });
    setEditingId(s.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) return;
    await api.delete(`/pro/services/${id}`);
    load();
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Services</h1>
          <p className="text-surface-500 mt-1">Gérez les services que vous proposez</p>
        </div>
        {!showForm && (
          <Button onClick={openNewForm}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nouveau service
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="p-6 border-2 border-brand-200 animate-slide-up bg-gradient-to-br from-white to-brand-50/30">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-surface-900">
              {editingId ? 'Modifier le service' : 'Nouveau service'}
            </h2>
            <button onClick={resetForm} className="text-surface-400 hover:text-surface-600 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Nom du service"
              placeholder="Coupe homme, Massage..."
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Durée (minutes)"
                type="number"
                min={5}
                required
                value={form.durationMinutes}
                onChange={(e) => setForm({ ...form, durationMinutes: +e.target.value })}
              />
              <Input
                label="Prix (€)"
                type="number"
                min={0}
                step="0.01"
                required
                value={form.price}
                onChange={(e) => setForm({ ...form, price: +e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-surface-700">Description</label>
              <textarea
                placeholder="Description du service..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="input-base min-h-[80px] resize-none"
                rows={3}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" loading={saving}>
                {editingId ? 'Enregistrer' : 'Ajouter le service'}
              </Button>
              <Button variant="secondary" type="button" onClick={resetForm}>
                Annuler
              </Button>
            </div>
          </form>
        </Card>
      )}

      {services.length === 0 && !showForm ? (
        <EmptyState
          title="Aucun service"
          description="Ajoutez vos premiers services pour que les clients puissent réserver."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((s, i) => (
            <Card
              key={s.id}
              className="p-5 card-hover animate-fade-in-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-surface-900">{s.name}</h3>
                <span className="text-xl font-bold text-brand-600 tabular-nums">{s.price}€</span>
              </div>
              {s.description && (
                <p className="text-sm text-surface-500 mb-4 line-clamp-2">{s.description}</p>
              )}
              <div className="flex items-center gap-1.5 text-sm text-surface-400 mb-5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{s.durationMinutes} min</span>
              </div>
              <div className="flex gap-2 pt-4 border-t border-surface-100">
                <Button size="sm" variant="secondary" onClick={() => handleEdit(s)}>
                  Modifier
                </Button>
                <Button size="sm" variant="danger" onClick={() => handleDelete(s.id)}>
                  Supprimer
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
