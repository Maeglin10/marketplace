'use client';

import { useState, useEffect, useCallback } from 'react';
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

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const TYPE_ICONS: Record<NotificationType, string> = {
  ORDER_PLACED: '\u{1F6D2}',
  ORDER_STATUS_UPDATE: '\u{1F4E6}',
  NEW_MESSAGE: '\u{1F4AC}',
  NEW_REVIEW: '\u{2B50}',
  DISPUTE_UPDATE: '\u{26A0}',
  PAYMENT_RECEIVED: '\u{1F4B0}',
};

const TYPE_LABELS: Record<NotificationType, string> = {
  ORDER_PLACED: 'Commande',
  ORDER_STATUS_UPDATE: 'Statut commande',
  NEW_MESSAGE: 'Message',
  NEW_REVIEW: 'Avis',
  DISPUTE_UPDATE: 'Litige',
  PAYMENT_RECEIVED: 'Paiement',
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

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  const fetchNotifications = useCallback(
    async (pageNum: number) => {
      if (!user) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/notifications?page=${pageNum}&limit=20`, {
          credentials: 'include',
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data.success) {
          setNotifications(data.data.notifications);
          setPagination(data.data.pagination);
          setUnreadCount(data.data.unreadCount);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  useEffect(() => {
    if (!authLoading) fetchNotifications(page);
  }, [fetchNotifications, page, authLoading]);

  async function markAllRead() {
    if (!user) return;
    setMarking(true);
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        credentials: 'include',
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      // silently fail
    } finally {
      setMarking(false);
    }
  }

  async function markOneRead(id: string) {
    if (!user) return;
    try {
      await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        credentials: 'include',
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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              {unreadCount} non {unreadCount > 1 ? 'lues' : 'lue'}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            disabled={marking}
            className="text-sm font-medium text-gray-700 hover:text-black border border-gray-300 rounded-lg px-4 py-2 transition-colors disabled:opacity-50"
          >
            {marking ? 'Traitement...' : 'Tout marquer comme lu'}
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-100 rounded-xl h-20" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">&#x1F514;</div>
          <h2 className="text-lg font-medium text-gray-700">Aucune notification</h2>
          <p className="text-sm text-gray-400 mt-1">Vous n'avez pas encore de notifications.</p>
          <Link
            href="/"
            className="inline-block mt-6 text-sm font-medium text-gray-700 hover:text-black underline"
          >
            Retour a l'accueil
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {notifications.map((notif) => {
              const icon = TYPE_ICONS[notif.type] ?? '\u{1F514}';
              const label = TYPE_LABELS[notif.type] ?? notif.type;
              const card = (
                <div
                  className={`flex gap-4 p-4 rounded-xl border transition-colors ${
                    !notif.read
                      ? 'bg-gray-50 border-gray-200'
                      : 'bg-white border-gray-100 hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    if (!notif.read) markOneRead(notif.id);
                  }}
                >
                  <span className="text-2xl flex-shrink-0 leading-none mt-0.5">{icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                          {label}
                        </span>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-black" />
                        )}
                      </div>
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {timeAgo(notif.createdAt)}
                      </span>
                    </div>
                    <p className={`text-sm text-gray-900 font-medium leading-snug ${!notif.read ? 'font-semibold' : ''}`}>
                      {notif.title}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5 leading-snug">{notif.message}</p>
                  </div>
                </div>
              );

              return notif.link ? (
                <Link
                  key={notif.id}
                  href={notif.link}
                  onClick={() => {
                    if (!notif.read) markOneRead(notif.id);
                  }}
                  className="block cursor-pointer"
                >
                  {card}
                </Link>
              ) : (
                <div key={notif.id} className="cursor-default">
                  {card}
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="text-sm font-medium text-gray-700 hover:text-black disabled:opacity-40 disabled:cursor-not-allowed border border-gray-300 rounded-lg px-4 py-2 transition-colors"
              >
                Precedent
              </button>
              <span className="text-sm text-gray-500">
                Page {pagination.page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page >= pagination.totalPages}
                className="text-sm font-medium text-gray-700 hover:text-black disabled:opacity-40 disabled:cursor-not-allowed border border-gray-300 rounded-lg px-4 py-2 transition-colors"
              >
                Suivant
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
