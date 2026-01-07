import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { SiteConfigProvider } from './context/SiteConfigContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import NewsDetail from './pages/NewsDetail';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import ReporterPanel from './pages/ReporterPanel';
import { useAuth } from './context/AuthContext';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const ProtectedRoute = ({ children, allowedRoles }: { children?: React.ReactNode, allowedRoles: string[] }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  if (user.isBlocked) return <div className="p-10 text-center text-red-600 font-bold">Access Denied: Your account is blocked.</div>;
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <LanguageProvider>
        <SiteConfigProvider>
          <Router>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="category/:categoryId" element={<CategoryPage />} />
                <Route path="news/:newsId" element={<NewsDetail />} />
                <Route path="login" element={<Login />} />
                <Route 
                  path="reporter/add" 
                  element={
                    <ProtectedRoute allowedRoles={['reporter', 'admin']}>
                      <ReporterPanel />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="reporter/edit/:newsId" 
                  element={
                    <ProtectedRoute allowedRoles={['reporter', 'admin']}>
                      <ReporterPanel />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="admin/dashboard" 
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </Router>
        </SiteConfigProvider>
      </LanguageProvider>
    </AuthProvider>
  );
};

export default App;