import { matchRuns } from "../data/datasets/matchRuns";
import { hospitals, type Hospital } from "../data/datasets/hospitals";
import { getDonors } from "./donorService";
import { getOrgans } from "./organService";
import {
  getHospitalForRecipient,
  getRecipients,
} from "./recipientService";

export interface ReportDistribution {
  label: string;
  count: number;
  percentage: number;
}

export interface HospitalReportRow {
  hospital: Hospital;
  donors: number;
  organs: number;
  recipients: number;
}

export interface ReportsData {
  donorTotal: number;
  donorByGender: ReportDistribution[];
  donorByBloodGroup: ReportDistribution[];
  recipientTotal: number;
  recipientByBloodGroup: ReportDistribution[];
  recipientByRequiredOrgan: ReportDistribution[];
  recipientByUrgency: ReportDistribution[];
  organTotal: number;
  organByType: ReportDistribution[];
  organByBloodGroup: ReportDistribution[];
  organByAvailability: ReportDistribution[];
  matchRunTotal: number;
  matchRunsByStatus: ReportDistribution[];
  hospitals: HospitalReportRow[];
}

function toDistribution(values: string[]): ReportDistribution[] {
  const total = values.length;
  const counts = new Map<string, number>();

  values.forEach((value) => {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  });

  return [...counts.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([label, count]) => ({
      label,
      count,
      percentage: total === 0 ? 0 : Math.round((count / total) * 100),
    }));
}

/** Builds deterministic reports from the current in-memory service data. */
export function getReportsData(): ReportsData {
  const donors = getDonors();
  const recipients = getRecipients();
  const organs = getOrgans();

  return {
    donorTotal: donors.length,
    donorByGender: toDistribution(donors.map((donor) => donor.gender)),
    donorByBloodGroup: toDistribution(donors.map((donor) => donor.bloodGroup)),
    recipientTotal: recipients.length,
    recipientByBloodGroup: toDistribution(
      recipients.map((recipient) => recipient.bloodGroup)
    ),
    recipientByRequiredOrgan: toDistribution(
      recipients.map((recipient) => recipient.requiredOrgan)
    ),
    recipientByUrgency: toDistribution(
      recipients.map((recipient) => recipient.urgency)
    ),
    organTotal: organs.length,
    organByType: toDistribution(organs.map((organ) => organ.organType)),
    organByBloodGroup: toDistribution(
      organs.map((organ) => organ.bloodGroup)
    ),
    organByAvailability: toDistribution(
      organs.map((organ) => organ.availabilityStatus)
    ),
    matchRunTotal: matchRuns.length,
    matchRunsByStatus: toDistribution(matchRuns.map((matchRun) => matchRun.status)),
    hospitals: hospitals.map((hospital) => ({
      hospital,
      donors: donors.filter((donor) => donor.hospitalId === hospital.id).length,
      organs: organs.filter((organ) => organ.hospitalId === hospital.id).length,
      recipients: recipients.filter(
        (recipient) => getHospitalForRecipient(recipient)?.id === hospital.id
      ).length,
    })),
  };
}
