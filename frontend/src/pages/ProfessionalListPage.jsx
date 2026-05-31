import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Button, Card, EmptyState } from '../components/ui/Elements';
import { PageLoader } from '../components/ui/Loading';

export default function ProfessionalListPage() {
  const [professionals, setProfessionals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/catalogue/categories').then(({ data }) => setCategories(data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (selectedCategory) params.append('categoryId', selectedCategory);
    api.get(`/professionals?${params}`).then(({ data }) => setProfessionals(data)).catch(() => setProfessionals([]))
      .finally(() => setLoading(false));
  }, [search, selectedCategory]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      <div className="flex gap-6">
        <aside className="w-56 shrink-0">
          <h3 className="font-semibold text-sm text-gray-500 mb-3 uppercase tracking-wide">Catégories</h3>
          <div className="space-y-1">
            <button onClick={() => setSelectedCategory(null)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${!selectedCategory ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-100'}`}>
              Tous
            </button>
            {categories.map(cat => (
              <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${selectedCategory === cat.id ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-100'}`}>
                {cat.icon} {cat.name}
                <span className="text-xs text-gray-400 ml-1">({cat.professionalCount})</span>
              </button>
            ))}
          </div>
        </aside>
        <div className="flex-1">
          <div className="flex gap-3 mb-6">
            <input className="flex-1 border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Rechercher un professionnel ou service..." value={search}
              onChange={(e) => setSearch(e.target.value)} />
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
                <Link key={pro.id} to={`/professionals/${pro.slug}`} className="block">
                  <Card className="p-5 hover:shadow-md transition cursor-pointer">
                    <h3 className="font-semibold text-lg">{pro.businessName}</h3>
                    {pro.city && <p className="text-sm text-gray-500 mt-1">{pro.city}</p>}
                    {pro.description && <p className="text-sm text-gray-600 mt-2 line-clamp-2">{pro.description}</p>}
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {pro.services?.slice(0, 3).map(s => (
                        <span key={s.id} className="text-xs bg-gray-100 px-2 py-1 rounded-full">{s.name}</span>
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
