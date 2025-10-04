import "bootstrap/dist/css/bootstrap.min.css";
import "./../css/custom.css";
import React, { useEffect, useState } from "react";
import {
  Button,
  FormGroup,
  Label,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Table,
  Container,
  Row,
  Col,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
} from "reactstrap";
import { toast } from "react-toastify";
import classnames from "classnames";
import { useDispatch, useSelector } from "react-redux";
import {
  addChecklist,
  getAssignedChecklists,
  fetchChecklists,
  updateChecklist,
  assignChecklistToMember,
  deleteAssignedChecklist,
} from "../store/CheckList/checklistSlice";
import { timeAgo } from "../Helper/functions";
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { fetchEmployeesByVendor } from "../store/Tracker/trackerSlice";
import swal from "sweetalert";
import UpdateChecklistModal from "../popup/UpdateChecklistModal";
import CheckListDocumentModel from "../popup/CheckListDocumentModel";

const ChecklistApp = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const { itemsList, employeeChecklists } = useSelector(
    (state) => state.checklistitems
  );
  const { employees } = useSelector((state) => state.timeTracker);
  const [activeTab, setActiveTab] = useState("1");
  const [title, setTitle] = useState("");
  const [employee, setEmployee] = useState("");
  const [steps, setSteps] = useState([{ title: "" }]);
  const [editSteps, setEditSteps] = useState([]);
  const [stepsDocuments, setStepsDocuments] = useState([]);

  const [checkedItems, setCheckedItems] = useState([]);
  const [checklistAddModalOpen, setChecklistAddModalOpen] = useState(false);
  const [checklistEditModalOpen, setChecklistEditModalOpen] = useState(false);
  const [assignChecklistModelOpen, setAssignChecklistModelOpenn] = useState(
    false
  );
  const [assignedCheckListModelOpen, setAssignedCheckListModelOpen] = useState(
    false
  );
  const [
    editAssignedCheckListModelOpen,
    setEditAssignedCheckListModelOpen,
  ] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState(null);
  const [isStepsModalOpen, setStepsModalOpen] = useState(false);
  const [isStepsModalDocumentOpen, setStepsModalDocumentOpen] = useState(false);

  const handleStepsModalOpen = () => setStepsModalOpen(true);
  const handleStepsDocumentModalOpen = () => setStepsModalDocumentOpen(true);

  const handleStepsModalClose = () => {
    setEditSteps([]);
    setStepsModalOpen(false);
  };
  const handleStepsModalDocumentClose = () => {
    setStepsDocuments([]);
    setStepsModalDocumentOpen(false);
  };
  const [
    assignCheckLitToEmployeeModelOpen,
    setAssignCheckLitToEmployeeModelOpen,
  ] = useState(false);

  const toggleAddChecklistPopup = () => {
    setTitle("");
    setSteps([{ title: "" }]);
    setChecklistAddModalOpen(!checklistAddModalOpen);
  };

  const toggleEditChecklistPopup = () => {
    setChecklistEditModalOpen(!checklistEditModalOpen);
  };
  const toggleAddEmployeePopup = () => {
    setAssignChecklistModelOpenn(!assignChecklistModelOpen);
  };
  const toggleAssignedChecklistPopup = () => {
    setAssignedCheckListModelOpen(!assignedCheckListModelOpen);
  };

  const toggleAssignCheckLitToEmployeeModelOpen = () => {
    setCheckedItems([]);
    setEmployee("");
    setAssignCheckLitToEmployeeModelOpen(!assignCheckLitToEmployeeModelOpen);
  };
  const toggleEditAssignedCheckListModelOpen = () => {
    setEditAssignedCheckListModelOpen(!editAssignedCheckListModelOpen);
  };

  const viewAssignedCheckListPopup = (items) => {
    // setSteps(items.stepsStatus);
    setEditSteps(items);
    handleStepsModalOpen();
  };
  const viewAssignedCheckListDocumentPopup = (items) => {
    // setSteps(items.stepsStatus);
    setStepsDocuments(items);
    handleStepsDocumentModalOpen();
  };

  const toggleTab = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  const addStepField = () => {
    setSteps([...steps, { title: "" }]);
  };

  const removeStepField = (index) => {
    const newSteps = steps.filter((_, stepIndex) => stepIndex !== index);
    setSteps(newSteps);
  };

  const handleStepChange = (value, index) => {
    const newSteps = steps.map((step, stepIndex) =>
      stepIndex === index ? { ...step, title: value } : step
    );
    setSteps(newSteps);
  };

  const handleEditClick = (checklist) => {
    setSelectedChecklist(checklist);
    toggleEditChecklistPopup();
  };

  const saveChecklistForm = () => {
    const checklistData = {
      title,
      steps,
    };
    dispatch(addChecklist(checklistData));
    toast.success('checkList Created Successfully.')
    toggleAddChecklistPopup();
  };

  const updateChecklistForm = () => {
    console.log("selectedChecklist : ", selectedChecklist);
    const checklistData = {
      title: selectedChecklist.title,
      steps: selectedChecklist.steps,
    };
    dispatch(updateChecklist({ id: selectedChecklist._id, checklistData }));
    toast.success('checkList Updated Successfully.')
    toggleEditChecklistPopup();
  };

  const handleEditChecklistTitleChange = (e) => {
    setSelectedChecklist((prev) => ({
      ...prev,
      title: e.target.value,
    }));
  };

  const handleEditStepChange = (value, index) => {
    setSelectedChecklist((prev) => ({
      ...prev,
      steps: prev.steps.map((step, stepIndex) =>
        stepIndex === index ? { ...step, title: value } : step
      ),
    }));
  };

  const handleEditAddStep = () => {
    setSelectedChecklist((prev) => ({
      ...prev,
      steps: [...prev.steps, { title: "" }],
    }));
  };

  const handleEditRemoveStep = (index) => {
    setSelectedChecklist((prev) => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index),
    }));
  };

  useEffect(() => {
    dispatch(fetchChecklists());
    dispatch(getAssignedChecklists());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      dispatch(fetchEmployeesByVendor(user?._id));
    }
  }, [user, dispatch]);

  const showOverAllStartRating = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <svg
          key={i}
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill={i < rating ? "#ffc107" : "#e4e5e9"}
          className="bi bi-star-fill"
          viewBox="0 0 16 16"
        >
          <path d="M3.612 15.443a.5.5 0 0 1-.757-.545l1.05-4.73L.173 6.765a.5.5 0 0 1 .284-.88l4.898-.696 2.082-4.093a.5.5 0 0 1 .896 0l2.082 4.093 4.898.696a.5.5 0 0 1 .284.88l-3.732 3.403 1.05 4.73a.5.5 0 0 1-.757.545L8 13.187l-4.389 2.256z" />
        </svg>
      );
    }
    return stars;
  };

  const handleChecklistSelect = (checklistId) => {
    setCheckedItems(
      (prevCheckedItems) =>
        prevCheckedItems.includes(checklistId)
          ? prevCheckedItems.filter((id) => id !== checklistId) // Deselect
          : [...prevCheckedItems, checklistId] // Select
    );
  };

  const handleAssignChecklist = (e) => {
    e.preventDefault();
    if (employee && checkedItems) {
      dispatch(
        assignChecklistToMember({
          employeeId: employee,
          checklistId: checkedItems,
        })
      );
      toast.success('Checklist assigned to employee.')
      toggleAssignCheckLitToEmployeeModelOpen();
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
          dispatch(deleteAssignedChecklist(id));
          swal("Deleted!", "record has been deleted.", "success");
        } catch (error) {
          console.error("Error deleting onboarding record:", error);
          swal("Error!", "Failed to delete record", "error");
        }
      }
    });
  };
  const openEditAssignedChecklistModal = (
    selectedEmployeeId,
    selectedChecklists
  ) => {
    setEmployee(selectedEmployeeId); // Pre-populate the employee
    handleChecklistSelect(selectedChecklists._id); // Pre-populate selected checklists
    toggleEditAssignedCheckListModelOpen();
  };

  const updateAssignedChecklist = async () => {
    console.log("updated checkLists:  ", checkedItems);
  };

  useEffect(() => {
    console.log("employeeChecklists: ", employeeChecklists);
  }, [employeeChecklists]);
  return (
    <Container className="mt-5 mx-2">
      <Row className="row bg-white border rounded">
        <Col md="12" className="px-0">
          <Nav tabs className="mb-0 checkListMenu">
            <div>
              <p
                className={classnames({ active: activeTab === "1" })}
                onClick={() => toggleTab("1")}
                style={{
                  cursor: "pointer",
                  fontWeight: "bold",
                  color: "#000",
                  padding: "1rem 2rem",
                  fontSize: "17px",
                  marginBottom: "0px",
                }}
              >
                Create Checklist
              </p>
            </div>
            <div>
              <p
                className={classnames({ active: activeTab === "3" })}
                onClick={() => toggleTab("3")}
                style={{
                  cursor: "pointer",
                  fontWeight: "bold",
                  color: "#000",
                  padding: "1rem 2rem",
                  fontSize: "17px",
                  marginBottom: "0px",
                }}
              >
                Onboarding Candidate
              </p>
            </div>
          </Nav>

          <TabContent activeTab={activeTab} className="my-3">
            <TabPane tabId="1">
              <div className="d-flex justify-content-between my-4 px-3">
                <Button
                  color="success"
                  onClick={toggleAddChecklistPopup}
                  style={{ backgroundColor: "#28a745" }}
                >
                  Create Checklist
                </Button>
              </div>
              <div className="px-4">
                <Table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Checklist Title</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itemsList.length ? (
                      itemsList.map((item, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{item.title}</td>
                          <td align="left">
                            <div className="d-flex gap-2">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                fill="green"
                                viewBox="0 0 512 512"
                                onClick={() => handleEditClick(item)}
                                className="cursor-pointer"
                              >
                                <path d="M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231zM160 399.4l-9.1 22.7c-4 3.1-8.5 5.4-13.3 6.9L59.4 452l23-78.1c1.4-4.9 3.8-9.4 6.9-13.3l22.7-9.1 0 32c0 8.8 7.2 16 16 16l32 0zM362.7 18.7L348.3 33.2 325.7 55.8 314.3 67.1l33.9 33.9 62.1 62.1 33.9 33.9 11.3-11.3 22.6-22.6 14.5-14.5c25-25 25-65.5 0-90.5L453.3 18.7c-25-25-65.5-25-90.5 0zm-47.4 168l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z" />
                              </svg>

                              {/* <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              fill="red"
                              viewBox="0 0 448 512"
                            >
                              <path d="M135.2 17.7L128 32 32 32C14.3 32 0 46.3 0 64S14.3 96 32 96l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0-7.2-14.3C307.4 6.8 296.3 0 284.2 0L163.8 0c-12.1 0-23.2 6.8-28.6 17.7zM416 128L32 128 53.2 467c1.6 25.3 22.6 45 47.9 45l245.8 0c25.3 0 46.3-19.7 47.9-45L416 128z" />
                            </svg> */}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3">No checklists available</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>

              {/* Add Checklist Modal */}
              <Modal
                isOpen={checklistAddModalOpen}
                toggle={toggleAddChecklistPopup}
              >
                <ModalHeader toggle={toggleAddChecklistPopup}>
                  Create Checklist
                </ModalHeader>
                <ModalBody>
                  <FormGroup>
                    <Label for="title">Title</Label>
                    <Input
                      type="text"
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label for="steps">Steps</Label>
                    {steps.map((step, index) => (
                      <div
                        key={index}
                        className="d-flex align-items-center mb-2"
                      >
                        <Input
                          type="text"
                          value={step.title}
                          onChange={(e) =>
                            handleStepChange(e.target.value, index)
                          }
                          placeholder={`Step ${index + 1}`}
                          className="me-2"
                        />
                        <Button
                          color="danger"
                          size="sm"
                          onClick={() => removeStepField(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button color="primary" onClick={addStepField}>
                      Add Step
                    </Button>
                  </FormGroup>
                </ModalBody>
                <ModalFooter>
                  <Button color="primary" onClick={saveChecklistForm}>
                    Save
                  </Button>{" "}
                  <Button color="secondary" onClick={toggleAddChecklistPopup}>
                    Cancel
                  </Button>
                </ModalFooter>
              </Modal>

              {/* Edit Checklist Modal */}
              <Modal
                isOpen={checklistEditModalOpen}
                toggle={toggleEditChecklistPopup}
              >
                <ModalHeader toggle={toggleEditChecklistPopup}>
                  Edit Checklist
                </ModalHeader>
                <ModalBody>
                  <FormGroup>
                    <Label for="editTitle">Title</Label>
                    <Input
                      type="text"
                      id="editTitle"
                      value={selectedChecklist?.title || ""}
                      onChange={handleEditChecklistTitleChange}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label for="editSteps">Steps</Label>
                    {selectedChecklist?.steps.map((step, index) => (
                      <div
                        key={index}
                        className="d-flex align-items-center mb-2"
                      >
                        <Input
                          type="text"
                          value={step.title}
                          onChange={(e) =>
                            handleEditStepChange(e.target.value, index)
                          }
                          placeholder={`Step ${index + 1}`}
                          className="me-2"
                        />
                        <Button
                          color="danger"
                          size="sm"
                          onClick={() => handleEditRemoveStep(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button color="primary" onClick={handleEditAddStep}>
                      Add Step
                    </Button>
                  </FormGroup>
                </ModalBody>
                <ModalFooter>
                  <Button color="primary" onClick={updateChecklistForm}>
                    Save
                  </Button>{" "}
                  <Button color="secondary" onClick={toggleEditChecklistPopup}>
                    Cancel
                  </Button>
                </ModalFooter>
              </Modal>
            </TabPane>

            <TabPane tabId="3">
              <div className="d-flex justify-content-between my-4 px-3">
                <p
                  className="text-success cursor-pointer"
                  onClick={toggleAssignCheckLitToEmployeeModelOpen}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="green"
                    viewBox="0 0 512 512"
                  >
                    {" "}
                    <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM232 344l0-64-64 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l64 0 0-64c0-13.3 10.7-24 24-24s24 10.7 24 24l0 64 64 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-64 0 0 64c0 13.3-10.7 24-24 24s-24-10.7-24-24z" />
                  </svg>{" "}
                  Add Employee
                </p>
                <p className="text-secondary cursor-pointer">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="lightgray"
                    viewBox="0 0 512 512"
                  >
                    {" "}
                    <path d="M399 384.2C376.9 345.8 335.4 320 288 320l-64 0c-47.4 0-88.9 25.8-111 64.2c35.2 39.2 86.2 63.8 143 63.8s107.8-24.7 143-63.8zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm256 16a72 72 0 1 0 0-144 72 72 0 1 0 0 144z" />
                  </svg>
                  <span className="ml-2">
                    {" "}
                    {employeeChecklists.length} Employees
                  </span>
                </p>
              </div>
              <Table className="overflow-hidden mb-0">
                <thead>
                  <tr>
                    <th style={{ paddingLeft: "40px" }}>Employee Info</th>
                    <th>Job Opening</th>
                    <th>Uploaded Documents</th>
                    <th>Status</th>
                    <th>Rating</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {employeeChecklists?.data?.length ? (
                    employeeChecklists?.data?.map((item, idx) => (
                      <tr key={idx} style={{ verticalAlign: "middle" }}>
                        <td style={{ height: "90px", paddingLeft: "40px" }}>
                          <div>
                            <strong>{item?.employee?.firstName}</strong>
                          </div>
                          <div>
                            <strong>{item?.employee?.address}</strong>
                          </div>
                        </td>
                        <td className="position-relative">
                          <Button
                            className="btn checkListBtn"
                            onClick={() => {
                              setEmployee(item.employee._id);
                              viewAssignedCheckListPopup(item);
                            }}
                          >
                            View Checklist
                          </Button>
                          <span className="customToolTip">
                            {item?.stepsStatus?.length}
                          </span>
                        </td>
                        <td className="position-relative">
                          <Button
                            className="btn checkListBtn"
                            onClick={() => {
                              setEmployee(item.employee._id);
                              viewAssignedCheckListDocumentPopup(item);
                            }}
                          >
                            View Docs
                          </Button>
                          {/* <span className="customToolTip">
                            {item?.stepsStatus?.length}
                          </span> */}
                        </td>

                        <td align="left">
                          <div>
                            <div>
                              <strong>{item.stepsStatus[0].status}</strong>
                            </div>
                            <div>{timeAgo(item.updatedAt)}</div>
                          </div>
                        </td>
                        <td>
                          {showOverAllStartRating(item.overallRating ?? 0)}
                        </td>
                        <td align="left">
                          <div className="d-flex gap-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 576 512"
                              width="20"
                              height="20"
                              fill="green"
                              className="cursor-pointer"
                              onClick={() => {
                                openEditAssignedChecklistModal(
                                  item.employee._id,
                                  item.checklist
                                );
                              }}
                            >
                              <path d="M288 80c-65.2 0-118.8 29.6-159.9 67.7C89.6 183.5 63 226 49.4 256c13.6 30 40.2 72.5 78.6 108.3C169.2 402.4 222.8 432 288 432s118.8-29.6 159.9-67.7C486.4 328.5 513 286 526.6 256c-13.6-30-40.2-72.5-78.6-108.3C406.8 109.6 353.2 80 288 80zM95.4 112.6C142.5 68.8 207.2 32 288 32s145.5 36.8 192.6 80.6c46.8 43.5 78.1 95.4 93 131.1c3.3 7.9 3.3 16.7 0 24.6c-14.9 35.7-46.2 87.7-93 131.1C433.5 443.2 368.8 480 288 480s-145.5-36.8-192.6-80.6C48.6 356 17.3 304 2.5 268.3c-3.3-7.9-3.3-16.7 0-24.6C17.3 208 48.6 156 95.4 112.6zM288 336c44.2 0 80-35.8 80-80s-35.8-80-80-80c-.7 0-1.3 0-2 0c1.3 5.1 2 10.5 2 16c0 35.3-28.7 64-64 64c-5.5 0-10.9-.7-16-2c0 .7 0 1.3 0 2c0 44.2 35.8 80 80 80zm0-208a128 128 0 1 1 0 256 128 128 0 1 1 0-256z" />
                            </svg>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              fill="red"
                              viewBox="0 0 448 512"
                              className="cursor-pointer"
                              onClick={() => {
                                handleDelete(item._id);
                              }}
                            >
                              <path d="M135.2 17.7L128 32 32 32C14.3 32 0 46.3 0 64S14.3 96 32 96l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0-7.2-14.3C307.4 6.8 296.3 0 284.2 0L163.8 0c-12.1 0-23.2 6.8-28.6 17.7zM416 128L32 128 53.2 467c1.6 25.3 22.6 45 47.9 45l245.8 0c25.3 0 46.3-19.7 47.9-45L416 128z" />
                            </svg>
                          </div>
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
              </Table>
            </TabPane>
          </TabContent>
        </Col>
      </Row>
      <Modal
        center
        isOpen={assignCheckLitToEmployeeModelOpen}
        toggle={toggleAssignCheckLitToEmployeeModelOpen}
        style={{ minWidth: "750px" }}
        className="addEmployee"
      >
        <ModalHeader toggle={toggleAssignCheckLitToEmployeeModelOpen}>
          Add Employee
        </ModalHeader>
        <ModalBody className="d-flex   p-4" style={{ minHeight: "350px" }}>
          <FormGroup className="w-50" style={{ border: "1px solid lightgray" }}>
            <Label for="checklistSelect" className="customHeading">
              <strong>Select Checklist</strong>
            </Label>
            <div
              style={{
                paddingLeft: "20px",
                maxHeight: "235px",
                minHeight: "235px",
                overflowY: "scroll",
              }}
            >
              {itemsList.length &&
                itemsList?.map((checklist) => (
                  <div>
                    <FormControlLabel
                      key={checklist._id}
                      control={
                        <Checkbox
                          checked={checkedItems.includes(checklist._id)}
                          onChange={() => handleChecklistSelect(checklist._id)}
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
                      label={checklist.title}
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
                    {employee.name}
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
            onClick={handleAssignChecklist}
          >
            Submit
          </Button>
        </div>
      </Modal>
      <Modal
        center
        isOpen={editAssignedCheckListModelOpen}
        toggle={toggleEditAssignedCheckListModelOpen}
        style={{ minWidth: "750px" }}
        className="addEmployee"
      >
        <ModalHeader toggle={toggleEditAssignedCheckListModelOpen}>
          View Assigned Checklist
        </ModalHeader>
        <ModalBody className="d-flex p-4" style={{ minHeight: "350px" }}>
          <FormGroup className="w-50" style={{ border: "1px solid lightgray" }}>
            <Label for="checklistSelect" className="customHeading">
              <strong>Select Checklist</strong>
            </Label>
            <div
              style={{
                paddingLeft: "20px",
                maxHeight: "235px",
                minHeight: "235px",
                overflowY: "scroll",
              }}
            >
              {itemsList.length &&
                itemsList?.map((checklist) => (
                  <div key={checklist._id}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          disabled={true}
                          checked={checkedItems.includes(checklist._id)}
                          // onChange={() => handleChecklistSelect(checklist._id)}
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
                      label={checklist.title}
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

        {/* <div className="pb-4 text-center">
          <Button
            color="success"
            className="px-5"
            onClick={updateAssignedChecklist}
            disabled={true}
          >
            Save Changes
          </Button>
        </div> */}
      </Modal>
      {editSteps && (
        <UpdateChecklistModal
          items={editSteps}
          open={isStepsModalOpen}
          employee={employee}
          onClose={handleStepsModalClose}
        />
      )}
      {stepsDocuments && (
        <CheckListDocumentModel
          items={stepsDocuments}
          open={isStepsModalDocumentOpen}
          employee={employee}
          onClose={handleStepsModalDocumentClose}
        />
      )}
    </Container>
  );
};

export default ChecklistApp;
