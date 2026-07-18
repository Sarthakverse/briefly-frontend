import { useNavigate } from 'react-router-dom';
import { UploadCloud, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getRecentMeetings, type RecentMeeting } from './homeApi';

export default function Home() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [meetings, setMeetings] = useState<RecentMeeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecentMeetings()
      .then(setMeetings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = meetings.filter(
    (m) =>
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.adapter.toLowerCase().includes(search.toLowerCase()) ||
      m.release.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Welcome & motto */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome, {localStorage.getItem('userName') || 'User'}!
        </h1>
        <p className="mt-2 text-lg text-gray-600 max-w-2xl">
          Turn conversations into clarity. Briefly AI transforms Microsoft Teams
          meeting transcripts into clear summaries, interactive flowcharts, and
          professional meeting documentation, helping you understand, share, and
          act on every meeting with confidence.
        </p>
        <p className="mt-2 text-xl font-semibold text-blue-600 italic">
          "Thrive with Change"
        </p>
      </div>

      {/* Upload Transcript Card */}
      <div
        onClick={() => navigate('/upload')}
        className="bg-white rounded-xl shadow-sm border border-dashed border-blue-300 p-8 hover:border-blue-500 hover:bg-blue-50/30 transition cursor-pointer text-center"
      >
        <UploadCloud className="mx-auto h-12 w-12 text-blue-500 mb-4" />
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Upload Transcript
        </h3>
        <p className="text-gray-500">
          Drag & drop a Teams transcript or click to browse
          <br />
          <span className="text-sm">Supported: .vtt, .docx, .txt</span>
        </p>
      </div>

      {/* Recent Meetings */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Recent Meetings</h3>
        </div>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search recent meetings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {loading ? (
          <p className="text-gray-500 text-center py-4">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No recent meetings found.</p>
        ) : (
          <div className="space-y-3">
            {filtered.map((meeting) => (
              <div
                key={meeting.id}
                onClick={() => navigate(`/meetings/${meeting.id}`)} // will implement later
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition"
              >
                <div>
                  <p className="font-medium text-gray-800">{meeting.title}</p>
                  <p className="text-sm text-gray-500">
                    {meeting.adapter} / {meeting.release} / {meeting.enhancement}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                    {meeting.status}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">{meeting.date}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}