import type { Donor } from "../types/donor";
import { donors as donorData } from "../data/datasets/donors";
import { hospitals, type Hospital } from "../data/datasets/hospitals";
import { organs, type OrganInventoryRecord } from "../data/datasets/organs";

let donors: Donor[] = [...donorData];

export function getDonors(): Donor[] {
  return [...donors];
}

export function getDonorById(id: string): Donor | undefined {
  return donors.find((donor) => donor.id === id);
}

export function getHospitalForDonor(donor: Donor): Hospital | undefined {
  return hospitals.find((hospital) => hospital.id === donor.hospitalId);
}

export function getOrgansForDonor(donorId: string): OrganInventoryRecord[] {
  return organs.filter((organ) => organ.donorId === donorId);
}

export function getPrimaryOrganForDonor(
  donorId: string
): OrganInventoryRecord | undefined {
  return getOrgansForDonor(donorId)[0];
}

export function createDonor(donor: Donor): Donor {
  donors.push(donor);
  return donor;
}

export function updateDonor(updatedDonor: Donor): Donor | undefined {
  const index = donors.findIndex((donor) => donor.id === updatedDonor.id);

  if (index === -1) {
    return undefined;
  }

  donors[index] = updatedDonor;

  return updatedDonor;
}

export function deleteDonor(id: string): boolean {
  const index = donors.findIndex((donor) => donor.id === id);

  if (index === -1) {
    return false;
  }

  donors.splice(index, 1);

  return true;
}
