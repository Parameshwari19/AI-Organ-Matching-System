import type { Donor } from "../../types/donor";

/** Seed donor records for the prototype's in-memory data store. */
export const donors: Donor[] = [
  { id: "D001", age: 35, gender: "Male", bloodGroup: "O+", hospitalId: "H001" },
  { id: "D002", age: 42, gender: "Female", bloodGroup: "A+", hospitalId: "H002" },
  { id: "D003", age: 29, gender: "Male", bloodGroup: "B+", hospitalId: "H003" },
  { id: "D004", age: 51, gender: "Female", bloodGroup: "AB+", hospitalId: "H004" },
  { id: "D005", age: 38, gender: "Male", bloodGroup: "O-", hospitalId: "H005" },
  { id: "D006", age: 46, gender: "Female", bloodGroup: "A-", hospitalId: "H006" },
  { id: "D007", age: 31, gender: "Male", bloodGroup: "B-", hospitalId: "H008" },
  { id: "D008", age: 55, gender: "Female", bloodGroup: "O+", hospitalId: "H007" },
];
