import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const navLinks = [
  { to: '/', label: 'Accueil' },
  { to: '/professionals', label: 'Professionnels' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col">
      <header className="bg-white/90 backdrop-blur-lg border-b border-surface-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 bg-gradient-to-br from-brand-600 to-brand-700 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-surface-900">Planity</span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === l.to ? 'text-brand-600' : 'text-surface-500 hover:text-surface-900'
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="text-sm font-medium text-surface-600 hover:text-surface-900 transition-colors"
                  >
                    {user.role === 'Professional' ? 'Dashboard' : 'Mon compte'}
                  </Link>
                  <button
                    onClick={logout}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-sm font-medium text-surface-600 hover:text-surface-900 transition-colors px-4 py-2">
                    Connexion
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center px-5 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-xl hover:bg-brand-700 transition-all shadow-sm hover:shadow-md"
                  >
                    S'inscrire
                  </Link>
                </>
              )}
            </div>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-surface-500 hover:bg-surface-100"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {mobileOpen && (
            <div className="md:hidden border-t border-surface-100 py-4 space-y-1 animate-slide-down">
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-3 py-2.5 rounded-xl text-sm font-medium ${
                    location.pathname === l.to ? 'bg-brand-50 text-brand-600' : 'text-surface-600 hover:bg-surface-50'
                  }`}
                >
                  {l.label}
                </Link>
              ))}
              <div className="border-t border-surface-100 pt-3 mt-3">
                {user ? (
                  <>
                    <Link to="/dashboard" onClick={() => setMobileOpen(false)}
                      className="block px-3 py-2.5 text-sm text-surface-600 hover:bg-surface-50 rounded-xl">
                      Dashboard
                    </Link>
                    <button onClick={() => { logout(); setMobileOpen(false); }}
                      className="block w-full text-left px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl">
                      Déconnexion
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMobileOpen(false)}
                      className="block px-3 py-2.5 text-sm text-surface-600 hover:bg-surface-50 rounded-xl">
                      Connexion
                    </Link>
                    <Link to="/register" onClick={() => setMobileOpen(false)}
                      className="block px-3 py-2.5 text-sm font-medium text-brand-600 hover:bg-brand-50 rounded-xl">
                      S'inscrire
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-surface-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
            <div className="md:col-span-2">
              <Link to="/" className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-brand-600 to-brand-700 rounded-xl flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-lg font-bold text-surface-900">Planity</span>
              </Link>
              <p className="text-sm text-surface-500 max-w-sm leading-relaxed">
                La solution de réservation en ligne pour les professionnels. Simplifiez la gestion de vos rendez-vous.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-surface-900 mb-4">Pour les pros</h4>
              <ul className="space-y-3">
                <li><Link to="/register" className="text-sm text-surface-500 hover:text-brand-600 transition-colors">Créer un compte</Link></li>
                <li><Link to="/dashboard" className="text-sm text-surface-500 hover:text-brand-600 transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-surface-900 mb-4">Contact</h4>
              <ul className="space-y-3">
                <li className="text-sm text-surface-500">contact@planity.app</li>
                <li className="text-sm text-surface-500">Support disponible 7j/7</li>
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-8 border-t border-surface-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-surface-400">&copy; {new Date().getFullYear()} Planity. Tous droits réservés.</p>
            <div className="flex items-center gap-6">
              <Link to="/" className="text-sm text-surface-400 hover:text-surface-600 transition-colors">CGU</Link>
              <Link to="/" className="text-sm text-surface-400 hover:text-surface-600 transition-colors">Confidentialité</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
