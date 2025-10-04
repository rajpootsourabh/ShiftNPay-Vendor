import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCareGiverByVendor } from "../../../../store/IDB_SYS/Clients/careGiverSlice";
import { fetchClientByVendor } from "../../../../store/IDB_SYS/Clients/clientSlice";

const FilterSection = () => {
  const dispatch = useDispatch();
  const { careGiver } = useSelector((state) => state.careGiver);
  const { clients } = useSelector((state) => state.client);

  const [selectedClient, setSelectedClient] = useState("");
  const [selectedCaregiver, setSelectedCaregiver] = useState("");
  const [month, setMonth] = useState("August 2025");

  useEffect(() => {
    dispatch(fetchCareGiverByVendor());
    dispatch(fetchClientByVendor());
  }, [dispatch]);

  return (
    <div className="d-flex align-items-center gap-4 justify-content-center bg-white p-2 mb-3 border">
      {/* Clients Dropdown */}
      <select
        className="form-select form-select-sm"
        value={selectedClient}
        onChange={(e) => setSelectedClient(e.target.value)}
        style={{ width: "200px" }}
      >
         <option value="" disabled>
          Clients
        </option>
        {clients.map((row) => (
          <option key={row._id} value={row._id}>
            {row.firstName} {row.middleInitial} {row.lastName}
          </option>
        ))}
      </select>

      {/* Three dots button */}
      <button className="btn btn-sm btn-success">⋯</button>

      {/* Filters Button */}
      <button className="btn btn-outline-success btn-sm">
        <i className="bi bi-funnel"></i> Filters
      </button>

      {/* Left Arrow */}
      <button className="btn btn-success btn-sm">⏪</button>

      {/* Month */}
      <span className="px-1 border text-center" style={{ width: "200px" }}>
        {month}
      </span>

      {/* Right Arrow */}
      <button className="btn btn-success btn-sm">⏩</button>

      {/* Display Options */}
      <button className="btn btn-outline-success btn-sm">
        <i className="bi bi-display"></i> Display Options
      </button>

      {/* Caregivers Dropdown */}
      <select
        className="form-select form-select-sm"
        value={selectedCaregiver}
        onChange={(e) => setSelectedCaregiver(e.target.value)}
        style={{ width: "200px" }}
      >
        <option value="" disabled>
          Select CareGiver
        </option>
        {careGiver.map((manager) => (
          <option key={manager._id} value={manager._id}>
            {manager.firstName ?? ""}{" "}
            {manager.lastName != "" ? manager.lastName : manager.email}
          </option>
        ))}
      </select>

      {/* Three dots button */}
      <button className="btn btn-sm btn-success">⋯</button>
    </div>
  );
};

export default FilterSection;
