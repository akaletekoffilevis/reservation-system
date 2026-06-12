import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card, Button } from '../../components/ui/Elements';
import { PageLoader } from '../../components/ui/Loading';

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

const emptySlotForm = { dayOfWeek: 0, startTime: '09:00', endTime: '17:00' };
const emptyOverrideForm = { date: '', startTime: '09:00', endTime: '17:00', reason: '' };

export default function AvailabilityPage() {
  const [slots, setSlots] = useState([]);
  const [overrides, setOverrides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slotForm, setSlotForm] = useState({ ...emptySlotForm });
  const [overrideForm, setOverrideForm] = useState({ ...emptyOverrideForm });
  const [showOverrideForm, setShowOverrideForm] = useState(false);

  const load = () => {
    api.get('/pro/availability')
      .then(({ data }) => {
        setSlots(data.slots || []);
        setOverrides(data.overrides || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
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
    if (!overrideForm.date) return;
    await api.post('/pro/availability/overrides', overrideForm);
    setOverrideForm({ ...emptyOverrideForm });
    setShowOverrideForm(false);
    load();
  };

  const deleteOverride = async (id) => {
    await api.delete(`/pro/availability/overrides/${id}`);
    load();
  };

  const formatOverrideDate = (d) =>
    new Date(d).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Disponibilités</h1>
        <p className="text-surface-500 mt-1">Définissez vos horaires d'ouverture et vos exceptions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-surface-900 mb-5">
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Horaires hebdomadaires
            </span>
          </h2>

          {slots.length === 0 ? (
            <div className="p-8 text-center bg-surface-50 rounded-xl border-2 border-dashed border-surface-200 mb-6">
              <div className="mb-3 flex justify-center">
                <div className="w-10 h-10 rounded-full bg-surface-200 flex items-center justify-center">
                  <svg className="w-5 h-5 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
              </div>
              <p className="text-sm font-medium text-surface-600">Aucun horaire défini</p>
              <p className="text-xs text-surface-400 mt-1">Ajoutez vos créneaux ci-dessous</p>
            </div>
          ) : (
            <div className="space-y-2 mb-6">
              {slots.map((s, i) => (
                <div
                  key={i}
                  className="group flex items-center justify-between p-3.5 bg-surface-50 rounded-xl hover:bg-surface-100 transition-colors duration-150"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200" />
                    <span className="font-medium text-surface-900 text-sm">{DAYS[s.dayOfWeek]}</span>
                    <span className="text-sm text-surface-500">{s.startTime} — {s.endTime}</span>
                  </div>
                  <button
                    onClick={() => removeSlot(i)}
                    className="text-surface-400 hover:text-red-500 transition-colors text-sm font-medium opacity-0 group-hover:opacity-100"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-surface-200 pt-5">
            <p className="text-sm font-semibold text-surface-700 mb-3">Ajouter un créneau</p>
            <div className="flex flex-wrap gap-3">
              <select
                value={slotForm.dayOfWeek}
                onChange={(e) => setSlotForm({ ...slotForm, dayOfWeek: +e.target.value })}
                className="input-base w-auto min-w-[130px]"
              >
                {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
              </select>
              <input
                type="time"
                value={slotForm.startTime}
                onChange={(e) => setSlotForm({ ...slotForm, startTime: e.target.value })}
                className="input-base w-auto"
              />
              <input
                type="time"
                value={slotForm.endTime}
                onChange={(e) => setSlotForm({ ...slotForm, endTime: e.target.value })}
                className="input-base w-auto"
              />
              <Button size="sm" onClick={addSlot}>Ajouter</Button>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-surface-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Exceptions
            </h2>
            <Button size="sm" variant="secondary" onClick={() => setShowOverrideForm(!showOverrideForm)}>
              {showOverrideForm ? 'Annuler' : 'Bloquer un créneau'}
            </Button>
          </div>

          {showOverrideForm && (
            <div className="p-5 bg-amber-50 rounded-xl border border-amber-200 mb-5 space-y-3 animate-slide-up">
              <input
                type="date"
                value={overrideForm.date}
                onChange={(e) => setOverrideForm({ ...overrideForm, date: e.target.value })}
                className="input-base"
              />
              <div className="flex gap-3">
                <input
                  type="time"
                  value={overrideForm.startTime}
                  onChange={(e) => setOverrideForm({ ...overrideForm, startTime: e.target.value })}
                  className="input-base flex-1"
                />
                <input
                  type="time"
                  value={overrideForm.endTime}
                  onChange={(e) => setOverrideForm({ ...overrideForm, endTime: e.target.value })}
                  className="input-base flex-1"
                />
              </div>
              <input
                type="text"
                placeholder="Raison (ex: Congés, Pause déjeuner...)"
                value={overrideForm.reason}
                onChange={(e) => setOverrideForm({ ...overrideForm, reason: e.target.value })}
                className="input-base"
              />
              <Button size="sm" variant="danger" onClick={addOverride} className="w-full">
                Bloquer ce créneau
              </Button>
            </div>
          )}

          {overrides.length === 0 ? (
            <div className="p-8 text-center bg-surface-50 rounded-xl border-2 border-dashed border-surface-200">
              <div className="mb-3 flex justify-center">
                <div className="w-10 h-10 rounded-full bg-surface-200 flex items-center justify-center">
                  <svg className="w-5 h-5 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                </div>
              </div>
              <p className="text-sm font-medium text-surface-600">Aucune exception</p>
              <p className="text-xs text-surface-400 mt-1">Bloquez des créneaux pour les congés ou pauses</p>
            </div>
          ) : (
            <div className="space-y-2">
              {overrides.map((o) => (
                <div
                  key={o.id}
                  className="group flex items-center justify-between p-3.5 bg-red-50 rounded-xl hover:bg-red-100 transition-colors duration-150"
                >
                  <div>
                    <p className="font-medium text-surface-900 text-sm">
                      {formatOverrideDate(o.date)}
                    </p>
                    <p className="text-sm text-surface-500">
                      {o.startTime} — {o.endTime}
                      {o.reason && <span className="text-surface-400"> · {o.reason}</span>}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteOverride(o.id)}
                    className="text-red-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
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
