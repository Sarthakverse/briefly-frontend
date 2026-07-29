import api from '../../lib/axios';

export interface AdapterOption { id: string; name: string; }
export interface ReleaseOption { id: string; name: string; }
export interface EnhancementOption { id: string; name: string; }
export interface TaskOption { id: string; name: string; }

export async function getAdapters(): Promise<AdapterOption[]> {
  const res = await api.get<AdapterOption[]>('/adapters');
  return res.data;
}
export async function getReleases(adapterId: string): Promise<ReleaseOption[]> {
  const res = await api.get<ReleaseOption[]>(`/releases/adapters/${adapterId}/releases`);
  return res.data;
}
export async function getEnhancements(releaseId: string): Promise<EnhancementOption[]> {
  const res = await api.get<EnhancementOption[]>(`/enhancements/releases/${releaseId}/enhancements`);
  return res.data;
}
export async function getTasks(): Promise<TaskOption[]> {
  const res = await api.get<TaskOption[]>('/tasks');
  return res.data;
}

export async function createMeetingWithTranscript(data: {
  title: string;
  transcriptFile: File;
  adapterId?: string;
  releaseId?: string;
  enhancementId?: string;
  taskId?: string;
}): Promise<{ id: string; status: string }> {
  const formData = new FormData();
  formData.append('title', data.title);
  formData.append('transcript', data.transcriptFile);

  if (data.taskId) {
    formData.append('taskId', data.taskId);
  } else {
    formData.append('adapterId', data.adapterId!);
    formData.append('releaseId', data.releaseId!);
    formData.append('enhancementId', data.enhancementId!);
  }

  const res = await api.post('/meetings', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}