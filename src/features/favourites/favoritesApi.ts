import api from '../../lib/axios';

export interface FavoritesResponse {
  meetings: Array<{
    id: string;
    title: string;
    status: string;
    createdAt: string;
    isFavorite: boolean;
    adapter: { name: string };
    release: { name: string };
    enhancement: { name: string };
  }>;
  workspace: Array<{
    id: string;
    title?: string;
    status: string;
    createdAt: string;
    isFavorite: boolean;
  }>;
}

export async function getFavorites(): Promise<FavoritesResponse> {
  const res = await api.get('/favorites');
  return res.data;
}

export async function checkFavorite(type: 'meeting' | 'workspace', id: string): Promise<boolean> {
  const res = await api.get('/favorites/check', { params: { type, id } });
  return res.data.isFavorite;
}