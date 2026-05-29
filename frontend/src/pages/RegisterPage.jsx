import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button, Input, Card } from '../components/ui/Elements';

export default function RegisterPage() {
  const [form, setForm] = useState({ email: '', password: '', displayName: '', phone: '', isProfessional: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate(form.isProfessional ? '/dashboard' : '/');
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Créer un compte</h1>
          <p className="text-gray-500 mt-1">Rejoignez Booking gratuitement</p>
        </div>

        <Card className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700 text-sm">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input label="Nom complet" type="text" placeholder="Jean Dupont" required
              value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} />
            <Input label="Email" type="email" placeholder="vous@exemple.fr" required
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input label="Téléphone" type="tel" placeholder="+33 6 12 34 56 78"
              value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Input label="Mot de passe" type="password" placeholder="Au moins 8 caractères" required
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />

            <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
              <input type="checkbox" checked={form.isProfessional}
                onChange={(e) => setForm({ ...form, isProfessional: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-brand-600 focus:ring-brand-500" />
              <div>
                <p className="font-medium text-gray-900 text-sm">Je suis un professionnel</p>
                <p className="text-xs text-gray-500">Je souhaite gérer mes rendez-vous en ligne</p>
              </div>
            </label>

            <Button type="submit" loading={loading} className="w-full">
              Créer mon compte
            </Button>
          </form>
          <p className="text-center mt-6 text-sm text-gray-500">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-brand-600 font-medium hover:text-brand-700">Se connecter</Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
