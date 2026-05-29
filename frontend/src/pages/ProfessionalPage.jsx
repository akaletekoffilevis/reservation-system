import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Card, Button, Badge, Input } from '../components/ui/Elements';
import { PageLoader } from '../components/ui/Loading';

export default function ProfessionalPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [pro, setPro] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState('services'); // services -> slots -> form -> done
  const [selectedService, setSelectedService] = useState(null);
  const [date, setDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [form, setForm] = useState({ clientName: '', clientEmail: '', clientPhone: '', notes: '' });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/professionals/${slug}`)
      .then(({ data }) => setPro(data))
      .catch(() => navigate('/professionals'))
      .finally(() => setLoading(false));
  }, [slug, navigate]);

  const handleSelectService = (service) => {
    setSelectedService(service);
    setStep('slots');
    setDate('');
    setSelectedSlot(null);
    setAvailableSlots([]);
  };

  const loadSlots = async (d) => {
    if (!d || !selectedService) return;
    setDate(d);
    setSelectedSlot(null);
    setError('');

    try {
      const { data } = await api.get(`/professionals/${pro.id}/availability`);
      const dayOfWeek = new Date(d + 'T12:00:00').getDay();
      const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

      const daySlots = (data.slots || []).filter((s) => s.dayOfWeek === adjustedDay);
      const overrides = (data.overrides || []).filter(
        (o) => new Date(o.date).toISOString().split('T')[0] === d
      );

      const slots = [];
      for (const slot of daySlots) {
        const [sh, sm] = slot.startTime.split(':').map(Number);
        const [eh, em] = slot.endTime.split(':').map(Number);
        let start = sh * 60 + sm;
        const end = eh * 60 + em;
        const dur = selectedService.durationMinutes;

        while (start + dur <= end) {
          const h = Math.floor(start / 60);
          const m = start % 60;
          const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

          const isOverridden = overrides.some((o) => {
            const [oh, om] = o.startTime.split(':').map(Number);
            const [oeh, oem] = o.endTime.split(':').map(Number);
            const oStart = oh * 60 + om;
            const oEnd = oeh * 60 + oem;
            return start >= oStart && start < oEnd;
          });

          if (!isOverridden) slots.push(timeStr);
          start += dur;
        }
      }
      setAvailableSlots(slots);
    } catch {
      setError('Erreur lors du chargement des disponibilités');
    }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    if (!selectedService || !selectedSlot || !date) return;
    setBookingLoading(true);
    setError('');

    try {
      const startUtc = new Date(`${date}T${selectedSlot}:00`).toISOString();
      const { data } = await api.post('/appointments', {
        professionalId: pro.id,
        serviceId: selectedService.id,
        clientName: form.clientName,
        clientEmail: form.clientEmail,
        clientPhone: form.clientPhone,
        startUtc,
        notes: form.notes,
      });
      navigate(`/booking-confirmed?token=${data.token}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la réservation');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!pro) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start gap-6 mb-10">
        <div className="w-20 h-20 bg-brand-100 rounded-2xl flex items-center justify-center flex-shrink-0">
          <span className="text-3xl font-bold text-brand-600">{pro.businessName.charAt(0)}</span>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{pro.businessName}</h1>
          {pro.city && <p className="text-gray-500 flex items-center gap-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>{pro.city}</p>}
          {pro.description && <p className="text-gray-600 mt-2 max-w-2xl">{pro.description}</p>}
        </div>
      </div>

      {/* Progress steps */}
      <div className="flex items-center gap-2 mb-8 text-sm">
        {['services', 'slots', 'form'].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === s ? 'bg-brand-600 text-white' :
              ['services', 'slots', 'form'].indexOf(step) > i ? 'bg-green-100 text-green-700' :
              'bg-gray-100 text-gray-400'
            }`}>
              {['services', 'slots', 'form'].indexOf(step) > i ? '✓' : i + 1}
            </div>
            <span className={`hidden sm:inline ${step === s ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
              {s === 'services' ? 'Service' : s === 'slots' ? 'Créneau' : 'Infos'}
            </span>
            {i < 2 && <div className="w-8 h-px bg-gray-200" />}
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      {/* Step 1: Services */}
      {step === 'services' && (
        <div className="animate-slide-up">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Choisissez un service</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pro.services?.map((s) => (
              <Card key={s.id} className="p-5 cursor-pointer border-2 hover:border-brand-300 transition-all" onClick={() => handleSelectService(s)}>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900">{s.name}</h3>
                  <span className="text-lg font-bold text-brand-600">{s.price}€</span>
                </div>
                {s.description && <p className="text-sm text-gray-500 mb-3">{s.description}</p>}
                <div className="flex items-center gap-1 text-sm text-gray-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {s.durationMinutes} min
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Date & Time */}
      {step === 'slots' && (
        <div className="animate-slide-up">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Choisissez une date</h2>
          <p className="text-gray-500 mb-6">{selectedService?.name} — {selectedService?.durationMinutes}min</p>

          <input type="date" value={date}
            onChange={(e) => loadSlots(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full sm:w-auto px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />

          {date && availableSlots.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Créneaux disponibles</h3>
              <div className="flex flex-wrap gap-3">
                {availableSlots.map((t) => (
                  <button key={t} onClick={() => setSelectedSlot(t)}
                    className={`px-5 py-3 rounded-xl border font-medium transition-all ${
                      selectedSlot === t
                        ? 'bg-brand-600 text-white border-brand-600 shadow-md'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-brand-300 hover:shadow'
                    }`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {date && availableSlots.length === 0 && (
            <div className="mt-6 p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-500">Aucun créneau disponible pour cette date.</p>
              <p className="text-sm text-gray-400 mt-1">Essayez une autre date.</p>
            </div>
          )}

          <div className="flex gap-3 mt-8">
            <Button variant="secondary" onClick={() => { setStep('services'); setSelectedService(null); }}>
              Retour
            </Button>
            {selectedSlot && (
              <Button onClick={() => setStep('form')}>
                Continuer
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Client info */}
      {step === 'form' && (
        <div className="animate-slide-up max-w-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Vos informations</h2>
          <p className="text-gray-500 mb-6">
            {selectedService?.name} — {new Date(`${date}T${selectedSlot}`).toLocaleDateString('fr-FR', {
              weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
            })}
          </p>

          <form onSubmit={handleBook} className="space-y-4">
            <Input label="Nom" placeholder="Votre nom" required
              value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} />
            <Input label="Email" type="email" placeholder="vous@exemple.fr" required
              value={form.clientEmail} onChange={(e) => setForm({ ...form, clientEmail: e.target.value })} />
            <Input label="Téléphone" type="tel" placeholder="+33 6 12 34 56 78"
              value={form.clientPhone} onChange={(e) => setForm({ ...form, clientPhone: e.target.value })} />
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Notes (optionnel)</label>
              <textarea placeholder="Informations supplémentaires..."
                value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500" rows={3} />
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="secondary" onClick={() => setStep('slots')}>Retour</Button>
              <Button type="submit" loading={bookingLoading} className="flex-1">
                Confirmer la réservation
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
