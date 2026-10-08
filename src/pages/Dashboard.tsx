import { useEffect, useState } from "react";
import { matchRuns } from "../data/datasets/matchRuns";

import {
  getDonors,
  getOrgansForDonor,
} from "../services/donorService";

import { getRecipients } from "../services/recipientService";

import {
  getHospitalForOrgan,
  getOrgans,
} from "../services/organService";

export default function Dashboard() {
  const [donors, setDonors] = useState<any[]>([]);
  const [recipients, setRecipients] = useState<any[]>([]);
  const [organs, setOrgans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);

        const [donorData, recipientData, organData] = await Promise.all([
          getDonors(),
          getRecipients(),
          getOrgans(),
        ]);

        setDonors(donorData);
        setRecipients(recipientData);
        setOrgans(organData);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-sm font-medium text-slate-500">
          Loading dashboard...
        </div>
      </div>
    );
  }

  const waitingRecipients = recipients.filter(
    (recipient) => recipient.status === "Waiting"
  );

  const criticalRecipients = waitingRecipients.filter(
    (recipient) => recipient.urgency === "Critical"
  );

  const availableOrgans = organs.filter(
    (organ) => organ.availabilityStatus === "Available"
  );

  const activeMatchRuns = matchRuns.filter(
    (matchRun) => matchRun.status === "In Progress"
  );

  /*
   * A donor is considered active when at least one
   * of their organs is currently available.
   */
  const activeDonors = donors.filter((donor) =>
    getOrgansForDonor(donor.id).some(
      (organ) => organ.availabilityStatus === "Available"
    )
  );

  const stats = [
    [
      "Active Donors",
      String(activeDonors.length),
      "Linked to available organs",
    ],
    [
      "Waiting Recipients",
      String(waitingRecipients.length),
      `${criticalRecipients.length} critical`,
    ],
    [
      "Available Organs",
      String(availableOrgans.length),
      "Available for review",
    ],
    [
      "Active Matches",
      String(activeMatchRuns.length),
      "Current match runs",
    ],
  ];

  const urgency = (
    ["Critical", "High", "Moderate", "Stable"] as const
  ).map((label) => ({
    label,

    count: waitingRecipients.filter(
      (recipient) => recipient.urgency === label
    ).length,

    color:
      label === "Critical"
        ? "bg-red-500"
        : label === "High"
        ? "bg-amber-500"
        : "bg-emerald-500",
  }));

  return (
    <div className="space-y-8">

      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-emerald-600">
            Clinical Decision Support
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            OrganMatch Dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Monitor organ availability, recipient urgency, and active
            matching workflows.
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([title, value, subtitle]) => (
          <div
            key={title}
            className="
              rounded-2xl
              border border-emerald-100
              bg-white
              p-6
              shadow-sm
              transition
              hover:border-emerald-200
              hover:shadow-md
            "
          >
            <p className="text-sm font-medium text-slate-500">
              {title}
            </p>

            <p className="mt-5 text-4xl font-bold text-slate-900">
              {value}
            </p>

            <p className="mt-2 text-sm font-medium text-emerald-600">
              {subtitle}
            </p>
          </div>
        ))}
      </div>

      {/* Dashboard Panels */}
      <div className="grid gap-6 xl:grid-cols-2">

        {/* Organ Availability */}
        <div
          className="
            rounded-2xl
            border border-emerald-100
            bg-white
            p-6
            shadow-sm
          "
        >
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Organ Availability
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Currently available donor organs
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              🫀
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {availableOrgans.map((organ) => {
              const hospital = getHospitalForOrgan(organ);

              return (
                <div
                  key={organ.id}
                  className="
                    flex
                    items-center
                    justify-between
                    rounded-xl
                    border border-slate-100
                    bg-slate-50
                    p-4
                    transition
                    hover:border-emerald-100
                    hover:bg-emerald-50/40
                  "
                >
                  <div>
                    <p className="font-semibold text-slate-900">
                      {organ.organType}
                    </p>

                    <p className="text-sm text-slate-500">
                      Blood Group {organ.bloodGroup} ·{" "}
                      {hospital?.city ?? "Hospital not recorded"}
                    </p>
                  </div>

                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Available
                  </span>
                </div>
              );
            })}

            {availableOrgans.length === 0 && (
              <p className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-500">
                No organs are currently marked as available.
              </p>
            )}
          </div>
        </div>

        {/* Recipient Urgency */}
        <div
          className="
            rounded-2xl
            border border-emerald-100
            bg-white
            p-6
            shadow-sm
          "
        >
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Recipient Urgency
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Current waiting-list priority
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              !
            </div>
          </div>

          <div className="mt-8 space-y-6">
            {urgency.map(({ label, count, color }) => (
              <div key={label}>
                <div className="mb-2 flex justify-between">
                  <span className="font-medium text-slate-700">
                    {label}
                  </span>

                  <span className="font-semibold text-slate-900">
                    {count}
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${color}`}
                    style={{
                      width: `${
                        waitingRecipients.length
                          ? (count / waitingRecipients.length) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Prototype Environment */}
      <div
        className="
          rounded-2xl
          border border-emerald-100
          bg-emerald-50/60
          p-5
        "
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-emerald-800">
              Backend Environment
            </p>

            <p className="mt-1 text-xs text-emerald-700/70">
              Dashboard data is loaded from the FastAPI backend and SQLite
              database.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>

            <span className="text-xs font-semibold text-emerald-700">
              SQLite / Backend
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}