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
  Table,
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
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { fetchEmployeesByVendor } from "../store/Tracker/trackerSlice";
import swal from "sweetalert";
import { fetchDocuments } from "../store/Product/documentSlice";
const BaseUrl = process.env.REACT_APP_BASH_DOC_URL;
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

  useEffect(() => {
    console.log('assignedDocuments : ', assignedDocuments)
  }, [assignedDocuments])


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
    if (employee && checkedItems) {
      dispatch(
        assignDocumentToMember({
          employeeId: employee,
          selectedIds: checkedItems,
        })
      ).unwrap()
      .then((result)=>{
        if(result.status){
          toast.success('Document assigned to employee.');
          openAssignDocuementModel();
        }

      });
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
    window.open(`${BaseUrl + fileUrl}`, "_blank");
  };
  useEffect(() => {
    dispatch(fetchAssignedDocuments()); //fetching the assigned doxcuments to employee.
    dispatch(fetchEmployeesByVendor(user?._id));
    dispatch(fetchDocuments({ date: "", search: "" })) // fetching the avaialble docuemnt uploaded
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
                assignedDocuments?.map((item, idx) => (
                  <tr key={idx} style={{ verticalAlign: "middle" }}>
                    <td >
                      <div>
                        <strong>{getUserName(item?.assignedTo)}</strong>
                      </div>
                    </td>
                    <td className="position-relative">
                      {item?.documentId?.docIdentity}
                    </td>
                    <td className="position-relative">
                      {item?.documentId?.fileName}
                    </td>


                    <td>{item.status == 'Pending' ? 'N/A' : (
                      <button
                        className="btn btn-primary"
                        onClick={() => handleView(item?.submittedFileUrl)} >
                        View

                      </button>
                    )} </td>
                    <td align="left">
                      <div>
                        <div>{timeAgo(item.updatedAt)}</div>
                      </div>
                    </td>
                    <td
                      className="d-flex justify-content-around document-action"
                      style={{ "border-bottom": "none" }}
                    >
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDelete(item?._id)} >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-4 py-4 text-center" colSpan="5">
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
        style={{ minWidth: "950px" }}
        className="addEmployee"
      >
        <ModalBody className="d-flex   p-4" style={{ minHeight: "350px" }}>
          <FormGroup className="w-50" style={{ border: "1px solid lightgray" }}>
            <Label for="checklistSelect" className="customHeading">
              <strong>Select Document</strong>
            </Label>
            <div
              style={{
                paddingLeft: "20px",
                maxHeight: "450px",
                minHeight: "450px",
                overflowY: "scroll",
              }}
            >
              {documents.length &&
                documents?.map((checklist) => (
                  <div>
                    <FormControlLabel
                      key={checklist._id}
                      control={
                        <Checkbox
                          checked={checkedItems.includes(checklist._id)}
                          onChange={() => handleDocumentSelect(checklist._id)}
                          sx={{
                            color: checkedItems.includes(checklist._id)
                              ? "#4caf50"
                              : "default",
                            "&.Mui-checked": {
                              color: "#4caf50",
                            },
                            "& .MuiSvgIcon-root": {
                              borderRadius: "50%", // Make checkbox round
                            },
                          }}
                        />
                      }
                      label={checklist.docIdentity}
                      style={{
                        color: checkedItems.includes(checklist._id)
                          ? "#4caf50"
                          : "default",
                        fontWeight: checkedItems.includes(checklist._id)
                          ? "bold"
                          : "normal",
                      }}
                    />
                  </div>
                ))}
            </div>
          </FormGroup>
          <FormGroup className="w-50  px-4 ">
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
        style={{ minWidth: "750px" }}
        className="addEmployee"
      >
        <ModalHeader toggle={toggleEditAssignedDocumentModelOpen}>
          View Assigned Document
        </ModalHeader>
        <ModalBody className="d-flex p-4" style={{ minHeight: "350px" }}>
          <FormGroup className="w-50" style={{ border: "1px solid lightgray" }}>
            <Label for="checklistSelect" className="customHeading">
              <strong>Select Document</strong>
            </Label>
            <div
              style={{
                paddingLeft: "20px",
                maxHeight: "235px",
                minHeight: "235px",
                overflowY: "scroll",
              }}
            >
              {documents.length &&
                documents?.map((checklist) => (
                  <div key={checklist._id}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          disabled={true}
                          checked={checkedItems.includes(checklist._id)}
                          // onChange={() => handleDocumentSelect(checklist._id)}
                          sx={{
                            color: checkedItems.includes(checklist._id)
                              ? "#4caf50"
                              : "default",
                            "&.Mui-checked": {
                              color: "#4caf50",
                            },
                            "& .MuiSvgIcon-root": {
                              borderRadius: "50%", // Make checkbox round
                            },
                          }}
                        />
                      }
                      label={checklist.fileName}
                      style={{
                        color: checkedItems.includes(checklist._id)
                          ? "#4caf50"
                          : "default",
                        fontWeight: checkedItems.includes(checklist._id)
                          ? "bold"
                          : "normal",
                      }}
                    />
                  </div>
                ))}
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

export default DocumentApp;
