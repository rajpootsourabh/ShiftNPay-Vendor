import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import {
  fetchClientByVendor,
  setPage,
  setSearch,
  setStatusFilter,
  setDateFilter,
  setLocationFilter,
  setClientTypeFilter,
  clearAllFilters,
} from "../../../store/IDB_SYS/Clients/clientSlice";
import { fetchClientTypesByVendor } from "../../../store/IDB_SYS/Clients/clientTypeSlice";
import { fetchLocationsByVendor } from "../../../store/IDB_SYS/Clients/locationSlice";

const FilterSection = ({ search: showSearch }) => {
  const dispatch = useDispatch();
  const { pagination, filters } = useSelector((state) => state.client);
  const { clientType } = useSelector((state) => state.clientType);
  const { location } = useSelector((state) => state.location);
  const [searchText, setSearchTextLocal] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchText);
  const [selectedStatus, setSelectedStatus] = useState(filters.status || "");
  const [selectedLocation, setSelectedLocation] = useState(
    filters.location || ""
  );
  const [selectedClientType, setSelectedClientType] = useState(
    filters.clientType || ""
  );
  const [dateRange, setDateRange] = useState({
    start: filters.dateRange?.start || "",
    end: filters.dateRange?.end || "",
  });

  // Status options - adjust based on your actual status values
  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "pending", label: "Pending" },
    { value: "assessment", label: "Assessment" },
    { value: "service", label: "Service" },
    { value: "discharged", label: "Discharged" },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    console.log("called filter page ");

    dispatch(setPage(1));
    dispatch(setSearch(debouncedSearch));
    dispatch(fetchClientByVendor());
  }, [debouncedSearch, dispatch]);

  useEffect(() => {
    dispatch(fetchClientTypesByVendor({ limit: 100 }));
    dispatch(fetchLocationsByVendor({ limit: 100 }));
  }, [dispatch]);

  useEffect(() => {
    // Apply filters when they change
    const filterTimer = setTimeout(() => {
      dispatch(setPage(1));
      dispatch(fetchClientByVendor());
    }, 300);

    return () => clearTimeout(filterTimer);
  }, [
    selectedStatus,
    selectedLocation,
    selectedClientType,
    dateRange,
    dispatch,
  ]);

  const handlePageChange = (newPage) => {
    if (
      newPage === pagination.page ||
      newPage < 1 ||
      newPage > pagination.pages
    )
      return;
    dispatch(setPage(newPage));
    dispatch(fetchClientByVendor());
  };

  const handleStatusChange = (e) => {
    const value = e.target.value;
    setSelectedStatus(value);
    dispatch(setStatusFilter(value));
  };

  const handleLocationChange = (e) => {
    const value = e.target.value;
    setSelectedLocation(value);
    dispatch(setLocationFilter(value));
  };

  const handleClientTypeChange = (e) => {
    const value = e.target.value;
    setSelectedClientType(value);
    dispatch(setClientTypeFilter(value));
  };

  const handleDateChange = (field, value) => {
    const newDateRange = { ...dateRange, [field]: value };
    setDateRange(newDateRange);
    dispatch(setDateFilter(newDateRange));
  };

  const handleClearFilters = () => {
    setSelectedStatus("");
    setSelectedLocation("");
    setSelectedClientType("");
    setDateRange({ start: "", end: "" });
    setSearchTextLocal("");
    dispatch(clearAllFilters());
    dispatch(setPage(1));
    dispatch(fetchClientByVendor());
  };

  const hasActiveFilters =
    selectedStatus ||
    selectedLocation ||
    selectedClientType ||
    dateRange.start ||
    dateRange.end ||
    searchText;

  return (
    <div className="bg-white p-3 rounded shadow-sm my-3">
      <div className="d-flex justify-content-between align-items-end flex-wrap gap-3">
        {showSearch && (
          <div className="w-75">
            <div className="d-flex flex-wrap gap-2 align-items-end">
              {/* Search Input */}
              <div className="flex-grow-1" style={{ minWidth: "200px" }}>
                <label className="form-label small text-muted mb-1">
                  Search Clients
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name, ID, etc..."
                  value={searchText}
                  onChange={(e) => setSearchTextLocal(e.target.value)}
                />
              </div>

              {/* Status Filter */}
              <div style={{ minWidth: "150px" }}>
                <label className="form-label small text-muted mb-1">
                  Status
                </label>
                <select
                  className="form-select"
                  value={selectedStatus}
                  onChange={handleStatusChange}
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location Filter */}
              <div style={{ minWidth: "150px" }}>
                <label className="form-label small text-muted mb-1">
                  Location
                </label>
                <select
                  className="form-select"
                  value={selectedLocation}
                  onChange={handleLocationChange}
                >
                  <option value="">All</option>
                  {location.map((manager) => (
                    <option key={manager._id} value={manager._id}>
                      {manager.location}
                    </option>
                  ))}
                </select>
              </div>

              {/* Client Type Filter */}
              <div style={{ minWidth: "150px" }}>
                <label className="form-label small text-muted mb-1">
                  Client Type
                </label>
                <select
                  className="form-select"
                  value={selectedClientType}
                  onChange={handleClientTypeChange}
                >
                  <option value="">All</option>

                  {clientType.map((manager) => (
                    <option key={manager._id} value={manager._id}>
                      {manager.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range Filters */}
              {/* <div style={{ minWidth: "150px" }}>
                <label className="form-label small text-muted mb-1">Start Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={dateRange.start}
                  onChange={(e) => handleDateChange("start", e.target.value)}
                />
              </div>
              
              <div style={{ minWidth: "150px" }}>
                <label className="form-label small text-muted mb-1">End Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={dateRange.end}
                  onChange={(e) => handleDateChange("end", e.target.value)}
                />
              </div> */}

              {/* Clear Filters Button */}
              {hasActiveFilters && (
                <div className="d-flex align-items-end">
                  <button
                    className="btn btn-outline-danger btn-sm h-100"
                    onClick={handleClearFilters}
                    title="Clear all filters"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pagination - unchanged as requested */}
        <div className="d-flex align-items-center ms-auto">
          <button
            className="btn btn-success btn-sm border rounded-start"
            disabled={pagination.page <= 1}
            onClick={() => handlePageChange(1)}
          >
            &laquo;
          </button>
          <button
            className="btn btn-success btn-sm border"
            disabled={pagination.page <= 1}
            onClick={() => handlePageChange(pagination.page - 1)}
          >
            &lsaquo;
          </button>
          <div className="border px-2 py-1 text-success small mx-1 f-11">
            {pagination.total > 0
              ? `${(pagination.page - 1) * pagination.limit + 1} to ${Math.min(
                  pagination.page * pagination.limit,
                  pagination.total
                )} of ${pagination.total} Records`
              : "No Records Found"}
          </div>
          <button
            className="btn btn-success btn-sm border"
            disabled={pagination.page >= pagination.pages}
            onClick={() => handlePageChange(pagination.page + 1)}
          >
            &rsaquo;
          </button>
          <button
            className="btn btn-success btn-sm border rounded-end ms-1"
            disabled={pagination.page >= pagination.pages}
            onClick={() => handlePageChange(pagination.pages)}
          >
            &raquo;
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterSection;
