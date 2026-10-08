import { matchRuns } from "../data/datasets/matchRuns";

import type { Notification } from "../types/notification";

import { getHospitalForOrgan, getOrgans } from "./organService";

import { getRecipients } from "./recipientService";

function compareNotifications(
  left: Notification,
  right: Notification
): number {
  return (right.date ?? "").localeCompare(left.date ?? "");
}

/**
 * Produces notifications that can be evidenced by the current datasets.
 *
 * Recipient data is loaded asynchronously from the backend.
 * Notifications are derived at read time.
 */
export async function getNotifications(): Promise<Notification[]> {
  const organs = getOrgans();

  const recipients = await getRecipients();

  const organNotifications: Notification[] = organs
    .filter(
      (organ) => organ.availabilityStatus === "Available"
    )
    .map((organ) => {
      const hospital = getHospitalForOrgan(organ);

      return {
        id: `organ-available-${organ.id}`,
        category: "organ",
        title: `Organ ${organ.id} is available`,
        description: `${organ.organType} (${organ.bloodGroup}) is available${
          hospital
            ? ` at ${hospital.name}, ${hospital.city}`
            : ""
        }.`,
        date: organ.recoveredAt,
      };
    });

  const recipientNotifications: Notification[] =
    recipients.flatMap((recipient) => {
      const notifications: Notification[] = [];

      if (recipient.urgency === "Critical") {
        notifications.push({
          id: `recipient-critical-${recipient.id}`,
          category: "recipient",
          title: `Critical recipient attention: ${recipient.id}`,
          description: `${recipient.requiredOrgan} is required; the recipient is currently ${recipient.status.toLowerCase()}.`,
          date: recipient.registrationDate,
        });
      }

      if (
        recipient.medicalStatus ===
        "Pending Verification"
      ) {
        notifications.push({
          id: `recipient-verification-${recipient.id}`,
          category: "recipient",
          title: `Verification pending for ${recipient.id}`,
          description: `${recipient.requiredOrgan} recipient record is marked Pending Verification.`,
          date: recipient.registrationDate,
        });
      }

      return notifications;
    });

  const matchingNotifications: Notification[] =
    matchRuns.map((run) => ({
      id: `match-run-${run.id}`,
      category: "matching",
      title: `Match run ${run.id}: ${run.status}`,
      description:
        run.status === "In Progress"
          ? `Matching review is in progress for organ ${run.organId}.`
          : `A ${run.status.toLowerCase()} matching run is recorded for organ ${run.organId}.`,
      date: run.startedAt,
    }));

  return [
    ...organNotifications,
    ...recipientNotifications,
    ...matchingNotifications,
  ].sort(compareNotifications);
}