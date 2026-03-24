'use client';

import NotificationList from '@/features/notifications/components/NotificationList';

/** 알림 센터 페이지 */
export default function NotificationsPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-slate-100">알림 센터</h1>
      <NotificationList />
      </div>
    </main>
  );
}
