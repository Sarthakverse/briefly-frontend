import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, ArrowLeft } from 'lucide-react';
import { getReleasesByAdapter } from './releaseApi';
import type { Release } from './releaseApi';

export default function ReleaseList() {
  const { adapterId } = useParams<{ adapterId: string }>();
  const navigate = useNavigate();
  const [releases, setReleases] = useState<Release[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!adapterId) return;
    getReleasesByAdapter(adapterId)
      .then(setReleases)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [adapterId]);

  const filtered = releases.filter(
    (r) => r.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/adapters')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition"
      >
        <ArrowLeft size={18} />
        Back to Adapters
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Releases</h1>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search releases..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading releases...</p>
      ) : filtered.length === 0 ? (
        <p className="text-center text-gray-500">No releases found.</p>
      ) : (
        <div className="space-y-4">
          {filtered.map((release) => (
            <div
              key={release.id}
              onClick={() => navigate(`/releases/${release.id}/enhancements`)}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:border-blue-500 hover:shadow-md transition cursor-pointer"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-800">{release.name}</h3>
                {release._count && (
                  <span className="text-sm text-gray-500">
                    {release._count.enhancements} enhancement{release._count.enhancements !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              {release.summary && (
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{release.summary}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}