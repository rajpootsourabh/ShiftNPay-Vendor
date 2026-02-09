/**
 * Client Column Configuration
 * Centralized configuration for all client-related columns
 * Used by DataGrid and ColumnChooser components
 */

// Column categories for grouping in the column chooser
export const COLUMN_CATEGORIES = {
  PERSONAL: 'Personal Information',
  CONTACT: 'Contact Information',
  ADDRESS: 'Address',
  SERVICE: 'Service Information',
  MEDICAL: 'Medical Information',
  BILLING: 'Billing',
  SYSTEM: 'System Fields',
};

// Required columns that cannot be hidden
export const REQUIRED_COLUMNS = ['actions', 'name', 'status'];

// Default visible columns (initial state)
export const DEFAULT_VISIBLE_COLUMNS = [
  'actions',
  'name',
  'contact',
  'status',
  'serviceDates',
  'address',
];

/**
 * Complete column definitions for client list
 * Each column has:
 * - id: unique identifier
 * - label: display name
 * - category: grouping category
 * - accessor: function to get display value from row data
 * - minWidth: minimum column width
 * - sortable: whether column can be sorted
 * - required: whether column can be hidden
 */
export const CLIENT_COLUMNS = [
  {
    id: 'actions',
    label: 'Actions',
    category: COLUMN_CATEGORIES.SYSTEM,
    minWidth: 90,
    sortable: false,
    required: true,
    accessor: null, // Actions column has custom rendering
  },
  {
    id: 'name',
    label: 'Name',
    category: COLUMN_CATEGORIES.PERSONAL,
    minWidth: 150,
    sortable: true,
    required: true,
    accessor: (row) => {
      const name = `${row.firstName || ''} ${row.middleInitial || ''} ${row.lastName || ''}`.trim();
      return { primary: name, secondary: row.dob ? `DOB: ${new Date(row.dob).toLocaleDateString()}` : '' };
    },
  },
  {
    id: 'firstName',
    label: 'First Name',
    category: COLUMN_CATEGORIES.PERSONAL,
    minWidth: 100,
    sortable: true,
    required: false,
    accessor: (row) => row.firstName || '',
  },
  {
    id: 'middleInitial',
    label: 'Middle Initial',
    category: COLUMN_CATEGORIES.PERSONAL,
    minWidth: 80,
    sortable: true,
    required: false,
    accessor: (row) => row.middleInitial || '',
  },
  {
    id: 'lastName',
    label: 'Last Name',
    category: COLUMN_CATEGORIES.PERSONAL,
    minWidth: 100,
    sortable: true,
    required: false,
    accessor: (row) => row.lastName || '',
  },
  {
    id: 'dob',
    label: 'Date of Birth',
    category: COLUMN_CATEGORIES.PERSONAL,
    minWidth: 110,
    sortable: true,
    required: false,
    accessor: (row) => row.dob ? new Date(row.dob).toLocaleDateString() : '',
  },
  {
    id: 'gender',
    label: 'Gender',
    category: COLUMN_CATEGORIES.PERSONAL,
    minWidth: 80,
    sortable: true,
    required: false,
    accessor: (row) => {
      const genderMap = { M: 'Male', F: 'Female', O: 'Other' };
      return genderMap[row.gender] || row.gender || '';
    },
  },
  {
    id: 'ssn',
    label: 'SSN',
    category: COLUMN_CATEGORIES.PERSONAL,
    minWidth: 100,
    sortable: false,
    required: false,
    accessor: (row) => row.ssn ? `***-**-${row.ssn.slice(-4)}` : '',
  },
  {
    id: 'contact',
    label: 'Contact',
    category: COLUMN_CATEGORIES.CONTACT,
    minWidth: 150,
    sortable: false,
    required: false,
    accessor: (row) => ({
      email: row.email || '',
      phone1: row.phone1 || '',
      phone2: row.phone2 || '',
    }),
  },
  {
    id: 'email',
    label: 'Email',
    category: COLUMN_CATEGORIES.CONTACT,
    minWidth: 180,
    sortable: true,
    required: false,
    accessor: (row) => row.email || '',
  },
  {
    id: 'phone1',
    label: 'Primary Phone',
    category: COLUMN_CATEGORIES.CONTACT,
    minWidth: 120,
    sortable: false,
    required: false,
    accessor: (row) => row.phone1 || '',
  },
  {
    id: 'phone2',
    label: 'Alternate Phone',
    category: COLUMN_CATEGORIES.CONTACT,
    minWidth: 120,
    sortable: false,
    required: false,
    accessor: (row) => row.phone2 || '',
  },
  {
    id: 'status',
    label: 'Status',
    category: COLUMN_CATEGORIES.SYSTEM,
    minWidth: 80,
    sortable: true,
    required: true,
    accessor: (row) => ({
      value: row.status,
      label: row.status === 'A' ? 'Active' : 'Inactive',
      isActive: row.status === 'A',
    }),
  },
  {
    id: 'serviceDates',
    label: 'Service Dates',
    category: COLUMN_CATEGORIES.SERVICE,
    minWidth: 130,
    sortable: true,
    required: false,
    accessor: (row) => ({
      start: row.serviceStart ? new Date(row.serviceStart).toLocaleDateString() : '',
      end: row.serviceEnd ? new Date(row.serviceEnd).toLocaleDateString() : 'Present',
    }),
  },
  {
    id: 'serviceStart',
    label: 'Service Start',
    category: COLUMN_CATEGORIES.SERVICE,
    minWidth: 110,
    sortable: true,
    required: false,
    accessor: (row) => row.serviceStart ? new Date(row.serviceStart).toLocaleDateString() : '',
  },
  {
    id: 'serviceEnd',
    label: 'Service End',
    category: COLUMN_CATEGORIES.SERVICE,
    minWidth: 110,
    sortable: true,
    required: false,
    accessor: (row) => row.serviceEnd ? new Date(row.serviceEnd).toLocaleDateString() : 'Present',
  },
  {
    id: 'address',
    label: 'Address',
    category: COLUMN_CATEGORIES.ADDRESS,
    minWidth: 200,
    sortable: false,
    required: false,
    accessor: (row) => ({
      line1: row.homeAddress1 || '',
      line2: row.homeAddress2 || '',
      city: row.homeCity || '',
      state: row.homeState || '',
      zip: row.homeZip || '',
    }),
  },
  {
    id: 'homeAddress1',
    label: 'Address Line 1',
    category: COLUMN_CATEGORIES.ADDRESS,
    minWidth: 150,
    sortable: false,
    required: false,
    accessor: (row) => row.homeAddress1 || '',
  },
  {
    id: 'homeAddress2',
    label: 'Address Line 2',
    category: COLUMN_CATEGORIES.ADDRESS,
    minWidth: 150,
    sortable: false,
    required: false,
    accessor: (row) => row.homeAddress2 || '',
  },
  {
    id: 'homeCity',
    label: 'City',
    category: COLUMN_CATEGORIES.ADDRESS,
    minWidth: 100,
    sortable: true,
    required: false,
    accessor: (row) => row.homeCity || '',
  },
  {
    id: 'homeState',
    label: 'State',
    category: COLUMN_CATEGORIES.ADDRESS,
    minWidth: 80,
    sortable: true,
    required: false,
    accessor: (row) => row.homeState || '',
  },
  {
    id: 'homeZip',
    label: 'Zip Code',
    category: COLUMN_CATEGORIES.ADDRESS,
    minWidth: 80,
    sortable: true,
    required: false,
    accessor: (row) => row.homeZip || '',
  },
  {
    id: 'homeCountry',
    label: 'Country',
    category: COLUMN_CATEGORIES.ADDRESS,
    minWidth: 100,
    sortable: true,
    required: false,
    accessor: (row) => row.homeCountry || '',
  },
  {
    id: 'inquiryDate',
    label: 'Inquiry Date',
    category: COLUMN_CATEGORIES.SERVICE,
    minWidth: 110,
    sortable: true,
    required: false,
    accessor: (row) => row.inquiryDate ? new Date(row.inquiryDate).toLocaleDateString() : '',
  },
  {
    id: 'assessmentDate',
    label: 'Assessment Date',
    category: COLUMN_CATEGORIES.SERVICE,
    minWidth: 120,
    sortable: true,
    required: false,
    accessor: (row) => row.assessmentDate ? new Date(row.assessmentDate).toLocaleDateString() : '',
  },
  {
    id: 'caseManager',
    label: 'Case Manager',
    category: COLUMN_CATEGORIES.SERVICE,
    minWidth: 130,
    sortable: true,
    required: false,
    accessor: (row) => row.caseManager?.name || row.caseManagerName || '',
  },
  {
    id: 'clientType',
    label: 'Client Type',
    category: COLUMN_CATEGORIES.SERVICE,
    minWidth: 120,
    sortable: true,
    required: false,
    accessor: (row) => row.clientType?.description || row.clientTypeName || '',
  },
  {
    id: 'locationId',
    label: 'Location',
    category: COLUMN_CATEGORIES.SERVICE,
    minWidth: 120,
    sortable: true,
    required: false,
    accessor: (row) => row.locationId?.location || row.locationName || '',
  },
  {
    id: 'referredBy',
    label: 'Referred By',
    category: COLUMN_CATEGORIES.SERVICE,
    minWidth: 130,
    sortable: true,
    required: false,
    accessor: (row) => row.referredBy?.name || row.referredByName || '',
  },
  {
    id: 'referralNumber',
    label: 'Referral Number',
    category: COLUMN_CATEGORIES.SERVICE,
    minWidth: 120,
    sortable: true,
    required: false,
    accessor: (row) => row.referralNumber || '',
  },
  {
    id: 'physician',
    label: 'Physician',
    category: COLUMN_CATEGORIES.MEDICAL,
    minWidth: 130,
    sortable: true,
    required: false,
    accessor: (row) => row.physician?.name || row.physicianName || '',
  },
  {
    id: 'diagnosisCode',
    label: 'Diagnosis Code',
    category: COLUMN_CATEGORIES.MEDICAL,
    minWidth: 110,
    sortable: true,
    required: false,
    accessor: (row) => row.diagnosisCode || '',
  },
  {
    id: 'diagnosisDescription',
    label: 'Diagnosis Description',
    category: COLUMN_CATEGORIES.MEDICAL,
    minWidth: 180,
    sortable: false,
    required: false,
    accessor: (row) => row.diagnosisDescription || '',
  },
  {
    id: 'ambulatory',
    label: 'Ambulatory Status',
    category: COLUMN_CATEGORIES.MEDICAL,
    minWidth: 120,
    sortable: true,
    required: false,
    accessor: (row) => row.ambulatory || '',
  },
  {
    id: 'dnr',
    label: 'DNR',
    category: COLUMN_CATEGORIES.MEDICAL,
    minWidth: 60,
    sortable: true,
    required: false,
    accessor: (row) => row.dnr ? 'Yes' : 'No',
  },
  {
    id: 'medRecordNumber',
    label: 'Med Record Number',
    category: COLUMN_CATEGORIES.MEDICAL,
    minWidth: 130,
    sortable: true,
    required: false,
    accessor: (row) => row.medRecordNumber || '',
  },
  {
    id: 'covidVaccinated',
    label: 'COVID Vaccinated',
    category: COLUMN_CATEGORIES.MEDICAL,
    minWidth: 120,
    sortable: true,
    required: false,
    accessor: (row) => row.covidVaccinated ? 'Yes' : 'No',
  },
  {
    id: 'vaccineType',
    label: 'Vaccine Type',
    category: COLUMN_CATEGORIES.MEDICAL,
    minWidth: 110,
    sortable: true,
    required: false,
    accessor: (row) => row.vaccineType || '',
  },
  {
    id: 'vaccineDate',
    label: 'Vaccine Date',
    category: COLUMN_CATEGORIES.MEDICAL,
    minWidth: 110,
    sortable: true,
    required: false,
    accessor: (row) => row.vaccineDate ? new Date(row.vaccineDate).toLocaleDateString() : '',
  },
  {
    id: 'billingPayor',
    label: 'Billing Payor',
    category: COLUMN_CATEGORIES.BILLING,
    minWidth: 120,
    sortable: true,
    required: false,
    accessor: (row) => row.billingPayor?.name || row.billingPayorName || '',
  },
  {
    id: 'billingAddress',
    label: 'Billing Address',
    category: COLUMN_CATEGORIES.BILLING,
    minWidth: 180,
    sortable: false,
    required: false,
    accessor: (row) => {
      const parts = [
        row.billingAddress1,
        row.billingAddress2,
        row.billingCity,
        row.billingState,
        row.billingZip,
      ].filter(Boolean);
      return parts.join(', ');
    },
  },
  {
    id: 'evvId',
    label: 'EVV ID',
    category: COLUMN_CATEGORIES.SYSTEM,
    minWidth: 100,
    sortable: true,
    required: false,
    accessor: (row) => row.evvId || '',
  },
  {
    id: 'accountingId',
    label: 'Accounting ID',
    category: COLUMN_CATEGORIES.SYSTEM,
    minWidth: 110,
    sortable: true,
    required: false,
    accessor: (row) => row.accountingId || '',
  },
  {
    id: 'priority',
    label: 'Priority',
    category: COLUMN_CATEGORIES.SERVICE,
    minWidth: 80,
    sortable: true,
    required: false,
    accessor: (row) => row.priority || '',
  },
  {
    id: 'weight',
    label: 'Weight',
    category: COLUMN_CATEGORIES.MEDICAL,
    minWidth: 80,
    sortable: true,
    required: false,
    accessor: (row) => row.weight ? `${row.weight} lbs` : '',
  },
  {
    id: 'enableWebLogin',
    label: 'Web Login Enabled',
    category: COLUMN_CATEGORIES.SYSTEM,
    minWidth: 120,
    sortable: true,
    required: false,
    accessor: (row) => row.enableWebLogin ? 'Yes' : 'No',
  },
  {
    id: 'createdAt',
    label: 'Created Date',
    category: COLUMN_CATEGORIES.SYSTEM,
    minWidth: 110,
    sortable: true,
    required: false,
    accessor: (row) => row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '',
  },
  {
    id: 'updatedAt',
    label: 'Updated Date',
    category: COLUMN_CATEGORIES.SYSTEM,
    minWidth: 110,
    sortable: true,
    required: false,
    accessor: (row) => row.updatedAt ? new Date(row.updatedAt).toLocaleDateString() : '',
  },
];

/**
 * Get column definition by ID
 * @param {string} columnId 
 * @returns {Object|undefined}
 */
export const getColumnById = (columnId) => {
  return CLIENT_COLUMNS.find(col => col.id === columnId);
};

/**
 * Get columns grouped by category
 * @returns {Object}
 */
export const getColumnsByCategory = () => {
  return CLIENT_COLUMNS.reduce((acc, col) => {
    if (!acc[col.category]) {
      acc[col.category] = [];
    }
    acc[col.category].push(col);
    return acc;
  }, {});
};

/**
 * Filter columns by IDs and maintain order
 * @param {string[]} columnIds - Array of column IDs in desired order
 * @returns {Object[]}
 */
export const getOrderedColumns = (columnIds) => {
  return columnIds
    .map(id => getColumnById(id))
    .filter(Boolean);
};

/**
 * Storage key for column preferences
 */
export const COLUMN_PREFERENCES_KEY = 'shipnpay_client_column_preferences';

/**
 * Default column preferences structure
 */
export const getDefaultColumnPreferences = () => ({
  visibleColumns: [...DEFAULT_VISIBLE_COLUMNS],
  columnOrder: [...DEFAULT_VISIBLE_COLUMNS],
});

export default CLIENT_COLUMNS;
