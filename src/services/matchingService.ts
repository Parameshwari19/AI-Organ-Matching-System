import type { Donor } from "../types/donor";
import type { Recipient } from "../types/recipient";
import type { MatchResult } from "../types/match";

import { hospitals } from "../data/datasets/hospitals";
import {
  organs,
  type OrganInventoryRecord,
} from "../data/datasets/organs";

/**
 * Result returned by the matching engine.
 *
 * The score is a decision-support score only.
 * It should not be treated as an autonomous medical decision.
 */

/**
 * Blood-group compatibility rules.
 *
 * This is a simplified demonstration model for the prototype.
 * Real transplantation requires organ-specific clinical compatibility
 * and additional medical evaluation.
 */
const BLOOD_GROUP_COMPATIBILITY: Record<string, string[]> = {
  "O-": ["O-"],
  "O+": ["O-", "O+"],
  "A-": ["O-", "A-"],
  "A+": ["O-", "O+", "A-", "A+"],
  "B-": ["O-", "B-"],
  "B+": ["O-", "O+", "B-", "B+"],
  "AB-": ["O-", "A-", "B-", "AB-"],
  "AB+": [
    "O-",
    "O+",
    "A-",
    "A+",
    "B-",
    "B+",
    "AB-",
    "AB+",
  ],
};

/**
 * Normalize strings before comparison.
 */
function normalize(value: string): string {
  return value.trim().toLowerCase();
}

/**
 * Find the primary organ associated with a donor.
 */
function getDonorOrgan(
  donor: Donor
): OrganInventoryRecord | undefined {
  return organs.find((organ) => organ.donorId === donor.id);
}

/**
 * Find donor hospital city.
 */
function getDonorLocation(
  donor: Donor
): string | undefined {
  return hospitals.find(
    (hospital) => hospital.id === donor.hospitalId
  )?.city;
}

/**
 * Check whether donor blood group is compatible
 * with recipient blood group.
 */
function isBloodGroupCompatible(
  donorBloodGroup: string,
  recipientBloodGroup: string
): boolean {
  const recipientCompatibleGroups =
    BLOOD_GROUP_COMPATIBILITY[recipientBloodGroup];

  if (!recipientCompatibleGroups) {
    return false;
  }

  return recipientCompatibleGroups.includes(donorBloodGroup);
}

/**
 * Check organ compatibility.
 */
function isOrganCompatible(
  donorOrgan: string,
  recipientOrgan: string
): boolean {
  return normalize(donorOrgan) === normalize(recipientOrgan);
}

/**
 * Both states represent recipients who may be considered
 * for matching.
 *
 * Waiting is the current seeded waiting-list state.
 * Active remains supported for records that have progressed
 * to active matching review.
 */
function isEligibleRecipientStatus(
  status: Recipient["status"]
): boolean {
  return status === "Waiting" || status === "Active";
}

/**
 * Calculate blood-group compatibility score.
 */
function calculateBloodGroupScore(
  donor: Donor,
  recipient: Recipient
): number {
  if (
    isBloodGroupCompatible(
      donor.bloodGroup,
      recipient.bloodGroup
    )
  ) {
    return 100;
  }

  return 0;
}

/**
 * Calculate organ compatibility score.
 */
function calculateOrganScore(
  donor: Donor,
  recipient: Recipient
): number {
  const organ = getDonorOrgan(donor);

  return organ &&
    isOrganCompatible(
      organ.organType,
      recipient.requiredOrgan
    )
    ? 100
    : 0;
}

/**
 * Calculate medical verification score.
 *
 * Medical verification is not represented directly
 * in the donor dataset.
 */
function calculateMedicalStatusScore(): number {
  return 0;
}

/**
 * Calculate donor availability score.
 */
function calculateAvailabilityScore(
  donor: Donor
): number {
  switch (getDonorOrgan(donor)?.availabilityStatus) {
    case "Available":
      return 100;

    case "Reserved":
      return 40;

    case "Allocated":
      return 10;

    case "Transplanted":
      return 0;

    case "Expired":
      return 0;

    default:
      return 0;
  }
}

/**
 * Calculate urgency score.
 */
function calculateUrgencyScore(
  urgency: Recipient["urgency"]
): number {
  switch (urgency) {
    case "Critical":
      return 100;

    case "High":
      return 80;

    case "Moderate":
      return 60;

    case "Stable":
      return 30;

    default:
      return 0;
  }
}

/**
 * Calculate waiting-time score.
 *
 * Longer waiting periods receive a higher priority.
 */
function calculateWaitingTimeScore(
  waitingDays: number
): number {
  if (waitingDays >= 180) {
    return 100;
  }

  if (waitingDays >= 120) {
    return 90;
  }

  if (waitingDays >= 90) {
    return 80;
  }

  if (waitingDays >= 60) {
    return 70;
  }

  if (waitingDays >= 30) {
    return 60;
  }

  if (waitingDays >= 14) {
    return 45;
  }

  return 30;
}

/**
 * Calculate location/logistics score.
 *
 * Same-city matching gets the highest score.
 * Unknown/different-city logistics receives a neutral score
 * in this prototype.
 */
function calculateLocationScore(
  donor: Donor,
  recipient: Recipient
): number {
  const donorLocation = getDonorLocation(donor);

  if (!donorLocation) {
    return 50;
  }

  const normalizedDonorLocation =
    normalize(donorLocation);

  const recipientLocation =
    normalize(recipient.location);

  if (
    normalizedDonorLocation === recipientLocation
  ) {
    return 100;
  }

  return 50;
}

/**
 * Generate human-readable reasons for the match.
 */
function generateMatchedCriteria(
  donor: Donor,
  recipient: Recipient
): string[] {
  const criteria: string[] = [];

  const organ = getDonorOrgan(donor);
  const donorLocation = getDonorLocation(donor);

  if (
    isBloodGroupCompatible(
      donor.bloodGroup,
      recipient.bloodGroup
    )
  ) {
    criteria.push(
      `Blood group ${donor.bloodGroup} is compatible with recipient ${recipient.bloodGroup}`
    );
  }

  if (
    organ &&
    isOrganCompatible(
      organ.organType,
      recipient.requiredOrgan
    )
  ) {
    criteria.push(
      `${organ.organType} matches the required organ`
    );
  }

  if (
    organ?.availabilityStatus === "Available"
  ) {
    criteria.push(
      "Organ is currently available"
    );
  }

  if (recipient.status === "Waiting") {
    criteria.push(
      "Recipient is on the current waiting list"
    );
  } else if (recipient.status === "Active") {
    criteria.push(
      "Recipient is active for matching review"
    );
  }

  if (recipient.medicalStatus === "Verified") {
    criteria.push(
      "Recipient medical verification is available"
    );
  }

  if (recipient.urgency === "Critical") {
    criteria.push(
      "Recipient has critical medical urgency"
    );
  } else if (recipient.urgency === "High") {
    criteria.push(
      "Recipient has high medical urgency"
    );
  }

  if (recipient.waitingDays >= 30) {
    criteria.push(
      `Recipient has been waiting ${recipient.waitingDays} days`
    );
  }

  if (
    donorLocation &&
    normalize(donorLocation) ===
      normalize(recipient.location)
  ) {
    criteria.push(
      "Donor and recipient are located in the same city"
    );
  }

  return criteria;
}

/**
 * Generate warnings for the coordinator.
 */
function generateWarnings(
  donor: Donor,
  recipient: Recipient
): string[] {
  const warnings: string[] = [];

  const organ = getDonorOrgan(donor);
  const donorLocation = getDonorLocation(donor);

  if (
    !isBloodGroupCompatible(
      donor.bloodGroup,
      recipient.bloodGroup
    )
  ) {
    warnings.push(
      "Blood group compatibility was not established"
    );
  }

  if (
    !organ ||
    !isOrganCompatible(
      organ.organType,
      recipient.requiredOrgan
    )
  ) {
    warnings.push(
      "Required organ does not match donor organ"
    );
  }

  warnings.push(
    "Donor medical verification is not recorded in the dataset"
  );

  if (!organ) {
    warnings.push(
      "No donor organ record is available"
    );
  } else if (
    organ.availabilityStatus !== "Available"
  ) {
    warnings.push(
      `Donor organ availability is ${organ.availabilityStatus}`
    );
  }

  if (recipient.medicalStatus !== "Verified") {
    warnings.push(
      "Recipient medical verification is incomplete"
    );
  }

  if (!donorLocation) {
    warnings.push(
      "Donor hospital location is not recorded"
    );
  } else if (
    normalize(donorLocation) !==
    normalize(recipient.location)
  ) {
    warnings.push(
      "Additional transportation/logistics coordination may be required"
    );
  }

  return warnings;
}

/**
 * Determine recommendation category.
 */
function getRecommendation(
  score: number,
  warnings: string[]
): MatchResult["recommendation"] {
  if (warnings.length === 0 && score >= 85) {
    return "Strong Match";
  }

  if (score >= 70) {
    return "Good Match";
  }

  return "Review Required";
}

/**
 * Calculate a single donor-recipient match.
 */
export function calculateMatch(
  donor: Donor,
  recipient: Recipient
): MatchResult {
  const bloodGroup =
    calculateBloodGroupScore(
      donor,
      recipient
    );

  const organ =
    calculateOrganScore(
      donor,
      recipient
    );

  const medicalStatus =
    calculateMedicalStatusScore();

  const availability =
    calculateAvailabilityScore(donor);

  const urgency =
    calculateUrgencyScore(
      recipient.urgency
    );

  const waitingTime =
    calculateWaitingTimeScore(
      recipient.waitingDays
    );

  const location =
    calculateLocationScore(
      donor,
      recipient
    );

  /**
   * Weighted score.
   *
   * Compatibility is intentionally given
   * the highest weight in this prototype.
   */
  const overallScore =
    bloodGroup * 0.25 +
    organ * 0.25 +
    medicalStatus * 0.15 +
    availability * 0.10 +
    urgency * 0.10 +
    waitingTime * 0.10 +
    location * 0.05;

  const roundedScore =
    Math.round(overallScore);

  const matchedCriteria =
    generateMatchedCriteria(
      donor,
      recipient
    );

  const warnings =
    generateWarnings(
      donor,
      recipient
    );

  return {
    recipient,

    overallScore: roundedScore,

    compatibility: {
      bloodGroup,
      organ,
      medicalStatus,
      availability,
      urgency,
      waitingTime,
      location,
    },

    matchedCriteria,

    warnings,

    recommendation:
      getRecommendation(
        roundedScore,
        warnings
      ),
  };
}

/**
 * Find all possible recipients for a donor.
 *
 * Recipients that fail the fundamental organ or
 * blood-group compatibility checks are excluded
 * from the ranked results.
 */
export function findRecipientMatches(
  donor: Donor,
  recipients: Recipient[]
): MatchResult[] {
  const organ = getDonorOrgan(donor);

  if (
    organ?.availabilityStatus !== "Available"
  ) {
    return [];
  }

  const matches = recipients
    .filter((recipient) => {
      /**
       * Recipient must be Waiting or Active.
       */
      if (
        !isEligibleRecipientStatus(
          recipient.status
        )
      ) {
        return false;
      }

      /**
       * Recipient medical status must be verified.
       */
      if (
        recipient.medicalStatus !== "Verified"
      ) {
        return false;
      }

      /**
       * Required organ must match donor organ.
       */
      if (
        !isOrganCompatible(
          organ.organType,
          recipient.requiredOrgan
        )
      ) {
        return false;
      }

      /**
       * Blood group must be compatible.
       */
      if (
        !isBloodGroupCompatible(
          donor.bloodGroup,
          recipient.bloodGroup
        )
      ) {
        return false;
      }

      return true;
    })
    .map((recipient) =>
      calculateMatch(
        donor,
        recipient
      )
    )
    .sort(
      (a, b) =>
        b.overallScore -
        a.overallScore
    );

  return matches;
}

/**
 * Find the highest-ranked recipient.
 */
export function findBestRecipientMatch(
  donor: Donor,
  recipients: Recipient[]
): MatchResult | undefined {
  const matches =
    findRecipientMatches(
      donor,
      recipients
    );

  return matches[0];
}

/**
 * Return a summary that can be displayed in the UI.
 */
export function getMatchSummary(
  match: MatchResult
): string {
  const score =
    match.overallScore;

  if (score >= 85) {
    return `Strong compatibility score of ${score}%. Clinical and logistical criteria are favorable.`;
  }

  if (score >= 70) {
    return `Good compatibility score of ${score}%. Additional clinical review is recommended.`;
  }

  return `Compatibility score of ${score}%. Further clinical review is required before proceeding.`;
}