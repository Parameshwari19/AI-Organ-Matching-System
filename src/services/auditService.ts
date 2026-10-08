import { matchRuns } from "../data/datasets/matchRuns";
import type { AuditEntry } from "../types/audit";
import { getHospitalForOrgan, getOrgans } from "./organService";
import { getRecipients } from "./recipientService";

function compareAuditEntries(left: AuditEntry, right: AuditEntry): number {
  return right.date.localeCompare(left.date);
}

/**
 * Builds a limited audit view from records that contain a source timestamp.
 * This does not infer status changes, approvals, user identities, or actions
 * that have not been persisted by the current prototype.
 */
export function getAuditEntries(): AuditEntry[] {
  const organEntries: AuditEntry[] = getOrgans()
    .filter((organ) => organ.recoveredAt)
    .map((organ) => {
      const hospital = getHospitalForOrgan(organ);

      return {
        id: `organ-record-${organ.id}`,
        category: "organ",
        action: "Organ recovery record",
        entityId: organ.id,
        details: `${organ.organType} (${organ.bloodGroup}); current inventory status: ${organ.availabilityStatus}${hospital ? ` at ${hospital.name}, ${hospital.city}` : ""}.`,
        date: organ.recoveredAt as string,
      };
    });

  const recipientEntries: AuditEntry[] = getRecipients()
    .filter(
      (recipient) =>
        recipient.urgency === "Critical" || recipient.urgency === "High"
    )
    .map((recipient) => ({
      id: `recipient-priority-${recipient.id}`,
      category: "recipient",
      action: "Recipient priority record",
      entityId: recipient.id,
      details: `Current urgency: ${recipient.urgency}; required organ: ${recipient.requiredOrgan}; current status: ${recipient.status}.`,
      date: recipient.registrationDate,
    }));

  const matchingEntries: AuditEntry[] = matchRuns.map((run) => ({
    id: `match-run-${run.id}`,
    category: "matching",
    action: "Matching run recorded",
    entityId: run.id,
    details: `Organ: ${run.organId}; current run status: ${run.status}.`,
    date: run.startedAt,
  }));

  return [...organEntries, ...recipientEntries, ...matchingEntries].sort(
    compareAuditEntries
  );
}
