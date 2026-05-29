import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { Card, Badge, EmptyState } from '../components/ui/Elements';
import { PageLoader } from '../components/ui/Loading';

export default function ProfessionalListPage() {
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const search = searchParams.get('search') || '';

  useEffect(() => {
    setLoading(true);
    api.get(`/professionals?search=${search}`)
      .then(({ data }) => setProfessionals(data))
      .catch(() => setProfessionals([]))
      .finally(() => setLoading(false));
  }, [search]);

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Professionnels</h1>
        {search ? (
          <p className="text-gray-500">Résultats pour "{search}" — {professionals.length} trouvé(s)</p>
        ) : (
          <p className="text-gray-500">Découvrez tous nos professionnels partenaires</p>
        )}
      </div>

      {professionals.length === 0 ? (
        <EmptyState
          title="Aucun professionnel trouvé"
          description={`Nous n'avons trouvé aucun professionnel correspondant à "${search}". Essayez une autre recherche.`}
          action={
            <Link to="/professionals" className="inline-flex items-center px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700">
              Voir tous les professionnels
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {professionals.map((p) => (
            <Link key={p.id} to={`/professionals/${p.slug}`}>
              <Card className="p-6 h-full group">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-bold text-brand-600">
                      {p.businessName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold text-gray-900 group-hover:text-brand-600 transition-colors truncate">
                      {p.businessName}
                    </h2>
                    {p.city && (
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {p.city}
                      </p>
                    )}
                  </div>
                </div>
                {p.description && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">{p.description}</p>
                )}
                {p.services?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {p.services.slice(0, 3).map((s) => (
                      <Badge key={s.id} variant="primary">
                        {s.name} — {s.price}€
                      </Badge>
                    ))}
                    {p.services.length > 3 && (
                      <Badge>+{p.services.length - 3}</Badge>
                    )}
                  </div>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
