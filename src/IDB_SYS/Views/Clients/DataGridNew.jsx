import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import Plus from "./../../assets/images/Plus.png";
import deleteIcon from "./../../assets/images/icons/delete.png";
import audit from "./../../assets/images/icons/audit.png";
import edit from "./../../assets/images/icons/edit.png";
import { FaColumns } from "react-icons/fa";
import Swal from "sweetalert2";
import {
  fetchClientByVendor,
  deleteClient,
} from "../../../store/IDB_SYS/Clients/clientSlice";
import { ColumnChooser } from "../../components/ColumnChooser";
import { useColumnPreferences } from "../../hooks";
import { getColumnById } from "../../config/clientColumnConfig";

/**
 * Enhanced DataGrid Component with Column Chooser
 * Features:
 * - Dynamic column visibility
 * - Column reordering
 * - Persistent user preferences
 * - Adjustable font size
 * - Responsive design
 */
const DataGrid = ({ fontSize = 14 }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { clients } = useSelector((state) => state.client);
  const { user } = useSelector((state) => state.user);
  
  const [apiLoading, setApiLoading] = useState(false);
  const [isColumnChooserOpen, setIsColumnChooserOpen] = useState(false);
  
  // Use the column preferences hook
  const {
    visibleColumns,
    columnOrder,
    isLoading: preferencesLoading,
    isSaving,
    savePreferences,
  } = useColumnPreferences(user?._id);

  // Get ordered and filtered columns based on preferences
  const displayColumns = useMemo(() => {
    // Filter columnOrder to only include visible columns
    const orderedVisibleIds = columnOrder.filter((id) =>
      visibleColumns.includes(id)
    );
    
    // Add any visible columns that might not be in order
    visibleColumns.forEach((id) => {
      if (!orderedVisibleIds.includes(id)) {
        orderedVisibleIds.push(id);
      }
    });

    // Map to full column definitions
    return orderedVisibleIds
      .map((id) => getColumnById(id))
      .filter(Boolean);
  }, [visibleColumns, columnOrder]);

  const editClient = useCallback((clientId) => {
    navigate(`/generations.idb-sys/clients/edit/${clientId}`);
  }, [navigate]);

  const handleDeleteClient = useCallback(async (clientId, clientName) => {
    const result = await Swal.fire({
      title: "Delete Client?",
      text: `Are you sure you want to delete ${clientName}? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      setApiLoading(true);
      try {
        await dispatch(deleteClient(clientId)).unwrap();
        Swal.fire("Deleted!", "Client has been deleted.", "success");
        dispatch(fetchClientByVendor());
      } catch (error) {
        Swal.fire("Error!", "Failed to delete client.", "error");
      } finally {
        setApiLoading(false);
      }
    }
  }, [dispatch]);

  const handleColumnChooserApply = useCallback(({ visibleColumns, columnOrder }) => {
    savePreferences({ visibleColumns, columnOrder });
  }, [savePreferences]);

  useEffect(() => {
    dispatch(fetchClientByVendor());
  }, [dispatch]);

  /**
   * Render cell content based on column type
   */
  const renderCellContent = useCallback((column, row) => {
    // Handle actions column specially
    if (column.id === "actions") {
      return (
        <div className="d-flex flex-wrap">
          <div className="action-buttons">
            <span
              className="d-flex align-items-center"
              style={{ cursor: "pointer" }}
              onClick={() => editClient(row._id)}
              title="Edit client"
            >
              <img src={edit} className="icons mx-1" alt="Edit" />
            </span>
            <span
              className="d-flex align-items-center"
              style={{ cursor: "pointer" }}
              onClick={() => handleDeleteClient(row._id, `${row.firstName} ${row.lastName}`)}
              title="Delete client"
            >
              <img src={deleteIcon} className="icons mx-1" alt="Delete" />
            </span>
            <span
              className="d-flex align-items-center"
              style={{ cursor: "pointer" }}
              title="Audit log"
            >
              <img src={audit} className="icons mx-1" alt="Audit" />
            </span>
          </div>
        </div>
      );
    }

    // Get the accessor function
    if (!column.accessor) return null;

    const value = column.accessor(row);

    // Handle different value types
    switch (column.id) {
      case "name":
        return (
          <>
            {value.primary}
            {value.secondary && (
              <div className="small text-muted">{value.secondary}</div>
            )}
          </>
        );

      case "contact":
        return (
          <>
            {value.email && <div>{value.email}</div>}
            {value.phone1 && <div>{value.phone1}</div>}
            {value.phone2 && <div>Alt: {value.phone2}</div>}
          </>
        );

      case "status":
        return (
          <span className={`badge ${value.isActive ? "bg-success" : "bg-secondary"}`}>
            {value.label}
          </span>
        );

      case "serviceDates":
        return (
          <>
            <div className="small">
              <strong>Start:</strong> {value.start || "N/A"}
            </div>
            <div className="small">
              <strong>End:</strong> {value.end}
            </div>
          </>
        );

      case "address":
        return (
          <>
            {value.line1 && <div>{value.line1}</div>}
            {value.line2 && <div>{value.line2}</div>}
            {(value.city || value.state || value.zip) && (
              <div>
                {value.city}{value.city && value.state ? ", " : ""}{value.state} {value.zip}
              </div>
            )}
          </>
        );

      default:
        // Handle simple string/number values
        if (typeof value === "object" && value !== null) {
          return JSON.stringify(value);
        }
        return value || "";
    }
  }, [editClient, handleDeleteClient]);

  // Show loading state while preferences are loading
  if (preferencesLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center p-5">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Loading Overlay */}
      {(apiLoading || isSaving) && (
        <div className="overlay">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="table-responsive table-striped custom-table-new">
        <table 
          className="table table-bordered"
          style={{ fontSize: `${fontSize}px`, transition: 'font-size 0.15s ease' }}
        >
          <thead className="table-success text-white">
            <tr>
              {displayColumns.map((column) => (
                <th
                  key={column.id}
                  className="text-left"
                  style={{ 
                    minWidth: column.minWidth || 100,
                    whiteSpace: "nowrap",
                    fontSize: `${fontSize}px`
                  }}
                >
                  {column.id === "actions" ? (
                    <div className="d-flex flex-wrap">
                      <div className="custom-btn py-1 round">
                        <Link to="/generations.idb-sys/clients/add">
                          <span className="d-flex align-items-center">
                            <span>
                              <img src={Plus} className="icons mx-1" alt="Add" />
                              {"New"}
                            </span>
                          </span>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {clients?.length > 0 ? (
              clients.map((row) => (
                <tr key={row._id}>
                  {displayColumns.map((column) => (
                    <td key={`${row._id}-${column.id}`}>
                      {renderCellContent(column, row)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={displayColumns.length} className="text-center py-4">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

DataGrid.propTypes = {
  fontSize: PropTypes.number,
};

DataGrid.defaultProps = {
  fontSize: 14,
};

export default React.memo(DataGrid);
