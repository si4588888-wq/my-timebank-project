import React, { useState } from 'react';
import {
  Bell,
  CheckCheck,
  Trash2,
  MessageSquare,
  ArrowRightLeft,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  X,
  Sparkles
} from 'lucide-react';
import { AppNotification, NotificationType } from '../types';

interface NotificationCenterProps {
  notifications: AppNotification[];
  unreadCount: number;
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (id: string) => void;
  onClearAll: () => void;
  onNavigate: (tab: 'chat' | 'swaps' | 'timebank' | 'matches' | 'profile', targetId?: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  unreadCount,
  isOpen,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onClearAll,
  onNavigate,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'messages' | 'swaps'>('all');

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter((notif) => {
    if (activeFilter === 'unread') return !notif.read;
    if (activeFilter === 'messages') return notif.type === 'message';
    if (activeFilter === 'swaps') {
      return (
        notif.type === 'proposal' ||
        notif.type === 'session_update' ||
        notif.type === 'session_completed' ||
        notif.type === 'timebank_credit'
      );
    }
    return true;
  });

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="w-3.5 h-3.5 text-amber-400" />;
      case 'proposal':
        return <ArrowRightLeft className="w-3.5 h-3.5 text-sky-400" />;
      case 'session_update':
        return <Calendar className="w-3.5 h-3.5 text-indigo-400" />;
      case 'session_completed':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'timebank_credit':
        return <Clock className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  const getNotificationBadgeColor = (type: NotificationType) => {
    switch (type) {
      case 'message':
        return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
      case 'proposal':
        return 'bg-sky-500/10 border-sky-500/30 text-sky-400';
      case 'session_update':
        return 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400';
      case 'session_completed':
        return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
      case 'timebank_credit':
        return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
      default:
        return 'bg-stone-800 border-stone-700 text-stone-300';
    }
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const now = new Date().getTime();
      const time = new Date(isoString).getTime();
      const diffMs = now - time;
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMinutes < 1) return 'Just now';
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      return `${diffDays}d ago`;
    } catch {
      return 'Recently';
    }
  };

  const handleNotificationClick = (notif: AppNotification) => {
    if (!notif.read) {
      onMarkAsRead(notif.id);
    }
    if (notif.linkTab) {
      onNavigate(notif.linkTab, notif.linkTargetId);
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop overlay for outside click dismiss */}
      <div
        className="fixed inset-0 z-40 bg-stone-950/40 backdrop-blur-[1px]"
        onClick={onClose}
      />

      {/* Popover Dropdown Window */}
      <div
        id="notification-center-dropdown"
        className="fixed sm:absolute top-16 sm:top-14 right-2 sm:right-0 w-[calc(100vw-16px)] sm:w-[440px] max-w-[460px] bg-stone-900 border border-stone-750 rounded-2xl sm:rounded-3xl shadow-2xl z-50 overflow-hidden flex flex-col text-stone-100 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="p-4 border-b border-stone-800 flex items-center justify-between gap-2 bg-stone-900/90 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <Bell className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-stone-100">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-stone-950">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-400">
                Messages, barter requests, and credit updates
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                title="Mark all as read"
                className="px-2.5 py-1 rounded-lg text-xs font-medium text-stone-300 hover:text-amber-400 hover:bg-stone-800 transition-colors flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mark read</span>
              </button>
            )}

            {notifications.length > 0 && (
              <button
                onClick={onClearAll}
                title="Clear all notifications"
                className="p-1.5 rounded-lg text-stone-400 hover:text-rose-400 hover:bg-stone-800 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
              title="Close notifications"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="px-4 py-2 border-b border-stone-800/80 bg-stone-950/40 flex items-center gap-1.5 overflow-x-auto text-xs scrollbar-none">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeFilter === 'all'
                ? 'bg-amber-500 text-stone-950 font-semibold shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setActiveFilter('unread')}
            className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeFilter === 'unread'
                ? 'bg-amber-500 text-stone-950 font-semibold shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            Unread
            {unreadCount > 0 && (
              <span className={`w-1.5 h-1.5 rounded-full ${
                activeFilter === 'unread' ? 'bg-stone-950' : 'bg-amber-400'
              }`} />
            )}
          </button>
          <button
            onClick={() => setActiveFilter('messages')}
            className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeFilter === 'messages'
                ? 'bg-amber-500 text-stone-950 font-semibold shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            Messages
          </button>
          <button
            onClick={() => setActiveFilter('swaps')}
            className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeFilter === 'swaps'
                ? 'bg-amber-500 text-stone-950 font-semibold shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            Swaps & Credits
          </button>
        </div>

        {/* Notifications List Container */}
        <div className="max-h-[380px] sm:max-h-[420px] overflow-y-auto divide-y divide-stone-800/60 p-2 space-y-1">
          {filteredNotifications.length === 0 ? (
            <div className="py-12 px-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-stone-800/70 border border-stone-700/60 flex items-center justify-center mx-auto mb-3 text-stone-400">
                <Bell className="w-6 h-6 opacity-40" />
              </div>
              <p className="text-sm font-semibold text-stone-300">No notifications here</p>
              <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
                {activeFilter === 'unread'
                  ? "You are all caught up! There are no unread notifications right now."
                  : "Incoming messages, swap session proposals, and time credit updates will appear here."}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif) => {
              const isUnread = !notif.read;
              return (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`group relative p-3 rounded-xl transition-all cursor-pointer border ${
                    isUnread
                      ? 'bg-amber-500/[0.07] hover:bg-amber-500/[0.12] border-amber-500/30'
                      : 'bg-stone-850/40 hover:bg-stone-800/60 border-transparent hover:border-stone-800'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar or Icon Indicator */}
                    <div className="relative flex-shrink-0">
                      {notif.senderAvatar ? (
                        <img
                          src={notif.senderAvatar}
                          alt={notif.senderName || 'Sender'}
                          className="w-9 h-9 rounded-xl object-cover border border-stone-700"
                        />
                      ) : (
                        <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${getNotificationBadgeColor(notif.type)}`}>
                          {getNotificationIcon(notif.type)}
                        </div>
                      )}

                      {/* Small badge overlay */}
                      <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border border-stone-900 flex items-center justify-center text-[9px] ${getNotificationBadgeColor(notif.type)}`}>
                        {getNotificationIcon(notif.type)}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-xs font-semibold truncate ${
                          isUnread ? 'text-amber-200' : 'text-stone-200'
                        }`}>
                          {notif.title}
                        </span>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <span className="text-[10px] text-stone-500 whitespace-nowrap">
                            {formatRelativeTime(notif.createdAt)}
                          </span>
                          {isUnread && (
                            <span
                              className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0"
                              title="Unread"
                            />
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-stone-400 line-clamp-2 mt-0.5 leading-relaxed">
                        {notif.message}
                      </p>

                      {/* Action Hint & Button */}
                      <div className="mt-2 flex items-center justify-between gap-2 pt-1 border-t border-stone-800/40">
                        {notif.actionLabel ? (
                          <span className="text-[11px] font-semibold text-amber-400 group-hover:text-amber-300 flex items-center gap-1">
                            {notif.actionLabel}
                            <ExternalLink className="w-3 h-3" />
                          </span>
                        ) : (
                          <span className="text-[10px] text-stone-500">Click to view</span>
                        )}

                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          {isUnread ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onMarkAsRead(notif.id);
                              }}
                              title="Mark as read"
                              className="p-1 rounded-md text-stone-400 hover:text-amber-400 hover:bg-stone-800 text-[10px] flex items-center gap-1"
                            >
                              <CheckCheck className="w-3 h-3" />
                            </button>
                          ) : null}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteNotification(notif.id);
                            }}
                            title="Delete notification"
                            className="p-1 rounded-md text-stone-500 hover:text-rose-400 hover:bg-stone-800"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-2.5 px-4 bg-stone-950/60 border-t border-stone-800 flex items-center justify-between text-[11px] text-stone-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Live Community Updates</span>
          </div>
          <span className="text-stone-500 text-[10px]">Instant Firestore sync</span>
        </div>
      </div>
    </>
  );
};
