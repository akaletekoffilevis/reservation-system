import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Button, Card, Badge, EmptyState } from '../../components/ui/Elements';
import { PageLoader } from '../../components/ui/Loading';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);

  useEffect(() => {
    api.get('/admin/reviews/pending').then(({ data }) => setReviews(data)).catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const approve = async (id) => {
    setActing(id);
    try { await api.post(`/admin/reviews/${id}/approve`); } catch {}
    setReviews(reviews.filter(r => r.id !== id));
    setActing(null);
  };

  const reject = async (id) => {
    setActing(id);
    try { await api.post(`/admin/reviews/${id}/reject`); } catch {}
    setReviews(reviews.filter(r => r.id !== id));
    setActing(null);
  };

  if (loading) return <PageLoader />;

  return (
    <div className="p-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Modération des avis</h1>
        <p className="text-gray-500 mt-1">{reviews.length} avis en attente de modération</p>
      </div>

      {reviews.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          title="Aucun avis en attente"
          description="Tous les avis ont été modérés."
        />
      ) : (
        <div className="space-y-3">
          {reviews.map(review => (
            <Card key={review.id} className="p-4">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{review.clientName}</span>
                    {review.professionalName && (
                      <span className="text-xs text-gray-400">sur {review.professionalName}</span>
                    )}
                  </div>
                  <div className="flex text-amber-400 text-sm mb-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <span key={i}>{i < review.rating ? '★' : '☆'}</span>
                    ))}
                  </div>
                  {review.comment && <p className="text-gray-700 text-sm">{review.comment}</p>}
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(review.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button variant="primary" size="sm" loading={acting === review.id} onClick={() => approve(review.id)}>
                    Approuver
                  </Button>
                  <Button variant="danger" size="sm" loading={acting === review.id} onClick={() => reject(review.id)}>
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
