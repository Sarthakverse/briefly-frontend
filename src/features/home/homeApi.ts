import api from '../../lib/axios';

export interface RecentMeeting {
  id: string;
  title: string;
  adapter: string;
  release: string;
  enhancement: string;
  date: string;
  status: string;
}

export async function getRecentMeetings(): Promise<RecentMeeting[]> {
  const res = await api.get('/meetings/recent');

  return res.data.map((m: any) => ({
    id: m.id,
    title: m.title,
    adapter: m.adapter?.name || '',
    release: m.release?.name || '',
    enhancement: m.enhancement?.name || '',
    date: new Date(m.createdAt).toISOString().split('T')[0],
    status: m.status,
  }));
}

interface RecentAdapter {
  id: string;
  name: string;
  createdAt: string;
}

interface RecentRelease {
  id: string;
  name: string;
  adapterId: string;
  adapter: { name: string };
  createdAt: string;
}

interface RecentEnhancement {
  id: string;
  name: string;
  releaseId: string;
  release: { name: string; adapter: { id: string; name: string } };
  createdAt: string;
}

export async function getRecentAdapters(): Promise<RecentAdapter[]> {
  const res = await api.get<RecentAdapter[]>('/adapters/recent');
  return res.data;
}

export async function getRecentReleases(): Promise<RecentRelease[]> {
  const res = await api.get<RecentRelease[]>('/releases/recent');
  return res.data;
}

export async function getRecentEnhancements(): Promise<RecentEnhancement[]> {
  const res = await api.get<RecentEnhancement[]>('/enhancements/recent');
  return res.data;
}