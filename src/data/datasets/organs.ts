export type OrganAvailabilityStatus = "Available" | "Reserved" | "Allocated" | "Transplanted" | "Expired";

export interface OrganInventoryRecord {
  id: string;
  donorId: string;
  organType: string;
  bloodGroup: string;
  hospitalId: string;
  location: string;
  availabilityStatus: OrganAvailabilityStatus;
  recoveredAt?: string;
}

export const organs: OrganInventoryRecord[] = [
  { id: "O001", donorId: "D001", organType: "Kidney", bloodGroup: "O+", hospitalId: "H001", location: "Chennai", availabilityStatus: "Available", recoveredAt: "2026-08-14T08:30:00Z" },
  { id: "O002", donorId: "D002", organType: "Liver", bloodGroup: "A+", hospitalId: "H002", location: "Coimbatore", availabilityStatus: "Allocated", recoveredAt: "2026-08-12T06:15:00Z" },
  { id: "O003", donorId: "D003", organType: "Heart", bloodGroup: "B+", hospitalId: "H003", location: "Chennai", availabilityStatus: "Available", recoveredAt: "2026-08-15T05:45:00Z" },
  { id: "O004", donorId: "D004", organType: "Kidney", bloodGroup: "AB+", hospitalId: "H004", location: "Bangalore", availabilityStatus: "Reserved", recoveredAt: "2026-08-10T09:00:00Z" },
  { id: "O005", donorId: "D005", organType: "Liver", bloodGroup: "O-", hospitalId: "H005", location: "Salem", availabilityStatus: "Available" },
  { id: "O006", donorId: "D006", organType: "Kidney", bloodGroup: "A-", hospitalId: "H006", location: "Madurai", availabilityStatus: "Available" },
  { id: "O007", donorId: "D007", organType: "Heart", bloodGroup: "B-", hospitalId: "H008", location: "Bangalore", availabilityStatus: "Allocated" },
  { id: "O008", donorId: "D008", organType: "Kidney", bloodGroup: "O+", hospitalId: "H007", location: "Chennai", availabilityStatus: "Transplanted" },
];
