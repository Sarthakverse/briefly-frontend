import api from '../../lib/axios';

export interface Task {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export async function getTasks(): Promise<Task[]> {
  const res = await api.get<Task[]>('/tasks');
  return res.data;
}

export async function createTask(name: string): Promise<Task> {
  const res = await api.post<Task>('/tasks', { name });
  return res.data;
}

export async function updateTask(id: string, name: string): Promise<Task> {
  const res = await api.put<Task>(`/tasks/${id}`, { name });
  return res.data;
}

export async function deleteTask(id: string): Promise<void> {
  await api.delete(`/tasks/${id}`);
}