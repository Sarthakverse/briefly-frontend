import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, ArrowLeft } from 'lucide-react';
import { getMeetingsByEnhancement } from './meetingApi';
import type { MeetingListItem } from './meetingApi';

export default function MeetingList() {
  const { enhancementId } = useParams<{ enhancementId: string }>();
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState<MeetingListItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!enhancementId) return;
    getMeetingsByEnhancement(enhancementId)
      .then(setMeetings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [enhancementId]);

  const filtered = meetings.filter((m) =>
    m.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition"
      >
        <ArrowLeft size={18} />
        Back
      </button>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Meetings</h1>
      <div className="relative mb-6">
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search meetings..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-center text-gray-500">No meetings found.</p>
      ) : (
        <div className="space-y-4">
          {filtered.map((meeting) => (
            <div
              key={meeting.id}
              onClick={() => navigate(`/meetings/${meeting.id}`)}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:border-blue-500 hover:shadow-md transition cursor-pointer"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-800">{meeting.title}</h3>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  meeting.status === 'completed' ? 'bg-green-100 text-green-800' :
                  meeting.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                  meeting.status === 'failed' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {meeting.status}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">{new Date(meeting.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}