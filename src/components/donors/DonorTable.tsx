import type { Donor } from "../../types/donor";
import type { Hospital } from "../../data/datasets/hospitals";
import type { OrganInventoryRecord } from "../../data/datasets/organs";

interface DonorTableProps {
  donors: DonorListItem[];
  onSelect?: (donor: DonorListItem) => void;
}

export interface DonorListItem {
  donor: Donor;
  hospital?: Hospital;
  organ?: OrganInventoryRecord;
}

export default function DonorTable({
  donors,
  onSelect,
}: DonorTableProps) {
  if (donors.length === 0) {
    return (
      <div className="rounded-2xl border border-emerald-100 bg-white p-12 text-center shadow-sm">
        <div className="text-4xl">🔎</div>

        <h3 className="mt-4 text-lg font-semibold text-slate-900">
          No donors found
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          Try changing your search or filter criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] text-left">
          {/* Table Header */}
          <thead className="bg-emerald-50/60">
            <tr className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              <th className="px-6 py-4">Donor</th>

              <th className="px-6 py-4">
                Organ
              </th>

              <th className="px-6 py-4">
                Blood Group
              </th>

              <th className="px-6 py-4">Demographics</th>

              <th className="px-6 py-4">Hospital</th>

              <th className="px-6 py-4">
                Availability
              </th>

              <th className="px-6 py-4 text-right">
                Action
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-100">
            {donors.map(({ donor, hospital, organ }) => (
              <tr
                key={donor.id}
                className="transition hover:bg-emerald-50/40"
              >
                {/* Donor */}
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-semibold text-emerald-700">
                      {donor.id.slice(-2).toUpperCase()}
                    </div>

                    <div>
                      <p className="font-semibold text-slate-900">
                        {donor.id}
                      </p>

                      <p className="text-xs text-slate-500">
                        Hospital ID {donor.hospitalId}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Organ */}
                <td className="px-6 py-5">
                  <span className="font-medium capitalize text-slate-700">
                    {organ?.organType ?? "No organ recorded"}
                  </span>
                </td>

                {/* Blood Group */}
                <td className="px-6 py-5">
                  <span className="inline-flex rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700">
                    {donor.bloodGroup}
                  </span>
                </td>

                {/* Medical Status */}
                <td className="px-6 py-5">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {donor.gender}, {donor.age}
                  </span>
                </td>

                {/* Location */}
                <td className="px-6 py-5">
                  <div>
                    <p className="font-medium text-slate-700 dark:text-slate-200">
                      {hospital?.name ?? "Hospital not recorded"}
                    </p>

                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {hospital ? `${hospital.city}, ${hospital.state}` : donor.hospitalId}
                    </p>
                  </div>
                </td>

                {/* Availability */}
                <td className="px-6 py-5">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
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
                    {organ?.availabilityStatus ?? "No organ recorded"}
                  </span>
                </td>

                {/* Action */}
                <td className="px-6 py-5 text-right">
                  <button
                    type="button"
                    onClick={() => onSelect?.({ donor, hospital, organ })}
                    className="rounded-lg px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="flex items-center justify-between border-t border-emerald-100 px-6 py-4">
        <p className="text-sm text-slate-500">
          Showing{" "}
          <span className="font-semibold text-slate-700">
            {donors.length}
          </span>{" "}
          donor{donors.length !== 1 ? "s" : ""}
        </p>

        <div className="text-xs text-slate-400">
          OrganMatch Clinical Decision Support
        </div>
      </div>
    </div>
  );
}
