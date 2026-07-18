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