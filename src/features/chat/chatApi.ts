import api from '../../lib/axios';

export interface ChatResponse {
  reply: string;
  sources?: Array<{
    type: string;
    label: string;
    url: string;
  }>;
}

export async function askChat(message: string): Promise<ChatResponse> {
  const res = await api.post<ChatResponse>('/chat/ask', { message });
  return res.data;
}