import { hospitals, type Hospital } from "../data/datasets/hospitals";
import {
  organs,
  type OrganInventoryRecord,
} from "../data/datasets/organs";
import { getDonorById } from "./donorService";
import type { Donor } from "../types/donor";

const API_URL = "http://127.0.0.1:8000";

/**
 * Existing in-memory organ inventory service.
 */
export function getOrgans(): OrganInventoryRecord[] {
  return [...organs];
}

export function getOrganById(
  id: string
): OrganInventoryRecord | undefined {
  return organs.find((organ) => organ.id === id);
}

export function getHospitalForOrgan(
  organ: OrganInventoryRecord
): Hospital | undefined {
  return hospitals.find(
    (hospital) => hospital.id === organ.hospitalId
  );
}

export function getDonorForOrgan(
  organ: OrganInventoryRecord
): Donor | undefined {
  return getDonorById(organ.donorId);
}

export function getOrgansByAvailability(
  availabilityStatus: OrganInventoryRecord["availabilityStatus"]
): OrganInventoryRecord[] {
  return organs.filter(
    (organ) =>
      organ.availabilityStatus === availabilityStatus
  );
}

/**
 * Backend organ record.
 *
 * These fields match the SQLite/FastAPI Organ model.
 */
export interface BackendOrgan {
  organ_id: string;
  donor_id: string;
  organ_type: string;
  retrieval_datetime: string;
  preservation_method: string;
  organ_condition_category: string;
  status: string;
  current_hospital_id: string;
}

/**
 * Load organs from the FastAPI backend.
 */
export async function getBackendOrgans(): Promise<BackendOrgan[]> {
  const response = await fetch(`${API_URL}/api/organs`);

  if (!response.ok) {
    throw new Error("Failed to load organs from backend");
  }

  return response.json();
}

/**
 * Load one organ from the FastAPI backend.
 */
export async function getBackendOrganById(
  organId: string
): Promise<BackendOrgan> {
  const response = await fetch(
    `${API_URL}/api/organs/${organId}`
  );

  if (!response.ok) {
    throw new Error("Organ not found");
  }

  return response.json();
}