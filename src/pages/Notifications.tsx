import { Bell, HeartPulse, PackageCheck, Stethoscope } from "lucide-react";
import Badge from "../components/common/Badge";
import Card from "../components/common/Card";
import PageHeader from "../components/common/PageHeader";
import { getNotifications } from "../services/notificationService";
import type { Notification, NotificationCategory } from "../types/notification";

const categoryLabels: Record<NotificationCategory, string> = {
  organ: "Organ inventory",
  recipient: "Recipient attention",
  matching: "Matching",
  system: "System",
};

const categoryBadgeTypes: Record<
  NotificationCategory,
  "success" | "warning" | "danger" | "info" | "neutral"
> = {
  organ: "success",
  recipient: "warning",
  matching: "info",
  system: "neutral",
};

function NotificationIcon({ category }: { category: NotificationCategory }) {
  const className = "h-5 w-5";

  switch (category) {
    case "organ":
      return <PackageCheck className={className} aria-hidden="true" />;
    case "recipient":
      return <HeartPulse className={className} aria-hidden="true" />;
    case "matching":
      return <Stethoscope className={className} aria-hidden="true" />;
    case "system":
      return <Bell className={className} aria-hidden="true" />;
  }
}

function formatNotificationDate(date?: string): string {
  if (!date) {
    return "No event date available";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: date.includes("T") ? "short" : undefined,
  }).format(parsedDate);
}

export default function Notifications() {
  const notifications = getNotifications();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Current dataset-derived coordination alerts. Read acknowledgement is not stored in this prototype."
      />

      <Card className="overflow-hidden">
        {notifications.length === 0 ? (
          <div className="flex min-h-56 flex-col items-center justify-center px-6 py-12 text-center">
            <div className="rounded-2xl bg-emerald-50 p-4 text-emerald-600">
              <Bell className="h-7 w-7" aria-hidden="true" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-slate-900">No current notifications</h2>
            <p className="mt-1 max-w-md text-sm text-slate-500">
              There are no dataset-derived organ, recipient, or persisted matching alerts to show.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-emerald-100" aria-label="Current notifications">
            {notifications.map((notification) => (
              <NotificationRow key={notification.id} notification={notification} />
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function NotificationRow({ notification }: { notification: Notification }) {
  return (
    <li className="flex gap-4 px-5 py-5 sm:px-6">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
        <NotificationIcon category={notification.category} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">{notification.title}</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">{notification.description}</p>
          </div>
          <Badge type={categoryBadgeTypes[notification.category]}>
            {categoryLabels[notification.category]}
          </Badge>
        </div>
        <p className="mt-3 text-xs font-medium text-slate-500">
          {formatNotificationDate(notification.date)}
        </p>
      </div>
    </li>
  );
}
