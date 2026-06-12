import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Button, Card, EmptyState } from '../../components/ui/Elements';
import { PageLoader } from '../../components/ui/Loading';

function StarRating({ rating }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={`text-base ${i < rating ? 'text-amber-400' : 'text-surface-200'}`}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);

  useEffect(() => {
    api.get('/admin/reviews/pending').then(({ data }) => setReviews(data)).catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleAction = async (id, action) => {
    setActing(id);
    try {
      await api.post(`/admin/reviews/${id}/${action}`);
      setReviews(prev => prev.filter(r => r.id !== id));
    } catch {}
    setActing(null);
  };

  if (loading) return <PageLoader />;

  return (
    <div className="p-6 lg:p-8 animate-fade-in max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-surface-900">Modération des avis</h1>
        <p className="text-surface-500 mt-1">
          {reviews.length > 0
            ? `${reviews.length} avis en attente de modération`
            : 'Tous les avis ont été modérés'}
        </p>
      </div>

      {reviews.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-8 h-8 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          title="Aucun avis en attente"
          description="Tous les avis ont été modérés."
        />
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <Card key={review.id} className="p-5 hover:shadow-md transition-shadow duration-200">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-surface-900">{review.clientName}</span>
                    {review.professionalName && (
                      <>
                        <span className="text-surface-300">•</span>
                        <span className="text-sm text-surface-500">
                          sur <span className="font-medium text-surface-700">{review.professionalName}</span>
                        </span>
                      </>
                    )}
                  </div>
                  <StarRating rating={review.rating} />
                  {review.comment && (
                    <p className="text-surface-600 text-sm leading-relaxed">{review.comment}</p>
                  )}
                  <p className="text-xs text-surface-400">{formatDate(review.createdAt)}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    variant="primary"
                    size="sm"
                    loading={acting === review.id}
                    onClick={() => handleAction(review.id, 'approve')}
                  >
                    Approuver
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    loading={acting === review.id}
                    onClick={() => handleAction(review.id, 'reject')}
                  >
                    Rejeter
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
