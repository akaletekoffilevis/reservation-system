import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card, Button, Badge } from '../../components/ui/Elements';
import { PageLoader } from '../../components/ui/Loading';

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

export default function AvailabilityPage() {
  const [slots, setSlots] = useState([]);
  const [overrides, setOverrides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slotForm, setSlotForm] = useState({ dayOfWeek: 0, startTime: '09:00', endTime: '17:00' });
  const [overrideForm, setOverrideForm] = useState({ date: '', startTime: '09:00', endTime: '17:00', reason: '' });
  const [showOverrideForm, setShowOverrideForm] = useState(false);

  const load = async () => {
    const { data } = await api.get('/pro/availability');
    setSlots(data.slots || []);
    setOverrides(data.overrides || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const addSlot = async () => {
    const newSlots = [...slots, { ...slotForm, isActive: true }];
    await api.put('/pro/availability', newSlots);
    load();
  };

  const removeSlot = async (i) => {
    const newSlots = slots.filter((_, idx) => idx !== i);
    await api.put('/pro/availability', newSlots);
    load();
  };

  const addOverride = async () => {
    await api.post('/pro/availability/overrides', overrideForm);
    setOverrideForm({ date: '', startTime: '09:00', endTime: '17:00', reason: '' });
    setShowOverrideForm(false);
    load();
  };

  const deleteOverride = async (id) => {
    await api.delete(`/pro/availability/overrides/${id}`);
    load();
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Disponibilités</h1>
        <p className="text-gray-500 mt-1">Définissez vos horaires d'ouverture et vos exceptions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weekly schedule */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Horaires hebdomadaires</h2>

          {slots.length === 0 && (
            <div className="p-6 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300 mb-4">
              <p className="text-sm text-gray-500">Aucun horaire défini</p>
              <p className="text-xs text-gray-400 mt-1">Ajoutez vos créneaux ci-dessous</p>
            </div>
          )}

          <div className="space-y-2 mb-6">
            {slots.map((s, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="font-medium text-gray-900">{DAYS[s.dayOfWeek]}</span>
                  <span className="text-sm text-gray-500">{s.startTime} — {s.endTime}</span>
                </div>
                <button onClick={() => removeSlot(i)} className="text-red-500 hover:text-red-700 text-sm font-medium">
                  Supprimer
                </button>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-4">
            <p className="text-sm font-medium text-gray-700 mb-3">Ajouter un créneau</p>
            <div className="flex flex-wrap gap-3">
              <select value={slotForm.dayOfWeek}
                onChange={(e) => setSlotForm({ ...slotForm, dayOfWeek: +e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
              </select>
              <input type="time" value={slotForm.startTime}
                onChange={(e) => setSlotForm({ ...slotForm, startTime: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              <input type="time" value={slotForm.endTime}
                onChange={(e) => setSlotForm({ ...slotForm, endTime: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              <Button size="sm" onClick={addSlot}>Ajouter</Button>
            </div>
          </div>
        </Card>

        {/* Overrides */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Exceptions</h2>
            <Button size="sm" variant="secondary" onClick={() => setShowOverrideForm(!showOverrideForm)}>
              {showOverrideForm ? 'Annuler' : 'Bloquer un créneau'}
            </Button>
          </div>

          {showOverrideForm && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mb-4 space-y-3 animate-slide-up">
              <input type="date" value={overrideForm.date}
                onChange={(e) => setOverrideForm({ ...overrideForm, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              <div className="flex gap-3">
                <input type="time" value={overrideForm.startTime}
                  onChange={(e) => setOverrideForm({ ...overrideForm, startTime: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                <input type="time" value={overrideForm.endTime}
                  onChange={(e) => setOverrideForm({ ...overrideForm, endTime: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              <input type="text" placeholder="Raison (ex: Congés, Pause déjeuner...)" value={overrideForm.reason}
                onChange={(e) => setOverrideForm({ ...overrideForm, reason: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              <Button size="sm" variant="danger" onClick={addOverride} className="w-full">
                Bloquer ce créneau
              </Button>
            </div>
          )}

          {overrides.length === 0 ? (
            <div className="p-6 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <p className="text-sm text-gray-500">Aucune exception</p>
              <p className="text-xs text-gray-400 mt-1">Bloquez des créneaux pour les congés ou pauses</p>
            </div>
          ) : (
            <div className="space-y-2">
              {overrides.map((o) => (
                <div key={o.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {new Date(o.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </p>
                    <p className="text-sm text-gray-500">{o.startTime} — {o.endTime}{o.reason ? ` · ${o.reason}` : ''}</p>
                  </div>
                  <button onClick={() => deleteOverride(o.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">
                    Supprimer
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
