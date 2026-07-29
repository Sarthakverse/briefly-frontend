import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface TopbarProps {
  title: string;
  actions?: React.ReactNode;
  onMenuClick?: () => void;
}

export default function Topbar({ title, actions, onMenuClick }: TopbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';
  const { theme, toggleTheme } = useTheme();

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