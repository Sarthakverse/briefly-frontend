import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, ArrowLeft } from 'lucide-react';
import { getEnhancementsByRelease } from './enhancementApi';
import type { Enhancement } from './enhancementApi';

export default function EnhancementList() {
  const { releaseId } = useParams<{ releaseId: string }>();
  const navigate = useNavigate();
  const [enhancements, setEnhancements] = useState<Enhancement[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!releaseId) return;
    getEnhancementsByRelease(releaseId)
      .then(setEnhancements)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [releaseId]);

  const filtered = enhancements.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  // Since we don't have the adapter ID easily, we use a generic back navigation
  // The previous release path is: /adapters/:adapterId/releases
  // We can derive it from the releaseId? Not directly, so we go back in history.
  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Enhancements</h1>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search enhancements..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading enhancements...</p>
      ) : filtered.length === 0 ? (
        <p className="text-center text-gray-500">No enhancements found.</p>
      ) : (
        <div className="space-y-4">
          {filtered.map((enhancement) => (
            <div
              key={enhancement.id}
              onClick={() => navigate(`/enhancements/${enhancement.id}/meetings`)}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:border-blue-500 hover:shadow-md transition cursor-pointer"
            >
              <h3 className="font-semibold text-gray-800">{enhancement.name}</h3>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}