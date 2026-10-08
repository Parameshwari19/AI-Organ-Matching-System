import type { Recipient } from "../types/recipient";

import {
  hospitals,
  type Hospital,
} from "../data/datasets/hospitals";

/*
 * Recipient Service
 *
 * Recipients are now loaded from the FastAPI backend.
 *
 * Backend:
 * GET http://127.0.0.1:8000/api/recipients
 */

const API_URL = "http://127.0.0.1:8000";

/* -------------------------------------------------------------------------- */
/* BACKEND RESPONSE TYPE                                                      */
/* -------------------------------------------------------------------------- */

interface BackendRecipient {
  recipient_id: string;
  hospital_id: string;
  required_organ: string;
  age: number;
  sex: string;
  blood_group: string;
  registration_date: string;
  waiting_days: number;
  urgency_category: string;
  medical_risk_level: string;
  medical_history_category: string;
  active_status: string;
  consent_status: string;
}

/* -------------------------------------------------------------------------- */
/* URGENCY MAPPING                                                            */
/* -------------------------------------------------------------------------- */

/*
 * Backend urgency values:
 *
 * Routine       → Stable
 * Priority      → Moderate
 * Urgent        → High
 * Super_Urgent  → Critical
 *
 * This is only for the existing frontend UI.
 */

function mapUrgency(
  urgency: string
): Recipient["urgency"] {
  switch (urgency) {
    case "Super_Urgent":
      return "Critical";

    case "Urgent":
      return "High";

    case "Priority":
      return "Moderate";

    case "Routine":
      return "Stable";

    default:
      return "Stable";
  }
}

/* -------------------------------------------------------------------------- */
/* STATUS MAPPING                                                             */
/* -------------------------------------------------------------------------- */

function mapStatus(
  status: string
): Recipient["status"] {
  switch (status) {
    case "Active":
      return "Waiting";

    case "Temporarily_Inactive":
      return "Inactive";

    default:
      return "Inactive";
  }
}

/* -------------------------------------------------------------------------- */
/* BACKEND → FRONTEND MAPPING                                                 */
/* -------------------------------------------------------------------------- */

function mapBackendRecipient(
  recipient: BackendRecipient
): Recipient {

  const hospital = hospitals.find(
    (item) => item.id === recipient.hospital_id
  );

  return {
    id: recipient.recipient_id,

    age: recipient.age,

    gender: recipient.sex,

    bloodGroup: recipient.blood_group,

    requiredOrgan: recipient.required_organ,

    medicalStatus: recipient.medical_risk_level,

    hospital:
      hospital?.name ?? recipient.hospital_id,

    location:
      hospital?.city ?? "Unknown",

    urgency: mapUrgency(
      recipient.urgency_category
    ),

    registrationDate:
      recipient.registration_date,

    waitingDays:
      recipient.waiting_days,

    status: mapStatus(
      recipient.active_status
    ),
  };
}

/* -------------------------------------------------------------------------- */
/* READ                                                                       */
/* -------------------------------------------------------------------------- */

/*
 * Get recipients from FastAPI / SQLite.
 *
 * IMPORTANT:
 * This function is now asynchronous because it uses fetch().
 */

export async function getRecipients(): Promise<Recipient[]> {

  const response = await fetch(
    `${API_URL}/api/recipients`
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch recipients from backend."
    );
  }

  const data: BackendRecipient[] =
    await response.json();

  return data.map(
    mapBackendRecipient
  );
}

/* -------------------------------------------------------------------------- */
/* GET RECIPIENT BY ID                                                        */
/* -------------------------------------------------------------------------- */

export async function getRecipientById(
  id: string
): Promise<Recipient | undefined> {

  try {

    const response = await fetch(
      `${API_URL}/api/recipients/${id}`
    );

    if (!response.ok) {
      return undefined;
    }

    const data: BackendRecipient =
      await response.json();

    return mapBackendRecipient(data);

  } catch (error) {

    console.error(
      "Error fetching recipient:",
      error
    );

    return undefined;
  }
}

/* -------------------------------------------------------------------------- */
/* HOSPITAL LOOKUP                                                            */
/* -------------------------------------------------------------------------- */

export function getHospitalForRecipient(
  recipient: Recipient
): Hospital | undefined {

  return hospitals.find(
    (hospital) =>
      hospital.name === recipient.hospital
  );
}

/* -------------------------------------------------------------------------- */
/* SEARCH                                                                     */
/* -------------------------------------------------------------------------- */

export async function searchRecipients(
  query: string
): Promise<Recipient[]> {

  const recipients =
    await getRecipients();

  const searchText =
    query.trim().toLowerCase();

  if (!searchText) {
    return recipients;
  }

  return recipients.filter(
    (recipient) => {

      const hospital =
        getHospitalForRecipient(
          recipient
        );

      return (
        recipient.id
          .toLowerCase()
          .includes(searchText) ||

        hospital?.name
          ?.toLowerCase()
          .includes(searchText) ||

        hospital?.city
          ?.toLowerCase()
          .includes(searchText) ||

        recipient.bloodGroup
          .toLowerCase()
          .includes(searchText) ||

        recipient.requiredOrgan
          .toLowerCase()
          .includes(searchText)
      );
    }
  );
}

/* -------------------------------------------------------------------------- */
/* FILTERS                                                                    */
/* -------------------------------------------------------------------------- */

export async function getRecipientsByBloodGroup(
  bloodGroup: string
): Promise<Recipient[]> {

  const recipients =
    await getRecipients();

  if (bloodGroup === "All") {
    return recipients;
  }

  return recipients.filter(
    (recipient) =>
      recipient.bloodGroup === bloodGroup
  );
}

export async function getRecipientsByOrgan(
  organType: string
): Promise<Recipient[]> {

  const recipients =
    await getRecipients();

  if (organType === "All") {
    return recipients;
  }

  return recipients.filter(
    (recipient) =>
      recipient.requiredOrgan === organType
  );
}

export async function getRecipientsByUrgency(
  urgency: string
): Promise<Recipient[]> {

  const recipients =
    await getRecipients();

  if (urgency === "All") {
    return recipients;
  }

  return recipients.filter(
    (recipient) =>
      recipient.urgency === urgency
  );
}

export async function getWaitingRecipients(): Promise<
  Recipient[]
> {

  const recipients =
    await getRecipients();

  return recipients.filter(
    (recipient) =>
      recipient.status === "Waiting"
  );
}

export async function getCriticalRecipients(): Promise<
  Recipient[]
> {

  const recipients =
    await getRecipients();

  return recipients.filter(
    (recipient) =>
      recipient.urgency === "Critical"
  );
}

export async function getHighPriorityRecipients(): Promise<
  Recipient[]
> {

  const recipients =
    await getRecipients();

  return recipients.filter(
    (recipient) =>
      recipient.urgency === "High"
  );
}

/* -------------------------------------------------------------------------- */
/* CREATE                                                                     */
/* -------------------------------------------------------------------------- */

/*
 * Recipient creation is already handled by AddRecipient.tsx
 * through POST /api/recipients.
 *
 * We do not use the old in-memory createRecipient()
 * anymore.
 */

/* -------------------------------------------------------------------------- */
/* UPDATE                                                                     */
/* -------------------------------------------------------------------------- */

/*
 * Update functionality will be connected to FastAPI
 * when the backend update endpoint is implemented.
 */

/* -------------------------------------------------------------------------- */
/* DELETE                                                                     */
/* -------------------------------------------------------------------------- */

/*
 * Delete functionality will be connected to FastAPI
 * when the backend delete endpoint is implemented.
 */

/* -------------------------------------------------------------------------- */
/* STATISTICS                                                                 */
/* -------------------------------------------------------------------------- */

export async function getRecipientCount(): Promise<number> {

  const recipients =
    await getRecipients();

  return recipients.length;
}

export async function getCriticalRecipientCount(): Promise<number> {

  const recipients =
    await getRecipients();

  return recipients.filter(
    (recipient) =>
      recipient.urgency === "Critical"
  ).length;
}

export async function getHighPriorityRecipientCount(): Promise<number> {

  const recipients =
    await getRecipients();

  return recipients.filter(
    (recipient) =>
      recipient.urgency === "High"
  ).length;
}

export async function getWaitingRecipientCount(): Promise<number> {

  const recipients =
    await getRecipients();

  return recipients.filter(
    (recipient) =>
      recipient.status === "Waiting"
  ).length;
}