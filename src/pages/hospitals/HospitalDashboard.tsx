import { useEffect, useState } from "react";

import {
  getHospitalNotifications,
  respondToHospitalOffer,
  type HospitalOffer,
} from "../../services/hospitalService";

const hospitals = [
  {
    id: "H0001",
    name: "Choudhury Transplant Centre",
  },
  {
    id: "H0002",
    name: "Bakshi Transplant Centre",
  },
  {
    id: "H0003",
    name: "Kannan Transplant Centre",
  },
  {
    id: "H0004",
    name: "Hospital H0004",
  },
  {
    id: "H0005",
    name: "Hospital H0005",
  },
];

export default function HospitalDashboard() {
  const [offers, setOffers] = useState<HospitalOffer[]>([]);
  const [hospitalName, setHospitalName] = useState("");
  const [hospitalId, setHospitalId] = useState("H0001");
  const [loading, setLoading] = useState(true);
  const [respondingId, setRespondingId] = useState("");
  const [error, setError] = useState("");

  async function loadHospitalOffers(selectedHospitalId = hospitalId) {
    try {
      setLoading(true);
      setError("");

      const data = await getHospitalNotifications(
        selectedHospitalId
      );

      setHospitalName(data.hospital_name);
      setOffers(data.offers);
    } catch (error) {
      console.error(
        "Failed to load hospital offers:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load hospital offers."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHospitalOffers();
  }, []);

  function handleHospitalChange(
    event: React.ChangeEvent<HTMLSelectElement>
  ) {
    const selectedHospitalId = event.target.value;

    setHospitalId(selectedHospitalId);
    loadHospitalOffers(selectedHospitalId);
  }

  async function handleResponse(
    notificationId: string,
    response: "ACCEPT" | "REJECT"
  ) {
    try {
      setRespondingId(notificationId);
      setError("");

      await respondToHospitalOffer(
        notificationId,
        response
      );

      await loadHospitalOffers();
    } catch (error) {
      console.error(
        `Failed to ${response.toLowerCase()} hospital offer:`,
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : `Failed to ${response.toLowerCase()} the offer.`
      );
    } finally {
      setRespondingId("");
    }
  }

  const activeOffers = offers.filter(
    (offer) => offer.can_respond
  );

  const respondedOffers = offers.filter(
    (offer) => !offer.can_respond
  );

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-sm font-medium text-slate-500">
          Loading hospital dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <p className="text-sm font-semibold text-emerald-600">
          Hospital Portal
        </p>

        <div className="mt-1 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Hospital Dashboard
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              {hospitalName}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Review organ offers received through the AI-assisted
              matching system.
            </p>
          </div>

          {/* Hospital Selector */}
          <div className="w-full lg:w-80">
            <label
              htmlFor="hospital"
              className="block text-sm font-semibold text-slate-700"
            >
              Hospital
            </label>

            <select
              id="hospital"
              value={hospitalId}
              onChange={handleHospitalChange}
              className="
                mt-2
                w-full
                rounded-xl
                border
                border-slate-200
                bg-white
                px-4
                py-3
                text-sm
                font-medium
                text-slate-800
                shadow-sm
                outline-none
                focus:border-emerald-500
                focus:ring-2
                focus:ring-emerald-100
              "
            >
              {hospitals.map((hospital) => (
                <option
                  key={hospital.id}
                  value={hospital.id}
                >
                  {hospital.id} - {hospital.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
          <p className="text-sm font-semibold text-red-700">
            Action failed
          </p>

          <p className="mt-1 text-sm text-red-600">
            {error}
          </p>
        </div>
      )}

      {/* Statistics */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Total Offers
          </p>

          <p className="mt-5 text-4xl font-bold text-slate-900">
            {offers.length}
          </p>

          <p className="mt-2 text-sm font-medium text-emerald-600">
            Offers received
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            New Offers
          </p>

          <p className="mt-5 text-4xl font-bold text-slate-900">
            {activeOffers.length}
          </p>

          <p className="mt-2 text-sm font-medium text-emerald-600">
            Awaiting hospital response
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Responded Offers
          </p>

          <p className="mt-5 text-4xl font-bold text-slate-900">
            {respondedOffers.length}
          </p>

          <p className="mt-2 text-sm font-medium text-emerald-600">
            Previous responses
          </p>
        </div>
      </div>

      {/* New Organ Offers */}
      <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              New Organ Offers
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Organ offers currently awaiting your hospital's
              response.
            </p>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            🫀
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {activeOffers.map((offer) => (
            <div
              key={offer.notification_id}
              className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900">
                      {offer.organ_type ?? "Organ"}
                    </h3>

                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      New Offer
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Organ ID
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {offer.organ_id}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Candidate Rank
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        Rank {offer.rank}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Recipient ID
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {offer.recipient_id}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Blood Group
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {offer.recipient_blood_group ??
                          "Not available"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Urgency
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {offer.recipient_urgency ??
                          "Not available"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Received
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {offer.sent_at
                          ? new Date(
                              offer.sent_at
                            ).toLocaleString()
                          : "Not available"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">
                  <button
                    type="button"
                    disabled={
                      respondingId ===
                      offer.notification_id
                    }
                    onClick={() =>
                      handleResponse(
                        offer.notification_id,
                        "ACCEPT"
                      )
                    }
                    className="
                      rounded-xl
                      bg-emerald-600
                      px-5
                      py-2.5
                      text-sm
                      font-semibold
                      text-white
                      shadow-sm
                      transition
                      hover:bg-emerald-700
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  >
                    {respondingId ===
                    offer.notification_id
                      ? "Processing..."
                      : "Accept"}
                  </button>

                  <button
                    type="button"
                    disabled={
                      respondingId ===
                      offer.notification_id
                    }
                    onClick={() =>
                      handleResponse(
                        offer.notification_id,
                        "REJECT"
                      )
                    }
                    className="
                      rounded-xl
                      border
                      border-red-200
                      bg-white
                      px-5
                      py-2.5
                      text-sm
                      font-semibold
                      text-red-600
                      transition
                      hover:bg-red-50
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                  >
                    {respondingId ===
                    offer.notification_id
                      ? "Processing..."
                      : "Reject"}
                  </button>
                </div>
              </div>
            </div>
          ))}

          {activeOffers.length === 0 && (
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-6 text-center">
              <p className="text-sm font-medium text-slate-600">
                No new organ offers are currently waiting
                for a response.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Previous Offers */}
      <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Previous Offers
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Previously received organ offers and hospital
            responses.
          </p>
        </div>

        <div className="mt-6 space-y-3">
          {respondedOffers.map((offer) => (
            <div
              key={offer.notification_id}
              className="
                flex
                flex-col
                gap-3
                rounded-xl
                border
                border-slate-100
                bg-slate-50
                p-4
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              <div>
                <p className="font-semibold text-slate-900">
                  {offer.organ_type ?? "Organ"} ·{" "}
                  {offer.organ_id}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Recipient {offer.recipient_id} · Rank{" "}
                  {offer.rank}
                </p>
              </div>

              <span
                className={
                  offer.response === "ACCEPT"
                    ? "rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700"
                    : offer.response === "REJECT"
                    ? "rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700"
                    : "rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
                }
              >
                {offer.response ?? offer.status}
              </span>
            </div>
          ))}

          {respondedOffers.length === 0 && (
            <p className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-500">
              No previous offers found.
            </p>
          )}
        </div>
      </div>

      {/* Prototype Environment */}
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-emerald-800">
              Hospital Portal
            </p>

            <p className="mt-1 text-xs text-emerald-700/70">
              Hospital offers are loaded from the FastAPI
              backend and SQLite database.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />

              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>

            <span className="text-xs font-semibold text-emerald-700">
              Backend Connected
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}