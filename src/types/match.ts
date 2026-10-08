import type { Recipient } from "./recipient";

/**
 * Classification of the AI-assisted match.
 */
export type MatchRecommendation =
  | "Strong Match"
  | "Good Match"
  | "Review Required";

/**
 * Compatibility dimensions used by the matching engine.
 */
export interface MatchCompatibility {
  bloodGroup: number;
  organ: number;
  medicalStatus: number;
  availability: number;
  urgency: number;
  waitingTime: number;
  location: number;
}

/**
 * Result produced by the matching engine.
 */
export interface MatchResult {
  recipient: Recipient;

  /**
   * Overall weighted compatibility score.
   * Range: 0 - 100.
   */
  overallScore: number;

  /**
   * Individual compatibility scores.
   */
  compatibility: MatchCompatibility;

  /**
   * Human-readable reasons supporting the match.
   */
  matchedCriteria: string[];

  /**
   * Issues that require coordinator/clinical review.
   */
  warnings: string[];

  /**
   * Human-readable classification.
   */
  recommendation: MatchRecommendation;
}