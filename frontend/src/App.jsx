import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import DashboardLayout from './components/DashboardLayout';
import { ProtectedRoute, PublicOnlyRoute } from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import ProfessionalListPage from './pages/ProfessionalListPage';
import ProfessionalPage from './pages/ProfessionalPage';
import BookingSuccessPage from './pages/BookingSuccessPage';
import ManageBookingPage from './pages/ManageBookingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardHomePage from './pages/dashboard/DashboardHomePage';
import AppointmentsPage from './pages/dashboard/AppointmentsPage';
import ServicesPage from './pages/dashboard/ServicesPage';
import AvailabilityPage from './pages/dashboard/AvailabilityPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProfessionalsPage from './pages/admin/AdminProfessionalsPage';
import AdminReviewsPage from './pages/admin/AdminReviewsPage';
import ProChatPage from './pages/dashboard/ProChatPage';
import TimeOffPage from './pages/dashboard/TimeOffPage';
import ChatPage from './pages/ChatPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/professionals" element={<ProfessionalListPage />} />
            <Route path="/professionals/:slug" element={<ProfessionalPage />} />
            <Route path="/booking-success/:token" element={<BookingSuccessPage />} />
            <Route path="/manage-booking/:token" element={<ManageBookingPage />} />
            <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
            <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />
            <Route path="/chat/:conversationId?" element={<ChatPage />} />
          </Route>
          <Route path="/dashboard" element={
            <ProtectedRoute roles={['Professional', 'Admin']}>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<DashboardHomePage />} />
            <Route path="appointments" element={<AppointmentsPage />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="availability" element={<AvailabilityPage />} />
            <Route path="chat" element={<ProChatPage />} />
            <Route path="timeoff" element={<TimeOffPage />} />
          </Route>
          <Route path="/admin" element={
            <ProtectedRoute roles={['Admin']}>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboardPage />} />
            <Route path="professionals" element={<AdminProfessionalsPage />} />
            <Route path="reviews" element={<AdminReviewsPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
