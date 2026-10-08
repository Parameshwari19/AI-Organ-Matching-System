export type NotificationCategory =
  | "organ"
  | "recipient"
  | "matching"
  | "system";

/**
 * A non-persisted notification derived from the current in-memory datasets.
 * Read state is intentionally omitted because the prototype has no
 * notification persistence or acknowledgement workflow.
 */
export interface Notification {
  id: string;
  category: NotificationCategory;
  title: string;
  description: string;
  date?: string;
}
