import api from '../../lib/axios';

export interface WorkspaceListItem {
  id: string;
  title?: string;
  status: string;
  createdAt: string;
}

export interface WorkspaceDetail {
  id: string;
  userId: string;
  title?: string;
  transcriptUrl?: string;
  transcriptText?: string;
  status: string;
  execSummary?: string;
  execMermaid?: string;
  techSummary?: string;
  techMermaid?: string;
  speakerSummary?: string;
  speakerMermaid?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  user: { name: string; email: string };
}

export async function getWorkspaceList(): Promise<WorkspaceListItem[]> {
  const res = await api.get('/workspace');
  return res.data;
}

export async function getWorkspaceById(id: string): Promise<WorkspaceDetail> {
  const res = await api.get(`/workspace/${id}`);
  return res.data;
}

export async function uploadWorkspaceTranscript(file: File): Promise<{ id: string; status: string }> {
  const formData = new FormData();
  formData.append('transcript', file);
  const res = await api.post('/workspace', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function deleteWorkspaceTranscript(id: string): Promise<void> {
  await api.delete(`/workspace/${id}`);
}

export async function deleteAllWorkspaceTranscripts(): Promise<void> {
  await api.delete('/workspace/all');
}

export async function updateWorkspaceTranscript(id: string, data: any): Promise<WorkspaceDetail> {
  const res = await api.put(`/workspace/${id}`, data);
  return res.data;
}

export async function toggleFavorite(type: 'meeting' | 'workspace', id: string): Promise<{ isFavorite: boolean }> {
  const res = await api.post('/favorites/toggle', { type, id });
  return res.data;
}