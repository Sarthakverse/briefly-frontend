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

export async function askChatStream(message: string): Promise<ReadableStream<Uint8Array>> {
  const token = localStorage.getItem('accessToken');
  const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';
  const response = await fetch(`${base}/chat/ask-stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ message }),
  });
  if (!response.ok) throw new Error('Streaming failed');
  return response.body!;
}