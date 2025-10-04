import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaSearch, FaSave } from "react-icons/fa";
import { getEmployeeListByCategory, getEmployeeMenuAccess, updateEmployeeMenuAccess } from "../../store/Product/employeeAccessSlice";

const Product = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCategoryLoading, setIsCategoryLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const {
    accessList,
    employeeList,
    loading: accessLoading,
    error: accessError,
  } = useSelector((state) => state.employeeAccess);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get("category");

    if (category) {
      setSelectedCategory(category);
      setIsCategoryLoading(true);

      Promise.all([
        dispatch(getEmployeeListByCategory(category)),
        dispatch(getEmployeeMenuAccess(category)),
      ]).then(() => {
        setIsCategoryLoading(false);
      });
    }
  }, [location.search, dispatch]);

  useEffect(() => {
    if (accessList && selectedCategory) {
      const employeesWithAccess = accessList.map((employee) => employee._id);
      setSelectedEmployees(employeesWithAccess);
      setSelectAll(false);
    }
  }, [accessList, selectedCategory]);

  const handleEmployeeSelect = (employeeId) => {
    setSelectedEmployees((prev) =>
      prev.includes(employeeId)
        ? prev.filter((id) => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(employeeList.map((employee) => employee._id));
    }
    setSelectAll(!selectAll);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await dispatch(
        updateEmployeeMenuAccess({
          category: selectedCategory,
          employeeIds: selectedEmployees,
        })
      ).unwrap();
    } catch (error) {
      console.error("Error saving employee access:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredEmployees = Array.isArray(employeeList)
    ? employeeList.filter((employee) =>
        employee.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];
  const pathSegment = selectedCategory
  .toLowerCase()
  .replace(/_/g, ' ')
  .replace(/\b\w/g, (char) => char.toUpperCase());
  return (
    <div className="product-wrap col-md-12 mx-auto py-3">
      <h2><strong>Selected Category:</strong> {pathSegment} </h2>

      {/* Filter Section */}
      <div className="filter mb-4 p-3 bg-light rounded">
        <div className="row w-100 align-items-center">
          <div className="col-md-6 mb-3 mb-md-0">
            <div className="input-group">
              <span className="input-group-text bg-white">
                <FaSearch className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search employees by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ fontSize: "1.1rem" }}
              />
            </div>
          </div>

          <div className="col-md-6 d-flex justify-content-end align-items-center">
            <div className="form-check me-3">
              <input
                className="form-check-input"
                type="checkbox"
                id="checkAll"
                checked={selectAll}
                onChange={handleSelectAll}
                style={{ transform: "scale(1.2)", marginRight: "8px" }}
              />
              <label
                className="form-check-label fw-medium"
                htmlFor="checkAll"
                style={{ fontSize: "1.1rem", cursor: "pointer" }}
              >
                Select All
              </label>
            </div>

            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={isSaving}
              style={{ fontSize: "1.1rem", minWidth: "120px" }}
            >
              {isSaving ? (
                <span className="spinner-border spinner-border-sm me-2" />
              ) : (
                <FaSave className="me-2" />
              )}
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>

      {/* Employee Listing */}
      {isCategoryLoading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <div className="mt-3">Loading employees...</div>
        </div>
      ) : (
        <div className="product-listing">
          {filteredEmployees.length === 0 ? (
            <div
              className="alert alert-info text-center py-3"
              style={{ fontSize: "1.1rem" }}
            >
              {employeeList.length === 0
                ? "No employees found for this category"
                : "No employees match your search"}
            </div>
          ) : (
            <div className="row">
              {[...Array(3)].map((_, colIndex) => {
                const employeesPerColumn = Math.ceil(filteredEmployees.length / 3);
                const startIndex = colIndex * employeesPerColumn;
                const endIndex = startIndex + employeesPerColumn;
                const columnEmployees = filteredEmployees.slice(
                  startIndex,
                  endIndex
                );

                return (
                  <div className="col-md-4" key={colIndex}>
                    {columnEmployees.map((employee) => (
                      <div
                        className="employee-item mb-2 p-2 bg-white rounded"
                        key={employee._id}
                        style={{
                          border: "1px solid #eee",
                          transition: "all 0.2s",
                        }}
                      >
                        <div className="form-check m-0">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`employee-${employee._id}`}
                            checked={selectedEmployees.includes(employee._id)}
                            onChange={() => handleEmployeeSelect(employee._id)}
                            style={{
                              transform: "scale(1.2)",
                              marginRight: "10px",
                            }}
                          />
                          <label
                            className="form-check-label"
                            htmlFor={`employee-${employee._id}`}
                            style={{
                              fontSize: "1.2rem",
                              cursor: "pointer",
                              verticalAlign: "middle",
                            }}
                          >
                            {employee.name}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Product;
