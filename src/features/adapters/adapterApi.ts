import api from '../../lib/axios';

export interface Adapter {
  id: string;
  name: string;
}

export async function getAdapters(): Promise<Adapter[]> {
  const res = await api.get<Adapter[]>('/adapters');
  return res.data;
}

export async function createAdapter(name: string): Promise<Adapter> {
  const res = await api.post<Adapter>('/adapters', { name });
  return res.data;
}

export async function updateAdapter(id: string, name: string): Promise<Adapter> {
  const res = await api.put<Adapter>(`/adapters/${id}`, { name });
  return res.data;
}

export async function deleteAdapter(id: string): Promise<void> {
  await api.delete(`/adapters/${id}`);
}