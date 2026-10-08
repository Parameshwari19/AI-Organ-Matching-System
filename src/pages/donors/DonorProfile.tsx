import { useNavigate, useParams } from "react-router-dom";
import {
  getDonorById,
  getHospitalForDonor,
  getPrimaryOrganForDonor,
} from "../../services/donorService";

export default function DonorProfile() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const donor = id ? getDonorById(id) : undefined;
  const hospital = donor ? getHospitalForDonor(donor) : undefined;
  const organ = donor ? getPrimaryOrganForDonor(donor.id) : undefined;

  if (!donor) {
    return (
      <div className="rounded-2xl border border-emerald-100 bg-white p-10 text-center shadow-sm">
        <div className="text-5xl">🔍</div>

        <h2 className="mt-4 text-xl font-bold text-slate-900">
          Donor not found
        </h2>

        <p className="mt-2 text-slate-500">
          The requested donor record could not be found.
        </p>

        <button
          type="button"
          onClick={() => navigate("/donors")}
          className="mt-6 rounded-lg bg-emerald-600 px-5 py-2.5 font-semibold text-white transition hover:bg-emerald-700"
        >
          Back to Donors
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <p className="text-sm font-medium text-emerald-600">
            Donor Management
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Donor Profile
          </h1>

          <p className="mt-2 text-slate-500">
            Donor identity, organ availability, and care-facility information.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/donors")}
          className="rounded-lg border border-emerald-100 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-emerald-50"
        >
          ← Back to Donors
        </button>

      </div>

      {/* Donor identity card */}
      <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">

        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

          <div className="flex items-center gap-4">

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 text-xl font-bold text-white">
              {donor.id.slice(-2)}
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Donor ID
              </p>

              <h2 className="text-2xl font-bold text-slate-900">
                {donor.id}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Hospital ID {donor.hospitalId}
              </p>
            </div>

          </div>

          <div>
            <span
              className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${
                organ?.availabilityStatus === "Available"
                    ? "bg-emerald-100 text-emerald-700"
                  : organ?.availabilityStatus === "Reserved"
                      ? "bg-amber-100 text-amber-700"
                    : organ?.availabilityStatus === "Allocated"
                        ? "bg-blue-100 text-blue-700"
                    : organ?.availabilityStatus === "Transplanted"
                        ? "bg-slate-100 text-slate-600"
                    : organ?.availabilityStatus === "Expired"
                          ? "bg-red-100 text-red-700"
                        : "bg-slate-100 text-slate-600"
              }`}
            >
              ● {organ?.availabilityStatus ?? "No organ recorded"}
            </span>
          </div>

        </div>
      </div>

      {/* Information grid */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Medical Information */}
        <section className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">

          <div className="mb-6">
            <p className="text-sm font-medium text-emerald-600">
              Donor Information
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              Donor Details
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">

            <InfoItem
              label="Blood Group"
              value={donor.bloodGroup}
            />

            <InfoItem
              label="Age"
              value={`${donor.age} years`}
            />

            <InfoItem
              label="Organ"
              value={organ?.organType ?? "No organ recorded"}
            />

            <InfoItem
              label="Gender"
              value={donor.gender}
            />

          </div>
        </section>

        {/* Hospital Information */}
        <section className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">

          <div className="mb-6">
            <p className="text-sm font-medium text-emerald-600">
              Care Facility
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              Hospital Information
            </h2>
          </div>

          <div className="space-y-5">

            <InfoItem
              label="Hospital"
              value={hospital?.name ?? donor.hospitalId}
            />

            <InfoItem
              label="Location"
              value={hospital?.city ?? "Not recorded"}
            />

            <InfoItem
              label="Hospital ID"
              value={donor.hospitalId}
            />

          </div>
        </section>

      </div>

      {/* Clinical decision section */}
      <section className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-6">

        <div className="flex items-start gap-4">

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-xl">
            🧬
          </div>

          <div>
            <h2 className="font-bold text-slate-900">
              Clinical Decision Support
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-600">
              This donor record can be evaluated by the matching engine
              against eligible recipients based on the available clinical
              and logistical information.
            </p>
          </div>

        </div>

      </section>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">

        <button
          type="button"
          onClick={() => navigate("/matching")}
          className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          Find Recipient Matches
        </button>

        <button
          type="button"
          onClick={() => navigate("/donors")}
          className="rounded-lg border border-emerald-100 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-emerald-50"
        >
          Back to Donor List
        </button>

      </div>

    </div>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-1 font-semibold text-slate-800">
        {value}
      </p>
    </div>
  );
}
