// InsuranceFormReplica.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useFormik } from "formik";
import { fetchClientById, updateClient } from "../../../../store/IDB_SYS/Clients/clientSlice";
import { fetchPayorByVendor } from "../../../../store/IDB_SYS/Clients/payorSlice";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faTimes, faSyncAlt, faPrint } from "@fortawesome/free-solid-svg-icons";

export default function InsuranceFormReplica() {
  const { selectedClient } = useSelector((state) => state.client);
  const { payor: payors } = useSelector((state) => state.payor);
  const { client } = useParams();
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [initialFormValues, setInitialFormValues] = useState(null);

  const getClientIdFromQueryString = () => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('client');
  };

  const clientId = getClientIdFromQueryString() || client;

  // Fetch client and payor data on mount
  useEffect(() => {
    dispatch(fetchPayorByVendor({ limit: 100 }));
    if (clientId) {
      dispatch(fetchClientById(clientId));
    }
  }, [clientId, dispatch]);

  // Helper function to safely format date
  const formatDate = (dateValue) => {
    if (!dateValue) return "";
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return "";
      return date.toISOString().split('T')[0];
    } catch {
      return "";
    }
  };

  // Build form values from client data (auto-population logic)
  const buildFormValuesFromClient = useCallback((clientData) => {
    if (!clientData) return getDefaultFormValues();

    const cmsData = clientData.cms1500 || {};
    const icd10Codes = cmsData.icd10Codes || {};

    // Find payor name from payors list
    const selectedPayor = payors?.find(p => p._id === clientData.billingPayor);
    const payorName = selectedPayor?.payor || "";

    return {
      // Payor and Carrier - Auto-fill from billing payor
      payor: clientData.billingPayor || "",
      carrier: payorName || cmsData.carrier || "",

      // Insurance Type - from CMS data or derive from client type
      insType: cmsData.insuranceType || "medicaid",
      insuredId: cmsData.insuredId || clientData.medRecordNumber || "",

      // Patient Information - Auto-fill from client personal data
      patientName: cmsData.patientName || `${clientData.lastName || ""}, ${clientData.firstName || ""} ${clientData.middleInitial || ""}`.trim().replace(/,\s*$/, ''),
      patientAddress: cmsData.patientAddress || clientData.billingAddress1 || clientData.homeAddress1 || "",
      patientCity: cmsData.patientCity || clientData.billingCity || clientData.homeCity || "",
      patientState: cmsData.patientState || clientData.billingState || clientData.homeState || "",
      patientZip: cmsData.patientZip || clientData.billingZip || clientData.homeZip || "",
      patientPhone: cmsData.patientPhone || clientData.phone1 || "",
      patientDob: formatDate(clientData.dob),
      patientSex: cmsData.patientSex || (clientData.gender === 'male' ? 'male' : clientData.gender === 'female' ? 'female' : ''),

      // Insured Information - Auto-fill from client data
      insuredLastName: cmsData.insuredLastName || clientData.lastName || "",
      insuredFirstName: cmsData.insuredFirstName || clientData.firstName || "",
      insuredMiddleInitial: cmsData.insuredMiddleInitial || clientData.middleInitial || "",
      insuredAddress: cmsData.insuredAddress || clientData.billingAddress1 || clientData.homeAddress1 || "",
      insuredCity: cmsData.insuredCity || clientData.billingCity || clientData.homeCity || "",
      insuredState: cmsData.insuredState || clientData.billingState || clientData.homeState || "",
      insuredZip: cmsData.insuredZip || clientData.billingZip || clientData.homeZip || "",
      insuredPhone: cmsData.insuredPhone || clientData.phone1 || "",
      insuredPolicyNumber: cmsData.insuredPolicyNumber || clientData.referralNumber || "",
      insuredDob: formatDate(cmsData.insuredDob || clientData.dob),
      insuredSex: cmsData.insuredSex || (clientData.gender === 'male' ? 'male' : clientData.gender === 'female' ? 'female' : ''),
      insuredPlanName: cmsData.insuredPlanName || "",
      anotherPlan: cmsData.anotherPlan || "no",

      // Relationship
      relationship: cmsData.relationshipToInsured || "self",

      // Condition Related To
      employment: cmsData.employmentRelated || "N",
      autoAccident: cmsData.autoAccident || "N",
      otherAccident: cmsData.otherAccident || "N",
      claimCodes: cmsData.claimCodes || clientData.diagnosisCode || "",
      accidentState: cmsData.accidentState || "",

      // Other Insured
      otherInsuredName: cmsData.otherInsuredName || "",
      otherInsuredPolicy: cmsData.otherInsuredPolicy || "",
      otherClaimId: cmsData.otherClaimId || "",

      // Signatures and Dates
      patientSignature: cmsData.patientSignatureOnFile !== undefined ? cmsData.patientSignatureOnFile : true,
      insuredSignature: cmsData.insuredSignatureOnFile !== undefined ? cmsData.insuredSignatureOnFile : true,
      illnessDate: formatDate(cmsData.currentIllnessDate || clientData.assessmentDate),
      illnessQual: cmsData.currentIllnessQualifier || "",
      otherDate: formatDate(cmsData.otherDate),
      otherQual: cmsData.otherDateQualifier || "",
      unableWorkFrom: formatDate(cmsData.unableToWorkFrom || clientData.serviceStart),
      unableWorkThru: formatDate(cmsData.unableToWorkThrough || clientData.serviceEnd),

      // Referring Provider
      referringProvider: cmsData.referringProvider || "",
      referringProviderId: cmsData.referringProviderId || "",
      referringProviderNpi: cmsData.referringProviderNpi || "",

      // Hospitalization
      hospitalizationFrom: formatDate(cmsData.hospitalizationFrom),
      hospitalizationThrough: formatDate(cmsData.hospitalizationThrough),

      // Additional Info
      additionalClaimInfo: cmsData.additionalClaimInfo || "",
      outsideLab: cmsData.outsideLab || "N",
      outsideLabCharges: cmsData.outsideLabCharges || 0,

      // Billing Information
      resubmissionCode: cmsData.resubmissionCode || "",
      originalReferenceNumber: cmsData.originalReferenceNumber || "",
      priorAuthorizationNumber: cmsData.priorAuthorizationNumber || clientData.referralNumber || "",
      placeOfService: cmsData.placeOfService || "12", // 12 = Home
      emg: cmsData.emg || false,
      epsdt: cmsData.epsdt || false,
      qualifier: cmsData.qualifier || "",
      providerNumberType: cmsData.providerNumberType || "other",
      providerNumber: cmsData.providerNumber || "",
      providerNpi: cmsData.providerNpi || "",
      federalTaxId: cmsData.federalTaxId || "",
      taxIdType: cmsData.taxIdType || "EIN",
      patientAccountNumber: cmsData.patientAccountNumber || `${(clientData.firstName || "").charAt(0)}${(clientData.lastName || "").charAt(0)}`.toUpperCase(),
      acceptAssignment: cmsData.acceptAssignment !== undefined ? cmsData.acceptAssignment : true,
      amountPaid: cmsData.amountPaid || 0,

      // Provider Information
      physicianSignature: cmsData.physicianSignature || "",
      serviceFacilityName: cmsData.serviceFacilityName || "",
      serviceFacilityAddress: cmsData.serviceFacilityAddress || "",
      serviceFacilityNpi: cmsData.serviceFacilityNpi || "",

      // Billing Provider
      billingProviderName: cmsData.billingProviderName || "",
      billingProviderAddress: cmsData.billingProviderAddress || "",
      billingProviderNpi: cmsData.billingProviderNpi || "",

      // ICD-10 Codes - Auto-fill diagnosis code in first slot
      icd10_A: icd10Codes.A || clientData.diagnosisCode || "",
      icd10_B: icd10Codes.B || "",
      icd10_C: icd10Codes.C || "",
      icd10_D: icd10Codes.D || "",
      icd10_E: icd10Codes.E || "",
      icd10_F: icd10Codes.F || "",
      icd10_G: icd10Codes.G || "",
      icd10_H: icd10Codes.H || "",
      icd10_I: icd10Codes.I || "",
      icd10_J: icd10Codes.J || "",
      icd10_K: icd10Codes.K || "",
      icd10_L: icd10Codes.L || "",
      icdIndicator: cmsData.icdIndicator || "10",

      // Checkbox helpers
      ol: cmsData.outsideLab || "N",
      ssn: cmsData.taxIdType === "SSN",
      ein: cmsData.taxIdType === "EIN" || cmsData.taxIdType !== "SSN",
      acceptYes: cmsData.acceptAssignment !== undefined ? cmsData.acceptAssignment : true,
    };
  }, [payors]);

  // Get default empty form values
  const getDefaultFormValues = () => ({
    payor: "",
    carrier: "",
    insType: "medicaid",
    insuredId: "",
    patientName: "",
    patientAddress: "",
    patientCity: "",
    patientState: "",
    patientZip: "",
    patientPhone: "",
    patientDob: "",
    patientSex: "",
    insuredLastName: "",
    insuredFirstName: "",
    insuredMiddleInitial: "",
    insuredAddress: "",
    insuredCity: "",
    insuredState: "",
    insuredZip: "",
    insuredPhone: "",
    insuredPolicyNumber: "",
    insuredDob: "",
    insuredSex: "",
    insuredPlanName: "",
    anotherPlan: "no",
    relationship: "self",
    employment: "N",
    autoAccident: "N",
    otherAccident: "N",
    claimCodes: "",
    accidentState: "",
    otherInsuredName: "",
    otherInsuredPolicy: "",
    otherClaimId: "",
    patientSignature: true,
    insuredSignature: true,
    illnessDate: "",
    illnessQual: "",
    otherDate: "",
    otherQual: "",
    unableWorkFrom: "",
    unableWorkThru: "",
    referringProvider: "",
    referringProviderId: "",
    referringProviderNpi: "",
    hospitalizationFrom: "",
    hospitalizationThrough: "",
    additionalClaimInfo: "",
    outsideLab: "N",
    outsideLabCharges: 0,
    resubmissionCode: "",
    originalReferenceNumber: "",
    priorAuthorizationNumber: "",
    placeOfService: "12",
    emg: false,
    epsdt: false,
    qualifier: "",
    providerNumberType: "other",
    providerNumber: "",
    providerNpi: "",
    federalTaxId: "",
    taxIdType: "EIN",
    patientAccountNumber: "",
    acceptAssignment: true,
    amountPaid: 0,
    physicianSignature: "",
    serviceFacilityName: "",
    serviceFacilityAddress: "",
    serviceFacilityNpi: "",
    billingProviderName: "",
    billingProviderAddress: "",
    billingProviderNpi: "",
    icd10_A: "",
    icd10_B: "",
    icd10_C: "",
    icd10_D: "",
    icd10_E: "",
    icd10_F: "",
    icd10_G: "",
    icd10_H: "",
    icd10_I: "",
    icd10_J: "",
    icd10_K: "",
    icd10_L: "",
    icdIndicator: "10",
    ol: "N",
    ssn: false,
    ein: true,
    acceptYes: true,
  });

  // Pre-fill form when selectedClient data is available
  useEffect(() => {
    if (selectedClient && selectedClient._id === clientId) {
      const formValues = buildFormValuesFromClient(selectedClient);
      formik.setValues(formValues);
      setInitialFormValues(formValues);
      setHasUnsavedChanges(false);
    }
  }, [selectedClient, clientId, payors]);

  const formik = useFormik({
    enableReinitialize: false,
    initialValues: getDefaultFormValues(),
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        const cms1500Data = {
          insuranceType: values.insType,
          insuredId: values.insuredId,
          carrier: values.carrier,
          patientName: values.patientName,
          patientAddress: values.patientAddress,
          patientCity: values.patientCity,
          patientState: values.patientState,
          patientZip: values.patientZip,
          patientPhone: values.patientPhone,
          patientSex: values.patientSex || undefined,
          insuredLastName: values.insuredLastName,
          insuredFirstName: values.insuredFirstName,
          insuredMiddleInitial: values.insuredMiddleInitial,
          insuredAddress: values.insuredAddress,
          insuredCity: values.insuredCity,
          insuredState: values.insuredState,
          insuredZip: values.insuredZip,
          insuredPhone: values.insuredPhone,
          insuredPolicyNumber: values.insuredPolicyNumber,
          insuredDob: values.insuredDob || null,
          insuredSex: values.insuredSex || undefined,
          insuredPlanName: values.insuredPlanName,
          anotherPlan: values.anotherPlan,
          relationshipToInsured: values.relationship,
          employmentRelated: values.employment,
          autoAccident: values.autoAccident,
          otherAccident: values.otherAccident,
          claimCodes: values.claimCodes,
          accidentState: values.accidentState,
          otherInsuredName: values.otherInsuredName,
          otherInsuredPolicy: values.otherInsuredPolicy,
          otherClaimId: values.otherClaimId,
          patientSignatureOnFile: values.patientSignature,
          insuredSignatureOnFile: values.insuredSignature,
          currentIllnessDate: values.illnessDate || null,
          currentIllnessQualifier: values.illnessQual,
          otherDate: values.otherDate || null,
          otherDateQualifier: values.otherQual,
          unableToWorkFrom: values.unableWorkFrom || null,
          unableToWorkThrough: values.unableWorkThru || null,
          referringProvider: values.referringProvider,
          referringProviderId: values.referringProviderId,
          referringProviderNpi: values.referringProviderNpi,
          hospitalizationFrom: values.hospitalizationFrom || null,
          hospitalizationThrough: values.hospitalizationThrough || null,
          additionalClaimInfo: values.additionalClaimInfo,
          outsideLab: values.ol,
          outsideLabCharges: values.outsideLabCharges,
          resubmissionCode: values.resubmissionCode,
          originalReferenceNumber: values.originalReferenceNumber,
          priorAuthorizationNumber: values.priorAuthorizationNumber,
          placeOfService: values.placeOfService,
          emg: values.emg,
          epsdt: values.epsdt,
          qualifier: values.qualifier,
          providerNumberType: values.providerNumberType,
          providerNumber: values.providerNumber,
          providerNpi: values.providerNpi,
          federalTaxId: values.federalTaxId,
          taxIdType: values.ein ? "EIN" : "SSN",
          patientAccountNumber: values.patientAccountNumber,
          acceptAssignment: values.acceptYes,
          amountPaid: values.amountPaid,
          physicianSignature: values.physicianSignature,
          serviceFacilityName: values.serviceFacilityName,
          serviceFacilityAddress: values.serviceFacilityAddress,
          serviceFacilityNpi: values.serviceFacilityNpi,
          billingProviderName: values.billingProviderName,
          billingProviderAddress: values.billingProviderAddress,
          billingProviderNpi: values.billingProviderNpi,
          lastModified: new Date().toISOString(),
          icd10Codes: {
            A: values.icd10_A,
            B: values.icd10_B,
            C: values.icd10_C,
            D: values.icd10_D,
            E: values.icd10_E,
            F: values.icd10_F,
            G: values.icd10_G,
            H: values.icd10_H,
            I: values.icd10_I,
            J: values.icd10_J,
            K: values.icd10_K,
            L: values.icd10_L
          },
          icdIndicator: values.icdIndicator,
        };

        // Only update CMS-1500 data, not core client data
        const updateData = {
          cms1500: cms1500Data
        };

        if (clientId) {
          await dispatch(updateClient({ id: clientId, data: updateData })).unwrap();
          toast.success("CMS-1500 form saved successfully!");
          setHasUnsavedChanges(false);
          setInitialFormValues(formik.values);
        }
      } catch (error) {
        console.error("Error saving CMS-1500 data:", error);
        toast.error("Error saving form data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
  });

  // Track changes
  useEffect(() => {
    if (initialFormValues) {
      const hasChanges = JSON.stringify(formik.values) !== JSON.stringify(initialFormValues);
      setHasUnsavedChanges(hasChanges);
    }
  }, [formik.values, initialFormValues]);

  // Handle cancel - discard changes and navigate back
  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (window.confirm("You have unsaved changes. Are you sure you want to discard them?")) {
        navigate(-1);
      }
    } else {
      navigate(-1);
    }
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  // Refresh payor list
  const handleRefreshPayors = () => {
    dispatch(fetchPayorByVendor({ limit: 100 }));
  };

  const LetterRow = ({ letters }) => (
    <div className="row gx-2 mb-2 align-items-end">
      {letters.map((letter) => (
        <div className="col-sm-3 d-flex gap-1" key={letter}>
          <label className="form-label small mb-1">{letter}</label>
          <input
            className="form-control px-1 small"
            style={{ width: "60px" }}
            name={`icd10_${letter}`}
            value={formik.values[`icd10_${letter}`]}
            onChange={formik.handleChange}
            placeholder="Code"
          />
        </div>
      ))}
    </div>
  );

  const icdLettersRow1 = ["A", "B", "C", "D"];
  const icdLettersRow2 = ["E", "F", "G", "H"];
  const icdLettersRow3 = ["I", "J", "K", "L"];

  // Get client name for header
  const clientName = selectedClient 
    ? `${selectedClient.firstName || ''} ${selectedClient.lastName || ''}`.trim()
    : '';

  return (
    <div className="container mt-4 print-optimized">
      {/* Action Bar - Save/Cancel/Print */}
      <div className="cms-action-bar d-flex justify-content-between align-items-center mb-3 p-2 bg-light rounded no-print">
        <div className="d-flex align-items-center gap-2">
          <h5 className="mb-0">CMS-1500 Form</h5>
          {clientName && <span className="badge bg-primary">{clientName}</span>}
          {hasUnsavedChanges && <span className="badge bg-warning text-dark">Unsaved Changes</span>}
        </div>
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={handlePrint}
            title="Print Form"
          >
            <FontAwesomeIcon icon={faPrint} className="me-1" />
            Print
          </button>
          <button
            type="button"
            className="btn btn-outline-danger btn-sm"
            onClick={handleCancel}
            title="Cancel and go back"
          >
            <FontAwesomeIcon icon={faTimes} className="me-1" />
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-success btn-sm"
            onClick={formik.handleSubmit}
            disabled={isLoading}
            title="Save CMS-1500 data"
          >
            <FontAwesomeIcon icon={faSave} className="me-1" />
            {isLoading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <div className="table-responsive print-table">
        <table className="table table-bordered print-table">
          <tbody>
            <tr>
              <td scope="row" colSpan={3}>
                <div className="row">
                  <div className="col-sm-2">
                    <div className="d-flex p-2 text-center">
                      <div className="do-not-staple small fw-bold">
                        <div>PLEASE DO NOT STAPLE IN THIS AREA</div>
                      </div>
                      <div>
                        <div className="black-box mt-0 mx-auto"></div>
                        <div className="black-box mt-1 mx-auto"></div>
                        <div className="black-box mt-1 mx-auto"></div>
                        <div className="black-box mt-1 mx-auto"></div>
                      </div>
                    </div>
                  </div>

                  <div className="col-sm-4"></div>
                  <div className="col-sm-3">
                    <div className="payor-section">
                      <label className="form-label small fw-semibold">
                        Payors (for Carrier if Ins. Co.)
                      </label>
                      <div className="d-flex align-items-center">
                        <select
                          className="form-select form-select-sm me-2"
                          name="payor"
                          value={formik.values.payor}
                          onChange={(e) => {
                            formik.handleChange(e);
                            // Auto-fill carrier when payor changes
                            const selectedPayor = payors?.find(p => p._id === e.target.value);
                            if (selectedPayor) {
                              formik.setFieldValue('carrier', selectedPayor.payor);
                            }
                          }}
                        >
                          <option value="">Select Payor</option>
                          {payors && payors.map((p) => (
                            <option key={p._id} value={p._id}>
                              {p.payor}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          aria-label="refresh"
                          onClick={handleRefreshPayors}
                          title="Refresh Payors"
                        >
                          <FontAwesomeIcon icon={faSyncAlt} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="col-sm-2">
                    <div className="carrier-section">
                      <label className="form-label small fw-semibold">
                        Carrier
                      </label>
                      <textarea
                        className="form-control px-1 form-control-sm"
                        rows="2"
                        name="carrier"
                        value={formik.values.carrier}
                        onChange={formik.handleChange}
                        placeholder="Enter carrier information"
                      />
                    </div>
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td colSpan={2}>
                <div className="col-sm-12">
                  <div className="d-flex flex-wrap align-items-center">
                    <span className="me-2 fw-semibold">1.</span>
                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="insType"
                        id="medicare"
                        value="medicare"
                        checked={formik.values.insType === "medicare"}
                        onChange={formik.handleChange}
                      />
                      <label className="form-check-label" htmlFor="medicare">
                        Medicare
                      </label>
                    </div>
                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="insType"
                        id="medicaid"
                        value="medicaid"
                        checked={formik.values.insType === "medicaid"}
                        onChange={formik.handleChange}
                      />
                      <label className="form-check-label" htmlFor="medicaid">
                        Medicaid
                      </label>
                    </div>
                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="insType"
                        id="tricare"
                        value="tricare"
                        checked={formik.values.insType === "tricare"}
                        onChange={formik.handleChange}
                      />
                      <label className="form-check-label" htmlFor="tricare">
                        Tricare
                      </label>
                    </div>
                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="insType"
                        id="champva"
                        value="champva"
                        checked={formik.values.insType === "champva"}
                        onChange={formik.handleChange}
                      />
                      <label className="form-check-label" htmlFor="champva">
                        Champva
                      </label>
                    </div>
                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="insType"
                        id="group"
                        value="group"
                        checked={formik.values.insType === "group"}
                        onChange={formik.handleChange}
                      />
                      <label className="form-check-label" htmlFor="group">
                        Group
                      </label>
                    </div>
                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="insType"
                        id="feca"
                        value="feca"
                        checked={formik.values.insType === "feca"}
                        onChange={formik.handleChange}
                      />
                      <label className="form-check-label" htmlFor="feca">
                        FECA
                      </label>
                    </div>
                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="insType"
                        id="other"
                        value="other"
                        checked={formik.values.insType === "other"}
                        onChange={formik.handleChange}
                      />
                      <label className="form-check-label" htmlFor="other">
                        Other
                      </label>
                    </div>
                  </div>
                </div>
              </td>
              <td>
                <div className="col-sm-12">
                  <label className="form-label small fw-semibold">
                    1a. Insured's I.D. Number
                  </label>
                  <input
                    className="form-control px-1 form-control-sm"
                    name="insuredId"
                    value={formik.values.insuredId}
                    onChange={formik.handleChange}
                    placeholder="Enter ID number"
                  />
                </div>
              </td>
            </tr>
            <tr>
              <td style={{ minWidth: "400px" }}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">
                    2. Patient's Name (Last, First, MI)
                  </label>
                  <input
                    className="form-control px-1 form-control-sm"
                    name="patientName"
                    value={formik.values.patientName}
                    onChange={formik.handleChange}
                    placeholder="Last, First, MI"
                  />
                </div>
              </td>
              <td style={{ minWidth: "400px" }}>
                <div className="row mb-3">
                  <div className="col-7">
                    <label className="form-label small fw-semibold">
                      3. Patient DOB
                    </label>
                    <input
                      className="form-control px-1 form-control-sm"
                      name="patientDob"
                      value={formik.values.patientDob}
                      onChange={formik.handleChange}
                      placeholder="MM/DD/YYYY"
                    />
                  </div>
                  <div className="col-5">
                    <label className="form-label small fw-semibold">Sex</label>
                    <div className="d-flex gap-2">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="patientSex"
                          id="male"
                          value="male"
                          checked={formik.values.patientSex === "male"}
                          onChange={formik.handleChange}
                        />
                        <label
                          className="form-check-label small"
                          htmlFor="male"
                        >
                          M
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="patientSex"
                          id="female"
                          value="female"
                          checked={formik.values.patientSex === "female"}
                          onChange={formik.handleChange}
                        />
                        <label
                          className="form-check-label small"
                          htmlFor="female"
                        >
                          F
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </td>
              <td style={{ minWidth: "300px" }}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">
                    4. Insured's Name (Last, First, MI)
                  </label>
                  <div className="row g-2">
                    <div className="col-4">
                      <input
                        className="form-control px-1 form-control-sm"
                        name="insuredLastName"
                        value={formik.values.insuredLastName}
                        onChange={formik.handleChange}
                        placeholder="Last"
                      />
                    </div>
                    <div className="col-4">
                      <input
                        className="form-control px-1 form-control-sm"
                        name="insuredFirstName"
                        value={formik.values.insuredFirstName}
                        onChange={formik.handleChange}
                        placeholder="First"
                      />
                    </div>
                    <div className="col-4">
                      <input
                        className="form-control px-1 form-control-sm"
                        name="insuredMiddleInitial"
                        value={formik.values.insuredMiddleInitial}
                        onChange={formik.handleChange}
                        placeholder="MI"
                      />
                    </div>
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">
                    5. Patient's Address
                  </label>
                  <input
                    className="form-control px-1 form-control-sm mb-2"
                    name="patientAddress"
                    value={formik.values.patientAddress}
                    onChange={formik.handleChange}
                    placeholder="Street address"
                  />
                </div>
              </td>
              <td>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">
                    6. Patient Relationship to Insured
                  </label>
                  <div className="d-flex flex-wrap gap-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="relationship"
                        id="self"
                        value="self"
                        checked={formik.values.relationship === "self"}
                        onChange={formik.handleChange}
                      />
                      <label className="form-check-label small" htmlFor="self">
                        Self
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="relationship"
                        id="spouse"
                        value="spouse"
                        checked={formik.values.relationship === "spouse"}
                        onChange={formik.handleChange}
                      />
                      <label
                        className="form-check-label small"
                        htmlFor="spouse"
                      >
                        Spouse
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="relationship"
                        id="child"
                        value="child"
                        checked={formik.values.relationship === "child"}
                        onChange={formik.handleChange}
                      />
                      <label className="form-check-label small" htmlFor="child">
                        Child
                      </label>
                    </div>
                  </div>
                </div>
              </td>
              <td>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">
                    7. Insured's Address (No. Street)
                  </label>
                  <input
                    className="form-control px-1 form-control-sm mb-2"
                    name="insuredAddress"
                    value={formik.values.insuredAddress}
                    onChange={formik.handleChange}
                    placeholder="Street address"
                  />
                </div>
              </td>
            </tr>
            <tr>
              <td>
                <div className="row g-2 mb-2">
                  <div className="col-8">
                    <input
                      className="form-control px-1 form-control-sm"
                      name="patientCity"
                      value={formik.values.patientCity}
                      onChange={formik.handleChange}
                      placeholder="City"
                    />
                  </div>
                  <div className="col-4">
                    <input
                      className="form-control px-1 form-control-sm"
                      name="patientState"
                      value={formik.values.patientState}
                      onChange={formik.handleChange}
                      placeholder="State"
                    />
                  </div>
                </div>
              </td>
              <td rowSpan={2} className="position-relative">
                <div
                  className="mt-2 small position-absolute "
                  style={{ top: "1px" }}
                >
                  8. Reserved for NUCC use
                </div>
              </td>
              <td>
                <div className="row g-2 mb-2">
                  <div className="col-8">
                    <input
                      className="form-control px-1 form-control-sm"
                      name="insuredCity"
                      value={formik.values.insuredCity}
                      onChange={formik.handleChange}
                      placeholder="City"
                    />
                  </div>
                  <div className="col-4">
                    <input
                      className="form-control px-1 form-control-sm"
                      name="insuredState"
                      value={formik.values.insuredState}
                      onChange={formik.handleChange}
                      placeholder="State"
                    />
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td>
                <div className="row g-2">
                  <div className="col-5">
                    <input
                      className="form-control px-1 form-control-sm"
                      name="patientZip"
                      value={formik.values.patientZip}
                      onChange={formik.handleChange}
                      placeholder="ZIP"
                    />
                  </div>
                  <div className="col-7">
                    <input
                      className="form-control px-1 form-control-sm"
                      name="patientPhone"
                      value={formik.values.patientPhone}
                      onChange={formik.handleChange}
                      placeholder="Phone"
                    />
                  </div>
                </div>
              </td>
              <td>
                <div className="row g-2">
                  <div className="col-5">
                    <input
                      className="form-control px-1 form-control-sm"
                      name="insuredZip"
                      value={formik.values.insuredZip}
                      onChange={formik.handleChange}
                      placeholder="ZIP"
                    />
                  </div>
                  <div className="col-7">
                    <input
                      className="form-control px-1 form-control-sm"
                      name="insuredPhone"
                      value={formik.values.insuredPhone}
                      onChange={formik.handleChange}
                      placeholder="Phone"
                    />
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">
                    9. Other Insured's Name (Last, First, MI)
                  </label>
                  <input
                    className="form-control px-1 form-control-sm"
                    name="otherInsuredName"
                    value={formik.values.otherInsuredName}
                    onChange={formik.handleChange}
                    placeholder="Last, First, MI"
                  />
                </div>
              </td>
              <td rowSpan={4}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">
                    10. Patient&apos;s Condition Related To:
                  </label>

                  <div className="small">
                    {/* Employment - 10a */}
                    <div className="mb-2">
                      <div className="mb-1">a. Employment?</div>
                      <div className="d-flex align-items-center">
                        <div className="form-check form-check-inline">
                          <input
                            type="radio"
                            className="form-check-input"
                            name="employment"
                            id="employmentY"
                            value="Y"
                            checked={formik.values.employment === "Y"}
                            onChange={formik.handleChange}
                          />
                          <label className="form-check-label" htmlFor="employmentY">
                            Y
                          </label>
                        </div>
                        <div className="form-check form-check-inline">
                          <input
                            type="radio"
                            className="form-check-input"
                            name="employment"
                            id="employmentN"
                            value="N"
                            checked={formik.values.employment === "N"}
                            onChange={formik.handleChange}
                          />
                          <label className="form-check-label" htmlFor="employmentN">
                            N
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Auto Accident with State - 10b */}
                    <div className="mb-2">
                      <div className="d-flex align-items-center mb-1">
                        <span className="me-5">b. Auto Accident?</span>
                        <span className="me-3">State</span>
                        <input
                          className="form-control form-control-sm w-25"
                          name="accidentState"
                          value={formik.values.accidentState}
                          onChange={formik.handleChange}
                        />
                      </div>
                      <div className="d-flex align-items-center">
                        <div className="form-check form-check-inline">
                          <input
                            type="radio"
                            className="form-check-input"
                            name="autoAccident"
                            id="autoAccidentY"
                            value="Y"
                            checked={formik.values.autoAccident === "Y"}
                            onChange={formik.handleChange}
                          />
                          <label className="form-check-label" htmlFor="autoAccidentY">
                            Y
                          </label>
                        </div>
                        <div className="form-check form-check-inline">
                          <input
                            type="radio"
                            className="form-check-input"
                            name="autoAccident"
                            id="autoAccidentN"
                            value="N"
                            checked={formik.values.autoAccident === "N"}
                            onChange={formik.handleChange}
                          />
                          <label className="form-check-label" htmlFor="autoAccidentN">
                            N
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Other Accident - 10c */}
                    <div className="mb-2">
                      <div className="mb-1">c. Other Accident</div>
                      <div className="d-flex align-items-center">
                        <div className="form-check form-check-inline">
                          <input
                            type="radio"
                            className="form-check-input"
                            name="otherAccident"
                            id="otherAccidentY"
                            value="Y"
                            checked={formik.values.otherAccident === "Y"}
                            onChange={formik.handleChange}
                          />
                          <label className="form-check-label" htmlFor="otherAccidentY">
                            Y
                          </label>
                        </div>
                        <div className="form-check form-check-inline">
                          <input
                            type="radio"
                            className="form-check-input"
                            name="otherAccident"
                            id="otherAccidentN"
                            value="N"
                            checked={formik.values.otherAccident === "N"}
                            onChange={formik.handleChange}
                          />
                          <label className="form-check-label" htmlFor="otherAccidentN">
                            N
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </td>
              <td rowSpan={3}>
                <div className="mt-3">
                  <label className="form-label small mb-1">
                    11. Insured's Policy Group or FECA Number
                  </label>
                  <input
                    className="form-control px-1 form-control-sm"
                    name="insuredPolicyNumber"
                    value={formik.values.insuredPolicyNumber}
                    onChange={formik.handleChange}
                  />
                </div>

                <div className="mt-2">
                  <label className="form-label small mb-1">
                    a. Insured's DOB
                  </label>
                  <div className="d-flex gap-2">
                    <input
                      className="form-control px-1 form-control-sm"
                      name="insuredDob"
                      value={formik.values.insuredDob}
                      onChange={formik.handleChange}
                      style={{ maxWidth: "110px" }}
                      placeholder="MM/DD/YYYY"
                    />
                    <div className="d-flex gap-2 align-items-center">
                      <div className="form-check form-check-inline">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="insuredSex"
                          id="insM"
                          value="male"
                          checked={formik.values.insuredSex === "male"}
                          onChange={formik.handleChange}
                        />
                        <label
                          className="form-check-label small"
                          htmlFor="insM"
                        >
                          M
                        </label>
                      </div>
                      <div className="form-check form-check-inline">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="insuredSex"
                          id="insF"
                          value="female"
                          checked={formik.values.insuredSex === "female"}
                          onChange={formik.handleChange}
                        />
                        <label
                          className="form-check-label small"
                          htmlFor="insF"
                        >
                          F
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-2">
                  <label className="form-label small mb-1">
                    b. Other Claim Id (Designated by NUCC)
                  </label>
                  <input
                    className="form-control px-1 form-control-sm"
                    name="otherClaimId"
                    value={formik.values.otherClaimId}
                    onChange={formik.handleChange}
                  />
                </div>
              </td>
            </tr>
            <tr>
              <td>
                <div className="mb-3">
                  <div className="my-2 ">
                    a. Other Insured's policy or group number
                  </div>
                  <input
                    className="form-control px-1 form-control-sm"
                    name="otherInsuredPolicy"
                    value={formik.values.otherInsuredPolicy}
                    onChange={formik.handleChange}
                  />
                </div>
              </td>
            </tr>
            <tr>
              <td className="position-relative" style={{ height: "60px" }}>
                <div
                  className="mt-2 small position-absolute "
                  style={{ top: "1px" }}
                >
                  b. Reserved for NUCC use
                </div>
              </td>
            </tr>
            <tr>
              <td className="position-relative" style={{ height: "60px" }}>
                <div
                  className="mt-2 small position-absolute "
                  style={{ top: "1px" }}
                >
                  c. Reserved for NUCC use
                </div>
              </td>
              <td>
                <div className="mt-2">
                  <label className="form-label small mb-1">
                    c. Insurance Plan Name
                  </label>
                  <input
                    className="form-control px-1 form-control-sm"
                    name="insuredPlanName"
                    value={formik.values.insuredPlanName}
                    onChange={formik.handleChange}
                  />
                </div>
              </td>
            </tr>
            <tr>
              <td>
                <div className="d-flex align-items-center gap-2">
                  <div className="small">12. Patient's Signature on File</div>
                  <input
                    type="checkbox"
                    name="patientSignature"
                    checked={formik.values.patientSignature}
                    onChange={formik.handleChange}
                  />
                </div>
              </td>
              <td></td>
              <td>
                <div className="d-flex align-items-center gap-2">
                  <div className="small">13. Insured's Signature on File</div>
                  <input
                    type="checkbox"
                    name="insuredSignature"
                    checked={formik.values.insuredSignature}
                    onChange={formik.handleChange}
                  />
                </div>
              </td>
            </tr>
            <tr>
              <td>
                <div className="mt-3">
                  <label className="small mb-1">
                    14. Date of Current Illness, Injury, or Pregnancy (LMP)
                  </label>
                  <div className="d-flex gap-2">
                    <input
                      className="form-control px-1 form-control-sm"
                      name="illnessDate"
                      value={formik.values.illnessDate}
                      onChange={formik.handleChange}
                      style={{ maxWidth: "120px" }}
                      placeholder="MM/DD/YYYY"
                    />
                    <input
                      className="form-control px-1 form-control-sm"
                      name="illnessQual"
                      value={formik.values.illnessQual}
                      onChange={formik.handleChange}
                      style={{ maxWidth: "60px" }}
                      placeholder="Qual"
                    />
                  </div>
                </div>
              </td>
              <td>
                <div className="mt-3">
                  <label className="small mb-1">15. Other Date</label>
                  <div className="d-flex gap-2">
                    <input
                      className="form-control px-1 form-control-sm"
                      name="otherDate"
                      value={formik.values.otherDate}
                      onChange={formik.handleChange}
                      style={{ maxWidth: "150px" }}
                      placeholder="MM/DD/YYYY"
                    />
                    <input
                      className="form-control px-1 form-control-sm"
                      name="otherQual"
                      value={formik.values.otherQual}
                      onChange={formik.handleChange}
                      style={{ maxWidth: "60px" }}
                      placeholder="Qual"
                    />
                  </div>
                </div>
              </td>
              <td>
                <div className=" rounded-sm p-2 small">
                  <label className="small mb-1">
                    16. Dates Patient unable to work
                  </label>
                  <div className="d-flex gap-2 align-items-center">
                    From{" "}
                    <input
                      className="form-control px-1 form-control-sm"
                      name="unableWorkFrom"
                      value={formik.values.unableWorkFrom}
                      onChange={formik.handleChange}
                      style={{ maxWidth: "120px" }}
                      placeholder="(MM/DD/YYYY)"
                    />
                    Thru{" "}
                    <input
                      className="form-control px-1 form-control-sm"
                      name="unableWorkThru"
                      value={formik.values.unableWorkThru}
                      onChange={formik.handleChange}
                      style={{ maxWidth: "120px" }}
                      placeholder=" (MM/DD/YYYY)"
                    />
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td colSpan={3}>
                <div className="">
                  <div className="row gx-2">
                    <div className="col-sm-4">
                      <div className="row gx-2">
                        <div className="col-sm-12 mb-2 mb-md-0">
                          <label className="form-label small">
                            17. Name of Referring Provider or Other source
                          </label>
                          <div className="d-flex gap-2">
                            <select className="form-select small w-25">
                              <option>Select</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-sm-4">
                      <div className="col-6 col-sm-12">
                        <label className="form-label small">
                          17a. I.D. of{" "}
                          <span className="highlight">Referring</span> physician
                        </label>
                        <div className="d-flex gap-2">
                          <select className="form-select small w-25">
                            <option>Select</option>
                          </select>
                          <input className="form-control px-1 small date-input  w-50" />
                        </div>
                      </div>
                      <div className="col-6 col-sm-12">
                        <label className="form-label small">
                          17b. NPI Number
                        </label>
                        <input className="form-control px-1 small w-75" />
                      </div>
                    </div>
                    <div className="col-sm-4 mt-2 mt-lg-0 pl-3">
                      <label className="form-label small mb-1">
                        18. Hospitalization Dates Related to Current Serv.
                      </label>
                      <div className="d-flex align-items-center gap-2">
                        <div className="d-flex align-items-center gap-1">
                          <span className="small">From</span>
                          <input className="form-control px-1 small date-input  w-50" />
                        </div>
                        <div className="d-flex align-items-center gap-1">
                          <span className="small">Thru</span>
                          <input className="form-control px-1 small date-input  w-50" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td colSpan={3}>
                <div className="row gx-2">
                  <div className="col-sm-7">
                    <label className="form-label small">
                      19. Additional Claim Information (Designated by NUCC)
                    </label>
                    <input
                      className="form-control px-1 small w-75"
                      name="additionalClaimInfo"
                      value={formik.values.additionalClaimInfo}
                      onChange={formik.handleChange}
                    />
                  </div>
                  <div className="col-sm-5 mt-2 mt-lg-0">
                    <div className="row gx-2">
                      <div className="col-7">
                        <label className="form-label small d-block">
                          20. Outside Lab?
                        </label>
                        <div className="d-flex gap-3">
                          <div className="form-check form-check-inline">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="ol"
                              id="olY"
                              value="Y"
                              checked={formik.values.ol === "Y"}
                              onChange={formik.handleChange}
                            />
                            <label className="form-check-label small" htmlFor="olY">
                              Yes
                            </label>
                          </div>
                          <div className="form-check form-check-inline">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="ol"
                              id="olN"
                              value="N"
                              checked={formik.values.ol === "N"}
                              onChange={formik.handleChange}
                            />
                            <label className="form-check-label small" htmlFor="olN">
                              No
                            </label>
                          </div>
                        </div>
                      </div>
                      <div className="col-5">
                        <label className="form-label small">$Charges</label>
                        <input
                          className="form-control px-1 small text-end"
                          name="outsideLabCharges"
                          value={formik.values.outsideLabCharges}
                          onChange={formik.handleChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td colSpan={3}>
                <div className="border rounded p-2 mb-2">
                  <label className="form-label small d-block mb-1">
                    21. Diagnosis or nature of illness or injury
                  </label>
                  <div className="row gx-2">
                    <div className="col-sm-12 mb-3 mb-lg-0">
                      <div className="row">
                        <div className="col-sm-8">
                          <div className="col-sm-9 mb-2">
                            <span className="badge bg-secondary-subtle text-dark border me-2">
                              ICD-10
                            </span>
                          </div>
                          <LetterRow letters={icdLettersRow1} />
                          <LetterRow letters={icdLettersRow2} />
                          <LetterRow letters={icdLettersRow3} />
                        </div>
                        <div className="col-sm-3">
                          <div className="row gx-2 align-items-end">
                            <div className="col-sm-9">
                              <label className="form-label small mb-1">ICD Ind</label>
                              <input
                                className="form-control px-1 tiny"
                                name="icdIndicator"
                                value={formik.values.icdIndicator}
                                onChange={formik.handleChange}
                              />
                            </div>
                            <div className="col-sm-12 text-end mt-3">
                              <button className="btn btn-sm btn-success btn-xxs">
                                ICD10 Service Ref
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td colSpan={3}>
                <div className="row gx-2">
                  <div className="col-sm-2">
                    <label className="form-label small">
                      22. Resubmission Code
                    </label>
                    <input className="form-control small" />
                  </div>
                  <div className="col-sm-2">
                    <label className="form-label small">Original Ref No.</label>
                    <input className="form-control small" />
                  </div>
                  <div className="col-sm-2">
                    <label className="form-label small">
                      23. Prior Authorization No.
                    </label>
                    <input className="form-control small" />
                  </div>
                  <div className="col-sm-1">
                    <label className="form-label small">24b POS</label>
                    <input
                      className="form-control small text-center"
                      defaultValue=""
                    />
                  </div>
                  <div className="col-sm-2 d-flex flex-column">
                    <label className="form-label small">24 C EMG</label>
                    <input
                      className="form-check-input ms-1 mt-auto mb-2"
                      type="checkbox"
                    />
                  </div>
                  <div className="col-sm-1 d-flex flex-column">
                    <label className="form-label small">24 H EPSDT</label>
                    <input
                      className="form-check-input ms-1 mt-auto mb-2"
                      type="checkbox"
                    />
                  </div>
                  <div className="col-sm-2">
                    <label className="form-label small">24.i</label>
                    <select className="form-select small">
                      <option>------Sele..------</option>
                    </select>
                  </div>
                </div>
                <div className="row">
                  <div className="col-sm-3">
                    <label className="form-label small d-block">
                      24 J (shaded) Provider Number
                    </label>
                    <div className="d-flex align-items-start flex-column">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="provnum"
                          id="lic"
                        />
                        <label className="form-check-label small" htmlFor="lic">
                          Use Caregiver State License #
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="provnum"
                          id="other"
                          defaultChecked
                        />
                        <label
                          className="form-check-label small"
                          htmlFor="other"
                        >
                          Other
                        </label>{" "}
                        <input className="form-control small" />
                      </div>
                    </div>
                  </div>

                  <div className="col-sm-3">
                    <label className="form-label small">
                      24 J Provider NPI Number
                    </label>
                    <input
                      className="form-control small"
                      placeholder="Assign on Caregivers Pers Data tab"
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-sm-3">
                    <label className="form-label small">
                      25. Federal Tax ID
                    </label>
                    <input
                      className="form-control small"
                      name="federalTaxId"
                      value={formik.values.federalTaxId}
                      onChange={formik.handleChange}
                    />
                  </div>
                  <div className="col-sm-2">
                    <div className="d-flex align-items-center gap-3 mt-1">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="ssn"
                          checked={formik.values.ssn}
                          onChange={formik.handleChange}
                        />
                        <label className="form-check-label small" htmlFor="ssn">SSN</label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="ein"
                          checked={formik.values.ein}
                          onChange={formik.handleChange}
                        />
                        <label className="form-check-label small" htmlFor="ein">EIN</label>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-3">
                    <label className="form-label small">
                      26. Patients acct no.
                    </label>
                    <input className="form-control small" defaultValue="FFA" />
                  </div>

                  <div className="col-sm-2">
                    <label className="form-label small d-block">
                      27. Accept Assignment?
                    </label>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        name="acceptYes"
                        checked={formik.values.acceptYes}
                        onChange={formik.handleChange}
                      />
                      <label
                        className="form-check-label small"
                        htmlFor="acceptYes"
                      >
                        Checked = Yes
                      </label>
                    </div>
                  </div>

                  <div className="col-sm-2">
                    <label className="form-label small">29. Amount Paid</label>
                    <input
                      className="form-control small text-end"
                      defaultValue="0.00"
                    />
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td colSpan={3}>
                <div className="row gx-2">
                  <div className="col-sm-3">
                    <label className="form-label small">
                      31. Signature of Physician For Electronic Submission
                    </label>
                    <div className="d-flex align-items-center gap-2">
                      <select className="form-select small">
                        <option>------Select------</option>
                      </select>
                      <button
                        className="btn btn-outline-secondary btn-xxs"
                        title="refresh"
                      >
                        ↻
                      </button>
                    </div>
                  </div>

                  <div className="col-sm-5">
                    <label className="form-label small">
                      32. Name and Address of Facility where services were
                      rendered if other than home or office:
                    </label>
                    <textarea
                      className="form-control small"
                      rows={3}
                    />
                    <div className="row gx-2 mt-1">
                      <div className="col-6">
                        <label className="form-label small">a.</label>
                        <input className="form-control small" />
                      </div>
                      <div className="col-6">
                        <label className="form-label small">b.</label>
                        <select className="form-select small">
                          <option>------Select------</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="col-sm-4">
                    <div className="d-flex justify-content-between">
                      <label className="form-label small">
                        33. Physician's suppliers billing name, address, Zip
                        Code, Phone
                      </label>
                      <span className="small text-muted">Override</span>
                    </div>
                    <textarea
                      className="form-control small"
                      rows={3}
                      defaultValue={`Mastercare Homecare & Healthcare
7920 Belt Line Road
Suite 720, TX, 75254-8181`}
                    />
                    <div className="row gx-2 mt-1">
                      <div className="col-6">
                        <label className="form-label small">
                          Phone#
                        </label>
                        <input
                          className="form-control small"
                          defaultValue="972-777-4345"
                        />
                      </div>
                      <div className="col-6">
                        <label className="form-label small">
                          NPI #
                        </label>
                        <input
                          className="form-control small"
                          defaultValue="1639837933"
                        />
                      </div>
                    </div>
                    <div className="row gx-2 mt-1">
                      <div className="col-4">
                        <label className="form-label small">
                          Other ID
                        </label>
                        <input className="form-control small" />
                      </div>
                      <div className="col-sm-3">
                        <label className="form-label small">
                          Qual
                        </label>
                        <select className="form-select small">
                          <option>ZZ</option>
                        </select>
                      </div>
                      <div className="col-5">
                        <label className="form-label small">
                          &nbsp;
                        </label>
                        <input className="form-control small" />
                      </div>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-optimized, .print-optimized * {
            visibility: visible;
          }
          .print-optimized {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0;
            margin: 0;
          }
          .print-table {
            width: 100% !important;
            font-size: 11px !important;
          }
          .print-table td, .print-table th {
            padding: 4px !important;
          }
          .form-control, .form-select {
            font-size: 11px !important;
            padding: 2px 4px !important;
            height: 24px !important;
          }
          .btn {
            display: none !important;
          }
          .no-print, .cms-action-bar {
            display: none !important;
          }
          .table-responsive {
            overflow: visible !important;
            width: 100% !important;
          }
          .container {
            max-width: 100% !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
        }
        
        .cms-action-bar {
          position: sticky;
          top: 0;
          z-index: 100;
          border: 1px solid #dee2e6;
        }
        
        .form-label-xs { font-size: 12px; font-weight: 600; }
        .form-label-xxs { font-size: 11px; }
        .highlight { background: #2d6cdf1a; padding: 0 .2rem; border-radius: .2rem; }
        .form-control-xxs, .form-select-xxs {
          height: 30px; padding: .15rem .4rem; font-size: 12px; line-height: 1.2;
        }
        textarea.form-control-xxs { padding: .35rem .5rem; font-size: 12px; }
        .btn-xxs { padding: .15rem .45rem; font-size: 11px; }
        .tiny { max-width: 48px; text-align: center; }
        .date-input { width: 110px; }
        .calendar-icon { font-size: 14px; line-height: 1; opacity: .7; }
        .badge.bg-secondary-subtle { background: #f4f5f7; }
        
        /* Auto-populated field indicator */
        .auto-filled {
          background-color: #f8f9fa;
          border-color: #6c757d;
        }
        
        /* Additional print optimization */
        @media (max-width: 576px) {
          .date-input { width: 100%; }
        }
        
        /* Ensure table fits on page */
        table {
          table-layout: fixed;
          width: 100%;
        }
        td, th {
          word-wrap: break-word;
        }
      `}</style>
    </div>
  );
}
