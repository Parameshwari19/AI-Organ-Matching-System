export type AuditCategory = "organ" | "recipient" | "matching";

/**
 * A limited, read-only audit view derived from timestamped dataset records.
 * It deliberately contains no user identity or inferred action history.
 */
export interface AuditEntry {
  id: string;
  category: AuditCategory;
  action: string;
  entityId: string;
  details: string;
  date: string;
}
