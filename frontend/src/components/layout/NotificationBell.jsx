import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCheck,
  MessageCircle,
  PackageCheck,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";

import {
  deleteNotification,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  subscribeToNotifications,
} from "../../services/notifications";
import { supabase } from "../../lib/supabase";
import useClickOutside from "../../hooks/useClickOutside";

const typeStyles = {
  message: {
    icon: MessageCircle,
    className: "bg-sky-50 text-sky-600 ring-sky-100",
  },
  swap_request: {
    icon: RefreshCw,
    className: "bg-pink-50 text-pink-600 ring-pink-100",
  },
  swap_accepted: {
    icon: PackageCheck,
    className: "bg-emerald-50 text-emerald-600 ring-emerald-100",
  },
  swap_completed: {
    icon: PackageCheck,
    className: "bg-violet-50 text-violet-600 ring-violet-100",
  },
};

function formatTime(value) {
  if (!value) return "";

  const diff = Date.now() - new Date(value).getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return "Now";
  if (diff < hour) return `${Math.floor(diff / minute)}m`;
  if (diff < day) return `${Math.floor(diff / hour)}h`;
  return `${Math.floor(diff / day)}d`;
}

export default function NotificationBell({ userId, variant = "desktop", onNavigate }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useClickOutside(dropdownRef, () => setOpen(false), open && variant === "desktop");

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.is_read).length,
    [notifications]
  );

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!userId) {
        setNotifications([]);
        return;
      }

      setLoading(true);
      const response = await getNotifications(userId);
      if (mounted && response.success) setNotifications(response.data || []);
      if (mounted) setLoading(false);
    }

    load();

    const channel = subscribeToNotifications(userId, (notice, eventType) => {
      setNotifications((prev) => {
        if (eventType === "DELETE") return prev.filter((item) => item.id !== notice.id);

        const exists = prev.some((item) => item.id === notice.id);
        const next = exists
          ? prev.map((item) => (item.id === notice.id ? notice : item))
          : [notice, ...prev];

        return next
          .slice()
          .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
          .slice(0, 30);
      });
    });

    return () => {
      mounted = false;
      if (channel) supabase.removeChannel(channel);
    };
  }, [userId]);

  async function handleOpenNotice(notice) {
    await markNotificationRead(notice.id);
    setNotifications((prev) =>
      prev.map((item) => (item.id === notice.id ? { ...item, is_read: true } : item))
    );

    setOpen(false);
    onNavigate?.();
    if (notice.link) navigate(notice.link);
  }

  async function handleMarkAll() {
    await markAllNotificationsRead(userId);
    setNotifications((prev) => prev.map((item) => ({ ...item, is_read: true })));
  }

  async function handleDelete(event, noticeId) {
    event.stopPropagation();
    await deleteNotification(noticeId);
    setNotifications((prev) => prev.filter((item) => item.id !== noticeId));
  }

  const isSheet = variant !== "desktop";

  return (
    <div ref={dropdownRef} className={isSheet ? "" : "relative"}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={
          isSheet
            ? "relative flex h-12 w-full items-center justify-between rounded-2xl bg-slate-50 px-5 font-black transition hover:bg-pink-50 hover:text-pink-500"
            : "relative flex h-11 w-11 items-center justify-center rounded-full border border-pink-100 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:bg-pink-50"
        }
      >
        <span className={isSheet ? "flex items-center gap-3" : "sr-only"}>
          {isSheet && <Bell size={19} />}
          Notifications
        </span>
        {!isSheet && <Bell size={19} />}

        {unreadCount > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-pink-500 px-1 text-[11px] font-black text-white ring-2 ring-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className={
            isSheet
              ? "fixed inset-0 z-[1200] bg-black/45 backdrop-blur-sm"
              : "absolute right-0 top-[62px] z-[1200] w-[min(390px,calc(100vw-32px))]"
          }
        >
          {isSheet && <button className="absolute inset-0 cursor-default" onClick={() => setOpen(false)} />}

          <section
            className={
              isSheet
                ? "absolute bottom-0 left-0 right-0 max-h-[84vh] overflow-hidden rounded-t-[34px] border border-pink-100 bg-white shadow-2xl sm:left-auto sm:right-5 sm:top-5 sm:h-[min(720px,calc(100vh-40px))] sm:w-[430px] sm:rounded-[30px]"
                : "overflow-hidden rounded-[28px] border border-pink-100 bg-white/95 shadow-[0_28px_80px_rgba(255,79,163,0.2)] backdrop-blur-2xl"
            }
          >
            <div className="flex items-center justify-between border-b border-pink-50 p-4">
              <div>
                <h3 className="text-lg font-black">Notifications</h3>
                <p className="text-xs font-bold text-slate-400">
                  {unreadCount > 0 ? `${unreadCount} unread update${unreadCount > 1 ? "s" : ""}` : "All caught up"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {notifications.length > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAll}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-50 text-pink-500 transition hover:bg-pink-100"
                    title="Mark all read"
                  >
                    <CheckCheck size={18} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 transition hover:bg-slate-100"
                  title="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="max-h-[min(560px,62vh)] overflow-y-auto p-3">
              {loading ? (
                <div className="rounded-2xl bg-pink-50 p-4 text-sm font-black text-pink-500">
                  Loading updates...
                </div>
              ) : notifications.length === 0 ? (
                <div className="rounded-2xl bg-pink-50/70 p-5">
                  <h4 className="text-sm font-black">No notifications yet</h4>
                  <p className="mt-1 text-sm text-slate-500">
                    Swap requests, chat messages, and item updates will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.map((notice) => (
                    <NotificationRow
                      key={notice.id}
                      notice={notice}
                      onOpen={() => handleOpenNotice(notice)}
                      onDelete={(event) => handleDelete(event, notice.id)}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-pink-50 p-3">
              <Link
                to="/swaps"
                onClick={() => {
                  setOpen(false);
                  onNavigate?.();
                }}
                className="flex h-11 items-center justify-center rounded-full bg-slate-950 text-sm font-black text-white transition hover:bg-pink-500"
              >
                View Swap Requests
              </Link>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function NotificationRow({ notice, onOpen, onDelete }) {
  const style = typeStyles[notice.type] || {
    icon: Bell,
    className: "bg-slate-50 text-slate-600 ring-slate-100",
  };
  const Icon = style.icon;

  return (
    <button
      type="button"
      onClick={onOpen}
      className={`group flex w-full gap-3 rounded-2xl p-3 text-left transition hover:bg-pink-50 ${
        notice.is_read ? "bg-white" : "bg-pink-50/80"
      }`}
    >
      <span
        className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ring-1 ${style.className}`}
      >
        <Icon size={18} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-start justify-between gap-2">
          <span className="line-clamp-1 text-sm font-black text-slate-950">{notice.title}</span>
          <span className="shrink-0 text-[11px] font-black text-slate-400">
            {formatTime(notice.created_at)}
          </span>
        </span>
        <span className="mt-1 line-clamp-2 text-sm leading-5 text-slate-500">{notice.message}</span>
      </span>

      <span
        role="button"
        tabIndex={0}
        onClick={onDelete}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") onDelete(event);
        }}
        className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-300 opacity-0 transition hover:bg-white hover:text-red-500 group-hover:opacity-100"
        title="Delete notification"
      >
        <Trash2 size={15} />
      </span>
    </button>
  );
}
