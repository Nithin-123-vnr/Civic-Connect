import { supabase } from './supabase';
import { MOCK_NOTIFICATIONS } from './mockData';
import type { Notification, NotificationType } from '@/types';

export function mapDbToNotification(row: any): Notification {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type as NotificationType,
    title: row.title,
    body: row.body,
    complaintId: row.complaint_id || undefined,
    complaintRef: row.complaint_ref || undefined,
    isRead: row.is_read ?? false,
    createdAt: row.created_at,
  };
}

export async function getNotifications(userId: string): Promise<Notification[]> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return MOCK_NOTIFICATIONS.filter(n => n.userId === userId);
    }

    return data.map(mapDbToNotification);
  } catch (err) {
    console.warn('Error fetching notifications from Supabase, using mock fallback:', err);
    return MOCK_NOTIFICATIONS.filter(n => n.userId === userId);
  }
}

export async function createNotification(data: {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  complaintId?: string;
  complaintRef?: string;
}): Promise<Notification> {
  const nowIso = new Date().toISOString();
  const insertPayload = {
    user_id: data.userId,
    type: data.type,
    title: data.title,
    body: data.body,
    complaint_id: data.complaintId || null,
    complaint_ref: data.complaintRef || null,
    is_read: false,
    created_at: nowIso,
  };

  try {
    const { error } = await supabase
      .from('notifications')
      .insert(insertPayload);

    if (error) {
      console.warn('Supabase notification insert warning:', error);
    }

    return {
      id: 'notif-' + Date.now(),
      ...data,
      isRead: false,
      createdAt: nowIso,
    };
  } catch (err) {
    console.warn('Notification insert exception:', err);
    return {
      id: 'notif-' + Date.now(),
      ...data,
      isRead: false,
      createdAt: nowIso,
    };
  }
}

export async function markNotificationAsRead(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (error) {
      console.warn('Failed to mark notification as read in Supabase:', error);
    }
  } catch (err) {
    console.warn('markNotificationAsRead exception:', err);
  }
}

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId);

    if (error) {
      console.warn('Failed to mark all notifications as read in Supabase:', error);
    }
  } catch (err) {
    console.warn('markAllNotificationsAsRead exception:', err);
  }
}

/**
 * Real-time Supabase subscription listener for user notifications
 */
export function subscribeToNotifications(
  userId: string,
  onUpdate: (notifications: Notification[]) => void
): () => void {
  try {
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        async () => {
          const freshList = await getNotifications(userId);
          onUpdate(freshList);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.warn('Realtime notifications subscription fallback:', err);
    return () => {};
  }
}
