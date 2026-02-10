import React, { useEffect, useState } from "react";
import { Field, ErrorMessage, useFormikContext } from "formik";
import { Nav, NavItem, NavLink, TabContent, TabPane } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInfoCircle,
  faPlus,
  faSyncAlt,
  faPlusCircle,
  faSave,
  faCheck
} from "@fortawesome/free-solid-svg-icons";
import { FaPlus } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { fetchCaseManagerByVendor } from "../../../../store/IDB_SYS/Clients/caseManagerSlice";
import { fetchClientTypesByVendor } from "../../../../store/IDB_SYS/Clients/clientTypeSlice";
import { fetchLocationsByVendor } from "../../../../store/IDB_SYS/Clients/locationSlice";
import { fetchPhysicianByVendor } from "../../../../store/IDB_SYS/Clients/physicianSlice";
import { ADDRESS_TYPES } from "../../../../constants";
import { fetchPayorByVendor } from "../../../../store/IDB_SYS/Clients/payorSlice";
import { useNavigate } from "react-router-dom";
import { fetchReasonByVendor } from "../../../../store/IDB_SYS/Clients/reasonSlice";
import { fetchReferralSourcesByVendor } from "../../../../store/IDB_SYS/Clients/referralSourceSlice";

const PersonalData = ({ formik, clientData, saveClient, onSaveTab, isSaved, isSaving }) => {
  const { setFieldValue, values, submitForm } = useFormikContext();
  const [shouldOpen1500Form, setShouldOpen1500Form] = useState(false);

  // Add this useEffect to handle the navigation after form submission
  useEffect(() => {
    if (shouldOpen1500Form && formik.isSubmitting === false && formik.isValid) {
      // Get the client ID (assuming it's returned in the response or available in values)
      const clientId = values._id || clientData?._id;
      if (clientId) {
        navigate(`/generations.idb-sys/clients/form-1500B?client=${clientId}`);
        setShouldOpen1500Form(false); // Reset the flag
      }
    }
  }, [formik.isSubmitting, formik.isValid, shouldOpen1500Form, values._id, clientData]);

  const CreateClientAndOpenForm1500 = () => {
    setShouldOpen1500Form(true);
    saveClient(values, shouldOpen1500Form); // This will trigger the form submission
  };

  const navigate = useNavigate();
  const { caseManager } = useSelector((state) => state.caseManager);
  const { clientType } = useSelector((state) => state.clientType);
  const { location } = useSelector((state) => state.location);
  const { reason } = useSelector((state) => state.reason);
  const { referralSources } = useSelector((state) => state.referralSource);
  const { physician } = useSelector((state) => state.physician);
  const { payor } = useSelector((state) => state.payor);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchCaseManagerByVendor({ limit: 100 }));
    dispatch(fetchClientTypesByVendor({ limit: 100 }));
    dispatch(fetchLocationsByVendor({ limit: 100 }));
    dispatch(fetchPhysicianByVendor({ limit: 100 }));
    dispatch(fetchPayorByVendor({ limit: 100 }));
    dispatch(fetchReasonByVendor({ limit: 100 }));
    dispatch(fetchReferralSourcesByVendor({ limit: 100 }))
  }, [dispatch]);

  const handleFileUpload = (field, e) => {
    setFieldValue(field, e.currentTarget.files[0]);
  };

  useEffect(() => {
    if (clientData) {
      // Set all the fields from API response
      Object.keys(clientData).forEach((key) => {
        // Handle special cases for dates
        if (
          key === "dob" ||
          key === "serviceStart" ||
          key === "serviceEnd" ||
          key === "inquiryDate" ||
          key === "assessmentDate" ||
          key === "hospitalDischargePrior" ||
          key === "erVisitPrior" ||
          key === "lastPaymentDate" ||
          key === "vaccineDate" ||
          key === "fluVaccineDate"
        ) {
          if (clientData[key]) {
            // Format date for input[type="date"]
            const dateValue = new Date(clientData[key])
              .toISOString()
              .split("T")[0];
            setFieldValue(key, dateValue);
          }
        }
        // Handle boolean values for checkboxes
        else if (typeof clientData[key] === "boolean") {
          setFieldValue(key, clientData[key]);
        }
        // Handle nested objects (like wellnessResponses)
        else if (
          typeof clientData[key] === "object" &&
          clientData[key] !== null &&
          !Array.isArray(clientData[key])
        ) {
          // For objects, we need to set each property individually
          Object.keys(clientData[key]).forEach((nestedKey) => {
            setFieldValue(`${key}.${nestedKey}`, clientData[key][nestedKey]);
          });
        }
        // Handle arrays (like customFields, attachments, etc.)
        else if (Array.isArray(clientData[key])) {
          setFieldValue(key, clientData[key]);
        }
        // Handle all other values (strings, numbers, etc.)
        else {
          setFieldValue(key, clientData[key] || "");
        }
      });

      // Set up specific fields that need special handling
      if (clientData.covidVaccinated) {
        setCovidVaccines(clientData.covidVaccines || []);
      }
      if (clientData.fluVaccineDate) {
        setFluVaccines(clientData.fluVaccines || []);
      }

      // Handle specific fields from your API response
      if (clientData.reasons) {
        setFieldValue("reasons", clientData.reasons);
      }

      if (clientData.referredBy) {
        setFieldValue("referredBy", clientData.referredBy.toString());
      }

      if (clientData.homeCountry) {
        setFieldValue("homeCountry", clientData.homeCountry.toString());
      }

      if (clientData.homeStartAddressType) {
        setFieldValue(
          "homeStartAddressType",
          clientData.homeStartAddressType.toString()
        );
      }

      if (clientData.homeEndAddressType) {
        setFieldValue(
          "homeEndAddressType",
          clientData.homeEndAddressType.toString()
        );
      }

      if (clientData.billingPayor) {
        setFieldValue("billingPayor", clientData.billingPayor.toString());
      }

      if (clientData.otherEvvStartAddressType) {
        setFieldValue(
          "otherEvvStartAddressType",
          clientData.otherEvvStartAddressType.toString()
        );
      }

      if (clientData.otherEvvEndAddressType) {
        setFieldValue(
          "otherEvvEndAddressType",
          clientData.otherEvvEndAddressType.toString()
        );
      }

      if (clientData.cms1500Version) {
        setFieldValue("cms1500Version", clientData.cms1500Version);
      }

      if (clientData.initialContactRelation) {
        setFieldValue(
          "initialContactRelation",
          clientData.initialContactRelation
        );
      }
    }
  }, [clientData, setFieldValue]);

  // State for each tab group
  const [activeAddressTab, setActiveAddressTab] = useState("1");
  const [activeMedicalTab, setActiveMedicalTab] = useState("1");
  const [activeVaccineTab, setActiveVaccineTab] = useState("1");
  const [activeAlertTab, setActiveAlertTab] = useState("1");
  const [activeTab, setActiveTab] = useState("tab-3");
  // State for vaccine data
  const [covidVaccines, setCovidVaccines] = useState(
    values.covidVaccines || []
  );
  const [fluVaccines, setFluVaccines] = useState(values.fluVaccines || []);

  // Handlers for adding vaccine entries
  const addCovidVaccine = () => {
    setCovidVaccines([...covidVaccines, { type: "", date: "" }]);
  };

  const addFluVaccine = () => {
    setFluVaccines([
      ...fluVaccines,
      { date: "", status: "", refusedReason: "" },
    ]);
  };

  const navigateUser = (url) => {
    window.open(`/generations.idb-sys/${url}`, "_blank");
  };

  return (
    <div className="tab-pane fade show active" id="Personal">
      <div className="row">
        <div className="col-md-10">
          {/* Personal Information Section */}
          <div className="frm-outer">
            <div className="card">
              <div className="card-body">
                <div className="row">
                  <div className="col-md-4">
                    <div className="form-group mb-3">
                      <label htmlFor="firstName" className="form-label">
                        First Name*
                      </label>
                      <Field
                        type="text"
                        name="firstName"
                        id="firstName"
                        className={`form-control ${formik.errors.firstName && formik.touched.firstName
                          ? "is-invalid"
                          : ""
                          }`}
                        required
                      />
                      <ErrorMessage
                        name="firstName"
                        component="div"
                        className="invalid-feedback"
                      />
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="form-group mb-3">
                      <label htmlFor="middleInitial" className="form-label">
                        Middle Initial
                      </label>
                      <Field
                        type="text"
                        name="middleInitial"
                        id="middleInitial"
                        className="form-control"
                        maxLength="1"
                      />
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="form-group mb-3">
                      <label htmlFor="lastName" className="form-label">
                        Last Name*
                      </label>
                      <Field
                        type="text"
                        name="lastName"
                        id="lastName"
                        className={`form-control ${formik.errors.lastName && formik.touched.lastName
                          ? "is-invalid"
                          : ""
                          }`}
                        required
                      />
                      <ErrorMessage
                        name="lastName"
                        component="div"
                        className="invalid-feedback"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information Section */}
                <div className="row">
                  <div className="col-md-4">
                    <div className="form-group mb-3">
                      <label htmlFor="phone1" className="form-label">
                        Phone 1*
                      </label>
                      <Field
                        type="tel"
                        name="phone1"
                        id="phone1"
                        className={`form-control ${formik.errors.phone1 && formik.touched.phone1
                          ? "is-invalid"
                          : ""
                          }`}
                        placeholder="(123) 456-7890"
                      />
                      <ErrorMessage
                        name="phone1"
                        component="div"
                        className="invalid-feedback"
                      />
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="form-group mb-3">
                      <label htmlFor="phone2" className="form-label">
                        Phone 2
                      </label>
                      <Field
                        type="tel"
                        name="phone2"
                        id="phone2"
                        className="form-control"
                        placeholder="(123) 456-7890"
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-group mb-3">
                      <label htmlFor="dob" className="form-label">
                        Date of Birth*
                      </label>
                      <Field
                        type="date"
                        name="dob"
                        id="dob"
                        className={`form-control ${formik.errors.dob && formik.touched.dob
                          ? "is-invalid"
                          : ""
                          }`}
                      />
                      <ErrorMessage
                        name="dob"
                        component="div"
                        className="invalid-feedback"
                      />
                    </div>
                  </div>
                </div>

                {/* Dates Section */}
                <div className="row">
                  <div className="col-md-4">
                    <div className="form-group mb-3">
                      <label className="form-label">Status</label>
                      <div className="d-flex align-items-center">
                        <Field
                          as="select"
                          name="status"
                          className="form-control me-2"
                        >
                          <option value="A">Active</option>
                          <option value="I">Inactive</option>
                          <option value="P">Pending</option>
                        </Field>
                        <span className="me-2">Gender</span>
                        <Field
                          as="select"
                          name="gender"
                          className="form-control"
                        >
                          <option value="null">Select</option>
                          <option value="M">Male</option>
                          <option value="F">Female</option>
                        </Field>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="form-group mb-3">
                      <label htmlFor="inquiryDate" className="form-label">
                        Inquiry Date
                      </label>
                      <Field
                        type="date"
                        name="inquiryDate"
                        id="inquiryDate"
                        className="form-control"
                      />
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="form-group mb-3">
                      <label htmlFor="assessmentDate" className="form-label">
                        Assessment Date
                      </label>
                      <Field
                        type="date"
                        name="assessmentDate"
                        id="assessmentDate"
                        className="form-control"
                      />
                    </div>
                  </div>
                </div>

                {/* Status and Service Dates */}
                <div className="row">
                  <div className="col-md-4">
                    <div className="form-row">
                      <label
                        htmlFor="reasons"
                        className="col-sm-4 col-form-label"
                      >
                        Reasons
                      </label>
                      <div className="col-sm-12 col-md-12 d-flex gap-2">
                        <Field
                          as="select"
                          name="reasons"
                          id="reasons"
                          className={`form-control ${formik.errors.reasons &&
                            formik.touched.reasons
                            ? "is-invalid"
                            : ""
                            }`}
                        >
                          <option value="null">-----Select-----</option>
                          {reason.map((p) => (
                            <option key={p._id} value={p._id}>
                              {p.description}
                            </option>
                          ))}
                        </Field>
                        <ErrorMessage
                          name="reasons"
                          component="div"
                          className="invalid-feedback"
                        />
                        <div className="input-group-text">
                          <FontAwesomeIcon icon={faPlusCircle} className="mx-2 cursor-pointer" onClick={() => {
                            navigateUser('clients/reason')
                          }} />
                          <FontAwesomeIcon icon={faSyncAlt} className="mx-2  cursor-pointer" onClick={
                            () => {
                              dispatch(fetchReasonByVendor({ limit: 100 }));
                            }
                          } />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="form-group mb-3">
                      <label htmlFor="serviceStart" className="form-label">
                        Service Start
                      </label>
                      <Field
                        type="date"
                        name="serviceStart"
                        id="serviceStart"
                        className={`form-control ${formik.errors.serviceStart &&
                          formik.touched.serviceStart
                          ? "is-invalid"
                          : ""
                          }`}
                      />
                      <ErrorMessage
                        name="serviceStart"
                        component="div"
                        className="invalid-feedback"
                      />
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="form-group mb-3">
                      <label htmlFor="serviceEnd" className="form-label">
                        Service End
                      </label>
                      <Field
                        type="date"
                        name="serviceEnd"
                        id="serviceEnd"
                        className={`form-control ${formik.errors.serviceEnd && formik.touched.serviceEnd
                          ? "is-invalid"
                          : ""
                          }`}
                      />
                      <ErrorMessage
                        name="serviceEnd"
                        component="div"
                        className="invalid-feedback"
                      />
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="form-group mb-3">
                      <label htmlFor="email" className="form-label">
                        Email
                      </label>
                      <Field
                        type="email"
                        name="email"
                        id="email"
                        className={`form-control ${formik.errors.email && formik.touched.email
                          ? "is-invalid"
                          : ""
                          }`}
                      />
                      <ErrorMessage
                        name="email"
                        component="div"
                        className="invalid-feedback"
                      />
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="form-group mb-3">
                      <label htmlFor="webPassword" className="form-label">
                        Web Password
                      </label>
                      <Field
                        type="text"
                        name="webPassword"
                        id="webPassword"
                        className={`form-control ${formik.errors.webPassword &&
                          formik.touched.webPassword
                          ? "is-invalid"
                          : ""
                          }`}
                      />
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="form-group mb-3">
                      <label
                        htmlFor="hospitalDischargePrior"
                        className="form-label"
                      >
                        ER visit prior to SOC
                      </label>
                      <Field
                        type="date"
                        name="hospitalDischargePrior"
                        id="hospitalDischargePrior"
                        className={`form-control ${formik.errors.hospitalDischargePrior &&
                          formik.touched.hospitalDischargePrior
                          ? "is-invalid"
                          : ""
                          }`}
                      />
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="form-check d-inline-block ml-3">
                      <label className="form-check-label" htmlFor="enable2FA">
                        Enable 2FA
                      </label>
                      <Field
                        className="form-check-input"
                        type="checkbox"
                        id="enable2FA"
                        name="enable2FA"
                      />
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="form-check d-inline-block ml-3">
                      <label
                        className="form-check-label"
                        htmlFor="enableAssistedGPS"
                      >
                        Enable Assisted GPS
                      </label>
                      <Field
                        className="form-check-input"
                        type="checkbox"
                        id="enableAssistedGPS"
                        name="enableAssistedGPS"
                      />
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="form-check d-inline-block ml-3">
                      <label
                        className="form-check-label"
                        htmlFor="enableWebLogin"
                      >
                        Enable Web Login
                      </label>
                      <Field
                        className="form-check-input"
                        type="checkbox"
                        id="enableWebLogin"
                        name="enableWebLogin"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information Section */}
          <div className="frm-outer mt-3 row">
            {/* Case Management Section */}
            <div className="col-md-12">
              <div className="card">
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-row">
                        <label
                          htmlFor="caseManager"
                          className="col-sm-4 col-form-label"
                        >
                          Case Manager
                        </label>
                        <div className="col-sm-12 col-md-12 d-flex gap-2">
                          <Field
                            as="select"
                            name="caseManager"
                            id="caseManager"
                            className={`form-control ${formik.errors.caseManager &&
                              formik.touched.caseManager
                              ? "is-invalid"
                              : ""
                              }`}
                          >
                            <option value="null">-----Select-----</option>
                            {caseManager.map((manager) => (
                              <option key={manager._id} value={manager._id}>
                                {manager.firstName} {manager.lastName}
                              </option>
                            ))}
                          </Field>
                          <ErrorMessage
                            name="caseManager"
                            component="div"
                            className="invalid-feedback"
                          />
                          <div className="input-group-text gap-2">
                            <FontAwesomeIcon icon={faPlusCircle} className="mx-2 cursor-pointer" onClick={() => {
                              navigateUser('clients/caseManager')
                            }} />
                            <FontAwesomeIcon icon={faSyncAlt} className="mx-2  cursor-pointer" onClick={
                              () => {
                                dispatch(fetchCaseManagerByVendor({ limit: 100 }));
                              }
                            } />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-row">
                        <label
                          htmlFor="ambulatory"
                          className="col-sm-4 col-form-label"
                        >
                          Ambulatory
                        </label>
                        <div className="col-sm-12 col-md-12">
                          <Field
                            as="select"
                            name="ambulatory"
                            id="ambulatory"
                            className={`form-control ${formik.errors.ambulatory &&
                              formik.touched.ambulatory
                              ? "is-invalid"
                              : ""
                              }`}
                          >
                            <option value="0">-----Select-----</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                            <option value="Yes with Assistance">
                              Yes with Assistance
                            </option>
                          </Field>
                          <ErrorMessage
                            name="ambulatory"
                            component="div"
                            className="invalid-feedback"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Referred By Field */}
                    <div className="col-md-6">
                      <div className="form-row">
                        <label htmlFor="referredBy" className="col-sm-4 col-form-label">
                          Referred By
                        </label>
                        <div className="col-sm-12 col-md-12 d-flex gap-2">
                          <Field
                            as="select"
                            name="referredBy"
                            id="referredBy"
                            className={`form-control ${formik.errors.referredBy && formik.touched.referredBy
                              ? "is-invalid"
                              : ""
                              }`}
                          >
                            <option value="">-----Select-----</option>
                            {referralSources.map((source) => (
                              <option key={source._id} value={source._id}>
                                {source.name}
                              </option>
                            ))}
                          </Field>
                          <ErrorMessage
                            name="referredBy"
                            component="div"
                            className="invalid-feedback"
                          />
                          <div className="input-group-text gap-2">
                            <FontAwesomeIcon
                              icon={faPlusCircle}
                              className="mx-2 cursor-pointer"
                              onClick={() => navigateUser("clients/referral-sources")}
                            />
                            <FontAwesomeIcon
                              icon={faSyncAlt}
                              className="mx-2 cursor-pointer"
                              onClick={() => dispatch(fetchReferralSourcesByVendor({ limit: 100 }))}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-row">
                        <label
                          htmlFor="referralNumber"
                          className="col-sm-4 col-form-label"
                        >
                          Referral #
                        </label>
                        <div className="col-sm-12 col-md-12">
                          <Field
                            type="text"
                            name="referralNumber"
                            id="referralNumber"
                            className="form-control"
                            placeholder=""
                          />
                          <div className="form-check d-inline-block ml-3">
                            <Field
                              className="form-check-input"
                              type="checkbox"
                              id="dnrCheck"
                              name="dnr"
                            />
                            <label
                              className="form-check-label"
                              htmlFor="dnrCheck"
                            >
                              DNR
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-row">
                        <label
                          htmlFor="physician"
                          className="col-sm-4 col-form-label"
                        >
                          Physician
                        </label>
                        <div className="col-sm-12 col-md-12 d-flex gap-2">
                          <Field
                            as="select"
                            name="physician"
                            id="physician"
                            className={`form-control ${formik.errors.physician &&
                              formik.touched.physician
                              ? "is-invalid"
                              : ""
                              }`}
                          >
                            <option value="null">-----Select-----</option>
                            {physician.map((phys) => (
                              <option key={phys._id} value={phys._id}>
                                {phys.firstName} {phys.lastName}
                              </option>
                            ))}
                          </Field>
                          <ErrorMessage
                            name="physician"
                            component="div"
                            className="invalid-feedback"
                          />
                          <div className="input-group-text gap-2">
                            <FontAwesomeIcon icon={faPlusCircle} className="mx-2 cursor-pointer" onClick={() => {
                              navigateUser('clients/physician')
                            }} />
                            <FontAwesomeIcon icon={faSyncAlt} className="mx-2  cursor-pointer" onClick={
                              () => {
                                dispatch(fetchPhysicianByVendor({ limit: 100 }));
                              }
                            } />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-row">
                        <label
                          htmlFor="diagnosisCode"
                          className="col-sm-4 col-form-label"
                        >
                          Diagnosis/Code
                        </label>
                        <div className="col-sm-12 col-md-12">
                          <div className="d-flex">
                            <Field
                              type="text"
                              name="diagnosisCode"
                              id="diagnosisCode"
                              className="form-control"
                              placeholder=""
                            />
                            <Field
                              type="text"
                              name="diagnosisDescription"
                              className="form-control ml-2"
                              placeholder=""
                            />
                            <div className="icons ml-2">
                              <span>
                                <i
                                  className="fa fa-info"
                                  aria-hidden="true"
                                ></i>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-row">
                        <label
                          htmlFor="clientType"
                          className="col-sm-4 col-form-label"
                        >
                          Client Type
                        </label>
                        <div className="col-sm-12 col-md-12 d-flex gap-2">
                          <Field
                            as="select"
                            name="clientType"
                            id="clientType"
                            className={`form-control ${formik.errors.clientType &&
                              formik.touched.clientType
                              ? "is-invalid"
                              : ""
                              }`}
                          >
                            <option value="null">-----Select-----</option>
                            {clientType.map((manager) => (
                              <option key={manager._id} value={manager._id}>
                                {manager.description}
                              </option>
                            ))}
                          </Field>
                          <ErrorMessage
                            name="clientType"
                            component="div"
                            className="invalid-feedback"
                          />
                          <div className="input-group-text gap-2">
                            <FontAwesomeIcon icon={faPlusCircle} className="mx-2 cursor-pointer" onClick={() => {
                              navigateUser('clients/clientTypes')
                            }} />
                            <FontAwesomeIcon icon={faSyncAlt} className="mx-2  cursor-pointer" onClick={
                              () => {
                                dispatch(fetchClientTypesByVendor({ limit: 100 }));
                              }
                            } />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-row">
                        <label
                          htmlFor="medRecordNumber"
                          className="col-sm-4 col-form-label"
                        >
                          Med Record #
                        </label>
                        <div className="col-sm-12 col-md-12">
                          <Field
                            type="text"
                            name="medRecordNumber"
                            id="medRecordNumber"
                            className="form-control"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-row">
                        <label
                          htmlFor="ssn"
                          className="col-sm-4 col-form-label"
                        >
                          SSN
                        </label>
                        <div className="col-sm-12 col-md-12">
                          <Field
                            type="text"
                            name="ssn"
                            id="ssn"
                            className="form-control"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-row">
                        <label
                          htmlFor="locationId"
                          className="col-sm-4 col-form-label"
                        >
                          Location ID
                        </label>
                        <div className="col-sm-12 col-md-12 d-flex gap-2">
                          <Field
                            as="select"
                            name="locationId"
                            id="locationId"
                            className={`form-control ${formik.errors.locationId &&
                              formik.touched.locationId
                              ? "is-invalid"
                              : ""
                              }`}
                          >
                            <option value="null">-----Select-----</option>
                            {location.map((manager) => (
                              <option key={manager._id} value={manager._id}>
                                {manager.description}
                              </option>
                            ))}
                          </Field>
                          <ErrorMessage
                            name="locationId"
                            component="div"
                            className="invalid-feedback"
                          />
                          <div className="input-group-text gap-2">
                            <FontAwesomeIcon icon={faPlusCircle} className="mx-2 cursor-pointer" onClick={() => {
                              navigateUser('clients/location')
                            }} />
                            <FontAwesomeIcon icon={faSyncAlt} className="mx-2  cursor-pointer" onClick={
                              () => {
                                dispatch(fetchLocationsByVendor({ limit: 100 }));
                              }
                            } />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-row">
                        <label
                          htmlFor="evvId"
                          className="col-sm-4 col-form-label"
                        >
                          EVV ID
                        </label>
                        <div className="col-sm-12 col-md-12">
                          <Field
                            type="text"
                            name="evvId"
                            id="evvId"
                            className="form-control"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-row">
                        <label
                          htmlFor="accountingId"
                          className="col-sm-4 col-form-label"
                        >
                          Accounting ID
                        </label>
                        <div className="col-sm-12 col-md-12">
                          <Field
                            type="text"
                            name="accountingId"
                            id="accountingId"
                            className="form-control"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-row">
                        <label
                          htmlFor="priority"
                          className="col-sm-4 col-form-label"
                        >
                          Priority
                        </label>
                        <div className="col-sm-12 col-md-12">
                          <div className="d-flex align-items-center">
                            <Field
                              as="select"
                              name="priority"
                              id="priority"
                              className="form-control"
                            >
                              <option value="null">-----Select-----</option>
                              <option value="1">1</option>
                              <option value="2">2</option>
                              <option value="3">3</option>
                              <option value="4">4</option>
                            </Field>
                            <span className="mx-2">Weight</span>
                            <Field
                              type="text"
                              name="weight"
                              className="form-control"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar with Client Photo */}
        <div className="col-md-2">
          <div className="card">
            <div className="card-body text-center">
              {values.clientPhoto ? (
                <img
                  src={URL.createObjectURL(values.clientPhoto)}
                  alt="Client"
                  className="img-fluid rounded mb-3"
                  style={{ maxHeight: "200px" }}
                />
              ) : (
                <div className="bg-light p-4 mb-3 rounded">
                  <i className="fas fa-user fa-4x text-muted"></i>
                </div>
              )}

              <input
                type="file"
                name="clientPhoto"
                onChange={(e) => handleFileUpload("clientPhoto", e)}
                className="form-control mb-2"
                accept="image/*"
                id="clientPhotoInput"
                hidden
              />

              <button
                type="button"
                className="btn btn-primary btn-sm w-100 mb-2"
                onClick={() =>
                  document.getElementById("clientPhotoInput").click()
                }
              >
                Upload Photo
              </button>

              <button
                type="button"
                className="btn btn-outline-danger btn-sm w-100 mb-3"
                onClick={() => setFieldValue("clientPhoto", null)}
                disabled={!values.clientPhoto}
              >
                Remove Photo
              </button>

              <div className="form-group mb-3">
                <label htmlFor="clientStatus" className="form-label">
                  Client Status
                </label>
                <Field
                  as="select"
                  name="status"
                  id="clientStatus"
                  className="form-control"
                >
                  <option value="A">Active</option>
                  <option value="I">Inactive</option>
                  <option value="P">Pending</option>
                </Field>
              </div>

              <button
                type="button"
                className="btn btn-secondary btn-sm w-100 mb-2"
              >
                <i className="fas fa-map-marker-alt me-1"></i> Geolocation
              </button>

              <button type="button" className="btn btn-info btn-sm w-100">
                <i className="fas fa-qrcode me-1"></i> Generate QR Code
              </button>
            </div>
          </div>
        </div>

        {/* Address Section */}
        <div className="frm-outer mt-3">
          <div className="row">
            <div className="col-md-6">
              <div className="card">
                <div className="card-header p-0">
                  <Nav tabs>
                    <NavItem>
                      <NavLink
                        className={activeAddressTab === "1" ? "active" : ""}
                        onClick={() => setActiveAddressTab("1")}
                      >
                        Home Address
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        className={activeAddressTab === "2" ? "active" : ""}
                        onClick={() => setActiveAddressTab("2")}
                      >
                        Other Address
                      </NavLink>
                    </NavItem>
                  </Nav>
                </div>
                <div className="card-body">
                  <TabContent activeTab={activeAddressTab}>
                    <TabPane tabId="1">
                      <div className="form-group mb-3">
                        <label htmlFor="homeAddress1" className="form-label">
                          Address 1*
                        </label>
                        <Field
                          type="text"
                          name="homeAddress1"
                          id="homeAddress1"
                          className={`form-control ${formik.errors.homeAddress1 &&
                            formik.touched.homeAddress1
                            ? "is-invalid"
                            : ""
                            }`}
                        />
                        <ErrorMessage
                          name="homeAddress1"
                          component="div"
                          className="invalid-feedback"
                        />
                      </div>

                      <div className="form-group mb-3">
                        <label htmlFor="homeAddress2" className="form-label">
                          Address 2
                        </label>
                        <Field
                          type="text"
                          name="homeAddress2"
                          id="homeAddress2"
                          className="form-control"
                        />
                      </div>

                      <div className="row">
                        <div className="col-md-6">
                          <div className="form-group mb-3">
                            <label htmlFor="homeCity" className="form-label">
                              City*
                            </label>
                            <Field
                              type="text"
                              name="homeCity"
                              id="homeCity"
                              className={`form-control ${formik.errors.homeCity &&
                                formik.touched.homeCity
                                ? "is-invalid"
                                : ""
                                }`}
                            />
                            <ErrorMessage
                              name="homeCity"
                              component="div"
                              className="invalid-feedback"
                            />
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group mb-3">
                            <label htmlFor="homeState" className="form-label">
                              State*
                            </label>
                            <Field
                              type="text"
                              name="homeState"
                              id="homeState"
                              className={`form-control ${formik.errors.homeState &&
                                formik.touched.homeState
                                ? "is-invalid"
                                : ""
                                }`}
                            />
                            <ErrorMessage
                              name="homeState"
                              component="div"
                              className="invalid-feedback"
                            />
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group mb-3">
                            <label htmlFor="homeZip" className="form-label">
                              Zip*
                            </label>
                            <Field
                              type="text"
                              name="homeZip"
                              id="homeZip"
                              className={`form-control ${formik.errors.homeZip && formik.touched.homeZip
                                ? "is-invalid"
                                : ""
                                }`}
                            />
                            <ErrorMessage
                              name="homeZip"
                              component="div"
                              className="invalid-feedback"
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-row">
                            <label
                              htmlFor="homeStartAddressType"
                              className=" col-form-label"
                            >
                              Start AddressType
                            </label>
                            <div className="col-sm-12 col-md-12">
                              <Field
                                as="select"
                                name="homeStartAddressType"
                                id="homeStartAddressType"
                                className={`form-control ${formik.errors.homeStartAddressType &&
                                  formik.touched.homeStartAddressType
                                  ? "is-invalid"
                                  : ""
                                  }`}
                              >
                                <option value="null">-----Select-----</option>
                                {ADDRESS_TYPES?.map((address) => (
                                  <option
                                    key={address.value}
                                    value={address.value}
                                  >
                                    {address.label}
                                  </option>
                                ))}
                              </Field>
                              <ErrorMessage
                                name="homeStartAddressType"
                                component="div"
                                className="invalid-feedback"
                              />
                              <div className="icons">
                                <span>
                                  <i
                                    className="fa fa-info"
                                    aria-hidden="true"
                                  ></i>
                                </span>
                                <span>
                                  <i
                                    className="fa fa-plus"
                                    aria-hidden="true"
                                  ></i>
                                </span>
                                <span>
                                  <i
                                    className="fa fa-refresh"
                                    aria-hidden="true"
                                  ></i>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-row">
                            <label
                              htmlFor="homeEndAddressType"
                              className=" col-form-label"
                            >
                              End AddressType
                            </label>
                            <div className="col-sm-12 col-md-12">
                              <Field
                                as="select"
                                name="homeEndAddressType"
                                id="homeEndAddressType"
                                className={`form-control ${formik.errors.homeEndAddressType &&
                                  formik.touched.homeEndAddressType
                                  ? "is-invalid"
                                  : ""
                                  }`}
                              >
                                <option value="null">-----Select-----</option>
                                {ADDRESS_TYPES?.map((address) => (
                                  <option
                                    key={address.value}
                                    value={address.value}
                                  >
                                    {address.label}
                                  </option>
                                ))}
                              </Field>
                              <ErrorMessage
                                name="homeEndAddressType"
                                component="div"
                                className="invalid-feedback"
                              />
                              <div className="icons">
                                <span>
                                  <i
                                    className="fa fa-info"
                                    aria-hidden="true"
                                  ></i>
                                </span>
                                <span>
                                  <i
                                    className="fa fa-plus"
                                    aria-hidden="true"
                                  ></i>
                                </span>
                                <span>
                                  <i
                                    className="fa fa-refresh"
                                    aria-hidden="true"
                                  ></i>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabPane>
                    <TabPane tabId="2">
                      <div className="form-group mb-3">
                        <label htmlFor="otherEvvAddress1" className="form-label">
                          Address 1
                        </label>
                        <Field
                          type="text"
                          name="otherEvvAddress1"
                          id="otherEvvAddress1"
                          className="form-control"
                        />
                      </div>

                      <div className="form-group mb-3">
                        <label htmlFor="otherEvvAddress2" className="form-label">
                          Address 2
                        </label>
                        <Field
                          type="text"
                          name="otherEvvAddress2"
                          id="otherEvvAddress2"
                          className="form-control"
                        />
                      </div>

                      <div className="row">
                        <div className="col-md-6">
                          <div className="form-group mb-3">
                            <label htmlFor="otherEvvCity" className="form-label">
                              City
                            </label>
                            <Field
                              type="text"
                              name="otherEvvCity"
                              id="otherEvvCity"
                              className="form-control"
                            />
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group mb-3">
                            <label htmlFor="otherEvvState" className="form-label">
                              State
                            </label>
                            <Field
                              type="text"
                              name="otherEvvState"
                              id="otherEvvState"
                              className="form-control"
                            />
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group mb-3">
                            <label htmlFor="otherEvvZip" className="form-label">
                              Zip
                            </label>
                            <Field
                              type="text"
                              name="otherEvvZip"
                              id="otherEvvZip"
                              className="form-control"
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-row">
                            <label
                              htmlFor="otherEvvStartAddressType"
                              className=" col-form-label"
                            >
                              Start AddressType
                            </label>
                            <div className="col-sm-12 col-md-12">
                              <Field
                                as="select"
                                name="otherEvvStartAddressType"
                                id="otherEvvStartAddressType"
                                className={`form-control ${formik.errors.otherEvvStartAddressType &&
                                  formik.touched.otherEvvStartAddressType
                                  ? "is-invalid"
                                  : ""
                                  }`}
                              >
                                <option value="null">-----Select-----</option>
                                {ADDRESS_TYPES?.map((address) => (
                                  <option
                                    key={address.value}
                                    value={address.value}
                                  >
                                    {address.label}
                                  </option>
                                ))}
                              </Field>
                              <ErrorMessage
                                name="otherEvvStartAddressType"
                                component="div"
                                className="invalid-feedback"
                              />
                              <div className="icons">
                                <span>
                                  <i
                                    className="fa fa-info"
                                    aria-hidden="true"
                                  ></i>
                                </span>
                                <span>
                                  <i
                                    className="fa fa-plus"
                                    aria-hidden="true"
                                  ></i>
                                </span>
                                <span>
                                  <i
                                    className="fa fa-refresh"
                                    aria-hidden="true"
                                  ></i>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-row">
                            <label
                              htmlFor="otherEvvEndAddressType"
                              className=" col-form-label"
                            >
                              End AddressType
                            </label>
                            <div className="col-sm-12 col-md-12">
                              <Field
                                as="select"
                                name="otherEvvEndAddressType"
                                id="otherEvvEndAddressType"
                                className={`form-control ${formik.errors.otherEvvEndAddressType &&
                                  formik.touched.otherEvvEndAddressType
                                  ? "is-invalid"
                                  : ""
                                  }`}
                              >
                                <option value="null">-----Select-----</option>
                                {ADDRESS_TYPES?.map((address) => (
                                  <option
                                    key={address.value}
                                    value={address.value}
                                  >
                                    {address.label}
                                  </option>
                                ))}
                              </Field>
                              <ErrorMessage
                                name="otherEvvEndAddressType"
                                component="div"
                                className="invalid-feedback"
                              />
                              <div className="icons">
                                <span>
                                  <i
                                    className="fa fa-info"
                                    aria-hidden="true"
                                  ></i>
                                </span>
                                <span>
                                  <i
                                    className="fa fa-plus"
                                    aria-hidden="true"
                                  ></i>
                                </span>
                                <span>
                                  <i
                                    className="fa fa-refresh"
                                    aria-hidden="true"
                                  ></i>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabPane>
                  </TabContent>
                </div>
              </div>
            </div>

            {/* Billing Address Section */}
            <div className="col-md-6">
              <div className="card">
                <div className="card-header p-0">
                  <ul className="nav nav-tabs">
                    <li className="nav-item">
                      <button
                        type="button"
                        className={`nav-link ${activeTab === "tab-3" ? "active" : ""
                          }`}
                        onClick={() => setActiveTab("tab-3")}
                      >
                        Client Billing Address
                      </button>
                    </li>
                    <li className="nav-item">
                      <button
                        type="button"
                        className={`nav-link ${activeTab === "tab-4" ? "active" : ""
                          }`}
                        onClick={() => setActiveTab("tab-4")}
                      >
                        Additional Payors
                      </button>
                    </li>
                    <li className="nav-item">
                      <button
                        type="button"
                        className={`nav-link ${activeTab === "tab-5" ? "active" : ""
                          }`}
                        onClick={() => setActiveTab("tab-5")}
                      >
                        Additional Physicians
                      </button>
                    </li>
                  </ul>
                </div>

                <div className="card-body">
                  {/* Client Billing Address Tab */}
                  {activeTab === "tab-3" && (
                    <div className="row">
                      <div className="col-12 mb-3">
                        <p className="text-muted">
                          (If different from home address)
                        </p>
                      </div>

                      <div className="col-md-12 mb-3">
                        <div className="input-group">
                          <label className="input-group-text">Payor</label>
                          <Field
                            as="select"
                            name="billingPayor"
                            className="form-select"
                          >
                            <option value="">-----Select-----</option>
                            {payor.map((p) => (
                              <option key={p._id} value={p._id}>
                                {p.payor}
                              </option>
                            ))}
                          </Field>
                          <div className="input-group-text gap-2">
                            <FontAwesomeIcon icon={faPlusCircle} className="mx-2 cursor-pointer" onClick={() => {
                              navigateUser('clients/payors')
                            }} />
                            <FontAwesomeIcon icon={faSyncAlt} className="mx-2  cursor-pointer" onClick={
                              () => {
                                dispatch(fetchPayorByVendor({ limit: 100 }));
                              }
                            } />
                          </div>
                        </div>
                      </div>

                      <div className="col-md-12 mb-3">
                        <div className="input-group">
                          <label className="input-group-text">Address 1</label>
                          <Field
                            type="text"
                            name="billingAddress1"
                            className="form-control"
                          />
                        </div>
                      </div>

                      <div className="col-md-12 mb-3">
                        <div className="input-group">
                          <label className="input-group-text">Address 2</label>
                          <Field
                            type="text"
                            name="billingAddress2"
                            className="form-control"
                          />
                        </div>
                      </div>

                      <div className="col-md-4 mb-3">
                        <div className="input-group">
                          <label className="input-group-text">City</label>
                          <Field
                            type="text"
                            name="billingCity"
                            className="form-control"
                          />
                        </div>
                      </div>

                      <div className="col-md-4 mb-3">
                        <div className="input-group">
                          <label className="input-group-text">State</label>
                          <Field
                            type="text"
                            name="billingState"
                            className="form-control"
                          />
                        </div>
                      </div>

                      <div className="col-md-4 mb-3">
                        <div className="input-group">
                          <label className="input-group-text">Zip</label>
                          <Field
                            type="text"
                            name="billingZip"
                            className="form-control"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Additional Payors Tab */}
                  {activeTab === "tab-4" && (
                    <div className="row">
                      {[2, 3, 4].map((num) => (
                        <div className="col-md-12 mb-3" key={`payor-${num}`}>
                          <div className="input-group">
                            <label className="input-group-text">
                              Payor {num}
                            </label>
                            <Field
                              as="select"
                              className="form-select"
                              name={`payor${num}`}
                            >
                              <option value="">-----Select-----</option>
                              {payor.map((p) => (
                                <option key={p._id} value={p._id}>
                                  {p.payor}
                                </option>
                              ))}
                            </Field>
                            <div className="input-group-text gap-2">
                              <FontAwesomeIcon icon={faPlusCircle} className="mx-2 cursor-pointer" onClick={() => {
                                navigateUser('clients/payors')
                              }} />
                              <FontAwesomeIcon icon={faSyncAlt} className="mx-2  cursor-pointer" onClick={
                                () => {
                                  dispatch(fetchPayorByVendor({ limit: 100 }));
                                }
                              } />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Additional Physicians Tab */}
                  {activeTab === "tab-5" && (
                    <div className="row">
                      {[2, 3, 4].map((num) => (
                        <div
                          className="col-md-12 mb-3"
                          key={`physician-${num}`}
                        >
                          <div className="input-group">
                            <label className="input-group-text">
                              Physician {num}
                            </label>
                            <Field
                              as="select"
                              className="form-select"
                              name={`physician${num}`}
                            >
                              <option value="">-----Select-----</option>
                              {physician.map((phys) => (
                                <option key={phys._id} value={phys._id}>
                                  {phys.firstName} {phys.lastName}
                                </option>
                              ))}
                            </Field>
                            <div className="input-group-text gap-2">
                              <FontAwesomeIcon icon={faPlusCircle} className="mx-2 cursor-pointer" onClick={() => {
                                navigateUser('clients/physician')
                              }} />
                              <FontAwesomeIcon icon={faSyncAlt} className="mx-2  cursor-pointer" onClick={
                                () => {
                                  dispatch(fetchPhysicianByVendor({ limit: 100 }));
                                }
                              } />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COVID and Flu Vaccination Section */}
        <div className="frm-outer mt-3">
          <div className="row">
            <div className="col-md-6">
              <div className="card">
                <div className="card-header p-0">
                  <Nav tabs>
                    <NavItem>
                      <NavLink
                        className={activeVaccineTab === "1" ? "active" : ""}
                        onClick={() => setActiveVaccineTab("1")}
                      >
                        COVID Vaccination
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        className={activeVaccineTab === "2" ? "active" : ""}
                        onClick={() => setActiveVaccineTab("2")}
                      >
                        COVID Dates
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        className={activeVaccineTab === "3" ? "active" : ""}
                        onClick={() => setActiveVaccineTab("3")}
                      >
                        Flu Vaccine
                      </NavLink>
                    </NavItem>
                  </Nav>
                </div>
                <div className="card-body">
                  <TabContent activeTab={activeVaccineTab}>
                    <TabPane tabId="1">
                      <div className="row">
                        <div className="col-md-6">
                          <div className="form-group mb-3">
                            <div className="form-check">
                              <Field
                                type="checkbox"
                                name="covidVaccinated"
                                id="covidVaccinated"
                                className="form-check-input"
                              />
                              <label
                                className="form-check-label"
                                htmlFor="covidVaccinated"
                              >
                                COVID-19 Vaccinated
                              </label>
                            </div>
                          </div>

                          <div className="form-group mb-3">
                            <div className="form-check">
                              <Field
                                type="checkbox"
                                name="vaccineRefused"
                                id="vaccineRefused"
                                className="form-check-input"
                              />
                              <label
                                className="form-check-label"
                                htmlFor="vaccineRefused"
                              >
                                Vaccine Refused
                              </label>
                            </div>
                          </div>

                          <div className="form-group mb-3">
                            <label
                              htmlFor="refusedReason"
                              className="form-label"
                            >
                              Refused Reason
                            </label>
                            <Field
                              as="textarea"
                              name="refusedReason"
                              id="refusedReason"
                              rows="3"
                              className="form-control"
                            />
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-group mb-3 text-center">
                            <label className="form-label">Vaccine Card</label>
                            <div className="mb-2">
                              {values.vaccineCard ? (
                                <img
                                  src={URL.createObjectURL(values.vaccineCard)}
                                  alt="Vaccine Card"
                                  className="img-fluid border"
                                  style={{ maxHeight: "150px" }}
                                />
                              ) : (
                                <div className="border p-3 bg-light">
                                  <i className="fas fa-image fa-3x text-muted"></i>
                                  <p className="mt-2">No image uploaded</p>
                                </div>
                              )}
                            </div>
                            <input
                              type="file"
                              name="vaccineCard"
                              onChange={(e) =>
                                handleFileUpload("vaccineCard", e)
                              }
                              className="form-control"
                              accept="image/*"
                            />
                          </div>
                        </div>
                      </div>
                    </TabPane>
                    <TabPane tabId="2">
                      <div className="table-responsive">
                        <table className="table table-bordered">
                          <thead>
                            <tr>
                              <th style={{ width: "15%" }}>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-success"
                                  onClick={addCovidVaccine}
                                >
                                  <i className="fas fa-plus"></i> Add
                                </button>
                              </th>
                              <th>Vaccine Type</th>
                              <th>Vaccine Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {covidVaccines.map((vaccine, index) => (
                              <tr key={index}>
                                <td>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-danger"
                                  >
                                    <i className="fas fa-trash"></i>
                                  </button>
                                </td>
                                <td>{vaccine.type}</td>
                                <td>{vaccine.date}</td>
                              </tr>
                            ))}
                            {covidVaccines.length === 0 && (
                              <tr>
                                <td
                                  colSpan="3"
                                  className="text-center text-muted"
                                >
                                  No vaccine records found
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </TabPane>
                    <TabPane tabId="3">
                      <div className="table-responsive">
                        <table className="table table-bordered">
                          <thead>
                            <tr>
                              <th style={{ width: "15%" }}>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-success"
                                  onClick={addFluVaccine}
                                >
                                  <i className="fas fa-plus"></i> Add
                                </button>
                              </th>
                              <th>Date</th>
                              <th>Status</th>
                              <th>Refused Reason</th>
                            </tr>
                          </thead>
                          <tbody>
                            {fluVaccines.map((vaccine, index) => (
                              <tr key={index}>
                                <td>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-danger"
                                  >
                                    <i className="fas fa-trash"></i>
                                  </button>
                                </td>
                                <td>{vaccine.date}</td>
                                <td>{vaccine.status}</td>
                                <td>{vaccine.refusedReason}</td>
                              </tr>
                            ))}
                            {fluVaccines.length === 0 && (
                              <tr>
                                <td
                                  colSpan="4"
                                  className="text-center text-muted"
                                >
                                  No flu vaccine records found
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </TabPane>
                  </TabContent>
                </div>
              </div>
            </div>

            {/* Alerts and Notifications Section */}
            <div className="col-md-6">
              <div className="card h-100">
                <div className="card-header p-0">
                  <Nav tabs>
                    <NavItem>
                      <NavLink
                        className={activeAlertTab === "1" ? "active" : ""}
                        onClick={() => setActiveAlertTab("1")}
                      >
                        Office Alerts
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        className={activeAlertTab === "2" ? "active" : ""}
                        onClick={() => setActiveAlertTab("2")}
                      >
                        Caregiver Alerts
                      </NavLink>
                    </NavItem>
                  </Nav>
                </div>
                <div className="card-body">
                  <TabContent activeTab={activeAlertTab}>
                    <TabPane tabId="1">
                      <div className="form-group mb-3">
                        <div className="form-check">
                          <Field
                            type="checkbox"
                            name="covidVaccinatedAlert"
                            id="covidVaccinatedAlert"
                            className="form-check-input"
                          />
                          <label
                            className="form-check-label"
                            htmlFor="covidVaccinatedAlert"
                          >
                            Alert when accessing client data
                          </label>
                        </div>
                      </div>

                      <div className="form-group mb-3">
                        <div className="form-check">
                          <Field
                            type="checkbox"
                            name="vaccineRefusedAlert"
                            id="vaccineRefusedAlert"
                            className="form-check-input"
                          />
                          <label
                            className="form-check-label"
                            htmlFor="vaccineRefusedAlert"
                          >
                            Alert when scheduling
                          </label>
                        </div>
                      </div>

                      <div className="form-group mb-3">
                        <label htmlFor="alertText" className="form-label">
                          Alert Text/Message
                        </label>
                        <Field
                          as="textarea"
                          name="alertText"
                          id="alertText"
                          rows="3"
                          className="form-control"
                          placeholder="Enter the alert message to display..."
                        />
                      </div>
                    </TabPane>
                  </TabContent>

                </div>
              </div>
            </div>

            {/* First Column - Billing Options */}
            <div className="col-md-6 mt-3">
              <div className="card bottom-box">
                <div className="card-body">
                  <div className="d-flex">
                    <div className="form-check me-4">
                      <Field
                        className="form-check-input"
                        type="checkbox"
                        id="enableClientSpecific1500"
                        name="enableClientSpecific1500"
                        checked={values.enableClientSpecific1500}
                      />
                      <label
                        className="form-check-label"
                        htmlFor="enableClientSpecific1500"
                      >
                        Enable Client Specific 1500
                      </label>
                    </div>

                    <div className="form-check">
                      <Field
                        className="form-check-input"
                        type="checkbox"
                        id="enableUB04"
                        name="enableUB04"
                        checked={values.enableUB04}
                      />
                      <label
                        className="form-check-label"
                        htmlFor="enableUB04"
                      >
                        Enable UB04
                      </label>
                    </div>
                  </div>

                  <div className="d-flex mt-3">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => {
                        const clientId = values._id || clientData?._id;
                        if (clientId) {
                          navigate(`/generations.idb-sys/clients/form-1500B?client=${clientId}&version=08/05`);
                        } else {
                          // Save first then navigate
                          CreateClientAndOpenForm1500();
                        }
                      }}
                    >
                      CMS 1500 Billing Version (08/05)
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => {
                        const clientId = values._id || clientData?._id;
                        if (clientId) {
                          navigate(`/generations.idb-sys/clients/form-1500B?client=${clientId}&version=02/12`);
                        } else {
                          // Save first then navigate
                          CreateClientAndOpenForm1500();
                        }
                      }}
                    >
                      CMS 1500 Billing Version (02/12)
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                    >
                      UB04
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Second Column - Signature Settings */}
            <div className="col-md-6 mt-3">
              <div className="card bottom-box">
                <div className="card-body">
                  <h6 className="note-head mb-3">
                    <strong>Time / Task Signature Defaults</strong>
                  </h6>

                  <div className="d-flex">
                    <div className="form-check me-4">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="requireCaregiverSig"
                      />
                      <label
                        className="form-check-label"
                        htmlFor="requireCaregiverSig"
                      >
                        Require Caregiver Signature
                      </label>
                    </div>

                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="requireClientSig"
                      />
                      <label
                        className="form-check-label"
                        htmlFor="requireClientSig"
                      >
                        Require Client Signature
                      </label>
                    </div>
                  </div>

                  <div className="mt-3">
                    <button type="button" className="btn btn-outline-secondary">
                      Update Future Schedules
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Save Button - Aligned to Right */}
      <div className="mt-4 pt-3 border-top d-flex justify-content-end">
        <div className="d-flex align-items-center gap-3">
          {isSaved && (
            <span className="text-success d-flex align-items-center">
              <FontAwesomeIcon icon={faCheck} className="me-1" />
              Saved successfully
            </span>
          )}
          <button
            type="button"
            className="btn btn-success"
            onClick={onSaveTab}
            disabled={isSaving || formik.isSubmitting}
          >
            {isSaving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Saving...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faSave} className="me-2" />
                Save
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PersonalData;