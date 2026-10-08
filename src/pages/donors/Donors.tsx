import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DonorFilters from "../../components/donors/DonorFilters";
import DonorTable, { type DonorListItem } from "../../components/donors/DonorTable";
import {
  getDonors,
  getHospitalForDonor,
  getPrimaryOrganForDonor,
} from "../../services/donorService";

export default function Donors() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [bloodGroup, setBloodGroup] = useState("All");
  const [organType, setOrganType] = useState("All");
  const [status, setStatus] = useState("All");

  const donors = getDonors();

  const donorRows = useMemo<DonorListItem[]>(
    () => donors.map((donor) => ({
      donor,
      hospital: getHospitalForDonor(donor),
      organ: getPrimaryOrganForDonor(donor.id),
    })),
    [donors]
  );

  const filteredDonors = useMemo(() => {
    return donorRows.filter(({ donor, hospital, organ }) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        searchText === "" ||
        donor.id.toLowerCase().includes(searchText) ||
        hospital?.city.toLowerCase().includes(searchText) ||
        hospital?.name.toLowerCase().includes(searchText);

      const matchesBlood =
        bloodGroup === "All" || donor.bloodGroup === bloodGroup;

      const matchesOrgan =
        organType === "All" || organ?.organType === organType;

      const matchesStatus =
        status === "All" || organ?.availabilityStatus === status;

      return (
        matchesSearch &&
        matchesBlood &&
        matchesOrgan &&
        matchesStatus
      );
    });
  }, [donorRows, search, bloodGroup, organType, status]);

  const bloodGroups = [...new Set(donorRows.map(({ donor }) => donor.bloodGroup))].sort();
  const organTypes = [...new Set(donorRows.flatMap(({ organ }) => organ ? [organ.organType] : []))].sort();
  const statuses = [...new Set(donorRows.flatMap(({ organ }) => organ ? [organ.availabilityStatus] : []))].sort();

  const clearFilters = () => {
    setSearch("");
    setBloodGroup("All");
    setOrganType("All");
    setStatus("All");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
  <div>
    <p className="text-sm font-medium text-emerald-600">
      Donor Management
    </p>

    <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
      Donors
    </h1>

    <p className="mt-2 text-slate-500">
      Manage registered donors and monitor organ availability.
    </p>
  </div>

  <button
    onClick={() => navigate("/donors/add")}
    className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
  >
    + Add Donor
  </button>
</div>

      <DonorFilters
        search={search}
        bloodGroup={bloodGroup}
        organType={organType}
        status={status}
        bloodGroups={bloodGroups}
        organTypes={organTypes}
        statuses={statuses}
        onSearchChange={setSearch}
        onBloodGroupChange={setBloodGroup}
        onOrganTypeChange={setOrganType}
        onStatusChange={setStatus}
        onClear={clearFilters}
      />

      <DonorTable
        donors={filteredDonors}
        onSelect={({ donor }) => {
          navigate(`/donors/${donor.id}`);
        }}
      />
    </div>
  );
}
