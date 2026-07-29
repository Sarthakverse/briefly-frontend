import { NavLink } from 'react-router-dom';
import {
  Home,
  FolderOpen,
  UploadCloud,
  LogOut,
  X,
  Briefcase,
  Star,
  ListTodo,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  onClose?: () => void;
}

interface NavItemProps {
  to: string;
  end?: boolean;
  icon: LucideIcon;
  label: string;
  onClose?: () => void;
}

function NavItem({ to, end, icon: Icon, label, onClose }: NavItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClose}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 px-4 py-3 rounded-lg overflow-hidden
         transition-all duration-200 ease-out
         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/70
         ${
           isActive
             ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md shadow-blue-900/30'
             : 'text-gray-300 hover:bg-gray-800 hover:text-white hover:translate-x-0.5'
         }`
      }
    >
      {({ isActive }) => (
        <>
          {/* sliding active indicator */}
          <span
            className={`absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-white
              transition-all duration-200 ease-out
              ${isActive ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0'}`}
          />
          <Icon
            size={20}
            className={`shrink-0 transition-transform duration-200 ease-out
              ${isActive ? '' : 'group-hover:scale-110 group-hover:-rotate-3'}`}
          />
          <span className="truncate">{label}</span>
        </>
      )}
    </NavLink>
  );
}

export default function Sidebar({ onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin';

  const handleLogout = async () => {
    await logout();
    onClose?.();
  };

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col h-screen relative">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white hover:rotate-90 transition-transform duration-200 lg:hidden"
        >
          <X size={20} />
        </button>
      )}

      <div className="px-6 py-8 border-b border-gray-800">
        <h1 className="text-2xl font-bold tracking-tight">Briefly AI</h1>
        <p className="text-gray-400 text-sm mt-1">Thrive with Change</p>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1">
        <NavItem to="/" end icon={Home} label="Home" onClose={onClose} />
        <NavItem to="/workspace" icon={Briefcase} label="Workspace" onClose={onClose} />
        <NavItem to="/favorites" icon={Star} label="Favorites" onClose={onClose} />
        <NavItem to="/adapters" icon={FolderOpen} label="Adapters" onClose={onClose} />
        <NavItem to="/tasks" icon={ListTodo} label="Other Tasks" onClose={onClose} />
        {isAdmin && (
          <NavItem to="/upload" icon={UploadCloud} label="Upload Transcript" onClose={onClose} />
        )}
      </nav>

      <div className="px-3 py-4 border-t border-gray-800">
        <div className="group flex items-center gap-3 px-4 py-3 text-sm text-gray-400">
          <div
            className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold
              ring-2 ring-transparent group-hover:ring-blue-400/50 transition-all duration-200"
          >
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-gray-200 truncate">{user?.name}</p>
            <p className="text-xs truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="group w-full flex items-center gap-3 px-4 py-2 mt-2 text-gray-400
            hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/70"
        >
          <LogOut
            size={18}
            className="transition-transform duration-200 ease-out group-hover:translate-x-0.5"
          />
          Logout
        </button>
      </div>
    </aside>
  );
}