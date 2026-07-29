import api from '../../lib/axios';

export interface SearchResult {
  id: string;
  type: 'adapter' | 'release' | 'enhancement' | 'meeting' | 'task' | 'workspace';
  label: string;
  subtitle: string;
  url: string;
}

export async function searchAll(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return [];
  const res = await api.get('/search', { params: { q: query } });
  return res.data;
}