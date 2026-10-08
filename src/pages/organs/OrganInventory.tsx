import { useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import PageHeader from "../../components/common/PageHeader";

import Card from "../../components/common/Card";

import Badge from "../../components/common/Badge";

import { HeartPulse } from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

type Organ = {
  organ_id: string;
  donor_id: string;
  organ_type: string;
  retrieval_datetime: string;
  preservation_method: string;
  organ_condition_category: string;
  status: string;
  current_hospital_id: string;
};

type Donor = {
  donor_id: string;
  blood_group: string;
};

type Hospital = {
  hospital_id: string;
  hospital_name: string;
  city: string;
};

export default function OrganInventory() {
  const navigate = useNavigate();

  const [organs, setOrgans] = useState<Organ[]>([]);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);

  const [search, setSearch] = useState("");
  const [organType, setOrganType] = useState("All");
  const [availabilityStatus, setAvailabilityStatus] = useState("All");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingOrganId, setEditingOrganId] = useState<string | null>(
    null
  );

  const [selectedHospitalId, setSelectedHospitalId] =
    useState("");

  const [savingOrganId, setSavingOrganId] = useState<string | null>(
    null
  );

  // Fetch data from FastAPI
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          organsResponse,
          donorsResponse,
          hospitalsResponse,
        ] = await Promise.all([
          fetch(`${API_URL}/api/organs`),
          fetch(`${API_URL}/api/donors`),
          fetch(`${API_URL}/api/hospitals`),
        ]);

        if (!organsResponse.ok) {
          throw new Error("Failed to fetch organs.");
        }

        if (!donorsResponse.ok) {
          throw new Error("Failed to fetch donors.");
        }

        if (!hospitalsResponse.ok) {
          throw new Error("Failed to fetch hospitals.");
        }

        const organsData = await organsResponse.json();
        const donorsData = await donorsResponse.json();
        const hospitalsData = await hospitalsResponse.json();

        setOrgans(organsData);
        setDonors(donorsData);
        setHospitals(hospitalsData);
      } catch (err) {
        console.error(err);

        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to load organ inventory.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getDonor = (donorId: string) => {
    return donors.find(
      (donor) => donor.donor_id === donorId
    );
  };

  const getHospital = (hospitalId: string) => {
    return hospitals.find(
      (hospital) => hospital.hospital_id === hospitalId
    );
  };

  const startEditing = (organ: Organ) => {
    setEditingOrganId(organ.organ_id);
    setSelectedHospitalId(organ.current_hospital_id);
  };

  const cancelEditing = () => {
    setEditingOrganId(null);
    setSelectedHospitalId("");
  };

  const saveHospital = async (organId: string) => {
    if (!selectedHospitalId) {
      return;
    }

    try {
      setSavingOrganId(organId);
      setError("");

      const response = await fetch(
        `${API_URL}/api/organs/${organId}/hospital?hospital_id=${encodeURIComponent(
          selectedHospitalId
        )}`,
        {
          method: "PUT",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to update hospital."
        );
      }

      setOrgans((currentOrgans) =>
        currentOrgans.map((organ) =>
          organ.organ_id === organId
            ? {
                ...organ,
                current_hospital_id:
                  data.current_hospital_id,
              }
            : organ
        )
      );

      setEditingOrganId(null);
      setSelectedHospitalId("");
    } catch (err) {
      console.error(err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to update organ hospital.");
      }
    } finally {
      setSavingOrganId(null);
    }
  };

  const filteredOrgans = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return organs.filter((organ) => {
      const donor = getDonor(organ.donor_id);
      const hospital = getHospital(
        organ.current_hospital_id
      );

      const matchesSearch =
        !searchText ||
        organ.organ_id
          .toLowerCase()
          .includes(searchText) ||
        organ.donor_id
          .toLowerCase()
          .includes(searchText) ||
        organ.organ_type
          .toLowerCase()
          .includes(searchText) ||
        donor?.blood_group
          ?.toLowerCase()
          .includes(searchText) ||
        hospital?.hospital_name
          ?.toLowerCase()
          .includes(searchText) ||
        hospital?.city
          ?.toLowerCase()
          .includes(searchText);

      return (
        matchesSearch &&
        (organType === "All" ||
          organ.organ_type === organType) &&
        (availabilityStatus === "All" ||
          organ.status === availabilityStatus)
      );
    });
  }, [
    search,
    organType,
    availabilityStatus,
    organs,
    donors,
    hospitals,
  ]);

  const organTypes = [
    ...new Set(
      organs.map((organ) => organ.organ_type)
    ),
  ];

  const statuses = [
    ...new Set(
      organs.map((organ) => organ.status)
    ),
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-end justify-between">
        <PageHeader
          title="Organ Inventory"
          description="Monitor currently available donor organs."
        />

        <button
          onClick={() => navigate("/organs/add")}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          + Add Organ
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <Card className="p-6 text-center">
          <p className="text-slate-600">
            Loading organ inventory...
          </p>
        </Card>
      )}

      {/* Error */}
      {error && (
        <Card className="p-6">
          <p className="font-semibold text-red-600">
            Failed to load organ inventory
          </p>

          <p className="mt-2 text-sm text-slate-600">
            {error}
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Make sure the FastAPI backend is running.
          </p>
        </Card>
      )}

      {!loading && !error && (
        <>
          {/* Filters */}
          <Card className="p-5">
            <div className="grid gap-3 md:grid-cols-3">
              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search organ, donor, or hospital..."
                className="rounded-xl border border-emerald-100 bg-white px-4 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
              />

              <select
                value={organType}
                onChange={(event) =>
                  setOrganType(event.target.value)
                }
                className="rounded-xl border border-emerald-100 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-emerald-500"
              >
                <option value="All">
                  All organ types
                </option>

                {organTypes.map((type) => (
                  <option
                    key={type}
                    value={type}
                  >
                    {type}
                  </option>
                ))}
              </select>

              <select
                value={availabilityStatus}
                onChange={(event) =>
                  setAvailabilityStatus(
                    event.target.value
                  )
                }
                className="rounded-xl border border-emerald-100 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-emerald-500"
              >
                <option value="All">
                  All statuses
                </option>

                {statuses.map((status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </Card>

          {/* Organ Cards */}
          <div className="grid gap-5 md:grid-cols-2">
            {filteredOrgans.map((item) => {
              const donor = getDonor(item.donor_id);

              const hospital = getHospital(
                item.current_hospital_id
              );

              const isEditing =
                editingOrganId === item.organ_id;

              const isSaving =
                savingOrganId === item.organ_id;

              const badgeType =
                item.status === "Available"
                  ? "success"
                  : item.status === "Reserved"
                    ? "warning"
                    : item.status === "Allocated"
                      ? "info"
                      : item.status === "Expired"
                        ? "danger"
                        : "neutral";

              return (
                <Card
                  key={item.organ_id}
                  className="p-5"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                        <HeartPulse size={21} />
                      </div>

                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {item.organ_type}
                        </h3>

                        <p className="text-xs text-slate-500">
                          Donor {item.donor_id}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Organ {item.organ_id}
                        </p>
                      </div>
                    </div>

                    <Badge type={badgeType}>
                      {item.status}
                    </Badge>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-4">
                    {/* Donor Blood Group */}
                    <div>
                      <p className="text-xs text-slate-400">
                        Blood Group
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {donor?.blood_group ??
                          "Not recorded"}
                      </p>
                    </div>

                    {/* Hospital */}
                    <div>
                      <p className="text-xs text-slate-400">
                        Location
                      </p>

                      {isEditing ? (
                        <select
                          value={selectedHospitalId}
                          onChange={(event) =>
                            setSelectedHospitalId(
                              event.target.value
                            )
                          }
                          className="mt-1 w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-emerald-500"
                        >
                          <option value="">
                            Select hospital
                          </option>

                          {hospitals.map(
                            (hospitalOption) => (
                              <option
                                key={
                                  hospitalOption.hospital_id
                                }
                                value={
                                  hospitalOption.hospital_id
                                }
                              >
                                {hospitalOption.hospital_id} -{" "}
                                {
                                  hospitalOption.hospital_name
                                }
                              </option>
                            )
                          )}
                        </select>
                      ) : (
                        <p className="mt-1 text-sm font-semibold text-slate-900">
                          {hospital
                            ? `${hospital.hospital_name}, ${hospital.city}`
                            : "Hospital not recorded"}
                        </p>
                      )}
                    </div>

                    {/* Organ Condition */}
                    <div>
                      <p className="text-xs text-slate-400">
                        Organ Condition
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {item.organ_condition_category}
                      </p>
                    </div>

                    {/* Preservation */}
                    <div>
                      <p className="text-xs text-slate-400">
                        Preservation
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {item.preservation_method}
                      </p>
                    </div>
                  </div>

                  {/* Edit Controls */}
                  <div className="mt-5 flex justify-end gap-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={cancelEditing}
                          disabled={isSaving}
                          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                        >
                          Cancel
                        </button>

                        <button
                          onClick={() =>
                            saveHospital(item.organ_id)
                          }
                          disabled={
                            isSaving ||
                            !selectedHospitalId
                          }
                          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isSaving
                            ? "Saving..."
                            : "Save"}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() =>
                          startEditing(item)
                        }
                        className="rounded-lg border border-emerald-200 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
                      >
                        Edit Hospital
                      </button>
                    )}
                  </div>
                </Card>
              );
            })}

            {filteredOrgans.length === 0 && (
              <Card className="p-10 text-center md:col-span-2">
                <p className="font-semibold text-slate-900">
                  No organs found
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  Try changing the search or filters.
                </p>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
}