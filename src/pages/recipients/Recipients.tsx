import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Search,
  SlidersHorizontal,
  Users,
  MapPin,
  Eye,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

import type { Recipient } from "../../types/recipient";

import {
  getHospitalForRecipient,
  getRecipients,
} from "../../services/recipientService";

function urgencyStyle(urgency: Recipient["urgency"]) {
  switch (urgency) {
    case "Critical":
      return "border-red-200 bg-red-50 text-red-700";

    case "High":
      return "border-orange-200 bg-orange-50 text-orange-700";

    case "Moderate":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "Stable":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

export default function Recipients() {
  const navigate = useNavigate();

  // Backend recipients
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [bloodGroup, setBloodGroup] = useState("All");
  const [organ, setOrgan] = useState("All");
  const [urgency, setUrgency] = useState("All");

  // Load recipients from FastAPI backend
  useEffect(() => {
    async function loadRecipients() {
      try {
        setLoading(true);
        setError("");

        const data = await getRecipients();

        setRecipients(data);
      } catch (err) {
        console.error("Failed to load recipients:", err);
        setError("Failed to load recipients from the backend.");
      } finally {
        setLoading(false);
      }
    }

    loadRecipients();
  }, []);

  // Filter recipients
  const filteredRecipients = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    return recipients.filter((recipient) => {
      const hospital = getHospitalForRecipient(recipient);

      const matchesSearch =
        searchText === "" ||
        recipient.id.toLowerCase().includes(searchText) ||
        hospital?.city?.toLowerCase().includes(searchText) ||
        hospital?.name?.toLowerCase().includes(searchText);

      const matchesBlood =
        bloodGroup === "All" ||
        recipient.bloodGroup === bloodGroup;

      const matchesOrgan =
        organ === "All" ||
        recipient.requiredOrgan === organ;

      const matchesUrgency =
        urgency === "All" ||
        recipient.urgency === urgency;

      return (
        matchesSearch &&
        matchesBlood &&
        matchesOrgan &&
        matchesUrgency
      );
    });
  }, [recipients, search, bloodGroup, organ, urgency]);

  // Summary statistics
  const criticalCount = recipients.filter(
    (recipient) => recipient.urgency === "Critical"
  ).length;

  const highCount = recipients.filter(
    (recipient) => recipient.urgency === "High"
  ).length;

  const waitingCount = recipients.filter(
    (recipient) => recipient.status === "Waiting"
  ).length;

  // Blood groups
  const bloodGroups = [
    ...new Set(
      recipients.map((recipient) => recipient.bloodGroup)
    ),
  ].sort();

  // Organ types
  const organTypes = [
    ...new Set(
      recipients.map((recipient) => recipient.requiredOrgan)
    ),
  ].sort();

  // Urgency levels
  const urgencyLevels = [
    ...new Set(
      recipients.map((recipient) => recipient.urgency)
    ),
  ];

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-emerald-600">
            Recipient Management
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Recipients
          </h1>

          <p className="mt-2 text-slate-500">
            Manage waiting-list recipients and monitor clinical urgency.
          </p>
        </div>

        {/* Add Recipient Button */}
        <button
          onClick={() => navigate("/recipients/add")}
          className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
        >
          + Add Recipient
        </button>
      </div>

      {/* Loading Message */}
      {loading && (
        <div className="rounded-xl border border-emerald-100 bg-white p-5 text-center text-sm text-slate-500 shadow-sm">
          Loading recipients...
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-center text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          title="Waiting Recipients"
          value={waitingCount}
          description="Active waiting list"
          icon={<Users size={20} />}
        />

        <SummaryCard
          title="Critical"
          value={criticalCount}
          description="Require urgent review"
          icon={<AlertTriangle size={20} />}
          danger
        />

        <SummaryCard
          title="High Priority"
          value={highCount}
          description="Require priority matching"
          icon={<CheckCircle2 size={20} />}
        />
      </div>

      {/* Filters */}
      <section className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <SlidersHorizontal
            size={20}
            className="text-emerald-600"
          />

          <h2 className="font-semibold text-slate-900">
            Search & Filters
          </h2>
        </div>

        <div className="grid gap-3 lg:grid-cols-4">

          {/* Search */}
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              type="text"
              placeholder="Search recipient ID, hospital..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              className="w-full rounded-xl border border-emerald-100 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-500"
            />
          </div>

          {/* Blood Group */}
          <select
            value={bloodGroup}
            onChange={(event) =>
              setBloodGroup(event.target.value)
            }
            className="rounded-xl border border-emerald-100 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-emerald-500"
          >
            <option value="All">
              All Blood Groups
            </option>

            {bloodGroups.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>

          {/* Organ */}
          <select
            value={organ}
            onChange={(event) =>
              setOrgan(event.target.value)
            }
            className="rounded-xl border border-emerald-100 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-emerald-500"
          >
            <option value="All">
              All Organs
            </option>

            {organTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          {/* Urgency */}
          <select
            value={urgency}
            onChange={(event) =>
              setUrgency(event.target.value)
            }
            className="rounded-xl border border-emerald-100 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-emerald-500"
          >
            <option value="All">
              All Urgency Levels
            </option>

            {urgencyLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Recipient Table */}
      <section className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">

        {/* Table Header */}
        <div className="border-b border-emerald-100 px-6 py-5">
          <div className="flex items-center justify-between">

            <div>
              <h2 className="font-semibold text-slate-900">
                Waiting List
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {filteredRecipients.length} recipients found
              </p>
            </div>

            {/* Backend status */}
            <div className="hidden rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 sm:block">
              SQLite / Backend
            </div>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full">

            <thead>
              <tr className="border-b border-emerald-100 bg-emerald-50/60 text-left text-xs uppercase tracking-wider text-slate-500">

                <th className="px-6 py-4">
                  Recipient
                </th>

                <th className="px-6 py-4">
                  Organ
                </th>

                <th className="px-6 py-4">
                  Blood Group
                </th>

                <th className="px-6 py-4">
                  Hospital
                </th>

                <th className="px-6 py-4">
                  Urgency
                </th>

                <th className="px-6 py-4">
                  Waiting
                </th>

                <th className="px-6 py-4">
                  Action
                </th>

              </tr>
            </thead>

            <tbody>
              {filteredRecipients.map((recipient, index) => {

                const hospital =
                  getHospitalForRecipient(recipient);

                return (
                  <tr
                    key={recipient.id}
                    className="border-b border-slate-100 transition hover:bg-emerald-50/40"
                  >

                    {/* Recipient */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 font-semibold text-emerald-700">
                          {String(index + 1).padStart(2, "0")}
                        </div>

                        <div>
                          <p className="font-semibold text-slate-900">
                            {recipient.id}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            Registered{" "}
                            {recipient.registrationDate}
                          </p>
                        </div>

                      </div>
                    </td>

                    {/* Organ */}
                    <td className="px-6 py-5">
                      <span className="font-medium text-slate-700">
                        {recipient.requiredOrgan}
                      </span>
                    </td>

                    {/* Blood */}
                    <td className="px-6 py-5">
                      <span className="rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700">
                        {recipient.bloodGroup}
                      </span>
                    </td>

                    {/* Hospital */}
                    <td className="px-6 py-5">
                      <div>

                        <p className="font-medium text-slate-700">
                          {hospital?.name ?? "Unknown facility"}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {hospital
                            ? `${hospital.city}, ${hospital.state}`
                            : "Location not recorded"}
                        </p>

                      </div>
                    </td>

                    {/* Urgency */}
                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${urgencyStyle(
                          recipient.urgency
                        )}`}
                      >
                        {recipient.urgency}
                      </span>
                    </td>

                    {/* Waiting */}
                    <td className="px-6 py-5">
                      <span className="text-sm text-slate-600">
                        {recipient.waitingDays} days
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-6 py-5">
                      <button
                        onClick={() =>
                          navigate(
                            `/recipients/${recipient.id}`
                          )
                        }
                        className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 transition hover:text-emerald-800"
                      >
                        <Eye size={17} />
                        View
                      </button>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="divide-y divide-slate-100 lg:hidden">

          {filteredRecipients.map((recipient) => {

            const hospital =
              getHospitalForRecipient(recipient);

            return (
              <div
                key={recipient.id}
                className="p-5"
              >

                <div className="flex items-start justify-between gap-4">

                  <div>
                    <p className="font-semibold text-slate-900">
                      {recipient.id}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {recipient.requiredOrgan} ·{" "}
                      {recipient.bloodGroup}
                    </p>
                  </div>

                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${urgencyStyle(
                      recipient.urgency
                    )}`}
                  >
                    {recipient.urgency}
                  </span>

                </div>

                <div className="mt-4 space-y-2 text-sm text-slate-600">

                  <p className="flex items-center gap-2">
                    <MapPin size={15} />

                    {hospital?.city ??
                      "Location not recorded"}
                  </p>

                  <p>
                    {hospital?.name ??
                      "Unknown facility"}
                  </p>

                  <p>
                    Waiting:{" "}
                    <span className="text-slate-700">
                      {recipient.waitingDays} days
                    </span>
                  </p>

                </div>

                <button
                  onClick={() =>
                    navigate(
                      `/recipients/${recipient.id}`
                    )
                  }
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-100 px-4 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
                >
                  <Eye size={17} />
                  View Recipient
                </button>

              </div>
            );
          })}

        </div>

        {/* Empty State */}
        {!loading && filteredRecipients.length === 0 && (
          <div className="px-6 py-16 text-center">

            <Users
              size={42}
              className="mx-auto text-slate-400"
            />

            <h3 className="mt-4 font-semibold text-slate-900">
              No recipients found
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Try changing your search or filters.
            </p>

          </div>
        )}

      </section>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  description,
  icon,
  danger = false,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <p className="text-sm font-medium text-slate-500">
          {title}
        </p>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            danger
              ? "bg-red-500/10 text-red-700"
              : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {icon}
        </div>

      </div>

      <p className="mt-4 text-3xl font-bold text-slate-900">
        {value}
      </p>

      <p
        className={`mt-2 text-sm ${
          danger
            ? "text-red-600"
            : "text-emerald-600"
        }`}
      >
        {description}
      </p>

    </div>
  );
}