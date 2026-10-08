export interface OrganRule {
  organType: string;
  maximumPreservationHours: number;
}

/** Demonstration-only preservation windows; clinical rules belong in a validated source. */
export const organRules: OrganRule[] = [
  { organType: "Heart", maximumPreservationHours: 4 },
  { organType: "Liver", maximumPreservationHours: 12 },
  { organType: "Kidney", maximumPreservationHours: 36 },
];
