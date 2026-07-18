import api from '../../lib/axios';

export interface Adapter {
  id: string;
  name: string;
}

export async function getAdapters(): Promise<Adapter[]> {
  const res = await api.get<Adapter[]>('/adapters');
  return res.data;
}