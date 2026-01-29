import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Row,
  Col,
  Card,
  CardBody,
  CardHeader,
  Collapse,
  InputGroup,
  InputGroupText,
  Alert,
} from "reactstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";

import { ChevronDown, Calendar, Clock } from "react-feather";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import { fetchCareGiverByVendor } from "../../../store/IDB_SYS/Clients/careGiverSlice";
import { fetchClientByVendor } from "../../../store/IDB_SYS/Clients/clientSlice";
import { fetchPayorByVendor } from "../../../store/IDB_SYS/Clients/payorSlice";
import {
  createSchedule,
  clearError,
  clearSuccess,
  fetchJobs,
  updateSchedule,
} from "../../../store/IDB_SYS/scheduler/scheduleSlice";
import moment from "moment";
import { convertToUTC } from "../../../Helper/functions";
import { toast } from "react-toastify";
import { faPlusCircle, faSyncAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const SchedulePopup = ({
  isOpen,
  toggle,
  onSave,
  setSelectedEvent,
  schedule,
  isEdit = false,
}) => {
  const { payor } = useSelector((state) => state.payor);
  const navigate = useNavigate();
  const { careGiver } = useSelector((state) => state.careGiver);
  const { clients } = useSelector((state) => state.client);
  const [selectedJob, SetSelectedJob] = useState(null);
  const [selectedJobShift, SetSelectedJobShift] = useState(null);
  const { loading, error, success, vendorJobs } = useSelector(
    (state) => state.schedule
  );


  const dispatch = useDispatch();
  const [dropdowns, setDropdowns] = useState({
    client: false,
    service: false,
    payor: false,
    caregiver: false,
    payroll: false,
  });

  const payrollItems = [
    { id: "1", name: "Regular Hours" },
    { id: "2", name: "Overtime" },
    { id: "3", name: "Holiday Pay" },
    { id: "4", name: "Training Hours" },
  ];

  // Validation Schema
  const validationSchema = Yup.object({
    // Client Details
    client: Yup.string().required("Client is required"),
    serviceOrder: Yup.string().required("Service order is required"),
    service: Yup.string().required("Service is required"),
    payor: Yup.string().required("Payor is required"),

    // Caregiver Details
    caregiver: Yup.string().required("Caregiver is required"),
    payrollItem: Yup.string().optional(),
    rate: Yup.number().optional(),

    // Date/Time
    startDate: Yup.date().required("Start date is required"),
    endDate: Yup.date()
      .required("End date is required")
      .min(Yup.ref("startDate"), "End date must be after start date"),

    // Frequency
    frequency: Yup.string().oneOf(["weekly", "monthly"]).default("weekly"),
    recurringWeeks: Yup.number().min(1).max(12).default(1),
    monthlyDay: Yup.number().min(1).max(31).default(1),
    weeklyStartDay: Yup.string().default("Sunday"),
    days: Yup.object({
      sunday: Yup.boolean().default(false),
      monday: Yup.boolean().default(false),
      tuesday: Yup.boolean().default(false),
      wednesday: Yup.boolean().default(false),
      thursday: Yup.boolean().default(false),
      friday: Yup.boolean().default(false),
      saturday: Yup.boolean().default(false),
    }),

    // Status
    confirmation: Yup.string()
      .oneOf(["confirmed", "unconfirmed"])
      .default("unconfirmed"),
    telephonyAlerts: Yup.string()
      .oneOf(["enabled", "disabled"])
      .default("disabled"),
    mileage: Yup.string().oneOf(["enabled", "disabled"]).default("disabled"),
    clientQA: Yup.string().oneOf(["enabled", "disabled"]).default("disabled"),
  });

  useEffect(() => {
    if (schedule) {
      dispatch(fetchJobs({ empId: schedule.caregiver?._id })).unwrap();
      SetSelectedJob(schedule.service?._id || null)
    }
  }, [schedule])

  // Format initial values based on whether we're editing or creating
  // Format initial values based on whether we're editing or creating
  const getInitialValues = () => {
    if (isEdit && schedule) {
      // Format the schedule data for the form

      return {
        // Client Details
        client: schedule.client?._id || "",
        serviceOrder: schedule.serviceOrder || "",
        service: schedule.service?._id || "",
        payor: schedule.payor?._id || "",

        // Caregiver Details
        caregiver: schedule.caregiver?._id || "",
        payrollItem: schedule.payrollItem || "",
        rate: schedule.rate || "",

        // Date/Time - Fix the date formatting
        startDate: schedule.start
          ? moment(schedule.start).format("YYYY-MM-DD")
          : "",
        startTime: schedule.start ? moment(schedule.start).format("HH:mm") : "",
        endDate: schedule.end ? moment(schedule.end).format("YYYY-MM-DD") : "",
        endTime: schedule.end ? moment(schedule.end).format("HH:mm") : "",
        // Frequency
        frequency: schedule.frequency || "weekly",
        recurringWeeks: schedule.recurringWeeks || 1,
        monthlyDay: schedule.monthlyDay || 1,
        weeklyStartDay: schedule.weeklyStartDay || "Sunday",
        days: schedule.days || {
          sunday: false,
          monday: false,
          tuesday: false,
          wednesday: false,
          thursday: false,
          friday: false,
          saturday: false,
        },

        // Status
        confirmation: schedule.confirmation || "unconfirmed",
        telephonyAlerts: schedule.telephonyAlerts || "disabled",
        mileage: schedule.mileage || "disabled",
        clientQA: schedule.clientQA || "disabled",
      };
    }

    // Default values for new schedule
    return {
      // Client Details
      client: "",
      serviceOrder: "",
      service: "",
      payor: "",

      // Caregiver Details
      caregiver: "",
      payrollItem: "",
      rate: "",

      // Date/Time
      startDate: "",
      startTime: "",
      endDate: "",
      endTime: "",

      // Frequency
      frequency: "weekly",
      recurringWeeks: 1,
      monthlyDay: 1,
      weeklyStartDay: "Sunday",
      days: {
        sunday: false,
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
      },

      // Status
      confirmation: "unconfirmed",
      telephonyAlerts: "disabled",
      mileage: "disabled",
      clientQA: "disabled",
    };
  };

  useEffect(() => {
    if (selectedJob) {
      const selectedJobDetsail = vendorJobs.filter((job => job._id == selectedJob));
      console.log(selectedJobDetsail, 'selectedJob')
      SetSelectedJobShift(selectedJobDetsail.length ? selectedJobDetsail[0].shift : null)

    }
  }, [selectedJob])
  const formik = useFormik({
    initialValues: getInitialValues(),
    validationSchema,
    enableReinitialize: true, // This allows the form to reinitialize when props change
    onSubmit: async (values) => {
      // Prepare data for API - ensure we're sending the right structure
      let formData = values;
      formData.start = convertToUTC(formData.startDate, "00:00");
      formData.end = convertToUTC(formData.endDate, "00:00");
      console.log("Submitting values:", formData); // Debug log

      try {
        if (isEdit && schedule) {
          // Update existing schedule
          await dispatch(
            updateSchedule({
              id: schedule._id || schedule.id, // Use the correct ID field
              formData,
            })
          ).unwrap();
          if (setSelectedEvent) {
            setSelectedEvent(null);
          }
        } else {
          // Create new schedule
          await dispatch(createSchedule(formData)).unwrap();
        }
        onSave();
      } catch (error) {
        toast.error(error.message);
        console.error("Failed to save schedule:", error);
      }
    },
  });

  const selectedClientData = clients.find(c => c._id === formik.values.client);
  const availableServiceOrders = selectedClientData?.serviceOrders || [];

  // Helper function to convert service order daysOfWeek array to schedule days object
  const convertDaysOfWeekToScheduleDays = (daysOfWeek) => {
    const dayMapping = {
      'Su': 'sunday',
      'Mo': 'monday',
      'Tu': 'tuesday',
      'We': 'wednesday',
      'Th': 'thursday',
      'Fr': 'friday',
      'Sa': 'saturday'
    };
    
    const days = {
      sunday: false,
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
    };
    
    if (daysOfWeek && Array.isArray(daysOfWeek)) {
      daysOfWeek.forEach(day => {
        const mappedDay = dayMapping[day];
        if (mappedDay) {
          days[mappedDay] = true;
        }
      });
    }
    
    return days;
  };

  // Auto-populate fields when a Service Order is selected
  useEffect(() => {
    if (!formik.values.serviceOrder || !selectedClientData) return;
    
    // Find the selected service order from the client's serviceOrders array
    const selectedServiceOrder = availableServiceOrders.find(
      order => order.serviceType === formik.values.serviceOrder
    );
    
    if (!selectedServiceOrder) return;

    // Auto-populate Payor if available (match by payor name or ID)
    if (selectedServiceOrder.payor) {
      const matchedPayor = payor.find(
        p => p._id === selectedServiceOrder.payor || p.payor === selectedServiceOrder.payor
      );
      if (matchedPayor) {
        formik.setFieldValue('payor', matchedPayor._id);
      }
    }

    // Auto-populate Caregiver if assigned and load their jobs
    if (selectedServiceOrder.caregiver) {
      const matchedCaregiver = careGiver.find(
        c => c._id === selectedServiceOrder.caregiver
      );
      if (matchedCaregiver) {
        formik.setFieldValue('caregiver', matchedCaregiver._id);
        // Load jobs for the caregiver
        loadJobsWithShift(matchedCaregiver._id);
      }
    }

    // Auto-populate Frequency type (weekly/monthly)
    if (selectedServiceOrder.frequencyType) {
      formik.setFieldValue('frequency', selectedServiceOrder.frequencyType);
    }

    // Auto-populate recurring weeks/interval
    if (selectedServiceOrder.recurEvery) {
      formik.setFieldValue('recurringWeeks', selectedServiceOrder.recurEvery);
    }

    // Auto-populate days of week for weekly frequency
    if (selectedServiceOrder.daysOfWeek && selectedServiceOrder.daysOfWeek.length > 0) {
      const scheduleDays = convertDaysOfWeekToScheduleDays(selectedServiceOrder.daysOfWeek);
      formik.setFieldValue('days', scheduleDays);
    }

    // Auto-populate authorization start date if available
    if (selectedServiceOrder.startDate) {
      formik.setFieldValue('startDate', moment(selectedServiceOrder.startDate).format('YYYY-MM-DD'));
    }

    // Auto-populate authorization end date if available
    if (selectedServiceOrder.endDate) {
      formik.setFieldValue('endDate', moment(selectedServiceOrder.endDate).format('YYYY-MM-DD'));
    }

    // Auto-populate payroll item if available
    if (selectedServiceOrder.payrollItem1) {
      formik.setFieldValue('payrollItem', selectedServiceOrder.payrollItem1);
    }

    // Auto-populate rate from costPerHour if available
    if (selectedServiceOrder.costPerHour) {
      formik.setFieldValue('rate', selectedServiceOrder.costPerHour);
    }

  }, [formik.values.serviceOrder, formik.values.client]);

  useEffect(() => {
    dispatch(fetchCareGiverByVendor());
    dispatch(fetchClientByVendor());

    dispatch(fetchPayorByVendor({ limit: 100 }));
  }, [dispatch]);


  const loadJobsWithShift = (value) => {
    dispatch(fetchJobs({ empId: value }));
  }
  useEffect(() => {
    if (success) {
      // toggle();
      dispatch(clearSuccess());
      if (!isEdit) {
        formik.resetForm();
      }
    }
  }, [success, toggle, dispatch, formik, isEdit]);

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        dispatch(clearError());
      }, 5000);
    }
  }, [error, dispatch]);

  const toggleDropdown = (dropdownName) => {
    const updatedDropdowns = Object.keys(dropdowns).reduce((acc, key) => {
      acc[key] = key === dropdownName ? !dropdowns[key] : false;
      return acc;
    }, {});
    setDropdowns(updatedDropdowns);
  };

  const handleDayChange = (day) => {
    formik.setFieldValue("days", {
      ...formik.values.days,
      [day]: !formik.values.days[day],
    });
  };

  const selectAllDays = () => {
    formik.setFieldValue("days", {
      sunday: true,
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: true,
    });
  };

  const selectWeekdays = () => {
    formik.setFieldValue("days", {
      sunday: false,
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
    });
  };

  const renderDropdown = (items, dropdownName, fieldName, showCode = false) => (
    <Collapse isOpen={dropdowns[dropdownName]}>
      <div
        className="dropdown-menu show border shadow-sm"
        style={{
          position: "absolute",
          zIndex: 1050,
          width: "100%",
          maxHeight: "200px",
          overflowY: "auto",
          marginTop: "2px",
        }}
      >
        {items.map((item) => (
          <div
            key={item.id}
            className="dropdown-item d-flex justify-content-between align-items-center"
            style={{
              cursor: "pointer",
              padding: "10px 15px",
              borderBottom: "1px solid #f8f9fa",
            }}
            onClick={() => {
              formik.setFieldValue(fieldName, item.name);
              toggleDropdown(dropdownName);
            }}
          >
            <span>{item.name}</span>
            {showCode && item.code && (
              <small className="text-muted">{item.code}</small>
            )}
          </div>
        ))}
      </div>
    </Collapse>
  );

  const CustomDropdownInput = ({ field, placeholder, onClick, error }) => (
    <div>
      <InputGroup>
        <Input
          type="text"
          {...field}
          onClick={onClick}
          placeholder={placeholder}
          style={{ cursor: "pointer" }}
          className={error ? "is-invalid" : ""}
        />
        <InputGroupText style={{ cursor: "pointer" }} onClick={onClick}>
          <ChevronDown size={16} />
        </InputGroupText>
      </InputGroup>
      {error && <div className="invalid-feedback d-block">{error}</div>}
    </div>
  );

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg">
      <ModalHeader toggle={toggle} className="bg-green text-white">
        <strong>{isEdit ? "Edit Schedule" : "Add Schedule"}</strong>
      </ModalHeader>
      <Form onSubmit={formik.handleSubmit}>
        <ModalBody
          style={{ maxHeight: "70vh", overflowY: "auto", padding: "20px" }}
        >
          {error && (
            <Alert color="danger" className="mb-3">
              {error.message ||
                `Failed to ${isEdit ? "update" : "create"} schedule`}
            </Alert>
          )}

          {/* Client Details */}
          <Card className="mb-4 shadow-sm">
            <CardHeader className="bg-light">
              <strong>Client Details</strong>
            </CardHeader>
            <CardBody>
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label className="fw-bold">Client *</Label>
                    <div className="d-flex align-items-center gap-2">
                      <Input
                        type="select"
                        name="client"
                        value={formik.values.client}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={
                          formik.touched.client && formik.errors.client ? "is-invalid" : ""
                        }
                      >
                        <option value="" disabled>
                          Select Client
                        </option>
                        {clients.map((row) => (
                          <option key={row._id} value={row._id}>
                            {row.firstName} {row.middleInitial} {row.lastName}
                          </option>
                        ))}
                      </Input>

                      {/* Grouped Icons */}
                      <div className="d-flex border rounded bg-white">
                        <button
                          type="button"
                          className="btn btn-white m-0"
                          onClick={() => navigate("/generations.idb-sys/clients/add")}
                        >
                          <FontAwesomeIcon icon={faPlusCircle} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-white m-0"
                          onClick={() => dispatch(fetchClientByVendor())}
                        >
                          <FontAwesomeIcon icon={faSyncAlt} />
                        </button>
                      </div>
                    </div>

                    {formik.touched.client && formik.errors.client && (
                      <div className="invalid-feedback d-block">
                        {formik.errors.client}
                      </div>
                    )}
                  </FormGroup>

                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label className="fw-bold">Service Order *</Label>
                    <Input
                      type="select"
                      name="serviceOrder"
                      value={formik.values.serviceOrder}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={
                        formik.touched.serviceOrder &&
                          formik.errors.serviceOrder
                          ? "is-invalid"
                          : ""
                      }
                    >
                      <option value="" disabled>
                        Select Service Order
                      </option>
                      {availableServiceOrders.map((order, index) => (
                        <option key={index} value={order.serviceType}>
                          {order.serviceType}
                        </option>
                      ))}
                    </Input>
                    {formik.touched.serviceOrder &&
                      formik.errors.serviceOrder && (
                        <div className="invalid-feedback d-block">
                          {formik.errors.serviceOrder}
                        </div>
                      )}
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label className="fw-bold">Payor *</Label>
                    <div className="position-relative">
                      <Input
                        type="select"
                        name="payor"
                        value={formik.values.payor}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={
                          formik.touched.payor && formik.errors.payor
                            ? "is-invalid"
                            : ""
                        }
                      >
                        <option value="" disabled>
                          Select Payor
                        </option>
                        {payor.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.payor}
                          </option>
                        ))}
                      </Input>
                      {formik.touched.payor && formik.errors.payor && (
                        <div className="invalid-feedback d-block">
                          {formik.errors.payor}
                        </div>
                      )}
                    </div>
                  </FormGroup>
                </Col>
              </Row>
            </CardBody>
          </Card>

          {/* Caregiver Details */}
          <Card className="mb-4 shadow-sm">
            <CardHeader className="bg-light">
              <strong>Caregiver Details</strong>
            </CardHeader>
            <CardBody>
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label className="fw-bold">Caregiver *</Label>
                    <div className="position-relative">
                      <Input
                        type="select"
                        name="caregiver"
                        value={formik.values.caregiver}
                        onChange={(e) => {
                          formik.handleChange(e);   // ✅ updates Formik
                          loadJobsWithShift(e.target.value); // ✅ your custom logic
                        }}

                        onBlur={formik.handleBlur}
                        className={
                          formik.touched.caregiver && formik.errors.caregiver
                            ? "is-invalid"
                            : ""
                        }
                      >
                        <option value="" disabled>
                          Select CareGiver
                        </option>
                        {careGiver.map((manager) => (
                          <option key={manager._id} value={manager._id}>
                            {manager.firstName ?? ""}{" "}
                            {manager.lastName !== ""
                              ? manager.lastName
                              : manager.email}
                          </option>
                        ))}
                      </Input>
                      {formik.touched.caregiver && formik.errors.caregiver && (
                        <div className="invalid-feedback d-block">
                          {formik.errors.caregiver}
                        </div>
                      )}
                    </div>
                  </FormGroup>
                </Col>
                <Col md={8}>
                  <FormGroup>
                    <Label className="fw-bold">
                      Service(
                      <small className="text-danger">
                        * Please select Caregiver first.{" "}
                      </small>
                      )
                    </Label>

                    <div className="position-relative">
                      <Input
                        type="select"
                        name="service"
                        value={formik.values.service}
                        onChange={(e) => {
                          formik.handleChange(e)
                          SetSelectedJob(e.target.value)

                        }}
                        onBlur={formik.handleBlur}
                        className={
                          formik.touched.service && formik.errors.service
                            ? "is-invalid"
                            : ""
                        }
                      >
                        <option value="" disabled>
                          Select service
                        </option>
                        {vendorJobs?.map((job) => (
                          <option key={job._id} value={job._id}>
                            {job.name ?? ""}{" "}
                          </option>
                        ))}
                      </Input>
                      {formik.touched.service && formik.errors.service && (
                        <div className="invalid-feedback d-block">
                          {formik.errors.service}
                        </div>
                      )}
                    </div>
                  </FormGroup>
                </Col>
                <Col md={4}>
                  <Label className="fw-bold opacity-0">
                    Service(
                    <small className="text-danger ">* Please sele. </small>)
                  </Label>
                  <Button color="secondary" onClick={toggle} disabled={loading}>
                    Add New Service
                  </Button>
                </Col>
                <Col md={8}>
                  <FormGroup>
                    <Label className="fw-bold">Assigned Shift To Service *</Label>
                    <InputGroup>
                      <Input
                        type="text"
                        value={selectedJobShift?.name || 'N/A'}
                        disabled={true}
                      />
                    </InputGroup>
                  </FormGroup>
                </Col>
                <Col md={4}>
                  <Label className="fw-bold opacity-0">
                    Service(
                    <small className="text-danger ">* Please sele. </small>)
                  </Label>
                  <Button color="secondary" onClick={toggle} disabled={loading}>
                    Change Shift
                  </Button>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label className="fw-bold">Payroll Item</Label>
                    <div className="position-relative">
                      <CustomDropdownInput
                        field={{
                          name: "payrollItem",
                          value: formik.values.payrollItem,
                          onChange: formik.handleChange,
                          onBlur: formik.handleBlur,
                        }}
                        placeholder="Select payroll item"
                        onClick={() => toggleDropdown("payroll")}
                      />
                      {renderDropdown(payrollItems, "payroll", "payrollItem")}
                    </div>
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label className="fw-bold">Rate</Label>
                    <Input
                      type="text"
                      name="rate"
                      value={formik.values.rate}
                      onChange={formik.handleChange}
                      placeholder="Enter rate"
                      className="bg-light"
                    />
                  </FormGroup>
                </Col>
              </Row>
            </CardBody>
          </Card>

          {/* Date/Time */}
          <Card className="mb-4 shadow-sm">
            <CardHeader className="bg-light">
              <strong>Date/Time</strong>
            </CardHeader>
            <CardBody>
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label className="fw-bold">Start Date *</Label>
                    <InputGroup>
                      <Input
                        type="date"
                        name="startDate"
                        value={formik.values.startDate}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={
                          formik.touched.startDate && formik.errors.startDate
                            ? "is-invalid"
                            : ""
                        }
                      />
                      <InputGroupText>
                        <Calendar size={16} />
                      </InputGroupText>
                    </InputGroup>
                    {formik.touched.startDate && formik.errors.startDate && (
                      <div className="invalid-feedback d-block">
                        {formik.errors.startDate}
                      </div>
                    )}
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label className="fw-bold">End Date *</Label>
                    <InputGroup>
                      <Input
                        type="date"
                        name="endDate"
                        value={formik.values.endDate}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={
                          formik.touched.endDate && formik.errors.endDate
                            ? "is-invalid"
                            : ""
                        }
                      />
                      <InputGroupText>
                        <Calendar size={16} />
                      </InputGroupText>
                    </InputGroup>
                    {formik.touched.endDate && formik.errors.endDate && (
                      <div className="invalid-feedback d-block">
                        {formik.errors.endDate}
                      </div>
                    )}
                  </FormGroup>
                </Col>
              </Row>
            </CardBody>
          </Card>

          {/* Frequency */}
          <Card className="mb-4 shadow-sm">
            <CardHeader className="bg-light">
              <strong>Frequency</strong>
            </CardHeader>
            <CardBody>
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label className="fw-bold mb-3">Recurrence Pattern</Label>
                    <div>
                      <Input
                        type="radio"
                        id="weekly"
                        name="frequency"
                        label="Weekly"
                        checked={formik.values.frequency === "weekly"}
                        onChange={() =>
                          formik.setFieldValue("frequency", "weekly")
                        }
                        className="mb-2"
                      />{" "}
                      Weekly
                      <br />
                      <Input
                        type="radio"
                        id="monthly"
                        name="frequency"
                        label="Monthly"
                        checked={formik.values.frequency === "monthly"}
                        onChange={() =>
                          formik.setFieldValue("frequency", "monthly")
                        }
                      />{" "}
                      Monthly
                    </div>
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label className="fw-bold">Recur every</Label>
                    <div className="d-flex align-items-center">
                      <Input
                        type="select"
                        name="recurringWeeks"
                        value={formik.values.recurringWeeks}
                        onChange={formik.handleChange}
                        style={{ width: "80px", marginRight: "10px" }}
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                          <option key={num} value={num}>
                            {num}
                          </option>
                        ))}
                      </Input>
                      <span>
                        {formik.values.frequency === "weekly"
                          ? "week(s)"
                          : "month(s)"}
                      </span>
                    </div>
                  </FormGroup>

                  {formik.values.frequency === "monthly" && (
                    <FormGroup className="mt-3">
                      <Label className="fw-bold">On day</Label>
                      <Input
                        type="select"
                        name="monthlyDay"
                        value={formik.values.monthlyDay}
                        onChange={formik.handleChange}
                        style={{ width: "100px" }}
                      >
                        {Array.from({ length: 31 }, (_, i) => i + 1).map(
                          (day) => (
                            <option key={day} value={day}>
                              {day}
                            </option>
                          )
                        )}
                      </Input>
                    </FormGroup>
                  )}
                </Col>
              </Row>

              {formik.values.frequency === "weekly" && (
                <>
                  <Row
                    className="mt-3"
                    style={{
                      justifyContent: "space-around",
                      gap: "15px",
                      alignItems: "end",
                    }}
                  >
                    <Col md={3}>
                      <div className="d-flex gap-2 mb-3">
                        <Button
                          color="outline-primary"
                          size="sm"
                          onClick={selectWeekdays}
                        >
                          M-F (Weekdays)
                        </Button>
                        <Button
                          color="outline-primary"
                          size="sm"
                          onClick={selectAllDays}
                        >
                          All Days
                        </Button>
                      </div>
                    </Col>
                    <Col md={6}>
                      <Label className="fw-bold mb-2">Select days:</Label>
                      <div className="d-flex justify-content-between">
                        {[
                          { key: "sunday", label: "Sun" },
                          { key: "monday", label: "Mon" },
                          { key: "tuesday", label: "Tue" },
                          { key: "wednesday", label: "Wed" },
                          { key: "thursday", label: "Thu" },
                          { key: "friday", label: "Fri" },
                          { key: "saturday", label: "Sat" },
                        ].map((day, index) => (
                          <div key={day.key} className="text-center">
                            <Label check className="d-block mb-1">
                              {day.label}
                            </Label>
                            <Input
                              type="checkbox"
                              checked={formik.values.days[day.key]}
                              onChange={() => handleDayChange(day.key)}
                              style={{ transform: "scale(1.5)" }}
                            />
                          </div>
                        ))}
                      </div>
                    </Col>
                  </Row>
                </>
              )}
            </CardBody>
          </Card>

          {/* Status and Settings */}
          <Row>
            <Col md={6}>
              <Card className="mb-3 shadow-sm">
                <CardHeader className="bg-light">
                  <strong>Confirm Status</strong>
                </CardHeader>
                <CardBody>
                  <FormGroup
                    style={{
                      display: "flex",
                      justifyContent: "space-around",
                      gap: "15px",
                      alignItems: "end",
                    }}
                  >
                    <div>
                      <Input
                        type="radio"
                        id="confirmed"
                        name="confirmation"
                        label="Confirmed"
                        checked={formik.values.confirmation === "confirmed"}
                        onChange={() =>
                          formik.setFieldValue("confirmation", "confirmed")
                        }
                      />{" "}
                      <span className="">Confirmed </span>
                    </div>
                    <div>
                      <Input
                        type="radio"
                        id="unconfirmed"
                        name="confirmation"
                        label="Un-Confirmed"
                        checked={formik.values.confirmation === "unconfirmed"}
                        onChange={() =>
                          formik.setFieldValue("confirmation", "unconfirmed")
                        }
                      />{" "}
                      Un-Confirmed
                    </div>
                  </FormGroup>
                </CardBody>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="mb-3 shadow-sm">
                <CardHeader className="bg-light">
                  <strong>EVV Alerts</strong>
                </CardHeader>
                <CardBody>
                  <FormGroup
                    style={{
                      display: "flex",
                      justifyContent: "space-around",
                      gap: "15px",
                      alignItems: "end",
                    }}
                  >
                    <div>
                      <Input
                        type="radio"
                        id="evvEnabled"
                        name="telephonyAlerts"
                        label="Enabled"
                        checked={formik.values.telephonyAlerts === "enabled"}
                        onChange={() =>
                          formik.setFieldValue("telephonyAlerts", "enabled")
                        }
                      />{" "}
                      Enabled
                    </div>
                    <div>
                      <Input
                        type="radio"
                        id="evvDisabled"
                        name="telephonyAlerts"
                        label="Disabled"
                        checked={formik.values.telephonyAlerts === "disabled"}
                        onChange={() =>
                          formik.setFieldValue("telephonyAlerts", "disabled")
                        }
                      />{" "}
                      Disabled
                    </div>
                  </FormGroup>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Card className="mb-3 shadow-sm">
                <CardHeader className="bg-light">
                  <strong>Mileage Prompt</strong>
                </CardHeader>
                <CardBody>
                  <FormGroup
                    style={{
                      display: "flex",
                      justifyContent: "space-around",
                      gap: "15px",
                      alignItems: "end",
                    }}
                  >
                    <div>
                      <Input
                        type="radio"
                        id="mileageEnabled"
                        name="mileage"
                        label="Enabled"
                        checked={formik.values.mileage === "enabled"}
                        onChange={() =>
                          formik.setFieldValue("mileage", "enabled")
                        }
                      />{" "}
                      Enabled
                    </div>
                    <div>
                      <Input
                        type="radio"
                        id="mileageDisabled"
                        name="mileage"
                        label="Disabled"
                        checked={formik.values.mileage === "disabled"}
                        onChange={() =>
                          formik.setFieldValue("mileage", "disabled")
                        }
                      />{" "}
                      Disabled
                    </div>
                  </FormGroup>
                </CardBody>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="mb-3 shadow-sm">
                <CardHeader className="bg-light">
                  <strong>Client QA</strong>
                </CardHeader>
                <CardBody>
                  <FormGroup
                    style={{
                      display: "flex",
                      justifyContent: "space-around",
                      gap: "15px",
                      alignItems: "end",
                    }}
                  >
                    <div>
                      <Input
                        type="radio"
                        id="qaEnabled"
                        name="clientQA"
                        label="Enabled"
                        checked={formik.values.clientQA === "enabled"}
                        onChange={() =>
                          formik.setFieldValue("clientQA", "enabled")
                        }
                      />{" "}
                      Enabled
                    </div>
                    <div>
                      <Input
                        type="radio"
                        id="qaDisabled"
                        name="clientQA"
                        label="Disabled"
                        checked={formik.values.clientQA === "disabled"}
                        onChange={() =>
                          formik.setFieldValue("clientQA", "disabled")
                        }
                      />{" "}
                      Disabled
                    </div>
                  </FormGroup>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </ModalBody>
        <ModalFooter className="bg-light">
          <Button color="secondary" onClick={toggle} disabled={loading}>
            Cancel
          </Button>
          <Button color="success" type="submit" disabled={loading}>
            {loading
              ? "Saving..."
              : isEdit
                ? "Update Schedule"
                : "Save Schedule"}
          </Button>
        </ModalFooter>
      </Form>
    </Modal >
  );
};

export default SchedulePopup;
