export type RecipientStatus =
  | "Active"
  | "Waiting"
  | "Matched"
  | "Allocated"
  | "Transplanted"
  | "Inactive";

export type RecipientUrgency =
  | "Critical"
  | "High"
  | "Moderate"
  | "Stable";

export type MedicalStatus =
  | "Verified"
  | "Pending Verification"
  | "Rejected";

export type Gender =
  | "Male"
  | "Female"
  | "Other";

export interface Recipient {
  id: string;

  age: number;

  gender: Gender;

  bloodGroup: string;

  requiredOrgan: string;

  medicalStatus: MedicalStatus;

  location: string;

  hospital: string;

  urgency: RecipientUrgency;

  registrationDate: string;

  waitingDays: number;

  status: RecipientStatus;
}