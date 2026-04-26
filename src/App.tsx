import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/Toast';
import { ProtectedRoute, OrganizerRoute, AdminRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import TrendingSection from './components/TrendingSection';
import CalendarSection from './components/CalendarSection';
import FeaturesSection from './components/FeaturesSection';
import StatsSection from './components/StatsSection';
import CitiesSection from './components/CitiesSection';
import CTASection from './components/CTASection';
import Footer from './components/Footer';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import EditorialPage from './pages/EditorialPage';
import ArticlePage from './pages/ArticlePage';
import ProfilePage from './pages/ProfilePage';
import AuthPage from './pages/AuthPage';
import CreateEventPage from './pages/CreateEventPage';
import AdminPage from './pages/admin/AdminPage';
import CommunityPage from './pages/CommunityPage';
import NotFoundPage from './pages/NotFoundPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import ScrollToTop from './components/ScrollToTop';
import NextRaceCountdown from './components/NextRaceCountdown';

function HomePage() {
  return (
    <>
      <Hero />
      <TrendingSection />
      <CalendarSection />
      <FeaturesSection />
      <StatsSection />
      <CitiesSection />
      <CTASection />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <ScrollToTop />
          <div className="min-h-screen bg-surface text-[#F5F5F0]">
            <Navbar />
            <NextRaceCountdown />
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/events/:id" element={<EventDetailPage />} />
                <Route path="/community" element={<CommunityPage />} />
                <Route path="/editorial" element={<EditorialPage />} />
                <Route path="/editorial/:slug" element={<ArticlePage />} />
                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                <Route path="/create-event" element={<OrganizerRoute><CreateEventPage /></OrganizerRoute>} />
                <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
                <Route path="/login" element={<AuthPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </ErrorBoundary>
            <Footer />
          </div>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
