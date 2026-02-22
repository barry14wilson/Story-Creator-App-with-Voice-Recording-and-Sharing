import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Navigation } from './components/Navigation';
import { Home } from './pages/Home';
import { Profile } from './pages/Profile';
import { StoryEditor } from './pages/StoryEditor';
import { StoryReader } from './pages/StoryReader';
import { BookView } from './pages/BookView';
import { Login } from './components/Login';
import { Loader2Icon, BookOpenIcon } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Protected route wrapper – redirects to /login when not signed in  */
/* ------------------------------------------------------------------ */
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2Icon size={40} className="animate-spin text-purple-500" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

/* ------------------------------------------------------------------ */
/*  404 catch-all                                                     */
/* ------------------------------------------------------------------ */
const NotFound = () => (
  <div className="max-w-2xl mx-auto text-center py-20">
    <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
      <BookOpenIcon size={40} className="text-purple-400" />
    </div>
    <h2 className="text-3xl font-display text-gray-600 mb-3">Page Not Found</h2>
    <p className="text-gray-500 font-body mb-6">
      Oops! This page doesn't exist. Let's get you back to making stories!
    </p>
    <a
      href="/"
      className="inline-flex items-center gap-2 py-3 px-6 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold rounded-xl shadow font-body"
    >
      Go Home
    </a>
  </div>
);

/* ------------------------------------------------------------------ */
/*  App inner (must be inside AuthProvider so useAuth works)           */
/* ------------------------------------------------------------------ */
const AppContent = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-float inline-block mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center shadow-xl">
              <BookOpenIcon size={40} className="text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-display text-purple-600 mb-2">Robyn Reads</h1>
          <Loader2Icon size={24} className="animate-spin text-purple-400 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/story/:id" element={<StoryReader />} />

          {/* Protected routes */}
          <Route
            path="/create"
            element={
              <ProtectedRoute>
                <StoryEditor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/book/:id"
            element={
              <ProtectedRoute>
                <BookView />
              </ProtectedRoute>
            }
          />

          {/* 404 catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-gray-400 font-body text-sm no-print">
        <p className="font-display text-purple-400 text-lg mb-1">Robyn Reads</p>
        <p>Created with love and imagination</p>
      </footer>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Root App                                                           */
/* ------------------------------------------------------------------ */
export function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}
