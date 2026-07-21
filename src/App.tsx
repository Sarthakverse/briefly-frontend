import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/layout/Layout';

import Login from './features/auth/Login';
import Register from './features/auth/Register';
import ForgotPassword from './features/auth/ForgotPassword';

import Home from './features/home/Home';
import AdapterList from './features/adapters/AdapterList';
import Upload from './features/upload/Upload';
import ReleaseList from './features/releases/ReleaseList';
import EnhancementList from './features/enhancements/EnhancementList';
import MeetingList from './features/meetings/MeetingList';
import MeetingView from './features/meetings/MeetingView';
import ProcessingPage from './features/upload/ProcessingPage';
import ErrorBoundary from './components/ErrorBoundary';


function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            <PageTransition>
              <Login />
            </PageTransition>
          }
        />

        <Route
          path="/register"
          element={
            <PageTransition>
              <Register />
            </PageTransition>
          }
        />

        <Route
          path="/forgot-password"
          element={
            <PageTransition>
              <ForgotPassword />
            </PageTransition>
          }
        />

        {/* Protected routes */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
          <Route
            index
            element={
              <PageTransition>
                <Home />
              </PageTransition>
            }
          />

          <Route
            path="adapters"
            element={
              <PageTransition>
                <AdapterList />
              </PageTransition>
            }
          />

          <Route
            path="adapters/:adapterId/releases"
            element={
              <PageTransition>
                <ReleaseList />
              </PageTransition>
            }
          />
          <Route
            path="releases/:releaseId/enhancements"
            element={
              <PageTransition>
                <EnhancementList />
              </PageTransition>
            }
          />
          <Route
            path="enhancements/:enhancementId/meetings"
            element={<PageTransition><MeetingList /></PageTransition>}
          />
          <Route
              path="meetings/:meetingId"
              element={<PageTransition><MeetingView /></PageTransition>}
            />
          <Route
            path="upload"
            element={
              <PageTransition>
                <Upload />
              </PageTransition>
            }
          />
        </Route>

        <Route path="processing/:meetingId" element={<PageTransition><ProcessingPage /></PageTransition>}/>
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <AnimatedRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}