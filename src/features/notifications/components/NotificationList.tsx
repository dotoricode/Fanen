'use client';

import { useNotifications } from '../hooks/useNotifications';

/** 알림 타입별 아이콘 색상 */
const TYPE_COLORS: Record<string, string> = {
  signal: 'bg-green-100 text-green-600',
  report: 'bg-blue-100 text-blue-600',
  info: 'bg-yellow-100 text-yellow-600',
  system: 'bg-gray-100 text-gray-600',
};

/** 알림 목록 컴포넌트 — 읽음/안읽음 구분 */
export default function NotificationList() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  if (notifications.length === 0) {
    return <p className="text-center text-gray-500 dark:text-zinc-500 py-8">알림이 없습니다.</p>;
  }

  return (
    <div className="space-y-3">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-zinc-500">
          안읽은 알림 <span className="font-bold text-blue-600">{unreadCount}</span>건
        </p>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllAsRead}
            className="text-sm text-blue-600 hover:underline"
          >
            모두 읽음
          </button>
        )}
      </div>

      {/* 알림 목록 */}
      <ul className="divide-y divide-gray-100 dark:divide-slate-700">
        {notifications.map((notification) => (
          <li
            key={notification.id}
            className={`flex items-start gap-3 rounded-lg p-3 transition-colors cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-700 ${
              !notification.isRead ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''
            }`}
            onClick={() => markAsRead(notification.id)}
          >
            {/* 타입 아이콘 */}
            <div className={`mt-0.5 h-8 w-8 flex-shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${TYPE_COLORS[notification.type] ?? TYPE_COLORS.info}`}>
              {notification.type === 'signal' && '신'}
              {notification.type === 'report' && '리'}
              {notification.type === 'info' && '정'}
              {notification.type === 'system' && '시'}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className={`text-sm truncate ${!notification.isRead ? 'font-bold text-gray-900 dark:text-zinc-100' : 'font-medium text-gray-700 dark:text-zinc-300'}`}>
                  {notification.title}
                </p>
                {!notification.isRead && (
                  <span className="h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-zinc-500 mt-0.5 line-clamp-1">{notification.message}</p>
              <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">
                {new Date(notification.createdAt).toLocaleString('ko-KR')}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
