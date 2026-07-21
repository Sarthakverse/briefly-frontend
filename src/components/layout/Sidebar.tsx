import { NavLink } from 'react-router-dom';
import { Home, FolderOpen, UploadCloud, LogOut, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const { user, logout } = useAuth();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
      isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
    }`;

  const handleLogout = async () => {
    await logout();
    onClose?.();
  };

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col h-screen relative">
      {/* Mobile close button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white lg:hidden"
        >
          <X size={20} />
        </button>
      )}

      {/* Logo */}
      <div className="px-6 py-8 border-b border-gray-800">
        <h1 className="text-2xl font-bold tracking-tight">Briefly AI</h1>
        <p className="text-gray-400 text-sm mt-1">Thrive with Change</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        <NavLink to="/" end className={linkClass} onClick={onClose}>
          <Home size={20} /> Home
        </NavLink>
        <NavLink to="/adapters" className={linkClass} onClick={onClose}>
          <FolderOpen size={20} /> Adapters
        </NavLink>
        <NavLink to="/upload" className={linkClass} onClick={onClose}>
          <UploadCloud size={20} /> Upload Transcript
        </NavLink>
      </nav>

      {/* User info & logout */}
      <div className="px-3 py-4 border-t border-gray-800">
        <div className="flex items-center gap-3 px-4 py-3 text-sm text-gray-400">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-gray-200 truncate">{user?.name}</p>
            <p className="text-xs truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2 mt-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </aside>
  );
}