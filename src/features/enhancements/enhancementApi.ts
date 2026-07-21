import api from '../../lib/axios';

export interface Enhancement {
  id: string;
  name: string;
  releaseId: string;
  createdAt: string;
  updatedAt: string;
}

export async function getEnhancementsByRelease(releaseId: string): Promise<Enhancement[]> {
  const res = await api.get<Enhancement[]>(`/enhancements/releases/${releaseId}/enhancements`);
  return res.data;
}
export async function createEnhancement(releaseId: string, name: string): Promise<Enhancement> {
  const res = await api.post<Enhancement>(`/enhancements/releases/${releaseId}/enhancements`, { name });
  return res.data;
}

export async function updateEnhancement(id: string, name: string): Promise<Enhancement> {
  const res = await api.put<Enhancement>(`/enhancements/${id}`, { name });
  return res.data;
}

export async function deleteEnhancement(id: string): Promise<void> {
  await api.delete(`/enhancements/${id}`);
}