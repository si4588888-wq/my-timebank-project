import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import { db, isFirebaseConfigured, auth } from './firebase';
import { ChatMessage, Conversation, UserPersona } from '../types';
import { addNotification } from './notificationService';

// Deterministic conversation ID for any pair of users
export function getConversationId(userId1: string, userId2: string): string {
  return [userId1, userId2].sort().join('_sb_');
}

// Initial default conversations for community demonstration
export const INITIAL_COMMUNITY_CONVERSATIONS: Conversation[] = [
  {
    id: 'user_marcus_sb_user_elena',
    participantIds: ['user_elena', 'user_marcus'],
    participantDetails: {
      user_elena: {
        name: 'Elena Rostova',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        headline: 'Master Baker & Culinary Instructor',
      },
      user_marcus: {
        name: 'Marcus Chen',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        headline: 'Senior Web3 & Rust Engineer',
      },
    },
    lastMessage: 'Sounds wonderful! 10:00 AM Saturday works for our 1:1 bread & code barter.',
    lastSenderId: 'user_marcus',
    updatedAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    lastMessageAt: '35m ago',
    unreadCount: { user_elena: 1, user_marcus: 0 },
  },
  {
    id: 'user_elena_sb_user_maya',
    participantIds: ['user_elena', 'user_maya'],
    participantDetails: {
      user_elena: {
        name: 'Elena Rostova',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        headline: 'Master Baker & Culinary Instructor',
      },
      user_maya: {
        name: 'Maya Lin',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        headline: 'Bilingual Translator & Calligrapher',
      },
    },
    lastMessage: 'I can prepare custom kanji sheets for your Tokyo trip before we bake sourdough!',
    lastSenderId: 'user_maya',
    updatedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    lastMessageAt: '3h ago',
    unreadCount: { user_elena: 0, user_maya: 0 },
  },
  {
    id: 'user_carlos_sb_user_elena',
    participantIds: ['user_elena', 'user_carlos'],
    participantDetails: {
      user_elena: {
        name: 'Elena Rostova',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        headline: 'Master Baker & Culinary Instructor',
      },
      user_carlos: {
        name: 'Carlos Gomez',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        headline: 'Luthier & Classical Flamenco Guitarist',
      },
    },
    lastMessage: 'Hi Elena! I would love to book a 1 TC session with you on artisanal fermentation.',
    lastSenderId: 'user_carlos',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    lastMessageAt: 'Yesterday',
    unreadCount: { user_elena: 0, user_carlos: 0 },
  },
];

export const INITIAL_CHAT_MESSAGES: Record<string, ChatMessage[]> = {
  'user_marcus_sb_user_elena': [
    {
      id: 'msg_1',
      conversationId: 'user_marcus_sb_user_elena',
      senderId: 'user_elena',
      senderName: 'Elena Rostova',
      senderAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      text: 'Hi Marcus! The AI Matchmaker highlighted a 95% synergy between your Rust expertise and my Sourdough baking. Would you be interested in a direct barter?',
      createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    },
    {
      id: 'msg_2',
      conversationId: 'user_marcus_sb_user_elena',
      senderId: 'user_marcus',
      senderName: 'Marcus Chen',
      senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      text: 'Absolutely! I have been struggling with bread hydration and oven spring. In return, I can walk you through smart contract fundamentals or async Rust.',
      createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    },
    {
      id: 'msg_3',
      conversationId: 'user_marcus_sb_user_elena',
      senderId: 'user_elena',
      senderName: 'Elena Rostova',
      senderAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      text: 'That sounds perfect! Let us do a 60-minute split or 2 separate hours. Are you free this weekend?',
      createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    },
    {
      id: 'msg_4',
      conversationId: 'user_marcus_sb_user_elena',
      senderId: 'user_marcus',
      senderName: 'Marcus Chen',
      senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      text: 'Sounds wonderful! 10:00 AM Saturday works for our 1:1 bread & code barter.',
      createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    },
  ],
  'user_elena_sb_user_maya': [
    {
      id: 'msg_maya_1',
      conversationId: 'user_elena_sb_user_maya',
      senderId: 'user_elena',
      senderName: 'Elena Rostova',
      senderAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      text: 'Konnichiwa Maya-san! I saw your Japanese language and calligraphy offering. I am visiting Kyoto next spring and want to learn conversational basics.',
      createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    },
    {
      id: 'msg_maya_2',
      conversationId: 'user_elena_sb_user_maya',
      senderId: 'user_maya',
      senderName: 'Maya Lin',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      text: 'I would love to help! I can prepare custom kanji sheets for your Tokyo trip before we bake sourdough!',
      createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    },
  ],
};

// Local storage helper
function getLocalConversations(): Conversation[] {
  try {
    const saved = localStorage.getItem('skillbank_conversations');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    // fallback
  }
  return INITIAL_COMMUNITY_CONVERSATIONS;
}

function saveLocalConversations(convs: Conversation[]) {
  try {
    localStorage.setItem('skillbank_conversations', JSON.stringify(convs));
  } catch (e) {
    // ignore
  }
}

function getLocalMessages(convId: string): ChatMessage[] {
  try {
    const saved = localStorage.getItem(`skillbank_msgs_${convId}`);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    // fallback
  }
  return INITIAL_CHAT_MESSAGES[convId] || [];
}

function saveLocalMessages(convId: string, msgs: ChatMessage[]) {
  try {
    localStorage.setItem(`skillbank_msgs_${convId}`, JSON.stringify(msgs));
  } catch (e) {
    // ignore
  }
}

/**
 * Subscribes to real-time updates for conversations involving a specific user.
 */
export function subscribeToUserConversations(
  currentUserId: string,
  onUpdate: (conversations: Conversation[]) => void
): () => void {
  // Always emit local state immediately for snappy UX
  const localList = getLocalConversations().filter((c) =>
    c.participantIds.includes(currentUserId)
  );
  onUpdate(localList);

  if (!db || !isFirebaseConfigured) {
    return () => {};
  }

  try {
    const convsRef = collection(db, 'conversations');
    const q = query(convsRef, where('participantIds', 'array-contains', currentUserId));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const firestoreConvs: Conversation[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            firestoreConvs.push({
              id: docSnap.id,
              participantIds: data.participantIds || [],
              participantDetails: data.participantDetails || {},
              lastMessage: data.lastMessage || '',
              lastSenderId: data.lastSenderId || '',
              updatedAt: data.updatedAt?.toDate?.() ? data.updatedAt.toDate().toISOString() : data.updatedAt || new Date().toISOString(),
              unreadCount: data.unreadCount || {},
            });
          });

          // Merge Firestore conversations with local ones, preferring Firestore
          const map = new Map<string, Conversation>();
          localList.forEach((c) => map.set(c.id, c));
          firestoreConvs.forEach((c) => map.set(c.id, c));

          const merged = Array.from(map.values()).sort(
            (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );

          saveLocalConversations(merged);
          onUpdate(merged);
        }
      },
      (error) => {
        console.warn('Firestore conversation sync fallback to local cache:', error);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('Unable to attach Firestore conversation listener:', err);
    return () => {};
  }
}

/**
 * Subscribes to real-time messages in a specific conversation thread.
 */
export function subscribeToConversationMessages(
  conversationId: string,
  onUpdate: (messages: ChatMessage[]) => void
): () => void {
  // Emit local cache immediately
  const localMsgs = getLocalMessages(conversationId);
  onUpdate(localMsgs);

  if (!db || !isFirebaseConfigured) {
    return () => {};
  }

  try {
    const msgsRef = collection(db, 'conversations', conversationId, 'messages');
    const q = query(msgsRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const fetched: ChatMessage[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            fetched.push({
              id: docSnap.id,
              conversationId,
              senderId: data.senderId,
              senderName: data.senderName,
              senderAvatar: data.senderAvatar,
              text: data.text,
              timestamp: data.timestamp,
              createdAt: data.createdAt || (data.timestamp?.toDate ? data.timestamp.toDate().toISOString() : new Date().toISOString()),
              isSystemNotification: data.isSystemNotification || false,
            });
          });

          // Deduplicate and merge
          const existingMap = new Map<string, ChatMessage>();
          localMsgs.forEach((m) => existingMap.set(m.id, m));
          fetched.forEach((m) => existingMap.set(m.id, m));

          const merged = Array.from(existingMap.values()).sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );

          saveLocalMessages(conversationId, merged);
          onUpdate(merged);
        }
      },
      (error) => {
        console.warn('Firestore messages sync fallback to local cache:', error);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('Unable to attach Firestore message listener:', err);
    return () => {};
  }
}

/**
 * Sends a direct message in a conversation.
 * Synchronizes to Firestore in real-time with timestamp and persists locally.
 */
export async function sendDirectChatMessage(params: {
  conversationId: string;
  sender: UserPersona;
  recipient: UserPersona;
  text: string;
}): Promise<ChatMessage> {
  const { conversationId, sender, recipient, text } = params;
  const now = new Date();
  const nowIso = now.toISOString();
  const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const newMessage: ChatMessage = {
    id: messageId,
    conversationId,
    senderId: sender.id,
    senderName: sender.name,
    senderAvatar: sender.avatar,
    text: text.trim(),
    createdAt: nowIso,
  };

  // 1. Optimistically update local cache
  const existingMsgs = getLocalMessages(conversationId);
  const updatedMsgs = [...existingMsgs, newMessage];
  saveLocalMessages(conversationId, updatedMsgs);

  // Update conversations list locally
  const localConvs = getLocalConversations();
  const existingConvIndex = localConvs.findIndex((c) => c.id === conversationId);

  const convPayload: Conversation = {
    id: conversationId,
    participantIds: [sender.id, recipient.id],
    participantDetails: {
      [sender.id]: {
        name: sender.name,
        avatar: sender.avatar,
        headline: sender.headline,
      },
      [recipient.id]: {
        name: recipient.name,
        avatar: recipient.avatar,
        headline: recipient.headline,
      },
    },
    lastMessage: text.trim(),
    lastSenderId: sender.id,
    updatedAt: nowIso,
    lastMessageAt: 'Just now',
  };

  if (existingConvIndex >= 0) {
    localConvs[existingConvIndex] = {
      ...localConvs[existingConvIndex],
      lastMessage: text.trim(),
      lastSenderId: sender.id,
      updatedAt: nowIso,
      lastMessageAt: 'Just now',
    };
  } else {
    localConvs.unshift(convPayload);
  }
  saveLocalConversations(localConvs);

  // Trigger notification for recipient
  addNotification({
    userId: recipient.id,
    type: 'message',
    title: `New Message from ${sender.name}`,
    message: text.trim().length > 90 ? text.trim().substring(0, 90) + '...' : text.trim(),
    senderId: sender.id,
    senderName: sender.name,
    senderAvatar: sender.avatar,
    linkTab: 'chat',
    linkTargetId: sender.id,
    actionLabel: 'Reply',
  }).catch(() => {});

  // 2. Synchronize to Firestore
  if (db && isFirebaseConfigured) {
    try {
      // Upsert conversation metadata
      const convDocRef = doc(db, 'conversations', conversationId);
      await setDoc(
        convDocRef,
        {
          id: conversationId,
          participantIds: [sender.id, recipient.id],
          participantDetails: convPayload.participantDetails,
          lastMessage: text.trim(),
          lastSenderId: sender.id,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      // Add message document
      const msgDocRef = doc(db, 'conversations', conversationId, 'messages', messageId);
      await setDoc(msgDocRef, {
        id: messageId,
        conversationId,
        senderId: sender.id,
        senderName: sender.name,
        senderAvatar: sender.avatar,
        text: text.trim(),
        createdAt: nowIso,
        timestamp: serverTimestamp(),
      });
    } catch (err) {
      console.warn('Firestore message upload fallback to client persistence:', err);
    }
  }

  return newMessage;
}

/**
 * Initializes or retrieves an existing conversation thread for two users.
 */
export function ensureConversationExists(
  userA: UserPersona,
  userB: UserPersona
): Conversation {
  const convId = getConversationId(userA.id, userB.id);
  const convs = getLocalConversations();
  const existing = convs.find((c) => c.id === convId);

  if (existing) {
    return existing;
  }

  const newConv: Conversation = {
    id: convId,
    participantIds: [userA.id, userB.id],
    participantDetails: {
      [userA.id]: {
        name: userA.name,
        avatar: userA.avatar,
        headline: userA.headline,
      },
      [userB.id]: {
        name: userB.name,
        avatar: userB.avatar,
        headline: userB.headline,
      },
    },
    lastMessage: 'Conversation started',
    lastSenderId: userA.id,
    updatedAt: new Date().toISOString(),
    lastMessageAt: 'Just now',
    unreadCount: {},
  };

  const updated = [newConv, ...convs];
  saveLocalConversations(updated);

  // Sync to Firestore if available
  if (db && isFirebaseConfigured) {
    setDoc(
      doc(db, 'conversations', convId),
      {
        id: convId,
        participantIds: [userA.id, userB.id],
        participantDetails: newConv.participantDetails,
        lastMessage: 'Conversation started',
        lastSenderId: userA.id,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    ).catch((e) => console.warn('Sync conversation error:', e));
  }

  return newConv;
}
