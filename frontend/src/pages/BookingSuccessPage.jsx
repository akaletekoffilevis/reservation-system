import { Link, useParams } from 'react-router-dom';
import { Card, Button } from '../components/ui/Elements';

export default function BookingSuccessPage() {
  const { token } = useParams();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 animate-fade-in">
      <Card className="max-w-lg w-full p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Rendez-vous confirmé !</h1>
        <p className="text-gray-500 mb-2">
          Votre demande de réservation a bien été envoyée.
        </p>
        <p className="text-sm text-gray-400 mb-8">
          Vous recevrez un email de confirmation avec tous les détails.
        </p>
        {token && (
          <Link to={`/manage-booking/${token}`}>
            <Button variant="secondary" className="w-full mb-3">
              Gérer mon rendez-vous
            </Button>
          </Link>
        )}
        <Link to="/">
          <Button variant="ghost" className="w-full">
            Retour à l'accueil
          </Button>
        </Link>
      </Card>
    </div>
  );
}
