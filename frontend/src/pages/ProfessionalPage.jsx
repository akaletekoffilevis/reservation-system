import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Button, Card, Input, Badge } from '../components/ui/Elements';
import { PageLoader } from '../components/ui/Loading';
import { useToast } from '../hooks/useToast';

function StarRating({ value, onChange, size = 'md' }) {
  const sizeClass = size === 'lg' ? 'text-2xl' : 'text-sm';
  return (
    <div className={`flex gap-1 ${sizeClass}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          className={`transition-colors ${
            star <= value ? 'text-amber-400' : 'text-gray-300'
          } ${onChange ? 'hover:text-amber-400 cursor-pointer' : 'cursor-default'}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function StepIndicator({ currentStep, steps }) {
  return (
    <div className="flex items-center gap-2 px-6 pt-6 pb-2">
      {steps.map((label, i) => {
        const stepNum = i + 1;
        const isActive = currentStep === stepNum;
        const isDone = currentStep > stepNum;
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-all duration-300 ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-md'
                    : isDone
                    ? 'bg-brand-100 text-brand-700'
                    : 'bg-surface-100 text-surface-400'
                }`}
              >
                {isDone ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  stepNum
                )}
              </div>
              <span
                className={`hidden sm:inline text-sm font-medium ${
                  isActive ? 'text-brand-700' : isDone ? 'text-surface-600' : 'text-surface-400'
                }`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-3 rounded-full ${
                  isDone ? 'bg-brand-400' : 'bg-surface-200'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function generateSlots(availability, days = 7) {
  const slots = [];
  const today = new Date();
  for (let d = 1; d <= days; d++) {
    const date = new Date(today);
    date.setDate(date.getDate() + d);
    const dayOfWeek = date.getDay();
    const daySlots = (availability || []).filter((s) => s.dayOfWeek === dayOfWeek);
    for (const slot of daySlots) {
      slots.push({
        date: date.toISOString().split('T')[0],
        dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
      });
    }
  }
  return slots;
}

function formatDateShort(dateStr) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

function formatTime(timeStr) {
  return timeStr ? timeStr.substring(0, 5) : '';
}

export default function ProfessionalPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [pro, setPro] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [fetchingSlots, setFetchingSlots] = useState(false);

  const [form, setForm] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
  });
  const [booking, setBooking] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: '',
    clientName: '',
    clientEmail: '',
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/professionals/${slug}`),
      api.get(`/catalogue/professionals/${slug}/reviews`).catch(() => ({ data: [] })),
    ])
      .then(([proRes, reviewsRes]) => {
        setPro(proRes.data);
        setReviews(reviewsRes.data);
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || 'Erreur lors du chargement');
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const selectService = async (service) => {
    setSelectedService(service);
    setSelectedSlot(null);
    setStep(2);
    if (!pro?.id) return;
    setFetchingSlots(true);
    try {
      const { data } = await api.get(`/professionals/${pro.id}/availability`);
      setAvailableSlots(generateSlots(data.slots || []));
    } catch {
      toast.error('Impossible de charger les disponibilités');
    } finally {
      setFetchingSlots(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!form.clientName.trim()) errors.clientName = 'Le nom est requis';
    if (!form.clientEmail.trim()) errors.clientEmail = "L'email est requis";
    else if (!/\S+@\S+\.\S+/.test(form.clientEmail)) errors.clientEmail = 'Email invalide';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const book = async () => {
    if (!validateForm()) return;
    if (!selectedService || !selectedSlot) return;
    setBooking(true);
    try {
      const start = new Date(`${selectedSlot.date}T${selectedSlot.startTime}`);
      const end = new Date(start.getTime() + selectedService.durationMinutes * 60000);
      const { data } = await api.post('/appointments', {
        professionalId: pro.id,
        serviceId: selectedService.id,
        clientName: form.clientName.trim(),
        clientEmail: form.clientEmail.trim(),
        clientPhone: form.clientPhone.trim() || undefined,
        startUtc: start.toISOString(),
        endUtc: end.toISOString(),
      });
      navigate(`/booking-success/${data.token}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur de réservation');
    } finally {
      setBooking(false);
    }
  };

  const submitReview = async () => {
    if (!reviewForm.comment.trim()) {
      toast.error('Veuillez écrire un commentaire.');
      return;
    }
    setSubmittingReview(true);
    try {
      const { data } = await api.post('/catalogue/reviews', {
        professionalId: pro.id,
        rating: reviewForm.rating,
        comment: reviewForm.comment.trim(),
        clientName: reviewForm.clientName.trim() || 'Anonyme',
        clientEmail: reviewForm.clientEmail.trim() || undefined,
      });
      setReviewSubmitted(true);
      setReviews((prev) => [data, ...prev]);
      toast.success('Avis envoyé ! En attente de modération.');
    } catch (err) {
      toast.error("Erreur lors de l'envoi de l'avis");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleContact = () => {
    navigate(
      `/chat?proId=${pro.id}&name=${encodeURIComponent(form.clientName || '')}&email=${encodeURIComponent(form.clientEmail || '')}`
    );
  };

  if (loading) return <PageLoader />;
  if (!pro) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-surface-500 text-lg">Professionnel introuvable.</p>
      </div>
    );
  }

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;
  const activeServices = (pro.services || []).filter((s) => s.isActive);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in space-y-6">
      {/* Professional Info Card */}
      <Card className="p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl lg:text-3xl font-bold text-surface-900 truncate">
                {pro.businessName}
              </h1>
              <Badge variant="primary">Pro</Badge>
            </div>
            {pro.city && (
              <p className="text-surface-500 flex items-center gap-1.5 text-sm mb-3">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {pro.city}
              </p>
            )}
            {reviews.length > 0 && (
              <div className="flex items-center gap-3 mb-3">
                <StarRating value={Math.round(averageRating)} />
                <span className="text-sm text-surface-500 font-medium">
                  {averageRating.toFixed(1)} ({reviews.length} avis)
                </span>
              </div>
            )}
            {pro.description && (
              <p className="text-surface-600 leading-relaxed text-sm lg:text-base">
                {pro.description}
              </p>
            )}
          </div>
          <Button
            variant="secondary"
            size="lg"
            onClick={handleContact}
            className="shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            Contacter
          </Button>
        </div>
      </Card>

      {/* Booking Wizard */}
      {activeServices.length > 0 && (
        <Card className="overflow-hidden">
          <StepIndicator currentStep={step} steps={['Service', 'Créneau', 'Infos']} />

          <div className="p-6 lg:p-8">
            {/* Step 1 — Service */}
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-surface-900">
                  Choisissez un service
                </h2>
                <div className="grid gap-3">
                  {activeServices.map((service) => (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => selectService(service)}
                      className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 ${
                        selectedService?.id === service.id
                          ? 'border-brand-500 bg-brand-50 shadow-sm'
                          : 'border-surface-200 hover:border-surface-300 hover:shadow-sm bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-semibold text-surface-900">
                          {service.name}
                        </span>
                        <span className="text-brand-600 font-bold text-lg">
                          {service.price}€
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-surface-500">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {service.durationMinutes} min
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2 — Créneau */}
            {step === 2 && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-lg font-semibold text-surface-900">
                      Sélectionnez un créneau
                    </h2>
                    <p className="text-sm text-surface-500 mt-0.5">
                      Pour{' '}
                      <span className="font-medium text-surface-700">
                        {selectedService?.name}
                      </span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-sm text-brand-600 hover:text-brand-700 font-medium"
                  >
                    Modifier
                  </button>
                </div>

                {fetchingSlots ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-surface-200 border-t-brand-600" />
                  </div>
                ) : availableSlots.length === 0 ? (
                  <p className="text-center py-12 text-surface-500">
                    Aucun créneau disponible cette semaine.
                  </p>
                ) : (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-h-72 overflow-y-auto pr-1">
                      {availableSlots.map((slot, i) => {
                        const isSelected = selectedSlot === slot;
                        return (
                          <button
                            key={`${slot.date}-${slot.startTime}-${i}`}
                            type="button"
                            onClick={() => setSelectedSlot(slot)}
                            className={`p-4 rounded-2xl border-2 text-center transition-all duration-200 ${
                              isSelected
                                ? 'border-brand-500 bg-brand-50 shadow-sm'
                                : 'border-surface-200 hover:border-surface-300 bg-white hover:shadow-sm'
                            }`}
                          >
                            <p
                              className={`text-sm font-semibold ${
                                isSelected ? 'text-brand-700' : 'text-surface-700'
                              }`}
                            >
                              {formatDateShort(slot.date)}
                            </p>
                            <p
                              className={`text-lg font-bold mt-1 ${
                                isSelected ? 'text-brand-600' : 'text-surface-900'
                              }`}
                            >
                              {formatTime(slot.startTime)}
                            </p>
                          </button>
                        );
                      })}
                    </div>

                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full mt-6"
                      disabled={!selectedSlot}
                      onClick={() => setStep(3)}
                    >
                      Continuer
                    </Button>
                  </>
                )}
              </div>
            )}

            {/* Step 3 — Infos */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-surface-900">
                    Vos informations
                  </h2>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-sm text-brand-600 hover:text-brand-700 font-medium"
                  >
                    Modifier
                  </button>
                </div>

                {/* Summary */}
                <div className="bg-brand-50 rounded-2xl p-5 space-y-2 border border-brand-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-surface-600">Service</span>
                    <span className="font-semibold text-surface-900">
                      {selectedService?.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-surface-600">Durée</span>
                    <span className="font-medium text-surface-700">
                      {selectedService?.durationMinutes} min
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-surface-600">Prix</span>
                    <span className="font-bold text-brand-600">
                      {selectedService?.price}€
                    </span>
                  </div>
                  <div className="border-t border-brand-200 pt-2 mt-2 flex items-center justify-between">
                    <span className="text-sm text-surface-600">Créneau</span>
                    <span className="font-semibold text-surface-900">
                      {selectedSlot &&
                        `${formatDateShort(selectedSlot.date)} à ${formatTime(
                          selectedSlot.startTime
                        )}`}
                    </span>
                  </div>
                </div>

                {/* Form */}
                <div className="space-y-4">
                  <Input
                    label="Nom *"
                    placeholder="Votre nom"
                    value={form.clientName}
                    onChange={(e) => {
                      setForm({ ...form, clientName: e.target.value });
                      if (formErrors.clientName)
                        setFormErrors({ ...formErrors, clientName: undefined });
                    }}
                    error={formErrors.clientName}
                  />
                  <Input
                    label="Email *"
                    type="email"
                    placeholder="vous@exemple.fr"
                    value={form.clientEmail}
                    onChange={(e) => {
                      setForm({ ...form, clientEmail: e.target.value });
                      if (formErrors.clientEmail)
                        setFormErrors({ ...formErrors, clientEmail: undefined });
                    }}
                    error={formErrors.clientEmail}
                  />
                  <Input
                    label="Téléphone"
                    type="tel"
                    placeholder="+33 6 12 34 56 78"
                    value={form.clientPhone}
                    onChange={(e) => setForm({ ...form, clientPhone: e.target.value })}
                  />
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={book}
                  loading={booking}
                >
                  {booking ? 'Réservation en cours...' : 'Confirmer la réservation'}
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Reviews */}
      {reviews.length > 0 && (
        <Card className="p-6 lg:p-8">
          <h2 className="text-lg font-bold text-surface-900 mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Avis clients ({reviews.length})
          </h2>
          <div className="space-y-5">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="border-b border-surface-100 pb-5 last:border-0 last:pb-0"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold text-sm">
                      {(review.clientName || 'A')[0].toUpperCase()}
                    </div>
                    <span className="font-medium text-surface-900 text-sm">
                      {review.clientName}
                    </span>
                    {review.isVerified && (
                      <Badge variant="success">Vérifié</Badge>
                    )}
                  </div>
                  {review.createdAt && (
                    <span className="text-xs text-surface-400">
                      {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  )}
                </div>
                <StarRating value={review.rating} />
                {review.comment && (
                  <p className="text-sm text-surface-600 mt-2 leading-relaxed">
                    {review.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Leave a Review */}
      {!reviewSubmitted ? (
        <Card className="p-6 lg:p-8">
          <h2 className="text-lg font-bold text-surface-900 mb-6">
            Laisser un avis
          </h2>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-2">
                Note
              </label>
              <StarRating
                value={reviewForm.rating}
                onChange={(r) => setReviewForm({ ...reviewForm, rating: r })}
                size="lg"
              />
            </div>
            <div className="space-y-2">
              <Input
                label="Votre nom"
                placeholder="Nom (affiché publiquement)"
                value={reviewForm.clientName}
                onChange={(e) =>
                  setReviewForm({ ...reviewForm, clientName: e.target.value })
                }
              />
              <Input
                label="Votre email"
                type="email"
                placeholder="Email (non affiché)"
                value={reviewForm.clientEmail}
                onChange={(e) =>
                  setReviewForm({ ...reviewForm, clientEmail: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-2">
                Commentaire
              </label>
              <textarea
                className="input-base min-h-[100px] resize-y"
                rows={4}
                placeholder="Partagez votre expérience..."
                value={reviewForm.comment}
                onChange={(e) =>
                  setReviewForm({ ...reviewForm, comment: e.target.value })
                }
              />
            </div>
            <Button
              variant="primary"
              size="lg"
              className="w-full sm:w-auto"
              onClick={submitReview}
              loading={submittingReview}
            >
              Envoyer mon avis
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="p-8 lg:p-10 text-center">
          <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-7 h-7 text-emerald-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-surface-900 mb-1">
            Merci pour votre avis !
          </h3>
          <p className="text-surface-500 text-sm">
            Votre avis a été soumis et sera visible après modération.
          </p>
        </Card>
      )}

      {/* Toast */}
      {toast.message && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-3 rounded-xl border shadow-lg animate-slide-down ${
            toast.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}
        >
          <span className="text-sm font-medium">{toast.message}</span>
          <button
            onClick={toast.clear}
            className="ml-2 text-current opacity-60 hover:opacity-100 text-lg leading-none"
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );
}
