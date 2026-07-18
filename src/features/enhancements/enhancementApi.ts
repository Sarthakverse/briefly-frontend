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