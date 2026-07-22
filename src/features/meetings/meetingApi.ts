import api from '../../lib/axios';

export interface MeetingListItem {
  id: string;
  title: string;
  status: string;
  createdAt: string;
}

export interface MeetingDetail {
  id: string;
  title: string;
  adapterId: string;
  releaseId: string;
  enhancementId: string;
  transcriptUrl?: string;
  transcriptText?: string;
  status: string;
  sharepointSyncStatus: string;
  execSummary?: string;
  execMermaid?: string;
  techSummary?: string;    // JSON string
  techMermaid?: string;
  speakerSummary?: string; // JSON string
  speakerMermaid?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  adapter: { name: string };
  release: { name: string };
  enhancement: { name: string };
}

export async function getMeetingsByEnhancement(enhancementId: string): Promise<MeetingListItem[]> {
  const res = await api.get<MeetingListItem[]>(`/meetings/enhancements/${enhancementId}`);
  return res.data;
}

export async function getMeetingById(id: string): Promise<MeetingDetail> {
  const res = await api.get<MeetingDetail>(`/meetings/${id}`);
  return res.data;
}

export async function reprocessMeeting(id: string): Promise<void> {
  await api.post(`/meetings/${id}/reprocess`);
}

export async function deleteMeeting(id: string): Promise<void> {
  await api.delete(`/meetings/${id}`);
}

export async function toggleFavorite(id: string): Promise<{ isFavorite: boolean }> {
  const res = await api.post('/favorites/toggle', { type: 'meeting', id });
  return res.data;
}