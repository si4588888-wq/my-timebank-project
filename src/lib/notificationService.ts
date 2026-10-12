import { AppNotification, NotificationType } from '../types';
import { db, isFirebaseConfigured } from './firebase';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit
} from 'firebase/firestore';

const NOTIFICATIONS_STORAGE_KEY = 'skillbank_notifications_v1';

// Seed initial realistic notifications for personas
const INITIAL_NOTIFICATIONS: Record<string, AppNotification[]> = {
  user_elena: [
    {
      id: 'notif_elena_1',
      userId: 'user_elena',
      type: 'message',
      title: 'New Message from Marcus Chen',
      message: '"Sounds wonderful! 10:00 AM Saturday works for our 1:1 bread & code barter."',
      senderId: 'user_marcus',
      senderName: 'Marcus Chen',
      senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
      linkTab: 'chat',
      linkTargetId: 'user_marcus',
      actionLabel: 'Open Chat',
    },
    {
      id: 'notif_elena_2',
      userId: 'user_elena',
      type: 'proposal',
      title: 'Swap Proposal: Bread & Code Barter',
      message: 'Marcus Chen proposed a 60-minute mutual barter session: Sourdough Fermentation for Async Rust.',
      senderId: 'user_marcus',
      senderName: 'Marcus Chen',
      senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 110).toISOString(),
      linkTab: 'swaps',
      linkTargetId: 'sess_1',
      actionLabel: 'Review Session',
    },
    {
      id: 'notif_elena_3',
      userId: 'user_elena',
      type: 'session_update',
      title: 'Swap Confirmed with Maya Lin',
      message: 'Maya Lin confirmed "Japanese Language & Calligraphy" for Wednesday at 04:00 PM.',
      senderId: 'user_maya',
      senderName: 'Maya Lin',
      senderAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      linkTab: 'swaps',
      linkTargetId: 'sess_2',
      actionLabel: 'View Schedule',
    },
    {
      id: 'notif_elena_4',
      userId: 'user_elena',
      type: 'session_completed',
      title: 'Session Completed: +1.0 TC Settled',
      message: 'Your Italian Pasta Making barter with Carlos Gomez was completed and logged to the ledger.',
      senderId: 'user_carlos',
      senderName: 'Carlos Gomez',
      senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      linkTab: 'timebank',
      actionLabel: 'Check Ledger',
    },
  ],
  user_marcus: [
    {
      id: 'notif_marcus_1',
      userId: 'user_marcus',
      type: 'message',
      title: 'New Message from Elena Rostova',
      message: '"That sounds perfect! Let us do a 60-minute split or 2 separate hours."',
      senderId: 'user_elena',
      senderName: 'Elena Rostova',
      senderAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      linkTab: 'chat',
      linkTargetId: 'user_elena',
      actionLabel: 'Reply to Elena',
    },
    {
      id: 'notif_marcus_2',
      userId: 'user_marcus',
      type: 'proposal',
      title: 'Barter Session Accepted',
      message: 'Elena accepted your proposed swap: Sourdough Fermentation for Async Rust.',
      senderId: 'user_elena',
      senderName: 'Elena Rostova',
      senderAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      linkTab: 'swaps',
      linkTargetId: 'sess_1',
      actionLabel: 'View Session',
    },
  ],
  user_maya: [
    {
      id: 'notif_maya_1',
      userId: 'user_maya',
      type: 'proposal',
      title: 'Time Credit Booking Request',
      message: 'Elena booked 1.0 hr of Japanese Language & Calligraphy using escrow credit.',
      senderId: 'user_elena',
      senderName: 'Elena Rostova',
      senderAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
      linkTab: 'swaps',
      linkTargetId: 'sess_2',
      actionLabel: 'View Booking',
    },
  ],
};

// Local storage helpers
function getLocalNotificationsMap(): Record<string, AppNotification[]> {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
      return INITIAL_NOTIFICATIONS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Error reading notifications from localStorage:', err);
    return INITIAL_NOTIFICATIONS;
  }
}

function saveLocalNotificationsMap(map: Record<string, AppNotification[]>): void {
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(map));
  } catch (err) {
    console.warn('Error saving notifications to localStorage:', err);
  }
}

/**
 * Gets all notifications for a specific user.
 */
export function getUserNotifications(userId: string): AppNotification[] {
  const map = getLocalNotificationsMap();
  const list = map[userId] || [];
  return [...list].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Adds a new notification for a recipient.
 * Synchronizes to Firestore if available and persists locally.
 */
export async function addNotification(
  notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'>
): Promise<AppNotification> {
  const notifId = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const fullNotif: AppNotification = {
    ...notification,
    id: notifId,
    read: false,
    createdAt: new Date().toISOString(),
  };

  // 1. Save locally
  const map = getLocalNotificationsMap();
  const userList = map[notification.userId] || [];
  map[notification.userId] = [fullNotif, ...userList];
  saveLocalNotificationsMap(map);

  // Dispatch custom window event for instant in-tab react updates
  window.dispatchEvent(
    new CustomEvent('skillbank_notification_added', {
      detail: { notification: fullNotif },
    })
  );

  // 2. Synchronize to Firestore
  if (db && isFirebaseConfigured) {
    try {
      const notifRef = doc(db, 'users', notification.userId, 'notifications', notifId);
      await setDoc(notifRef, fullNotif);
    } catch (err) {
      console.warn('Firestore notification sync notice (local storage active):', err);
    }
  }

  return fullNotif;
}

/**
 * Marks an individual notification as read.
 */
export async function markNotificationAsRead(userId: string, notificationId: string): Promise<void> {
  const map = getLocalNotificationsMap();
  const userList = map[userId] || [];
  map[userId] = userList.map((n) => (n.id === notificationId ? { ...n, read: true } : n));
  saveLocalNotificationsMap(map);

  window.dispatchEvent(new CustomEvent('skillbank_notification_updated'));

  if (db && isFirebaseConfigured) {
    try {
      const notifRef = doc(db, 'users', userId, 'notifications', notificationId);
      await updateDoc(notifRef, { read: true });
    } catch (err) {
      // Ignored for offline mode
    }
  }
}

/**
 * Marks all notifications for a user as read.
 */
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  const map = getLocalNotificationsMap();
  const userList = map[userId] || [];
  map[userId] = userList.map((n) => ({ ...n, read: true }));
  saveLocalNotificationsMap(map);

  window.dispatchEvent(new CustomEvent('skillbank_notification_updated'));

  if (db && isFirebaseConfigured) {
    try {
      for (const n of userList) {
        if (!n.read) {
          const notifRef = doc(db, 'users', userId, 'notifications', n.id);
          updateDoc(notifRef, { read: true }).catch(() => {});
        }
      }
    } catch (err) {
      // Ignored
    }
  }
}

/**
 * Deletes a single notification.
 */
export async function deleteNotification(userId: string, notificationId: string): Promise<void> {
  const map = getLocalNotificationsMap();
  const userList = map[userId] || [];
  map[userId] = userList.filter((n) => n.id !== notificationId);
  saveLocalNotificationsMap(map);

  window.dispatchEvent(new CustomEvent('skillbank_notification_updated'));

  if (db && isFirebaseConfigured) {
    try {
      const notifRef = doc(db, 'users', userId, 'notifications', notificationId);
      await deleteDoc(notifRef);
    } catch (err) {
      // Ignored
    }
  }
}

/**
 * Clears all notifications for a user.
 */
export async function clearAllNotifications(userId: string): Promise<void> {
  const map = getLocalNotificationsMap();
  map[userId] = [];
  saveLocalNotificationsMap(map);

  window.dispatchEvent(new CustomEvent('skillbank_notification_updated'));
}

/**
 * Subscribes to notifications for a user (real-time with fallback to local events).
 */
export function subscribeToNotifications(
  userId: string,
  callback: (notifications: AppNotification[]) => void
): () => void {
  // Initial callback with local state
  callback(getUserNotifications(userId));

  // Listen to window events for local updates
  const handleLocalUpdate = () => {
    callback(getUserNotifications(userId));
  };
  window.addEventListener('skillbank_notification_added', handleLocalUpdate);
  window.addEventListener('skillbank_notification_updated', handleLocalUpdate);

  // Firestore onSnapshot listener if configured
  let unsubscribeFirestore: (() => void) | null = null;
  if (db && isFirebaseConfigured) {
    try {
      const notifsCol = collection(db, 'users', userId, 'notifications');
      const q = query(notifsCol, orderBy('createdAt', 'desc'), limit(30));
      unsubscribeFirestore = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: AppNotification[] = [];
            snapshot.forEach((docSnap) => {
              list.push(docSnap.data() as AppNotification);
            });
            // Merge with local state
            const map = getLocalNotificationsMap();
            map[userId] = list;
            saveLocalNotificationsMap(map);
            callback(list);
          }
        },
        (err) => {
          console.warn('Firestore notifications subscription fallback:', err);
        }
      );
    } catch (err) {
      console.warn('Could not setup Firestore notification listener:', err);
    }
  }

  return () => {
    window.removeEventListener('skillbank_notification_added', handleLocalUpdate);
    window.removeEventListener('skillbank_notification_updated', handleLocalUpdate);
    if (unsubscribeFirestore) {
      unsubscribeFirestore();
    }
  };
}
