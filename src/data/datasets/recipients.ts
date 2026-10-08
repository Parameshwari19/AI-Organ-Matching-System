import type { Recipient } from "../../types/recipient";

/** Seed recipient records for the prototype's in-memory data store. */
export const recipients: Recipient[] = [
  { id: "R001", age: 42, gender: "Male", bloodGroup: "O+", requiredOrgan: "Kidney", medicalStatus: "Verified", location: "Chennai", hospital: "Apollo Hospital", urgency: "Critical", registrationDate: "2026-07-02", waitingDays: 42, status: "Waiting" },
  { id: "R002", age: 51, gender: "Female", bloodGroup: "A+", requiredOrgan: "Liver", medicalStatus: "Verified", location: "Coimbatore", hospital: "KMCH Hospital", urgency: "High", registrationDate: "2026-07-14", waitingDays: 31, status: "Waiting" },
  { id: "R003", age: 36, gender: "Male", bloodGroup: "B+", requiredOrgan: "Heart", medicalStatus: "Verified", location: "Chennai", hospital: "Apollo Hospital", urgency: "High", registrationDate: "2026-07-18", waitingDays: 27, status: "Waiting" },
  { id: "R004", age: 29, gender: "Female", bloodGroup: "AB+", requiredOrgan: "Kidney", medicalStatus: "Verified", location: "Bangalore", hospital: "Manipal Hospital", urgency: "Moderate", registrationDate: "2026-07-22", waitingDays: 21, status: "Waiting" },
  { id: "R005", age: 47, gender: "Male", bloodGroup: "O-", requiredOrgan: "Liver", medicalStatus: "Pending Verification", location: "Salem", hospital: "SKS Hospital", urgency: "Moderate", registrationDate: "2026-07-25", waitingDays: 18, status: "Waiting" },
  { id: "R006", age: 33, gender: "Female", bloodGroup: "A-", requiredOrgan: "Kidney", medicalStatus: "Verified", location: "Madurai", hospital: "Meenakshi Mission Hospital", urgency: "Stable", registrationDate: "2026-07-29", waitingDays: 14, status: "Waiting" },
  { id: "R007", age: 58, gender: "Male", bloodGroup: "B-", requiredOrgan: "Liver", medicalStatus: "Verified", location: "Chennai", hospital: "MGM Healthcare", urgency: "Critical", registrationDate: "2026-08-01", waitingDays: 11, status: "Waiting" },
  { id: "R008", age: 40, gender: "Female", bloodGroup: "O+", requiredOrgan: "Heart", medicalStatus: "Verified", location: "Coimbatore", hospital: "KG Hospital", urgency: "Stable", registrationDate: "2026-08-05", waitingDays: 7, status: "Waiting" },
];
