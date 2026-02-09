/**
 * Client Export Utility
 * Handles exporting client data to CSV and Excel formats
 */
import * as XLSX from 'xlsx';
import { CLIENT_COLUMNS, getColumnById } from '../config/clientColumnConfig';

/**
 * Format date for filename
 * @returns {string} Formatted date string YYYY_MM_DD
 */
const getFormattedDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}_${month}_${day}`;
};

/**
 * Get export filename
 * @param {string} type - Export type ('all' or 'visible')
 * @param {string} format - File format ('csv' or 'xlsx')
 * @returns {string} Formatted filename
 */
const getExportFilename = (type, format) => {
  const dateStr = getFormattedDate();
  return `clients_export_${type}_${dateStr}.${format}`;
};

/**
 * Get all exportable columns (excluding actions)
 * @returns {Array} Array of column definitions
 */
export const getAllExportColumns = () => {
  return CLIENT_COLUMNS.filter(col => col.id !== 'actions' && col.accessor);
};

/**
 * Get visible columns for export based on column preferences
 * @param {Array} visibleColumnIds - Array of visible column IDs
 * @param {Array} columnOrder - Array of column IDs in order
 * @returns {Array} Array of column definitions in order
 */
export const getVisibleExportColumns = (visibleColumnIds, columnOrder) => {
  // Filter and order columns based on preferences
  const orderedIds = columnOrder.filter(id => 
    visibleColumnIds.includes(id) && id !== 'actions'
  );
  
  // Add any visible columns not in order
  visibleColumnIds.forEach(id => {
    if (!orderedIds.includes(id) && id !== 'actions') {
      orderedIds.push(id);
    }
  });

  return orderedIds
    .map(id => getColumnById(id))
    .filter(col => col && col.accessor);
};

/**
 * Extract simple value from accessor result
 * Handles complex objects returned by accessors
 * @param {any} value - Value from accessor
 * @param {string} columnId - Column ID for special handling
 * @returns {string} Simple string value
 */
const extractSimpleValue = (value, columnId) => {
  if (value === null || value === undefined) return '';
  
  // Handle specific column types
  switch (columnId) {
    case 'name':
      return typeof value === 'object' ? value.primary || '' : value;
    
    case 'contact':
      if (typeof value === 'object') {
        const parts = [value.email, value.phone1, value.phone2].filter(Boolean);
        return parts.join(' | ');
      }
      return value;
    
    case 'status':
      if (typeof value === 'object') {
        return value.label || (value.isActive ? 'Active' : 'Inactive');
      }
      return value === 'A' ? 'Active' : value === 'I' ? 'Inactive' : value;
    
    case 'serviceDates':
      if (typeof value === 'object') {
        return `Start: ${value.start || 'N/A'}, End: ${value.end || 'Present'}`;
      }
      return value;
    
    case 'address':
      if (typeof value === 'object') {
        const parts = [
          value.line1,
          value.line2,
          value.city,
          value.state,
          value.zip
        ].filter(Boolean);
        return parts.join(', ');
      }
      return value;
    
    default:
      if (typeof value === 'object') {
        return JSON.stringify(value);
      }
      return String(value);
  }
};

/**
 * Transform client data for export
 * @param {Array} clients - Array of client objects
 * @param {Array} columns - Array of column definitions to export
 * @returns {Array} Array of objects with column labels as keys
 */
const transformDataForExport = (clients, columns) => {
  if (!clients || clients.length === 0) return [];

  return clients.map(client => {
    const row = {};
    columns.forEach(column => {
      if (column.accessor) {
        const value = column.accessor(client);
        row[column.label] = extractSimpleValue(value, column.id);
      }
    });
    return row;
  });
};

/**
 * Export data to CSV format
 * @param {Array} data - Transformed data array
 * @param {string} filename - Export filename
 */
const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return false;
  }

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Clients');
  
  // Write as CSV
  XLSX.writeFile(workbook, filename, { bookType: 'csv' });
  return true;
};

/**
 * Export data to Excel format
 * @param {Array} data - Transformed data array
 * @param {string} filename - Export filename
 */
const exportToExcel = (data, filename) => {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return false;
  }

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Clients');
  
  // Auto-size columns
  const maxWidth = 50;
  const colWidths = Object.keys(data[0] || {}).map(key => ({
    wch: Math.min(
      maxWidth,
      Math.max(key.length, ...data.map(row => String(row[key] || '').length))
    )
  }));
  worksheet['!cols'] = colWidths;
  
  // Write as Excel
  XLSX.writeFile(workbook, filename);
  return true;
};

/**
 * Export all client data
 * @param {Array} clients - Array of client objects
 * @param {string} format - Export format ('csv' or 'xlsx')
 * @returns {boolean} Success status
 */
export const exportAllClientData = (clients, format = 'xlsx') => {
  const columns = getAllExportColumns();
  const data = transformDataForExport(clients, columns);
  const filename = getExportFilename('all', format);
  
  if (format === 'csv') {
    return exportToCSV(data, filename);
  }
  return exportToExcel(data, filename);
};

/**
 * Export visible columns only
 * @param {Array} clients - Array of client objects
 * @param {Array} visibleColumnIds - Array of visible column IDs
 * @param {Array} columnOrder - Array of column IDs in order
 * @param {string} format - Export format ('csv' or 'xlsx')
 * @returns {boolean} Success status
 */
export const exportVisibleClientData = (clients, visibleColumnIds, columnOrder, format = 'xlsx') => {
  const columns = getVisibleExportColumns(visibleColumnIds, columnOrder);
  const data = transformDataForExport(clients, columns);
  const filename = getExportFilename('visible', format);
  
  if (format === 'csv') {
    return exportToCSV(data, filename);
  }
  return exportToExcel(data, filename);
};

/**
 * Get export summary info
 * @param {Array} clients - Array of client objects
 * @param {Array} visibleColumnIds - Array of visible column IDs
 * @returns {Object} Summary with record and column counts
 */
export const getExportSummary = (clients, visibleColumnIds) => {
  const allColumns = getAllExportColumns();
  const visibleColumns = visibleColumnIds.filter(id => id !== 'actions');
  
  return {
    totalRecords: clients?.length || 0,
    allColumnsCount: allColumns.length,
    visibleColumnsCount: visibleColumns.length,
  };
};

export default {
  exportAllClientData,
  exportVisibleClientData,
  getAllExportColumns,
  getVisibleExportColumns,
  getExportSummary,
};
