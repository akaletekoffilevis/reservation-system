import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Button, Card, Input } from '../components/ui/Elements';
import { PageLoader } from '../components/ui/Loading';
import { useToast } from '../hooks/useToast';

export default function ProfessionalPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [pro, setPro] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [form, setForm] = useState({ clientName: '', clientEmail: '', clientPhone: '' });
  const [booking, setBooking] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '', appointmentId: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const toast = useToast();

  useEffect(() => {
    api.get(`/professionals/${slug}`).then(({ data }) => setPro(data));
    api.get(`/catalogue/professionals/${slug}/reviews`).then(({ data }) => setReviews(data)).catch(() => {});
  }, [slug]);

  const selectService = (service) => {
    setSelectedService(service);
    setStep(2);
    api.get(`/professionals/${pro.id}/availability`).then(({ data }) => {
      const slots = [];
      for (const slot of data.slots || []) {
        for (let d = 1; d <= 7; d++) {
          const date = new Date();
          date.setDate(date.getDate() + d);
          if (date.getDay() === slot.dayOfWeek) {
            slots.push({
              date: date.toISOString().split('T')[0],
              startTime: slot.startTime,
              endTime: slot.endTime,
            });
          }
        }
      }
      setAvailableSlots(slots);
    });
  };

  const book = async () => {
    if (!selectedService || !selectedSlot || !form.clientName || !form.clientEmail) return;
    setBooking(true);
    try {
      const start = new Date(`${selectedSlot.date}T${selectedSlot.startTime}`);
      const end = new Date(start.getTime() + selectedService.durationMinutes * 60000);
      const { data } = await api.post('/appointments', {
        professionalId: pro.id, serviceId: selectedService.id,
        clientName: form.clientName, clientEmail: form.clientEmail,
        clientPhone: form.clientPhone, startUtc: start.toISOString(), endUtc: end.toISOString(),
      });
      navigate(`/booking-success/${data.token}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur de réservation');
    } finally {
      setBooking(false);
    }
  };

  const submitReview = async () => {
    if (!reviewForm.comment.trim()) { toast.error('Veuillez écrire un commentaire.'); return; }
    setSubmittingReview(true);
    try {
      const { data } = await api.post('/catalogue/reviews', {
        professionalId: pro.id,
        rating: reviewForm.rating, comment: reviewForm.comment,
        clientName: form.clientName || 'Anonyme',
        clientEmail: form.clientEmail || undefined,
      });
      setReviewSubmitted(true);
      setReviews([data, ...reviews]);
      toast.success('Avis envoyé ! En attente de modération.');
    } catch (err) {
      toast.error('Erreur lors de l\'envoi de l\'avis');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (!pro) return <PageLoader />;

  const averageRating = reviews.length > 0 ? Math.round(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <Card className="p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{pro.businessName}</h1>
            {pro.city && <p className="text-gray-500 mt-1">{pro.city}</p>}
            {pro.description && <p className="text-gray-700 mt-3">{pro.description}</p>}
          </div>
          <Button variant="secondary" onClick={() => navigate(`/chat?pro=${pro.id}&name=${form.clientName}&email=${form.clientEmail}`)}>
            Contacter
          </Button>
        </div>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2 mt-3">
            <div className="flex text-amber-400">
              {Array.from({ length: 5 }, (_, i) => <span key={i}>{i < averageRating ? '★' : '☆'}</span>)}
            </div>
            <span className="text-sm text-gray-500">({reviews.length} avis)</span>
          </div>
        )}
      </Card>

      <Card className="overflow-hidden mb-6">
        <div className="flex border-b">
          {['Service', 'Créneau', 'Infos'].map((s, i) => (
            <div key={s} className={`flex-1 p-3 text-center text-sm font-medium ${step === i + 1 ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' : 'text-gray-400'}`}>
              {s}
            </div>
          ))}
        </div>

        <div className="p-6">
          {step === 1 && (
            <div className="space-y-3">
              {(pro.services || []).filter(s => s.isActive).map(service => (
                <button key={service.id} onClick={() => selectService(service)}
                  className={`w-full text-left p-4 rounded-xl border transition ${selectedService?.id === service.id ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300'}`}>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{service.name}</span>
                    <span className="text-blue-600 font-semibold">{service.price}€</span>
                  </div>
                  <span className="text-sm text-gray-500">{service.durationMinutes} min</span>
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div>
              <p className="text-sm text-gray-500 mb-4">{selectedService?.name} — Sélectionnez un créneau</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                {availableSlots.map((slot, i) => (
                  <button key={i} onClick={() => setSelectedSlot(slot)}
                    className={`p-3 rounded-xl border text-sm transition ${selectedSlot === slot ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300'}`}>
                    {new Date(slot.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                    <br />
                    {slot.startTime.substring(0, 5)}
                  </button>
                ))}
              </div>
              {selectedSlot && (
                <Button variant="primary" className="w-full mt-4" onClick={() => setStep(3)}>
                  Continuer
                </Button>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-xl text-sm">
                <p><strong>Service :</strong> {selectedService?.name}</p>
                <p><strong>Créneau :</strong> {selectedSlot && new Date(selectedSlot.date).toLocaleDateString('fr-FR')} à {selectedSlot?.startTime?.substring(0, 5)}</p>
              </div>
              <Input placeholder="Nom *" value={form.clientName} onChange={e => setForm({ ...form, clientName: e.target.value })} />
              <Input placeholder="Email *" type="email" value={form.clientEmail} onChange={e => setForm({ ...form, clientEmail: e.target.value })} />
              <Input placeholder="Téléphone" type="tel" value={form.clientPhone} onChange={e => setForm({ ...form, clientPhone: e.target.value })} />
              <Button variant="primary" className="w-full" onClick={book} loading={booking}>
                {booking ? 'Réservation...' : 'Confirmer la réservation'}
              </Button>
            </div>
          )}
        </div>
      </Card>

      {reviews.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-bold mb-4">Avis clients ({reviews.length})</h2>
          <div className="space-y-4">
            {reviews.map(review => (
              <div key={review.id} className="border-b pb-4 last:border-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{review.clientName}</span>
                  {review.isVerified && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Vérifié</span>}
                </div>
                <div className="flex text-amber-400 text-sm mb-1">
                  {Array.from({ length: 5 }, (_, i) => <span key={i}>{i < review.rating ? '★' : '☆'}</span>)}
                </div>
                {review.comment && <p className="text-sm text-gray-700">{review.comment}</p>}
              </div>
            ))}
          </div>
        </Card>
      )}
      {!reviewSubmitted && (
        <Card className="p-6">
          <h2 className="text-lg font-bold mb-4">Laisser un avis</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600 mb-2">Note</p>
              <div className="flex gap-1 text-2xl">
                {[1,2,3,4,5].map(r => (
                  <button key={r} onClick={() => setReviewForm({...reviewForm, rating: r})}
                    className={`transition ${r <= reviewForm.rating ? 'text-amber-400' : 'text-gray-300'} hover:text-amber-400`}>
                    ★
                  </button>
                ))}
              </div>
            </div>
            <textarea className="w-full border rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-brand-500"
              rows={3} placeholder="Partagez votre expérience..." value={reviewForm.comment}
              onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})} />
            <Button variant="primary" onClick={submitReview} loading={submittingReview}>
              Envoyer mon avis
            </Button>
          </div>
        </Card>
      )}
      {reviewSubmitted && (
        <Card className="p-6 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-green-700 font-medium">Merci ! Votre avis a été soumis et sera visible après modération.</p>
        </Card>
      )}
      {toast.message && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg animate-slide-up ${
          toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-green-50 border-green-200 text-green-800'
        }`}>
          <span className="text-sm font-medium">{toast.message}</span>
          <button onClick={toast.clear} className="text-current opacity-60 hover:opacity-100">&times;</button>
        </div>
      )}
    </div>
  );
}
