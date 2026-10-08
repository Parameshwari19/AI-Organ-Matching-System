export type StaffRole = "Transplant Coordinator" | "Surgeon" | "Administrator";

export interface StaffMember {
  id: string;
  name: string;
  role: StaffRole;
  hospitalId: string;
}

export const staff: StaffMember[] = [
  { id: "S001", name: "Dr. Ananya Iyer", role: "Transplant Coordinator", hospitalId: "H003" },
  { id: "S002", name: "Dr. Arjun Menon", role: "Surgeon", hospitalId: "H002" },
  { id: "S003", name: "Priya Nair", role: "Administrator", hospitalId: "H001" },
];
