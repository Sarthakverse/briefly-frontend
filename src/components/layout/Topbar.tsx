interface TopbarProps {
  title: string;
  actions?: React.ReactNode;
}

export default function Topbar({ title, actions }: TopbarProps) {
  return (
    <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 border-b border-gray-200">
      <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </header>
  );
}