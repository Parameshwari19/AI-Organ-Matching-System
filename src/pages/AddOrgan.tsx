import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

export default function AddOrgan() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    organ_id: "",
    donor_id: "",
    organ_type: "",
    retrieval_datetime: "",
    preservation_method: "",
    organ_condition_category: "",
    status: "",
    current_hospital_id: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/api/organs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(JSON.stringify(data));
      }

      setMessage("Organ added successfully.");

      setTimeout(() => {
        navigate("/organs");
      }, 1000);
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage("Failed to add organ.");
      }
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Add Organ
        </h1>

        <p className="mt-1 text-gray-600">
          Add a new organ to the transplant inventory.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-3xl space-y-6 rounded-lg border bg-white p-6 shadow-sm"
      >
        {/* Organ ID */}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Organ ID
          </label>

          <input
            type="text"
            name="organ_id"
            value={formData.organ_id}
            onChange={handleChange}
            placeholder="OTEST001"
            required
            className="w-full rounded-md border px-3 py-2"
          />
        </div>

        {/* Donor ID */}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Donor ID
          </label>

          <input
            type="text"
            name="donor_id"
            value={formData.donor_id}
            onChange={handleChange}
            placeholder="DTEST001"
            required
            className="w-full rounded-md border px-3 py-2"
          />
        </div>

        {/* Organ Type */}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Organ Type
          </label>

          <select
            name="organ_type"
            value={formData.organ_type}
            onChange={handleChange}
            required
            className="w-full rounded-md border px-3 py-2"
          >
            <option value="">Select organ</option>
            <option value="Kidney">Kidney</option>
            <option value="Heart">Heart</option>
            <option value="Liver">Liver</option>
            <option value="Lung">Lung</option>
            <option value="Pancreas">Pancreas</option>
            <option value="Intestine">Intestine</option>
          </select>
        </div>

        {/* Retrieval Date */}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Retrieval Date & Time
          </label>

          <input
            type="datetime-local"
            name="retrieval_datetime"
            value={formData.retrieval_datetime}
            onChange={handleChange}
            required
            className="w-full rounded-md border px-3 py-2"
          />
        </div>

        {/* Preservation Method */}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Preservation Method
          </label>

          <select
            name="preservation_method"
            value={formData.preservation_method}
            onChange={handleChange}
            required
            className="w-full rounded-md border px-3 py-2"
          >
            <option value="">Select method</option>
            <option value="Cold Storage">Cold Storage</option>
            <option value="Machine Perfusion">Machine Perfusion</option>
          </select>
        </div>

        {/* Organ Condition */}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Organ Condition
          </label>

          <select
            name="organ_condition_category"
            value={formData.organ_condition_category}
            onChange={handleChange}
            required
            className="w-full rounded-md border px-3 py-2"
          >
            <option value="">Select condition</option>
            <option value="Excellent">Excellent</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
            <option value="Poor">Poor</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Status
          </label>

          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
            className="w-full rounded-md border px-3 py-2"
          >
            <option value="">Select status</option>
            <option value="Available">Available</option>
            <option value="Reserved">Reserved</option>
            <option value="Allocated">Allocated</option>
            <option value="Transplanted">Transplanted</option>
            <option value="Expired">Expired</option>
          </select>
        </div>

        {/* Hospital */}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Current Hospital ID
          </label>

          <input
            type="text"
            name="current_hospital_id"
            value={formData.current_hospital_id}
            onChange={handleChange}
            placeholder="H0001"
            required
            className="w-full rounded-md border px-3 py-2"
          />
        </div>

        {/* Message */}
        {message && (
          <p className="text-sm font-medium text-slate-700">
            {message}
          </p>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            style={{
              display: "block",
              backgroundColor: "blue",
              color: "white",
              padding: "10px 20px",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Add Organ
          </button>

          <button
            type="button"
            onClick={() => navigate("/organs")}
            className="rounded-md border px-5 py-2"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}