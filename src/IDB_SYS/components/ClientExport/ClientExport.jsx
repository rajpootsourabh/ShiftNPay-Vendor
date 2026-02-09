import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaFileExport, FaFileExcel, FaFileCsv, FaChevronDown } from 'react-icons/fa';
import PropTypes from 'prop-types';
import axios from 'axios';
import Swal from 'sweetalert2';
import {
  exportAllClientData,
  exportVisibleClientData,
  getExportSummary,
} from '../../utils/clientExportUtils';
import './ClientExport.css';

const BaseUrl = process.env.REACT_APP_BASH_URL;

/**
 * ClientExport Component
 * Dropdown button with export options for client data
 */
const ClientExport = ({ visibleColumns, columnOrder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState('xlsx'); // 'xlsx' or 'csv'
  const dropdownRef = useRef(null);
  const dispatch = useDispatch();
  
  const { filters } = useSelector((state) => state.client);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch all clients with current filters (no pagination)
  const fetchAllClientsForExport = useCallback(async () => {
    const token = localStorage.getItem('shinpay-vendor-token');
    const { search, status, location, clientType, dateStart, dateEnd, dateField } = filters;

    const queryParams = new URLSearchParams({
      page: '1',
      limit: '10000', // Fetch all records
      ...(search && { search }),
      ...(status && { status }),
      ...(location && { location }),
      ...(clientType && { clientType }),
      ...(dateStart && { dateStart }),
      ...(dateEnd && { dateEnd }),
      ...(dateField && { dateField }),
    }).toString();

    const response = await axios.get(`${BaseUrl}/vendor/client?${queryParams}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data?.clients || [];
  }, [filters]);

  // Handle export all data
  const handleExportAll = useCallback(async (format) => {
    setIsExporting(true);
    setIsOpen(false);

    try {
      const clients = await fetchAllClientsForExport();
      
      if (!clients || clients.length === 0) {
        Swal.fire({
          icon: 'info',
          title: 'No Data',
          text: 'No client records found matching the current filters.',
          confirmButtonColor: '#198754',
        });
        return;
      }

      const success = exportAllClientData(clients, format);
      
      if (success) {
        Swal.fire({
          icon: 'success',
          title: 'Export Complete',
          text: `Successfully exported ${clients.length} client records with all columns.`,
          confirmButtonColor: '#198754',
          timer: 2000,
          timerProgressBar: true,
        });
      }
    } catch (error) {
      console.error('Export error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Export Failed',
        text: 'An error occurred while exporting data. Please try again.',
        confirmButtonColor: '#d33',
      });
    } finally {
      setIsExporting(false);
    }
  }, [fetchAllClientsForExport]);

  // Handle export visible columns
  const handleExportVisible = useCallback(async (format) => {
    setIsExporting(true);
    setIsOpen(false);

    try {
      const clients = await fetchAllClientsForExport();
      
      if (!clients || clients.length === 0) {
        Swal.fire({
          icon: 'info',
          title: 'No Data',
          text: 'No client records found matching the current filters.',
          confirmButtonColor: '#198754',
        });
        return;
      }

      const success = exportVisibleClientData(clients, visibleColumns, columnOrder, format);
      
      if (success) {
        const visibleCount = visibleColumns.filter(id => id !== 'actions').length;
        Swal.fire({
          icon: 'success',
          title: 'Export Complete',
          text: `Successfully exported ${clients.length} client records with ${visibleCount} visible columns.`,
          confirmButtonColor: '#198754',
          timer: 2000,
          timerProgressBar: true,
        });
      }
    } catch (error) {
      console.error('Export error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Export Failed',
        text: 'An error occurred while exporting data. Please try again.',
        confirmButtonColor: '#d33',
      });
    } finally {
      setIsExporting(false);
    }
  }, [fetchAllClientsForExport, visibleColumns, columnOrder]);

  // Toggle format between xlsx and csv
  const toggleFormat = useCallback(() => {
    setExportFormat(prev => prev === 'xlsx' ? 'csv' : 'xlsx');
  }, []);

  return (
    <div className="client-export-dropdown" ref={dropdownRef}>
      <button
        className="btn btn-outline-success btn-sm d-flex align-items-center"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        title="Export client data"
      >
        {isExporting ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status" />
            Exporting...
          </>
        ) : (
          <>
            <FaFileExport className="me-2" />
            Export
            <FaChevronDown className={`ms-2 dropdown-arrow ${isOpen ? 'open' : ''}`} />
          </>
        )}
      </button>

      {isOpen && (
        <div className="client-export-menu">
          {/* Format Toggle */}
          <div className="export-format-toggle">
            <span className="format-label">Format:</span>
            <button
              className={`format-btn ${exportFormat === 'xlsx' ? 'active' : ''}`}
              onClick={() => setExportFormat('xlsx')}
              title="Excel format"
            >
              <FaFileExcel className="me-1" />
              Excel
            </button>
            <button
              className={`format-btn ${exportFormat === 'csv' ? 'active' : ''}`}
              onClick={() => setExportFormat('csv')}
              title="CSV format"
            >
              <FaFileCsv className="me-1" />
              CSV
            </button>
          </div>

          <div className="export-divider" />

          {/* Export All Data */}
          <button
            className="export-option"
            onClick={() => handleExportAll(exportFormat)}
            disabled={isExporting}
          >
            <div className="export-option-content">
              <span className="export-option-title">Export All Data</span>
              <span className="export-option-desc">
                All columns • Respects filters
              </span>
            </div>
          </button>

          {/* Export Visible Columns */}
          <button
            className="export-option"
            onClick={() => handleExportVisible(exportFormat)}
            disabled={isExporting}
          >
            <div className="export-option-content">
              <span className="export-option-title">Export Visible Columns</span>
              <span className="export-option-desc">
                Only selected columns • Respects filters
              </span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

ClientExport.propTypes = {
  visibleColumns: PropTypes.arrayOf(PropTypes.string).isRequired,
  columnOrder: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default React.memo(ClientExport);
