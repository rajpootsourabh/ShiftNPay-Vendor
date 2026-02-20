import "bootstrap/dist/css/bootstrap.min.css";
import "./../css/custom.css";
import React, { useEffect, useState } from "react";
import {
  Button,
  FormGroup,
  Label,
  Modal,
  ModalHeader,
  ModalBody,
} from "reactstrap";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import {
  getAssignedDocuments,
  fetchAssignedDocuments,
  assignDocumentToMember,
  deleteAssignedDocument,
} from "../store/AssignedDocument/assignedDocumentSlice";
import { getUserName, timeAgo } from "../Helper/functions";
import moment from "moment";
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { fetchEmployeesByVendor } from "../store/Tracker/trackerSlice";
import swal from "sweetalert";
import { fetchDocuments, seedOnboardingForms } from "../store/Product/documentSlice";
const BaseUrl = process.env.REACT_APP_BASH_DOC_URL;

/* ═══════════════════════════════════════════════════════════════════════════════
   RECEIVE DOCUMENT SECTION COMPONENT
   Displays a tracking table for assigned documents showing:
   - Employee Name, Form Name, Assigned By, Assigned Date
   - Status (Pending/In Progress/Completed), Completed Date, Action
   
   Document Lifecycle:
   - "Pending" → Pending (yellow badge) - Document assigned, not started
   - "In Progress" → In Progress (blue badge) - Employee started working
   - "Completed" → Completed (green badge) - Employee submitted
═══════════════════════════════════════════════════════════════════════════════ */
const ReceiveDocumentSection = ({ assignedDocuments, getUserName, isModal = false }) => {
  // Status filter state
  const [statusFilter, setStatusFilter] = useState('All');

  // Helper function to derive display status from backend status
  const getDisplayStatus = (item) => {
    const backendStatus = item?.status?.toLowerCase() || 'pending';
    if (backendStatus === 'submitted' || backendStatus === 'completed') {
      return 'Completed';
    }
    if (backendStatus === 'in progress' || backendStatus === 'inprogress') {
      return 'In Progress';
    }
    return 'Pending';
  };

  // Filter documents based on selected status
  const filteredDocuments = assignedDocuments?.filter((item) => {
    if (statusFilter === 'All') return true;
    return getDisplayStatus(item) === statusFilter;
  }) || [];

  // Helper function to get badge style based on status
  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Completed':
        return {
          background: '#dcfce7',
          color: '#15803d',
          border: '1px solid #86efac',
        };
      case 'In Progress':
        return {
          background: '#dbeafe',
          color: '#1d4ed8',
          border: '1px solid #93c5fd',
        };
      case 'Pending':
      default:
        return {
          background: '#fef3c7',
          color: '#b45309',
          border: '1px solid #fcd34d',
        };
    }
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return moment(dateString).format('MMM DD, YYYY');
  };

  // Format datetime helper for detailed view
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return moment(dateString).format('MMM DD, YYYY HH:mm');
  };

  // Handle View Submission - opens the submitted PDF
  const handleViewSubmission = (fileUrl) => {
    console.log('handleViewSubmission called with fileUrl:', fileUrl);
    
    if (!fileUrl) {
      toast.warning('No submission file available');
      return;
    }
    
    // Construct full URL - handle both old format (api/vendor-documents/...) and new format (vendor-documents/...)
    const baseDocUrl = BaseUrl?.replace(/\/$/, '') || 'http://localhost:4000';
    const cleanFileUrl = fileUrl.startsWith('/') ? fileUrl.slice(1) : fileUrl;
    const fullUrl = `${baseDocUrl}/${cleanFileUrl}`;
    
    console.log('Opening URL:', fullUrl);
    window.open(fullUrl, '_blank');
  };

  // Handle Remind button (UI only for now)
  const handleRemind = (item) => {
    const employeeName = getUserName(item?.assignedTo) || 'Employee';
    const formName = item?.documentId?.fileName || 'the document';
    toast.info(`Reminder sent to ${employeeName} for ${formName}`, {
      autoClose: 3000,
    });
  };

  return (
    <div
      style={{
        marginTop: isModal ? '0' : '40px',
        background: isModal ? '#fff' : 'linear-gradient(135deg, #f0fdf4 0%, #f0f9ff 100%)',
        borderRadius: isModal ? '0' : '16px',
        padding: isModal ? '20px' : '28px',
        border: isModal ? 'none' : '1px solid #e0f2e9',
      }}
    >
      {/* Section Header - Hidden in modal since modal has its own header */}
      {!isModal && (
      <div className="d-flex justify-content-between align-items-center" style={{ marginBottom: '20px' }}>
        <div className="d-flex align-items-center" style={{ gap: '12px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0369a1, #0284c7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(3,105,161,0.25)',
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="white" viewBox="0 0 512 512">
              <path d="M152.1 38.2c9.9 8.9 10.7 24 1.8 33.9l-72 80c-4.4 4.9-10.6 7.8-17.2 7.9s-12.9-2.4-17.6-7L7 113C-2.3 103.6-2.3 88.4 7 79s24.6-9.4 33.9 0l22.1 22.1 55.1-61.2c8.9-9.9 24-10.7 33.9-1.8zm0 160c9.9 8.9 10.7 24 1.8 33.9l-72 80c-4.4 4.9-10.6 7.8-17.2 7.9s-12.9-2.4-17.6-7L7 273c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l22.1 22.1 55.1-61.2c8.9-9.9 24-10.7 33.9-1.8zM224 96c0-17.7 14.3-32 32-32H480c17.7 0 32 14.3 32 32s-14.3 32-32 32H256c-17.7 0-32-14.3-32-32zm0 160c0-17.7 14.3-32 32-32H480c17.7 0 32 14.3 32 32s-14.3 32-32 32H256c-17.7 0-32-14.3-32-32zM160 416c0-17.7 14.3-32 32-32H480c17.7 0 32 14.3 32 32s-14.3 32-32 32H192c-17.7 0-32-14.3-32-32zM48 368a48 48 0 1 1 0 96 48 48 0 1 1 0-96z" />
            </svg>
          </div>
          <div>
            <h5 style={{ fontWeight: 700, margin: 0, color: '#1a1a1a', fontSize: '18px' }}>
              Receive Document
            </h5>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '13px' }}>
              Track document submissions and employee progress
            </p>
          </div>
        </div>
        <div className="d-flex align-items-center" style={{ gap: '12px' }}>
          {/* Status Filter Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              background: '#fff',
              fontSize: '13px',
              fontWeight: 500,
              color: '#374151',
              cursor: 'pointer',
              outline: 'none',
              minWidth: '140px',
            }}
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
          <span
            style={{
              background: '#e0f2fe',
              color: '#0369a1',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            {filteredDocuments.length} / {assignedDocuments?.length || 0} Documents
          </span>
        </div>
      </div>
      )}

      {/* Tracking Table */}
      <table
        className="custom-table timetracker"
        style={{
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          width: '100%',
        }}
      >
        <thead>
          <tr style={{ background: 'linear-gradient(135deg, #0369a1, #0284c7)' }}>
            <th style={{ color: '#fff', fontWeight: 600, fontSize: '13px', padding: '14px 16px', letterSpacing: '0.3px' }}>
              Employee Name
            </th>
            <th style={{ color: '#fff', fontWeight: 600, fontSize: '13px', padding: '14px 16px', letterSpacing: '0.3px' }}>
              Form Name
            </th>
            <th style={{ color: '#fff', fontWeight: 600, fontSize: '13px', padding: '14px 16px', letterSpacing: '0.3px' }}>
              Assigned By
            </th>
            <th style={{ color: '#fff', fontWeight: 600, fontSize: '13px', padding: '14px 16px', letterSpacing: '0.3px' }}>
              Assigned Date
            </th>
            <th style={{ color: '#fff', fontWeight: 600, fontSize: '13px', padding: '14px 16px', letterSpacing: '0.3px', textAlign: 'center' }}>
              Status
            </th>
            <th style={{ color: '#fff', fontWeight: 600, fontSize: '13px', padding: '14px 16px', letterSpacing: '0.3px' }}>
              Completed Date
            </th>
            <th style={{ color: '#fff', fontWeight: 600, fontSize: '13px', padding: '14px 16px', letterSpacing: '0.3px', textAlign: 'center' }}>
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredDocuments.length > 0 ? (
            filteredDocuments.map((item, idx) => {
              const displayStatus = getDisplayStatus(item);
              const badgeStyle = getStatusBadgeStyle(displayStatus);
              const employeeName = getUserName(item?.assignedTo) || 'N/A';
              const formName = item?.documentId?.fileName || 'N/A';
              const assignedByName = item?.assignedBy?.name || item?.assignedBy?.firstName 
                ? `${item?.assignedBy?.firstName || ''} ${item?.assignedBy?.lastName || ''}`.trim() 
                : 'Vendor';
              const assignedDate = formatDate(item?.createdAt);
              const completedDate = displayStatus === 'Completed' ? formatDate(item?.completedAt || item?.updatedAt) : '—';

              return (
                <tr
                  key={item?._id || idx}
                  style={{
                    background: idx % 2 === 0 ? '#fff' : '#f9fafb',
                    transition: 'background-color 0.15s',
                    height: '56px',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f0fdf4')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#fff' : '#f9fafb')}
                >
                  {/* Employee Name */}
                  <td style={{ padding: '12px 16px', fontWeight: 500, color: '#1f2937', fontSize: '14px' }}>
                    {employeeName}
                  </td>

                  {/* Form Name */}
                  <td style={{ padding: '12px 16px', color: '#374151', fontSize: '14px' }}>
                    {formName}
                  </td>

                  {/* Assigned By */}
                  <td style={{ padding: '12px 16px', color: '#6b7280', fontSize: '13px' }}>
                    {assignedByName}
                  </td>

                  {/* Assigned Date */}
                  <td style={{ padding: '12px 16px', color: '#6b7280', fontSize: '13px' }}>
                    {assignedDate}
                  </td>

                  {/* Status Badge */}
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <span
                      style={{
                        ...badgeStyle,
                        padding: '5px 14px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 600,
                        letterSpacing: '0.3px',
                        display: 'inline-block',
                      }}
                    >
                      {displayStatus}
                    </span>
                  </td>

                  {/* Completed Date */}
                  <td style={{ padding: '12px 16px', color: '#6b7280', fontSize: '13px' }}>
                    {completedDate}
                  </td>

                  {/* Action Buttons */}
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    {displayStatus === 'Completed' ? (
                      <button
                        onClick={() => handleViewSubmission(item?.submittedFileUrl)}
                        style={{
                          background: 'linear-gradient(135deg, #108a00, #28a745)',
                          color: '#fff',
                          border: 'none',
                          padding: '7px 16px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          boxShadow: '0 2px 6px rgba(16,138,0,0.2)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'translateY(-1px)';
                          e.target.style.boxShadow = '0 4px 12px rgba(16,138,0,0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = '0 2px 6px rgba(16,138,0,0.2)';
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="white" viewBox="0 0 576 512">
                          <path d="M288 80c-65.2 0-118.8 29.6-159.9 67.7C89.6 183.5 63 226 49.4 256c13.6 30 40.2 72.5 78.6 108.3C169.2 402.4 222.8 432 288 432s118.8-29.6 159.9-67.7C486.4 328.5 513 286 526.6 256c-13.6-30-40.2-72.5-78.6-108.3C406.8 109.6 353.2 80 288 80zM95.4 112.6C142.5 68.8 207.2 32 288 32s145.5 36.8 192.6 80.6c46.8 43.5 78.1 95.4 93 131.1c3.3 7.9 3.3 16.7 0 24.6c-14.9 35.7-46.2 87.7-93 131.1C433.5 443.2 368.8 480 288 480s-145.5-36.8-192.6-80.6C48.6 356 17.3 304 2.5 268.3c-3.3-7.9-3.3-16.7 0-24.6C17.3 208 48.6 156 95.4 112.6zM288 336c44.2 0 80-35.8 80-80s-35.8-80-80-80s-80 35.8-80 80s35.8 80 80 80z"/>
                        </svg>
                        View Submission
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRemind(item)}
                        style={{
                          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                          color: '#fff',
                          border: 'none',
                          padding: '7px 16px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          boxShadow: '0 2px 6px rgba(245,158,11,0.2)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'translateY(-1px)';
                          e.target.style.boxShadow = '0 4px 12px rgba(245,158,11,0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = '0 2px 6px rgba(245,158,11,0.2)';
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="white" viewBox="0 0 448 512">
                          <path d="M224 0c-17.7 0-32 14.3-32 32V51.2C119 66 64 130.6 64 208v18.8c0 47-17.3 92.4-48.5 127.6l-7.4 8.3c-8.4 9.4-10.4 22.9-5.3 34.4S19.4 416 32 416H416c12.6 0 24-7.4 29.2-18.9s3.1-25-5.3-34.4l-7.4-8.3C401.3 319.2 384 273.9 384 226.8V208c0-77.4-55-142-128-156.8V32c0-17.7-14.3-32-32-32zm45.3 493.3c12-12 18.7-28.3 18.7-45.3H224 160c0 17 6.7 33.3 18.7 45.3s28.3 18.7 45.3 18.7s33.3-6.7 45.3-18.7z"/>
                        </svg>
                        Remind
                      </button>
                    )}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="7" style={{ padding: '40px 20px', textAlign: 'center' }}>
                <div style={{ color: '#9ca3af' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 512 512" style={{ marginBottom: '12px', opacity: 0.5 }}>
                    <path d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zM256 0V128H384L256 0zM112 256H272c8.8 0 16 7.2 16 16s-7.2 16-16 16H112c-8.8 0-16-7.2-16-16s7.2-16 16-16zm0 64H272c8.8 0 16 7.2 16 16s-7.2 16-16 16H112c-8.8 0-16-7.2-16-16s7.2-16 16-16zm0 64H272c8.8 0 16 7.2 16 16s-7.2 16-16 16H112c-8.8 0-16-7.2-16-16s7.2-16 16-16z"/>
                  </svg>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: 500 }}>No documents to track</p>
                  <p style={{ margin: '4px 0 0', fontSize: '13px' }}>Assign documents to employees to see them here</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const DocumentApp = ({ user }) => {
  const dispatch = useDispatch();
  const { documents } = useSelector((state) => state.documents);
  const { assignedDocuments } = useSelector((state) => state.assignedDocuments);
  const { employees } = useSelector((state) => state.timeTracker);
  const [employee, setEmployee] = useState("");
  const [checkedItems, setCheckedItems] = useState([]);
  const [
    editAssignedDocumentModelOpen,
    setEditAssignedDocumentModelOpen,
  ] = useState(false);
  const handleStepsDocumentModalOpen = () => setStepsModalDocumentOpen(true);
  const [isStepsModalDocumentOpen, setStepsModalDocumentOpen] = useState(false);
  const [
    toggleAssignDocumentPopup,
    setToggleAssignDocumentPopup,
  ] = useState(false);
  const [editSteps, setEditSteps] = useState([]);

  const openAssignDocuementModel = () => {
    setCheckedItems([]);
    setEmployee("");
    setToggleAssignDocumentPopup(!toggleAssignDocumentPopup);
  };
  const toggleEditAssignedDocumentModelOpen = () => {
    setEditAssignedDocumentModelOpen(!editAssignedDocumentModelOpen);
  };

  const viewAssignedDocumentPopup = (items) => {
    setEditSteps(items);
  };
  const viewAssignedDocumentDocumentPopup = (items) => {
    handleStepsDocumentModalOpen();
  };

  const handleDocumentSelect = (selectedIds) => {
    setCheckedItems(
      (prevCheckedItems) =>
        prevCheckedItems.includes(selectedIds)
          ? prevCheckedItems.filter((id) => id !== selectedIds) // Deselect
          : [...prevCheckedItems, selectedIds] // Select
    );
  };

  const handleAssignDocument = (e) => {
    e.preventDefault();
    if (employee && checkedItems && checkedItems.length > 0) {
      dispatch(
        assignDocumentToMember({
          employeeId: employee,
          selectedIds: checkedItems,
        })
      ).unwrap()
      .then((result)=>{
        if(result.status){
          const message = result.message || 'Documents assigned successfully.';
          toast.success(message);
          openAssignDocuementModel();
        } else {
          toast.error(result.message || 'Failed to assign documents.');
        }
      })
      .catch((err) => {
        toast.error(err.message || 'Error assigning documents.');
      });
    } else {
      toast.warning('Please select at least one document and an employee.');
    }
  };
  const handleDelete = async (id) => {
    console.log("id", id);
    swal({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then(async (willComplete) => {
      if (willComplete) {
        try {
          await dispatch(deleteAssignedDocument(id))
          .unwrap()
          .then((result)=>{
            console.log(result)
            if(result.status){
              swal("Deleted!", "record has been deleted.", "success");
            }
          }); 
          
        } catch (error) {
          console.error("Error deleting onboarding record:", error);
          swal("Error!", "Failed to delete record", "error");
        }
      }
    });
  };
  const handleView = (fileUrl) => {
    console.log('handleView called with fileUrl:', fileUrl);
    
    if (!fileUrl) {
      console.warn('No submission file URL available');
      toast.warning('No submission file available for this document');
      return;
    }
    
    // Construct full URL - handle both old format (api/vendor-documents/...) and new format (vendor-documents/...)
    const baseDocUrl = process.env.REACT_APP_BASH_URL?.replace('/v1', '') || 'http://localhost:4000';
    const cleanFileUrl = fileUrl.startsWith('/') ? fileUrl.slice(1) : fileUrl;
    const fullUrl = `${baseDocUrl}/${cleanFileUrl}`;
    
    console.log('Opening URL:', fullUrl);
    window.open(fullUrl, "_blank");
  };
  useEffect(() => {
    // Seed onboarding forms first, then fetch assigned documents
    dispatch(seedOnboardingForms()).unwrap()
      .then(() => {
        dispatch(fetchAssignedDocuments());
        dispatch(fetchDocuments({ date: "", search: "", includeSystemForms: 'true' }));
      })
      .catch((err) => {
        console.error('Seed forms error:', err);
        // Still fetch even if seed fails (forms might already exist)
        dispatch(fetchAssignedDocuments());
        dispatch(fetchDocuments({ date: "", search: "", includeSystemForms: 'true' }));
      });
    dispatch(fetchEmployeesByVendor(user?._id));
  }, [dispatch]);



  return (
    <div className="container my-4">
      <div className="row">
        <div className="col-lg-12 col-md-12 col-sm-12 p-4">
          <div className="d-flex justify-content-between align-items-center mb-3 mt-4">
            <button
              className="btn btn-success"
              onClick={openAssignDocuementModel}
            >
              Assign Document
            </button>
          </div>
          <table className="custom-table w-full divide-y divide-gray-200 timetracker">
            <thead>
              <tr>
                <th style={{ paddingLeft: "40px" }}>Employee Info</th>
                <th>Document Id</th>
                <th>Assigned Document</th>
                <th>Uploaded By Employee</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {assignedDocuments?.length ? (
                assignedDocuments?.map((item, idx) => {
                  const docId = item?.documentId;
                  const displayCode = docId?.docIdentity || 'N/A';
                  const displayName = docId?.fileName || 'N/A';
                  const isCompleted = item.status === 'Completed' || item.status === 'Submitted';
                  const isInProgress = item.status === 'In Progress';
                  
                  // Determine badge class based on status
                  let badgeClass = 'bg-warning'; // Default for Pending
                  if (isCompleted) badgeClass = 'bg-success';
                  else if (isInProgress) badgeClass = 'bg-info';
                  
                  return (
                  <tr key={idx} style={{ verticalAlign: "middle" }}>
                    <td >
                      <div>
                        <strong>{getUserName(item?.assignedTo)}</strong>
                      </div>
                    </td>
                    <td className="position-relative">
                      {displayCode}
                    </td>
                    <td className="position-relative">
                      {displayName}
                    </td>


                    <td>{item.status === 'Pending' ? 'N/A' : (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleView(item?.submittedFileUrl)} >
                        View
                      </button>
                    )} </td>
                    <td align="left">
                      <div>
                        <span className={`badge ${badgeClass}`}>
                          {item.status || 'Pending'}
                        </span>
                      </div>
                    </td>
                    <td
                      className="d-flex justify-content-around document-action"
                      style={{ "border-bottom": "none" }}
                    >
                      {isCompleted ? (
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleView(item?.submittedFileUrl)}
                        >
                          View Submission
                        </button>
                      ) : (
                        <button
                          className="btn btn-danger"
                          onClick={() => handleDelete(item?._id)}
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                );})
              ) : (
                <tr>
                  <td className="px-4 py-4 text-center" colSpan="6">
                    <p className="mb-0">No Record Found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          
        </div>
      </div>
      <Modal
        center
        isOpen={toggleAssignDocumentPopup}
        toggle={openAssignDocuementModel}
        style={{ maxWidth: "700px", width: "95%" }}
        className="addEmployee"
      >
        <ModalBody className="d-flex p-4" style={{ minHeight: "320px", maxHeight: "80vh", overflow: "hidden" }}>
          <FormGroup className="w-50" style={{ border: "1px solid lightgray", display: "flex", flexDirection: "column", minWidth: 0 }}>
            <Label for="checklistSelect" className="customHeading">
              <strong>Select Document</strong>
            </Label>
            <div
              style={{
                paddingLeft: "20px",
                maxHeight: "300px",
                overflowY: "auto",
                flex: 1,
              }}
            >
              {documents?.length > 0 ? documents.map((doc) => (
                  <div key={doc._id}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={checkedItems.includes(doc._id)}
                          onChange={() => handleDocumentSelect(doc._id)}
                          sx={{
                            color: checkedItems.includes(doc._id)
                              ? "#4caf50"
                              : "default",
                            "&.Mui-checked": {
                              color: "#4caf50",
                            },
                            "& .MuiSvgIcon-root": {
                              borderRadius: "50%",
                            },
                          }}
                        />
                      }
                      label={doc.fileName || doc.docIdentity}
                      style={{
                        color: checkedItems.includes(doc._id)
                          ? "#4caf50"
                          : "default",
                        fontWeight: checkedItems.includes(doc._id)
                          ? "bold"
                          : "normal",
                      }}
                    />
                  </div>
                )) : (
                  <p style={{ padding: "10px 20px", color: "#999" }}>No forms available</p>
                )}
            </div>
          </FormGroup>
          <FormGroup className="w-50 px-4">
            <Label for="employeeName">Assign To</Label>
            <FormControl fullWidth>
              <Select
                value={employee}
                onChange={(e) => setEmployee(e.target.value)}
              >
                <MenuItem value="">
                  <em>Select</em>
                </MenuItem>
                {employees?.map((employee) => (
                  <MenuItem key={employee._id} value={employee._id}>
                    {getUserName(employee)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </FormGroup>
        </ModalBody>
        <div className="pb-4 text-center">
          <Button
            color="success"
            className="px-5"
            onClick={handleAssignDocument}
          >
            Submit
          </Button>
        </div>
      </Modal>
      <Modal
        center
        isOpen={editAssignedDocumentModelOpen}
        toggle={toggleEditAssignedDocumentModelOpen}
        style={{ maxWidth: "700px", width: "95%" }}
        className="addEmployee"
      >
        <ModalHeader toggle={toggleEditAssignedDocumentModelOpen}>
          View Assigned Document
        </ModalHeader>
        <ModalBody className="d-flex p-4" style={{ minHeight: "320px", maxHeight: "80vh", overflow: "hidden" }}>
          <FormGroup className="w-50" style={{ border: "1px solid lightgray", display: "flex", flexDirection: "column", minWidth: 0 }}>
            <Label for="checklistSelect" className="customHeading">
              <strong>Select Document</strong>
            </Label>
            <div
              style={{
                paddingLeft: "20px",
                maxHeight: "235px",
                overflowY: "auto",
                flex: 1,
              }}
            >
              {documents?.length > 0 ? documents.map((doc) => (
                  <div key={doc._id}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          disabled={true}
                          checked={checkedItems.includes(doc._id)}
                          sx={{
                            color: checkedItems.includes(doc._id)
                              ? "#4caf50"
                              : "default",
                            "&.Mui-checked": {
                              color: "#4caf50",
                            },
                            "& .MuiSvgIcon-root": {
                              borderRadius: "50%",
                            },
                          }}
                        />
                      }
                      label={doc.fileName || doc.docIdentity}
                      style={{
                        color: checkedItems.includes(doc._id)
                          ? "#4caf50"
                          : "default",
                        fontWeight: checkedItems.includes(doc._id)
                          ? "bold"
                          : "normal",
                      }}
                    />
                  </div>
                )) : (
                  <p style={{ padding: "10px 20px", color: "#999" }}>No forms</p>
                )}
            </div>
          </FormGroup>

          <FormGroup className="w-50 px-4">
            <Label for="employeeName">Assigned To</Label>
            <FormControl fullWidth>
              <Select value={employee} disabled>
                <MenuItem value="">
                  <em>Select</em>
                </MenuItem>
                {employees?.map((employee) => (
                  <MenuItem key={employee._id} value={employee._id}>
                    {employee.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </FormGroup>
        </ModalBody>
      </Modal>
    </div>
  );
};

export { ReceiveDocumentSection };
export default DocumentApp;
