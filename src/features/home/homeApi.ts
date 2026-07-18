// Placeholder for recent meetings. Replace with real API when available.
export interface RecentMeeting {
  id: string;
  title: string;
  adapter: string;
  release: string;
  enhancement: string;
  date: string;
  status: string;
}

// Simulated data for now – remove when backend endpoint is ready
const mockMeetings: RecentMeeting[] = [
  {
    id: '1',
    title: 'Q4 Architecture Review',
    adapter: 'ActiveMQ',
    release: 'v2.1.0',
    enhancement: 'Private Endpoint Enhancement',
    date: '2026-07-10',
    status: 'Completed',
  },
  {
    id: '2',
    title: 'Sprint 23 Planning',
    adapter: 'Microsoft Teams',
    release: 'v4.5.0',
    enhancement: 'Meeting Transcripts Processing',
    date: '2026-07-08',
    status: 'Completed',
  },
];

export async function getRecentMeetings(): Promise<RecentMeeting[]> {
  // TODO: Replace with real API call:
  // const res = await api.get('/meetings/recent');
  // return res.data;
  return mockMeetings;
}