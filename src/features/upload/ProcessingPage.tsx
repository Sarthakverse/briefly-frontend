import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMeetingById } from '../meetings/meetingApi';
import { Loader2 } from 'lucide-react';

export default function ProcessingPage() {
  const { meetingId } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!meetingId) return;
    const interval = setInterval(async () => {
      try {
        const meeting = await getMeetingById(meetingId);
        if (meeting.status === 'completed') {
          clearInterval(interval);
          navigate(`/meetings/${meetingId}`, { replace: true });
        } else if (meeting.status === 'failed') {
          clearInterval(interval);
          navigate(`/meetings/${meetingId}`, { replace: true });
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [meetingId, navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
      <p className="text-lg text-gray-700">Processing transcript...</p>
      <p className="text-sm text-gray-500 mt-2">This may take a minute. You'll be redirected automatically.</p>
    </div>
  );
}