export type Gender =
  | "Male"
  | "Female"
  | "Other";

export interface Donor {
  id: string;
  age: number;
  gender: Gender;
  bloodGroup: string;
  hospitalId: string;
}
