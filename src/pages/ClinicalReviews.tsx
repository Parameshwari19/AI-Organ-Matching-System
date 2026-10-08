import { useEffect, useState, type CSSProperties } from "react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

interface ClinicalReview {
  review_id: string;
  organ_id: string;
  recipient_id: string;
  hospital_id: string;
  rank: number;
  status: string;
  reviewed_by: string | null;
  review_date: string | null;
  decision: string;
  remarks: string | null;
}

export default function ClinicalReviews() {
  const [reviews, setReviews] = useState<ClinicalReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(
    null
  );
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadReviews() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/ml/clinical-reviews/pending`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            data?.message ||
            "Failed to load clinical reviews"
        );
      }

      setReviews(data.reviews || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load clinical reviews"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReviews();
  }, []);

  async function submitDecision(
    reviewId: string,
    decision: "APPROVED" | "NOT APPROVED"
  ) {
    try {
      setProcessingId(reviewId);
      setMessage("");
      setError("");

      const response = await fetch(
        `${API_URL}/api/ml/clinical-reviews/${reviewId}/decision`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reviewed_by: "STAFF001",
            decision: decision,
            remarks:
              decision === "APPROVED"
                ? "Clinical review approved for prototype testing"
                : "Clinical review not approved",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            data?.message ||
            "Failed to submit clinical decision"
        );
      }

      if (decision === "APPROVED") {
        setMessage(
          "Clinical review approved successfully. Final allocation completed."
        );
      } else {
        setMessage(
          "Clinical review marked as not approved."
        );
      }

      await loadReviews();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to submit clinical decision"
      );
    } finally {
      setProcessingId(null);
    }
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <h1 style={styles.title}>Clinical Reviews</h1>
        <p>Loading pending clinical reviews...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Clinical Reviews</h1>

          <p style={styles.subtitle}>
            Review hospital-accepted organ offers before final allocation.
          </p>
        </div>

        <button
          style={styles.refreshButton}
          onClick={loadReviews}
        >
          Refresh
        </button>
      </div>

      {message && (
        <div style={styles.successMessage}>
          {message}
        </div>
      )}

      {error && (
        <div style={styles.errorMessage}>
          {error}
        </div>
      )}

      {reviews.length === 0 ? (
        <div style={styles.emptyCard}>
          <h2>No Pending Clinical Reviews</h2>

          <p>
            There are currently no hospital-accepted offers
            waiting for clinical review.
          </p>
        </div>
      ) : (
        <div style={styles.list}>
          {reviews.map((review) => (
            <div
              key={review.review_id}
              style={styles.card}
            >
              <div style={styles.cardHeader}>
                <div>
                  <h2 style={styles.organTitle}>
                    Organ: {review.organ_id}
                  </h2>

                  <span style={styles.status}>
                    {review.status}
                  </span>
                </div>

                <div style={styles.rank}>
                  Rank {review.rank}
                </div>
              </div>

              <div style={styles.details}>
                <div style={styles.detailBox}>
                  <span style={styles.label}>
                    Recipient ID
                  </span>

                  <strong>
                    {review.recipient_id}
                  </strong>
                </div>

                <div style={styles.detailBox}>
                  <span style={styles.label}>
                    Hospital ID
                  </span>

                  <strong>
                    {review.hospital_id}
                  </strong>
                </div>

                <div style={styles.detailBox}>
                  <span style={styles.label}>
                    Review ID
                  </span>

                  <strong>
                    {review.review_id}
                  </strong>
                </div>

                <div style={styles.detailBox}>
                  <span style={styles.label}>
                    Decision
                  </span>

                  <strong>
                    {review.decision}
                  </strong>
                </div>
              </div>

              <div style={styles.actions}>
                <button
                  style={styles.approveButton}
                  disabled={
                    processingId === review.review_id
                  }
                  onClick={() =>
                    submitDecision(
                      review.review_id,
                      "APPROVED"
                    )
                  }
                >
                  {processingId === review.review_id
                    ? "Processing..."
                    : "Approve"}
                </button>

                <button
                  style={styles.rejectButton}
                  disabled={
                    processingId === review.review_id
                  }
                  onClick={() =>
                    submitDecision(
                      review.review_id,
                      "NOT APPROVED"
                    )
                  }
                >
                  Not Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  container: {
    padding: "30px",
    width: "100%",
    boxSizing: "border-box",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
  },

  title: {
    margin: 0,
    fontSize: "28px",
    fontWeight: 700,
    color: "#0f172a",
  },

  subtitle: {
    marginTop: "8px",
    color: "#64748b",
    fontSize: "15px",
  },

  refreshButton: {
    padding: "10px 18px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 600,
  },

  successMessage: {
    padding: "14px 18px",
    marginBottom: "20px",
    borderRadius: "8px",
    background: "#dcfce7",
    color: "#166534",
    border: "1px solid #86efac",
  },

  errorMessage: {
    padding: "14px 18px",
    marginBottom: "20px",
    borderRadius: "8px",
    background: "#fee2e2",
    color: "#991b1b",
    border: "1px solid #fca5a5",
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  card: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "24px",
    boxShadow: "0 2px 8px rgba(15, 23, 42, 0.05)",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "22px",
  },

  organTitle: {
    margin: 0,
    fontSize: "20px",
    color: "#0f172a",
  },

  status: {
    display: "inline-block",
    marginTop: "8px",
    padding: "5px 10px",
    borderRadius: "20px",
    background: "#fef3c7",
    color: "#92400e",
    fontSize: "12px",
    fontWeight: 600,
  },

  rank: {
    padding: "8px 14px",
    borderRadius: "20px",
    background: "#dbeafe",
    color: "#1d4ed8",
    fontWeight: 700,
    fontSize: "13px",
  },

  details: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "15px",
    marginBottom: "25px",
  },

  detailBox: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    padding: "14px",
    background: "#f8fafc",
    borderRadius: "8px",
  },

  label: {
    fontSize: "12px",
    color: "#64748b",
    textTransform: "uppercase",
    fontWeight: 600,
  },

  actions: {
    display: "flex",
    gap: "12px",
  },

  approveButton: {
    padding: "11px 22px",
    border: "none",
    borderRadius: "8px",
    background: "#059669",
    color: "#ffffff",
    fontWeight: 600,
    cursor: "pointer",
  },

  rejectButton: {
    padding: "11px 22px",
    border: "1px solid #fca5a5",
    borderRadius: "8px",
    background: "#ffffff",
    color: "#dc2626",
    fontWeight: 600,
    cursor: "pointer",
  },

  emptyCard: {
    padding: "40px",
    textAlign: "center",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    color: "#64748b",
  },
};