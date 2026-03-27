'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

type NotificationType =
  | 'ORDER_PLACED'
  | 'ORDER_STATUS_UPDATE'
  | 'NEW_MESSAGE'
  | 'NEW_REVIEW'
  | 'DISPUTE_UPDATE'
  | 'PAYMENT_RECEIVED';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string | null;
  read: boolean;
  createdAt: string;
}

const TYPE_ICONS: Record<NotificationType, string> = {
  ORDER_PLACED: '\u{1F6D2}',
  ORDER_STATUS_UPDATE: '\u{1F4E6}',
  NEW_MESSAGE: '\u{1F4AC}',
  NEW_REVIEW: '\u{2B50}',
  DISPUTE_UPDATE: '\u{26A0}',
  PAYMENT_RECEIVED: '\u{1F4B0}',
};

function timeAgo(dateString: string): string {
  const now = Date.now();
  const date = new Date(dateString).getTime();
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return 'il y a quelques secondes';
  if (diff < 3600) {
    const mins = Math.floor(diff / 60);
    return `il y a ${mins} min${mins > 1 ? 's' : ''}`;
  }
  if (diff < 86400) {
    const hours = Math.floor(diff / 3600);
    return `il y a ${hours} h`;
  }
  const days = Math.floor(diff / 86400);
  return `il y a ${days} jour${days > 1 ? 's' : ''}`;
}

function truncate(text: string, max = 80): string {
  return text.length > max ? text.slice(0, max) + '...' : text;
}

export function NotificationCenter() {
  const { token } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/notifications?limit=10', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data.notifications);
        setUnreadCount(data.data.unreadCount);
      }
    } catch {
      // silently fail
    }
  }, [token]);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Polling every 30 seconds
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [token, fetchNotifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  async function markAllRead() {
    if (!token) return;
    setLoading(true);
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  async function markOneRead(id: string) {
    if (!token) return;
    try {
      await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // silently fail
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-black"
        aria-label="Notifications"
      >
        <svg
          className="w-6 h-6 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={1.8}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-black text-white text-[10px] font-bold leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="font-semibold text-gray-900">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                disabled={loading}
                className="text-xs text-gray-500 hover:text-black transition-colors disabled:opacity-50"
              >
                Tout marquer comme lu
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-400 text-sm">
                Aucune notification
              </div>
            ) : (
              notifications.map((notif) => {
                const icon = TYPE_ICONS[notif.type] ?? '\u{1F514}';
                const inner = (
                  <div
                    className={`flex gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${
                      !notif.read ? 'bg-gray-50' : ''
                    }`}
                    onClick={() => {
                      if (!notif.read) markOneRead(notif.id);
                    }}
                  >
                    <span className="text-xl flex-shrink-0 leading-none mt-0.5">{icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-medium text-gray-900 leading-snug ${!notif.read ? 'font-semibold' : ''}`}>
                          {notif.title}
                        </p>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-black flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 leading-snug">
                        {truncate(notif.message)}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{timeAgo(notif.createdAt)}</p>
                    </div>
                  </div>
                );

                return notif.link ? (
                  <Link
                    key={notif.id}
                    href={notif.link}
                    onClick={() => {
                      setOpen(false);
                      if (!notif.read) markOneRead(notif.id);
                    }}
                    className="block"
                  >
                    {inner}
                  </Link>
                ) : (
                  <div key={notif.id}>{inner}</div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-100">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="block text-center text-sm font-medium text-gray-700 hover:text-black transition-colors"
            >
              Voir toutes les notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
