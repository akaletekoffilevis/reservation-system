import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfessionalListPage from './pages/ProfessionalListPage';
import ProfessionalPage from './pages/ProfessionalPage';
import BookingSuccessPage from './pages/BookingSuccessPage';
import ManageBookingPage from './pages/ManageBookingPage';
import DashboardLayout from './components/DashboardLayout';
import DashboardHomePage from './pages/dashboard/DashboardHomePage';
import AppointmentsPage from './pages/dashboard/AppointmentsPage';
import ServicesPage from './pages/dashboard/ServicesPage';
import AvailabilityPage from './pages/dashboard/AvailabilityPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/professionals" element={<ProfessionalListPage />} />
            <Route path="/professionals/:slug" element={<ProfessionalPage />} />
            <Route path="/booking/:token" element={<ManageBookingPage />} />
            <Route path="/booking-confirmed" element={<BookingSuccessPage />} />
          </Route>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHomePage />} />
            <Route path="appointments" element={<AppointmentsPage />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="availability" element={<AvailabilityPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
