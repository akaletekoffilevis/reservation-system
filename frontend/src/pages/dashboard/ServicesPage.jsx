import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card, Button, Input, Badge, EmptyState } from '../../components/ui/Elements';
import { PageLoader } from '../../components/ui/Loading';

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', description: '', durationMinutes: 60, price: 0 });
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await api.get('/pro/services');
    setServices(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) await api.put(`/pro/services/${editing}`, form);
      else await api.post('/pro/services', form);
      setShowForm(false);
      setEditing(null);
      setForm({ name: '', description: '', durationMinutes: 60, price: 0 });
      load();
    } finally { setSaving(false); }
  };

  const handleEdit = (s) => {
    setForm({ name: s.name, description: s.description || '', durationMinutes: s.durationMinutes, price: s.price });
    setEditing(s.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce service ?')) return;
    await api.delete(`/pro/services/${id}`);
    load();
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <p className="text-gray-500 mt-1">Gérez les services que vous proposez</p>
        </div>
        {!showForm && (
          <Button onClick={() => { setShowForm(true); setEditing(null); setForm({ name: '', description: '', durationMinutes: 60, price: 0 }); }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Nouveau service
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="p-6 border-2 border-brand-200 animate-slide-up">
          <h2 className="text-lg font-semibold mb-4">{editing ? 'Modifier le service' : 'Nouveau service'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Nom du service" placeholder="Coupe homme, Massage..." required
                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Durée (min)" type="number" min={5} required
                  value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: +e.target.value })} />
                <Input label="Prix (€)" type="number" min={0} step="0.01" required
                  value={form.price} onChange={(e) => setForm({ ...form, price: +e.target.value })} />
              </div>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea placeholder="Description du service..." value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500" rows={2} />
            </div>
            <div className="flex gap-3">
              <Button type="submit" loading={saving}>{editing ? 'Enregistrer' : 'Ajouter'}</Button>
              <Button variant="secondary" onClick={() => { setShowForm(false); setEditing(null); }}>Annuler</Button>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((s) => (
            <Card key={s.id} className="p-5">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-gray-900">{s.name}</h3>
                <span className="text-lg font-bold text-brand-600">{s.price}€</span>
              </div>
              {s.description && <p className="text-sm text-gray-500 mb-3">{s.description}</p>}
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {s.durationMinutes} min
              </div>
              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <Button size="sm" variant="secondary" onClick={() => handleEdit(s)}>Modifier</Button>
                <Button size="sm" variant="danger" onClick={() => handleDelete(s.id)}>Supprimer</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
