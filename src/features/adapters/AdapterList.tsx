import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { getAdapters } from './adapterApi';
import type { Adapter } from './adapterApi';

export default function AdapterList() {
  const [adapters, setAdapters] = useState<Adapter[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getAdapters()
      .then(setAdapters)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = adapters.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Adapters</h1>
      <div className="relative mb-6">
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search adapters..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading adapters...</p>
      ) : filtered.length === 0 ? (
        <p className="text-center text-gray-500">No adapters found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.map((adapter) => (
            <div
              key={adapter.id}
              onClick={() => navigate(`/adapters/${adapter.id}/releases`)}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:border-blue-500 hover:shadow-md transition cursor-pointer"
            >
              <h3 className="font-semibold text-gray-800">{adapter.name}</h3>
              <p className="text-sm text-gray-500 mt-1">View releases</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}