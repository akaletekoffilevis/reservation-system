import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'Admin';

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const proLinks = [
    { path: '/dashboard', label: 'Tableau de bord', icon: '📊' },
    { path: '/dashboard/appointments', label: 'Rendez-vous', icon: '📅' },
    { path: '/dashboard/services', label: 'Services', icon: '✂️' },
    { path: '/dashboard/availability', label: 'Disponibilités', icon: '🕐' },
    { path: '/dashboard/chat', label: 'Messagerie', icon: '💬' },
    { path: '/dashboard/timeoff', label: 'Congés', icon: '🏖️' },
  ];

  const adminLinks = [
    { path: '/admin', label: 'Dashboard', icon: '📊' },
    { path: '/admin/professionals', label: 'Professionnels', icon: '👤' },
    { path: '/admin/reviews', label: 'Avis', icon: '⭐' },
  ];

  const links = isAdmin ? adminLinks : proLinks;
  const title = isAdmin ? 'Administration' : 'Dashboard Pro';

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r overflow-y-auto shrink-0 flex flex-col">
        <div className="p-4 border-b">
          <Link to="/" className="text-xl font-bold text-blue-600">Booking</Link>
          <p className="text-sm text-gray-500 mt-1">{title}</p>
        </div>
        <nav className="p-3 space-y-1 flex-1">
          {links.map(link => (
            <Link key={link.path} to={link.path} end={link.path === '/dashboard' || link.path === '/admin'}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                isActive(link.path) ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
              }`}>
              <span>{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="border-t p-3">
          <div className="text-xs text-gray-400 mb-2 truncate">{user?.email}</div>
          <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg">
            Déconnexion
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
}
