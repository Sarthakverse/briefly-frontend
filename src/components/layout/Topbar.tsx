interface TopbarProps {
  title: string;
  actions?: React.ReactNode;
  onMenuClick?: () => void;
}

export default function Topbar({ title, actions, onMenuClick }: TopbarProps) {
  return (
    <header className="h-16 bg-white shadow-sm flex items-center justify-between px-4 sm:px-6 border-b border-gray-200">
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden text-gray-500 hover:text-gray-700 p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">{title}</h2>
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </header>
  );
}