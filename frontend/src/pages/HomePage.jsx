import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Elements';

export default function HomePage() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/professionals?search=${search}`);
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-900 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 relative">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 animate-fade-in">
              Réservez vos rendez-vous en <span className="text-brand-200">quelques clics</span>
            </h1>
            <p className="text-lg sm:text-xl text-brand-100 mb-10 max-w-2xl animate-fade-in">
              Trouvez le professionnel qu'il vous faut et réservez instantanément, sans création de compte.
            </p>
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-xl animate-slide-up">
              <div className="relative flex-1">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Coiffeur, kiné, médecin... ou ville"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 bg-white/95 backdrop-blur focus:outline-none focus:ring-2 focus:ring-brand-300 shadow-lg"
                />
              </div>
              <Button size="lg" className="bg-white text-brand-700 hover:bg-brand-50 px-8">
                Rechercher
              </Button>
            </form>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50" />
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
          {[
            { value: '500+', label: 'Professionnels' },
            { value: '10k+', label: 'Rendez-vous / mois' },
            { value: '4.8/5', label: 'Satisfaction client' },
          ].map((s, i) => (
            <div key={i} className="p-6 text-center">
              <p className="text-3xl font-bold text-brand-600">{s.value}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Comment ça marche ?</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Trois étapes simples pour réserver votre rendez-vous.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Trouvez', desc: 'Parcourez notre sélection de professionnels près de chez vous', color: 'bg-blue-100 text-blue-600' },
              { step: '02', title: 'Choisissez', desc: 'Sélectionnez votre service et le créneau qui vous arrange', color: 'bg-purple-100 text-purple-600' },
              { step: '03', title: 'Réservez', desc: 'Confirmez en un clic, sans créer de compte', color: 'bg-green-100 text-green-600' },
            ].map(({ step, title, desc, color }) => (
              <div key={step} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 group">
                <div className={`w-14 h-14 ${color} rounded-xl flex items-center justify-center text-lg font-bold mb-6 group-hover:scale-110 transition-transform`}>
                  {step}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
                <p className="text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-brand-600 to-brand-800 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Vous êtes professionnel ?</h2>
          <p className="text-brand-100 mb-8 text-lg">Simplifiez la gestion de vos rendez-vous avec Booking Pro.</p>
          <Link to="/register"
            className="inline-flex items-center px-8 py-4 bg-white text-brand-700 font-semibold rounded-xl hover:bg-brand-50 transition-colors shadow-lg">
            Créer mon compte professionnel
            <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Trouvez par catégorie</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Coiffure', icon: '💇', color: 'bg-pink-50 border-pink-200 hover:bg-pink-100' },
              { name: 'Bien-être', icon: '💆', color: 'bg-purple-50 border-purple-200 hover:bg-purple-100' },
              { name: 'Santé', icon: '🏥', color: 'bg-blue-50 border-blue-200 hover:bg-blue-100' },
              { name: 'Sport', icon: '🏋️', color: 'bg-green-50 border-green-200 hover:bg-green-100' },
            ].map(({ name, icon, color }) => (
              <Link key={name} to={`/professionals?search=${name}`}
                className={`flex flex-col items-center gap-3 p-6 rounded-xl border transition-all ${color}`}>
                <span className="text-3xl">{icon}</span>
                <span className="font-medium text-gray-900">{name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
