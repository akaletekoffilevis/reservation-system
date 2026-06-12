import { Link } from 'react-router-dom';
import { Card, Button } from '../../components/ui/Elements';

export default function ProChatPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 animate-fade-in">
      <Card className="max-w-lg w-full p-8 text-center">
        <div className="w-20 h-20 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Messagerie professionnelle</h1>
        <p className="text-gray-500 mb-2">
          Gérez les échanges avec vos clients en un seul endroit.
        </p>
        <p className="text-sm text-gray-400 mb-8">
          Cette fonctionnalité sera bientôt disponible.
        </p>
        <Link to="/dashboard">
          <Button variant="primary" className="w-full">
            Retour au tableau de bord
          </Button>
        </Link>
      </Card>
    </div>
  );
}
