import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Moon, Sun, Bell, Check, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';

interface TopbarProps {
  title: string;
  actions?: React.ReactNode;
  onMenuClick?: () => void;
}

// Map notification type to a route path (dynamic segments require entityId)
function getEntityUrl(type: string, entityId: string | null): string | null {
  if (!entityId) return null;
  switch (type) {
    case 'adapter': return `/adapters/${entityId}/releases`;
    case 'release': return `/releases/${entityId}/enhancements`;
    case 'enhancement': return `/enhancements/${entityId}/meetings`;
    case 'meeting': return `/meetings/${entityId}`;
    case 'task': return `/tasks/${entityId}/meetings`;
    case 'workspace': return `/workspace/${entityId}`;
    default: return null;
  }
}

export default function Topbar({ title, actions, onMenuClick }: TopbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const bellRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Only show unread notifications for the dropdown (read ones removed from view)
  const unreadNotifications = notifications.filter((n) => !n.readAt);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        showNotifications &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        bellRef.current &&
        !bellRef.current.contains(e.target as Node)
      ) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showNotifications]);

  // Handle notification click: mark as read, then navigate
  const handleNotificationClick = async (notification: any) => {
    await markRead(notification.id);
    setShowNotifications(false);
    const url = getEntityUrl(notification.type, notification.entityId);
    if (url) navigate(url);
  };

  return (
    <header className="h-16 bg-white dark:bg-gray-900 shadow-sm dark:shadow-gray-800 flex items-center justify-between px-4 sm:px-6 border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        {!isHome && (
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center p-1.5 -ml-1 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-white transition-colors"
            title="Go back"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white">{title}</h2>
      </div>
      <div className="flex items-center gap-3">
        {actions && <div className="flex items-center gap-3">{actions}</div>}

        {/* Notification Bell */}
        <div className="relative">
          <button
            ref={bellRef}
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
            title="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-500 rounded-full shadow-sm">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown */}
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                ref={dropdownRef}
                initial={{ opacity: 0, y: 10, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-80 max-w-[90vw] sm:w-80
                  left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0
                  bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden z-[60]"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-bold text-gray-800 dark:text-white">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllRead()}
                      className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto scrollbar-hide">
                  {unreadNotifications.length === 0 ? (
                    <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-8">
                      No new notifications
                    </div>
                  ) : (
                    unreadNotifications.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className="w-full text-left px-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-start justify-between gap-2 bg-indigo-50/50 dark:bg-indigo-900/10"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-800 dark:text-gray-100 leading-snug">{n.message}</p>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                            {new Date(n.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {getEntityUrl(n.type, n.entityId) && (
                          <ExternalLink size={14} className="text-indigo-500 dark:text-indigo-400 shrink-0 mt-0.5" />
                        )}
                      </button>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  );
}