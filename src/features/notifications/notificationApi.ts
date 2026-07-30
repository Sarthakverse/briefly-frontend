import api from '../../lib/axios';

export interface NotificationItem {
  id: string;
  message: string;
  type: string;
  entityId: string | null;
  createdAt: string;
  readAt: string | null;
}

export interface NotificationListResponse {
  notifications: NotificationItem[];
  unreadCount: number;
}

export async function getNotifications(): Promise<NotificationListResponse> {
  const res = await api.get<NotificationListResponse>('/notifications');
  return res.data;
}

export async function markNotificationRead(id: string): Promise<void> {
  await api.patch(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await api.patch('/notifications/read-all');
}