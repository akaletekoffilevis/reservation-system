import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { Button, Card, EmptyState } from '../components/ui/Elements';
import { PageLoader } from '../components/ui/Loading';

export default function ProfessionalListPage() {
  const [searchParams] = useSearchParams();
  const [professionals, setProfessionals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/catalogue/categories')
      .then(({ data }) => setCategories(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (selectedCategory) params.append('categoryId', selectedCategory);
    api.get(`/professionals?${params}`)
      .then(({ data }) => setProfessionals(data))
      .catch(() => setProfessionals([]))
      .finally(() => setLoading(false));
  }, [search, selectedCategory]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="lg:w-56 shrink-0">
          <h3 className="font-semibold text-sm text-gray-500 mb-3 uppercase tracking-wide">Catégories</h3>
          <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            <button onClick={() => setSelectedCategory(null)}
              className={`shrink-0 px-3 py-2 rounded-lg text-sm transition whitespace-nowrap ${!selectedCategory ? 'bg-brand-50 text-brand-700 font-medium' : 'hover:bg-gray-100'}`}>
              Tous
            </button>
            {categories.map(cat => (
              <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
                className={`shrink-0 px-3 py-2 rounded-lg text-sm transition whitespace-nowrap ${selectedCategory === cat.id ? 'bg-brand-50 text-brand-700 font-medium' : 'hover:bg-gray-100'}`}>
                {cat.icon && <span className="mr-1.5">{cat.icon}</span>}{cat.name}
                {cat.professionalCount > 0 && (
                  <span className="text-xs text-gray-400 ml-1">({cat.professionalCount})</span>
                )}
              </button>
            ))}
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <div className="flex gap-3 mb-6">
            <div className="relative flex-1">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
                placeholder="Rechercher un professionnel ou service..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <PageLoader />
          ) : professionals.length === 0 ? (
            <EmptyState
              icon={
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
              title="Aucun professionnel trouvé"
              description={search ? "Essayez de modifier votre recherche." : "Aucun professionnel disponible dans cette catégorie pour le moment."}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {professionals.map(pro => (
                <Link key={pro.id} to={`/professionals/${pro.slug}`} className="block group">
                  <Card hover className="p-5 h-full transition-all duration-200">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg text-gray-900 group-hover:text-brand-600 transition-colors">{pro.businessName}</h3>
                      {pro.rating > 0 && (
                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          <span className="text-amber-400 text-sm">★</span>
                          <span className="text-sm text-gray-500">{pro.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    {pro.city && (
                      <p className="text-sm text-gray-500 flex items-center gap-1 mb-2">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {pro.city}
                      </p>
                    )}
                    {pro.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{pro.description}</p>
                    )}
                    <div className="flex gap-1.5 flex-wrap">
                      {(pro.services || []).slice(0, 3).map(s => (
                        <span key={s.id} className="text-xs bg-brand-50 text-brand-700 px-2.5 py-1 rounded-full font-medium">{s.name}</span>
                      ))}
                      {(pro.services?.length || 0) > 3 && (
                        <span className="text-xs text-gray-400 px-2 py-1">+{pro.services.length - 3}</span>
                      )}
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
