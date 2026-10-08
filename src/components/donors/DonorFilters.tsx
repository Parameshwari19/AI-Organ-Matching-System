import { Search, SlidersHorizontal, X } from "lucide-react";

interface DonorFiltersProps {
  search: string;
  bloodGroup: string;
  organType: string;
  status: string;
  bloodGroups: string[];
  organTypes: string[];
  statuses: string[];
  onSearchChange: (value: string) => void;
  onBloodGroupChange: (value: string) => void;
  onOrganTypeChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onClear: () => void;
}

export default function DonorFilters({
  search,
  bloodGroup,
  organType,
  status,
  bloodGroups,
  organTypes,
  statuses,
  onSearchChange,
  onBloodGroupChange,
  onOrganTypeChange,
  onStatusChange,
  onClear,
}: DonorFiltersProps) {
  const hasFilters =
    search !== "" ||
    bloodGroup !== "All" ||
    organType !== "All" ||
    status !== "All";

  return (
    <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-emerald-600" />

          <h2 className="font-semibold text-slate-900">
            Search & Filters
          </h2>
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-800"
          >
            <X className="h-4 w-4" />
            Clear
          </button>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        {/* Search */}
        <div className="relative lg:col-span-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            type="text"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search donor ID, hospital..."
            className="w-full rounded-xl border border-emerald-100 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
          />
        </div>

        {/* Blood Group */}
        <select
          value={bloodGroup}
          onChange={(event) => onBloodGroupChange(event.target.value)}
          className="rounded-xl border border-emerald-100 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500"
        >
          <option value="All">All Blood Groups</option>
          {bloodGroups.map((group) => (
            <option key={group} value={group}>{group}</option>
          ))}
        </select>

        {/* Organ */}
        <select
          value={organType}
          onChange={(event) => onOrganTypeChange(event.target.value)}
          className="rounded-xl border border-emerald-100 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500"
        >
          <option value="All">All Organs</option>
          {organTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>

        {/* Status */}
        <select
          value={status}
          onChange={(event) => onStatusChange(event.target.value)}
          className="rounded-xl border border-emerald-100 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500"
        >
          <option value="All">All Statuses</option>
          {statuses.map((itemStatus) => (
            <option key={itemStatus} value={itemStatus}>{itemStatus}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
