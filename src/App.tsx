import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/layout/Layout";
import ErrorBoundary from "./components/ErrorBoundary";

import Login from "./features/auth/Login";
import Register from "./features/auth/Register";
import ForgotPassword from "./features/auth/ForgotPassword";

import Home from "./features/home/Home";

import AdapterList from "./features/adapters/AdapterList";
import ReleaseList from "./features/releases/ReleaseList";
import EnhancementList from "./features/enhancements/EnhancementList";

import MeetingList from "./features/meetings/MeetingList";
import MeetingView from "./features/meetings/MeetingView";

import Upload from "./features/upload/Upload";
import ProcessingPage from "./features/upload/ProcessingPage";

import WorkspaceList from "./features/workspace/WorkspaceList";
import WorkspaceProcessingPage from "./features/workspace/WorkspaceProcessingPage";
import WorkspaceView from "./features/workspace/WorkspaceView";

import FavoritesPage from './features/favourites/FavoritesPage';
import RecentEnhancements from "./features/enhancements/RecentEnhancements";
import RecentReleases from "./features/releases/RecentReleases";
import { ConfirmProvider } from "./context/ConfirmContext";
import TaskList from './features/tasks/TaskList';
import TaskMeetingList from './features/tasks/TaskMeetingList';
import { NotificationProvider } from "./context/NotificationContext"; 

function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
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
        {/* ---------------- Public Routes ---------------- */}
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

        {/* ---------------- Protected Routes (with Layout) ---------------- */}
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

          {/* Adapters */}
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
            element={
              <PageTransition>
                <MeetingList />
              </PageTransition>
            }
          />
          <Route
            path="meetings/:meetingId"
            element={
              <PageTransition>
                <MeetingView />
              </PageTransition>
            }
          />

          {/* Upload */}
          <Route
            path="upload"
            element={
              <PageTransition>
                <Upload />
              </PageTransition>
            }
          />

          {/* Workspace Routes */}
          <Route
            path="workspace"
            element={
              <PageTransition>
                <WorkspaceList />
              </PageTransition>
            }
          />
          <Route
            path="workspace/processing/:workspaceId"
            element={
              <PageTransition>
                <WorkspaceProcessingPage />
              </PageTransition>
            }
          />
          <Route
            path="workspace/:workspaceId"
            element={
              <PageTransition>
                <WorkspaceView />
              </PageTransition>
            }
          />

          {/* Favorites */}
          <Route
            path="favorites"
            element={
              <PageTransition>
                <FavoritesPage />
              </PageTransition>
            }
          />

          {/* Recent global views */}
          <Route
            path="releases/recent"
            element={
              <PageTransition>
                <RecentReleases />
              </PageTransition>
            }
          />
          <Route
            path="enhancements/recent"
            element={
              <PageTransition>
                <RecentEnhancements />
              </PageTransition>
            }
          />

          {/* Other Tasks */}
          <Route
            path="tasks"
            element={
              <PageTransition>
                <TaskList />
              </PageTransition>
            }
          />
          <Route
            path="tasks/:taskId/meetings"
            element={
              <PageTransition>
                <TaskMeetingList />
              </PageTransition>
            }
          />
        </Route>

        {/* Processing (outside main layout, full‑screen) */}
        <Route
          path="processing/:meetingId"
          element={
            <PageTransition>
              <ProcessingPage />
            </PageTransition>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <ConfirmProvider>
            <NotificationProvider>
              <BrowserRouter>
                <AnimatedRoutes />
              </BrowserRouter>
            </NotificationProvider>
          </ConfirmProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}