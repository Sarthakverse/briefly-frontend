import api from '../../lib/axios';

export interface Release {
  id: string;
  name: string;
  adapterId: string;
  summary?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { enhancements: number };
}

export async function getReleasesByAdapter(adapterId: string): Promise<Release[]> {
  const res = await api.get<Release[]>(`/releases/adapters/${adapterId}/releases`);
  return res.data;
}
export async function createRelease(adapterId: string, name: string, summary?: string): Promise<Release> {
  const res = await api.post<Release>(`/releases/adapters/${adapterId}/releases`, { name, summary });
  return res.data;
}

export async function updateRelease(id: string, data: { name?: string; summary?: string }): Promise<Release> {
  const res = await api.put<Release>(`/releases/${id}`, data);
  return res.data;
}

export async function deleteRelease(id: string): Promise<void> {
  await api.delete(`/releases/${id}`);
}