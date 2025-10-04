import { useEffect, useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import FormTabs from "./FormTabs";
import PersonalData from "./tabs/PersonalData";
import Attachments from "./tabs/Attachments";
import Charting from "./tabs/Charting";
import Contacts from "./tabs/Contacts";
import CustomFields from "./tabs/CustomFields";
import Directions from "./tabs/Directions";
import Exclusions from "./tabs/Exclusions";
import History from "./tabs/History";
import Interruptions from "./tabs/Interruptions";
import Invoicing from "./tabs/Invoicing";
import Needs from "./tabs/Needs";
import Notes from "./tabs/Notes";
import Plan from "./tabs/Plan";
import Reminders from "./tabs/Reminders";
import Service from "./tabs/Service";
import Supervisory from "./tabs/Supervisory";
import Visit from "./tabs/Visit";
import Wellness from "./tabs/Wellness";
import {
  createClient,
  fetchClientById,
} from "../../../store/IDB_SYS/Clients/clientSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

const ClientForm = () => {
  const [activeTab, setActiveTab] = useState("Personal");
  const [completedTabs, setCompletedTabs] = useState([
    "Personal",
    "Attachments",
    "Charting",
    "Contacts",
    "Custom",
    "Directions",
    "Exclusions",
    "History",
    "Interruptions",
    "Invoicing",
    "Needs",
    "Notes",
    "Plan",
    "Reminders",
    "Service",
    "Supervisory",
    "Visit",
    "Wellness",
  ]);
  const [isValidating, setIsValidating] = useState(false);
  const [initialValues, setInitialValues] = useState(null);
  const { selectedClient } = useSelector((state) => state.client);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { clientId } = useParams();

  useEffect(() => {
    if (clientId) {
      dispatch(fetchClientById(clientId));
    } else {
      // Set empty initial values for new client
      setInitialValues(getEmptyInitialValues());
    }
  }, [clientId, dispatch]);
  // Initial values for all form fields across all tabs

  useEffect(() => {
    if (clientId && selectedClient && selectedClient._id === clientId) {
      setInitialValues(selectedClient);
    }
  }, [selectedClient, clientId]);

  const getEmptyInitialValues = () => {
    return {
      // Personal Data
      firstName: "",
      middleInitial: "",
      lastName: "",
      phone1: "",
      phone2: "",
      dob: "",
      status: "A",
      gender: "",
      inquiryDate: "",
      assessmentDate: "",
      reasons: "-----Select-----",
      referredBy: "",
      serviceStart: "",
      serviceEnd: "",
      email: "",
      webPassword: "",
      enableWebLogin: false,
      enable2FA: false,
      enableAssistedGPS: false,
      hospitalDischargePrior: "",
      erVisitPrior: "",
      caseManager: null,
      ambulatory: "",
      physician: "",
      referralNumber: "",
      dnr: false,
      diagnosisCode: "",
      diagnosisDescription: "",
      clientType: null,
      medRecordNumber: "",
      ssn: "",
      locationId: null,
      evvId: "",
      accountingId: "",
      priority: "",
      weight: "",
      homeAddress1: "",
      homeAddress2: "",
      homeCity: "",
      homeState: "",
      homeZip: "",
      homeCountry: "0",
      homeStartAddressType: "0",
      homeEndAddressType: "0",
      otherEvvDescription: "",
      otherEvvAddress1: "",
      otherEvvAddress2: "",
      otherEvvCity: "",
      otherEvvState: "",
      otherEvvZip: "",
      otherEvvStartAddressType: "0",
      otherEvvEndAddressType: "0",
      billingPayor: "0",
      billingAddress1: "",
      billingAddress2: "",
      billingCity: "",
      billingState: "",
      billingZip: "",
      payor2: "",
      payor3: "",
      payor4: "",
      physician2: null,
      physician3: null,
      physician4: null,
      covidVaccinated: false,
      vaccineRefused: false,
      refusedReason: "",
      vaccineCard: null,
      vaccineType: "",
      vaccineDate: "",
      fluVaccineDate: "",
      fluVaccineStatus: "",
      fluRefusedReason: "",
      alertNote: "",
      generationsEvvAlert: false,
      alertText: "",
      enableClientSpecific1500: false,
      cms1500Version: "08/05",
      requireCaregiverSignature: false,
      requireClientSignature: false,

      // Attachments
      attachments: [],

      // Charting
      careNotesAccess: "disabled",
      woundNotesAccess: "disabled",
      clientLoginNotes: "no-access",
      chartingNotes: "",

      // Contacts
      initialContactName: "",
      initialContactEmail: "",
      initialContactPhone: "",
      initialContactAltPhone: "",
      initialContactWebPassword: "",
      initialContactEnableLogin: false,
      initialContactEnable2FA: false,
      initialContactRelation: "0",
      includeOnCarePlan: false,
      additionalContacts: [],

      // Custom Fields
      customFields: [],

      // Directions
      directions: "",
      parkingInfo: "",
      accessInstructions: "",
      specialInstructions: "",

      // Exclusions
      exclusions: [],
      preferences: [],

      // History
      historyItems: [],

      // Interruptions
      interruptions: [],

      // Invoicing
      openBalance: 0,
      overdueBalance: 0,
      lastPaymentDate: null,
      invoiceType: "All",
      invoiceStatus: "All",
      dateFrom: "",
      dateTo: "",
      invoices: [],
      payments: [],

      // Needs
      needsMasterList: [],
      assignedNeeds: [],

      // Notes
      notes: [],

      // Plan of Care
      enableMarDocumentation: false,
      marSchedule: "BeforeAfter",
      marTimes: "",
      requireMarSignature: true,
      requirePrnReason: true,
      carePlans: [],

      // Reminders
      reminders: [],

      // Service Orders
      showInactiveServiceOrders: false,
      requireServiceOrder: false,
      serviceOrders: [],

      // Supervisory Visits
      supervisoryVisits: [],

      // Visit History
      visitHistory: [],

      // Wellness
      wellnessResponses: {},
      wellnessHistory: [],
      wellnessGroupFilter: "All",
    };
  };

  const sanitizeData = (data) => {
    const objectIdFields = [
      "caseManager",
      "caseManager2",
      "caseManager3",
      "referredBy",
      "physician",
      "clientType",
      "locationId",
    ];

    objectIdFields.forEach((field) => {
      if (data[field] === "") {
        data[field] = null;
      }
    });

    return data;
  };

  // Validation schema for all tabs

  const createPersonalDataSchema = () =>
    Yup.object().shape({
      firstName: Yup.string().required("First name is required"),
      lastName: Yup.string().required("Last name is required"),
      // phone1: Yup.string(),
      // email: Yup.string().email("Please enter a valid email address"),
      // dob: Yup.date()
      //   .typeError("Please enter a valid date of birth")
      //   .required("Date of birth is required"),
      // caseManager: Yup.string().required("Case Manager is required"),
      // clientType: Yup.string().required("Client Type is required"),
      // ambulatory: Yup.string().required("Ambulatory is required"),
      // physician: Yup.string().required("Physician is required"),
      // locationId: Yup.string().required("Location is required"),

      // serviceEnd: Yup.date()
      //   .typeError("Please enter a valid end date")
      //   .required("End date is required"),
      // serviceStart: Yup.date()
      //   .typeError("Please enter a valid start date")
      //   .required("Start date is required"),

      // ssn: Yup.string(),
      // homeAddress1: Yup.string().required("Address is required"),
      // homeCity: Yup.string().required("City is required"),
      // homeState: Yup.string().required("State is required"),
      // homeZip: Yup.string().required("Zip code is required"),
      // homeStartAddressType: Yup.string().required("Address type is required"),
      // homeEndAddressType: Yup.string().required("Address type is required"),
      // billingAddress1: Yup.string(),
      // vaccineRefused: Yup.boolean(),
      // refusedReason: Yup.string(),
    });

  const createAttachmentsSchema = () =>
    Yup.object().shape({
      attachments: Yup.array().of(
        Yup.object().shape({
          description: Yup.string().required("Description is required"),
          file: Yup.mixed().required("File is required"),
        })
      ),
    });
  const createChartingSchema = () =>
    Yup.object().shape({
      careNotesAccess: Yup.string()
        .required("Care notes access is required")
        .oneOf(["disabled", "enabled", "required"], "Invalid selection"),
      woundNotesAccess: Yup.string()
        .required("Wound notes access is required")
        .oneOf(["disabled", "enabled", "required-active"], "Invalid selection"),
      clientLoginNotes: Yup.string()
        .required("Client access is required")
        .oneOf(
          ["no-access", "view-approved", "view-sign"],
          "Invalid selection"
        ),
      chartingNotes: Yup.string().max(
        500,
        "Notes must be 500 characters or less"
      ),
    });
  const createCustomFieldsSchema = () =>
    Yup.object().shape({
      customFields: Yup.array().of(
        Yup.object().shape({
          field: Yup.string().required("Field name is required"),
          description: Yup.string().required("Description is required"),
        })
      ),
    });
  const createDirectionSchema = () =>
    Yup.object().shape({
      directions: Yup.string().max(
        1000,
        "Directions must be 1000 characters or less"
      ),
      parkingInfo: Yup.string().max(
        500,
        "Parking info must be 500 characters or less"
      ),
      accessInstructions: Yup.string().max(
        500,
        "Access instructions must be 500 characters or less"
      ),
      specialInstructions: Yup.string().max(
        1000,
        "Special instructions must be 1000 characters or less"
      ),
    });
  const createContactValidationSchema = () =>
    Yup.object().shape({
      initialContactName: Yup.string(),
      initialContactEmail: Yup.string().email("Invalid email address"),
      initialContactPhone: Yup.string().test(
        "is-valid-phone",
        "Invalid phone number",
        (value) => !value || value.replace(/\D/g, "").length >= 10
      ),
      initialContactAltPhone: Yup.string().test(
        "is-valid-phone",
        "Invalid phone number",
        (value) => !value || value.replace(/\D/g, "").length >= 10
      ),
      initialContactWebPassword: Yup.string(),
      initialContactRelation: Yup.string().notOneOf(
        ["0"],
        "Relationship is required"
      ),
      additionalContacts: Yup.array().of(
        Yup.object().shape({
          name: Yup.string().required("Name is required"),
          email: Yup.string()
            .email("Invalid email")
            .required("Email is required"), // Added required
          phone: Yup.string()
            .required("Phone is required")
            .test(
              "is-valid-phone",
              "Invalid phone number",
              (value) => value && value.replace(/\D/g, "").length >= 10
            ),
          relation: Yup.string()
            .notOneOf(["0"], "Relationship is required")
            .required("Relationship is required"),
        })
      ),
    });

  const creatExclutionSchema = () =>
    Yup.object().shape({
      directions: Yup.string().max(1000, "Directions too long"),

      exclusions: Yup.array().of(
        Yup.object().shape({
          type: Yup.string().required("Type is required"),
          comment: Yup.string().required("Comment is required"),
          isPermanent: Yup.boolean(),
          endDate: Yup.date(),
        })
      ),
    });

  const createHistorySchema = () =>
    Yup.object().shape({
      historyItems: Yup.array().of(
        Yup.object().shape({
          date: Yup.date().required("Date is required"),
          type: Yup.string().required("Type is required"),
          description: Yup.string()
            .required("Description is required")
            .max(500, "Description too long"),
          enteredBy: Yup.string(),
          isSignificant: Yup.boolean(),
        })
      ),
    });

  const createInteruptionSchema = () =>
    Yup.object().shape({
      interruptions: Yup.array().of(
        Yup.object().shape({
          startDate: Yup.date().required("Start date is required").nullable(),
          endDate: Yup.date().required("End date is required").nullable(),
          type: Yup.string()
            .required("Type is required")
            .oneOf([
              "voluntary",
              "hospitalization",
              "administrative",
              "emergency",
              "other",
            ]),
          reason: Yup.string()
            .required("Reason is required")
            .max(1000, "Reason too long"),
          status: Yup.string().oneOf([
            "pending",
            "approved",
            "denied",
            "completed",
          ]),
        })
      ),
    });

  const createInvoiceSchema = () =>
    Yup.object().shape({
      invoices: Yup.array().of(
        Yup.object().shape({
          invoiceNumber: Yup.string().required("Invoice number is required"),
          date: Yup.date().required("Invoice date is required"),
          dueDate: Yup.date()
            .required("Due date is required")
            .min(Yup.ref("date"), "Due date must be after invoice date"),
          amount: Yup.number()
            .required("Amount is required")
            .min(0, "Amount cannot be negative"),
          paid: Yup.number().min(0, "Paid amount cannot be negative"),
          balance: Yup.number(),
          status: Yup.string().oneOf(["Open", "Paid", "Overdue", "Void"]),
          type: Yup.string().oneOf(["Service", "Product", "Adjustment"]),
          description: Yup.string().max(200, "Description too long"),
        })
      ),
      payments: Yup.array().of(
        Yup.object().shape({
          date: Yup.date().required("Payment date is required"),
          amount: Yup.number()
            .required("Amount is required")
            .min(0.01, "Amount must be positive"),
          method: Yup.string().required("Payment method is required"),
          reference: Yup.string(),
          appliedTo: Yup.array().of(Yup.string()),
        })
      ),
    });
  const createAssignedNeedsSchema = () =>
    Yup.object().shape({
      assignedNeeds: Yup.array().of(
        Yup.object().shape({
          description: Yup.string().required("Description is required"),
          category: Yup.string(),
          frequency: Yup.string(),
          startDate: Yup.date().required("Start date is required"),
          endDate: Yup.date().min(
            Yup.ref("startDate"),
            "End date must be after start date"
          ),
          priority: Yup.string()
            .required("Priority is required")
            .oneOf(["High", "Medium", "Low"]),
          status: Yup.string()
            .required("Status is required")
            .oneOf(["Active", "On Hold", "Completed", "Discontinued"]),
          notes: Yup.string().max(500, "Notes too long"),
        })
      ),
    });
  const createCarePlansSchema = () =>
    Yup.object().shape({
      carePlans: Yup.array().of(
        Yup.object().shape({
          discipline: Yup.string().required("Discipline is required"),
          frequency: Yup.string().required("Frequency is required"),
          startDate: Yup.date().required("Start date is required"),
          endDate: Yup.date().min(
            Yup.ref("startDate"),
            "End date must be after start date"
          ),
          goals: Yup.string()
            .required("Goals are required")
            .max(1000, "Goals too long"),
          interventions: Yup.string().max(1000, "Interventions too long"),
          status: Yup.string()
            .required("Status is required")
            .oneOf(["Active", "Pending", "On Hold", "Discontinued"]),
          physician: Yup.string(),
        })
      ),
      enableMarDocumentation: Yup.boolean(),
      marSchedule: Yup.string(),
      marTimes: Yup.string(),
      requireMarSignature: Yup.boolean(),
      requirePrnReason: Yup.boolean(),

      preferences: Yup.array().of(
        Yup.object().shape({
          type: Yup.string(),
          details: Yup.string(),
          priority: Yup.string().oneOf(["low", "medium", "high", "critical"]),
        })
      ),
      serviceOrders: Yup.array().of(
        Yup.object().shape({
          serviceType: Yup.string().required("Service type is required"),
          status: Yup.string()
            .required("Status is required")
            .oneOf(["active", "pending", "expired", "denied"]),
          startDate: Yup.date().required("Start date is required"),
          endDate: Yup.date().min(
            Yup.ref("startDate"),
            "End date must be after start date"
          ),
          frequency: Yup.string().required("Frequency is required"),
          description: Yup.string()
            .required("Description is required")
            .max(1000, "Description too long"),
          authNumber: Yup.string(),
          physicianNotes: Yup.string().max(1000, "Notes too long"),
          requireSignature: Yup.boolean(),
        })
      ),
    });
  const createSuperVisorVisitSchema = () =>
    Yup.object().shape({
      // super visor visits module
      supervisoryVisits: Yup.array().of(
        Yup.object().shape({
          visitType: Yup.string().required("Visit type is required"),
          status: Yup.string()
            .required("Status is required")
            .oneOf(["scheduled", "completed", "missed", "rescheduled"]),
          visitDate: Yup.date().required("Visit date is required"),
          supervisorName: Yup.string()
            .required("Supervisor name is required")
            .max(100, "Name too long"),
          duration: Yup.number()
            .min(15, "Minimum 15 minutes")
            .max(480, "Maximum 8 hours"),
          purpose: Yup.string()
            .required("Purpose is required")
            .max(1000, "Purpose too long"),
          notes: Yup.string().max(1000, "Notes too long"),
          requireFollowUp: Yup.boolean(),
          followUpActions: Yup.string(),
          completedDate: Yup.date().when("status", {
            is: "completed",
            then: Yup.date().required(
              "Completed date is required for completed visits"
            ),
          }),
          findings: Yup.string(),
        })
      ),
      requireServiceOrder: Yup.boolean(),
      showInactiveServiceOrders: Yup.boolean(),
    });
  const createReminderSchema = () =>
    Yup.object().shape({
      reminders: Yup.array().of(
        Yup.object().shape({
          type: Yup.string().required("Type is required"),
          dueDate: Yup.date()
            .required("Due date is required")
            .min(new Date(), "Due date cannot be in the past"),
          priority: Yup.string()
            .required("Priority is required")
            .oneOf(["high", "medium", "low"]),
          description: Yup.string()
            .required("Description is required")
            .max(500, "Description too long"),
          notes: Yup.string().max(1000, "Notes too long"),
          completed: Yup.boolean(),
          completedDate: Yup.date(),
        })
      ),
    });
  const createNotesSchema = () =>
    Yup.object().shape({
      notes: Yup.array().of(
        Yup.object().shape({
          category: Yup.string().required("Category is required"),
          priority: Yup.string()
            .required("Priority is required")
            .oneOf(["High", "Medium", "Low"]),
          content: Yup.string()
            .required("Note content is required")
            .max(2000, "Note too long"),
          enteredBy: Yup.string().required(),
          date: Yup.date().required(),
        })
      ),
    });
  const createVisitHistorySchema = () =>
    Yup.object().shape({
      visitHistory: Yup.array().of(
        Yup.object().shape({
          visitDate: Yup.date().required("Visit date is required"),
          serviceType: Yup.string().required("Service type is required"),
          caregiverName: Yup.string(),
          startTime: Yup.date(),
          endTime: Yup.date().min(
            Yup.ref("startTime"),
            "End time must be after start time"
          ),
          status: Yup.string()
            .required("Status is required")
            .oneOf([
              "Completed",
              "Missed",
              "Cancelled",
              "In Progress",
              "Scheduled",
            ]),
          tasks: Yup.array().of(
            Yup.object().shape({
              description: Yup.string().required(
                "Task description is required"
              ),
              completed: Yup.boolean(),
            })
          ),
          notes: Yup.string().max(2000, "Notes too long"),
          outcomes: Yup.string(),
          reason: Yup.string(),
          documents: Yup.array().of(
            Yup.object().shape({
              name: Yup.string().required("Document name is required"),
              url: Yup.string()
                .url("Invalid URL format")
                .required("URL is required"),
            })
          ),
        })
      ),
    });
  const createWelnessSchema = () =>
    Yup.object().shape({
      wellnessResponses: Yup.object().test(
        "at-least-one-response",
        "At least one wellness question must be answered",
        (value) => {
          if (!value) return false;
          return Object.values(value).some(
            (response) =>
              response?.value !== undefined &&
              response?.value !== null &&
              response?.value !== ""
          );
        }
      ),
      wellnessHistory: Yup.array().of(
        Yup.object().shape({
          questionId: Yup.number().required(),
          value: Yup.mixed().required("Value is required"),
          date: Yup.date().required("Date is required"),
          notes: Yup.string().max(500, "Notes too long"),
        })
      ),
      wellnessGroupFilter: Yup.string(),
    });

  const tabs = [
    {
      id: "Personal",
      label: "Personal Data",
      validationSchema: createPersonalDataSchema(),
    },
    {
      id: "Attachments",
      label: "Attachments",
      validationSchema: createAttachmentsSchema(),
    },
    {
      id: "Charting",
      label: "Charting",
      validationSchema: createChartingSchema(),
    },
    {
      id: "Contacts",
      label: "Contacts",
      validationSchema: createContactValidationSchema(),
    },
    {
      id: "Custom",
      label: "Custom Fields",
      validationSchema: createCustomFieldsSchema(),
    },
    {
      id: "Directions",
      label: "Directions/Misc",
      validationSchema: createDirectionSchema(),
    },
    {
      id: "Exclusions",
      label: "Exclusions/Preferences",
      validationSchema: creatExclutionSchema(),
    },
    {
      id: "History",
      label: "History",
      validationSchema: createHistorySchema(),
    },
    {
      id: "Interruptions",
      label: "Interruptions of Service",
      validationSchema: createInteruptionSchema(),
    },
    {
      id: "Invoicing",
      label: "Invoicing",
      validationSchema: createInvoiceSchema(),
    },
    {
      id: "Needs",
      label: "Needs",
      validationSchema: createAssignedNeedsSchema(),
    },
    {
      id: "Notes",
      label: "Notes",
      validationSchema: createNotesSchema(),
    },
    {
      id: "Plan",
      label: "Plan Of Care (485)",
      validationSchema: createCarePlansSchema(),
    },
    {
      id: "Reminders",
      label: "Reminders",
      validationSchema: createReminderSchema(),
    },
    {
      id: "Service",
      label: "Service Orders",
      validationSchema: createSuperVisorVisitSchema(), // Note: This might need adjustment
    },
    {
      id: "Supervisory",
      label: "Supervisory Visits",
      validationSchema: createSuperVisorVisitSchema(),
    },
    {
      id: "Visit",
      label: "Visit History",
      validationSchema: createVisitHistorySchema(),
    },
    {
      id: "Wellness",
      label: "Wellness",
      validationSchema: createWelnessSchema(),
    },
  ];

  // Combined validation schema for Formik
  const validationSchema = Yup.object().shape(
    tabs.reduce((acc, tab) => {
      return { ...acc, ...tab.validationSchema.fields };
    }, {})
  );
  useEffect(() => {
    console.log(completedTabs);
  }, [completedTabs]);

  const handleTabChange = async (tabId, formik) => {
    if (isValidating) return;
    setIsValidating(true);

    const currentTab = tabs.find((tab) => tab.id === activeTab);

    try {
      // Clear previous errors
      formik.setErrors({});

      if (currentTab?.validationSchema) {
        // Validate only the current tab's fields
        const currentValues = {};
        Object.keys(currentTab.validationSchema.fields).forEach((key) => {
          currentValues[key] = formik.values[key];
        });

        await currentTab.validationSchema.validate(currentValues, {
          abortEarly: false,
        });
      }

      // Update completed tabs
      if (!completedTabs.includes(activeTab)) {
        setCompletedTabs([...completedTabs, activeTab]);
      }

      // Change tab
      setActiveTab(tabId);
    } catch (error) {
      console.group("Validation Error");
      console.log("Raw error:", error);

      const errorMessages = {};

      if (error.name === "ValidationError") {
        if (error.inner && Array.isArray(error.inner)) {
          error.inner.forEach((err) => {
            if (err.path && err.message) {
              errorMessages[err.path] = err.message;
            }
          });
        } else if (error.path && error.message) {
          errorMessages[error.path] = error.message;
        }
      } else {
        console.error("Non-validation error:", error);
        errorMessages._error = error.message || "Validation failed";
      }

      if (Object.keys(errorMessages).length > 0) {
        const touchedFields = {};
        Object.keys(errorMessages).forEach((key) => {
          touchedFields[key] = true;
        });

        // Show only the first error message
        const firstErrorKey = Object.keys(errorMessages)[0];
        toast.error(errorMessages[firstErrorKey], {
          position: "top-right",
          autoClose: 3000,
        });

        formik.setTouched(touchedFields);
      }
      console.log("Processed errors:", errorMessages);
      console.groupEnd();

      formik.setErrors(errorMessages);
    } finally {
      setIsValidating(false);
    }
  };

  // Update your Next button onClick handler:

  const handleSubmit = (values, { setSubmitting }) => {
    console.log("Form submitted:", values);
    // Use it before creating/updating
    const cleanData = sanitizeData(values);

    dispatch(createClient(cleanData))
      .unwrap() // This ensures you catch only successful results or handle errors in catch
      .then(() => {
        setSubmitting(false);
        navigate("/generations.idb-sys/clients/listing"); // Redirect after success
      })
      .catch((error) => {
        console.error("Error creating client:", error);
        setSubmitting(false);
      });
  };

  // In your parent component
  const saveClient = (values, shouldOpen1500Form = false,clientId) => {
    console.log("save Client submitted:", values);
    const cleanData = sanitizeData(values);
    try {
       if(clientId){
            navigate(
              `/generations.idb-sys/clients/form-1500B?client=${clientId}`
            );
          }
          
      dispatch(createClient(cleanData))
        .unwrap()
        .then((res) => {
          console.log(res, "res");
        
            // Navigate to 1500 form with the new client ID
            navigate(
              `/generations.idb-sys/clients/form-1500B?client=${res._id}`
            );

        }).catch((error) => {
        toast.error(error, {
        position: "top-right",
        autoClose: 3000,
      });
      });;
    } catch (error) {
      toast.error(error.message, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  if (!initialValues) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  return (
    <div className="client-form-container border">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        validateOnChange={false} // Add this to prevent premature validation
        validateOnBlur={false} // Add this to prevent premature validation
      >
        {(formik) => (
          <Form>
            <FormTabs
              tabs={tabs}
              activeTab={activeTab}
              completedTabs={completedTabs}
              onTabChange={(tabId) => handleTabChange(tabId, formik)}
              disabled={isValidating}
            />

            <div className="tab-content p-3">
              {activeTab === "Personal" && (
                <PersonalData
                  formik={formik}
                  clientData={selectedClient}
                  saveClient={saveClient}
                />
              )}
              {activeTab === "Attachments" && (
                <Attachments formik={formik} clientData={selectedClient} />
              )}
              {activeTab === "Charting" && (
                <Charting formik={formik} clientData={selectedClient} />
              )}
              {activeTab === "Contacts" && (
                <Contacts
                  formik={formik}
                  clientData={selectedClient}
                  completedTabs={completedTabs}
                />
              )}
              {activeTab === "Custom" && (
                <CustomFields formik={formik} clientData={selectedClient} />
              )}
              {activeTab === "Directions" && (
                <Directions formik={formik} clientData={selectedClient} />
              )}
              {activeTab === "Exclusions" && (
                <Exclusions formik={formik} clientData={selectedClient} />
              )}
              {activeTab === "History" && (
                <History formik={formik} clientData={selectedClient} />
              )}
              {activeTab === "Interruptions" && (
                <Interruptions formik={formik} clientData={selectedClient} />
              )}
              {activeTab === "Invoicing" && (
                <Invoicing formik={formik} clientData={selectedClient} />
              )}
              {activeTab === "Needs" && (
                <Needs formik={formik} clientData={selectedClient} />
              )}
              {activeTab === "Notes" && (
                <Notes formik={formik} clientData={selectedClient} />
              )}
              {activeTab === "Plan" && (
                <Plan formik={formik} clientData={selectedClient} />
              )}
              {activeTab === "Reminders" && (
                <Reminders formik={formik} clientData={selectedClient} />
              )}
              {activeTab === "Service" && (
                <Service formik={formik} clientData={selectedClient} />
              )}
              {activeTab === "Supervisory" && (
                <Supervisory formik={formik} clientData={selectedClient} />
              )}
              {activeTab === "Visit" && (
                <Visit formik={formik} clientData={selectedClient} />
              )}
              {activeTab === "Wellness" && (
                <Wellness formik={formik} clientData={selectedClient} />
              )}
            </div>

            <div className="form-actions p-3">
              {completedTabs.includes("Personal") && activeTab !== "Personal" && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setActiveTab("Personal")}
                >
                  Back
                </button>
              )}

              {activeTab !== tabs[tabs.length - 1].id ? (
                <button
                  type="button"
                  className="btn btn-primary d-none"
                  onClick={async () => {
                    const currentTab = tabs.find((tab) => tab.id === activeTab);
                    const nextTab =
                      tabs[tabs.findIndex((tab) => tab.id === activeTab) + 1];

                    if (currentTab?.validationSchema) {
                      try {
                        await currentTab.validationSchema.validate(
                          formik.values,
                          { abortEarly: false }
                        );

                        if (!completedTabs.includes(activeTab)) {
                          setCompletedTabs([...completedTabs, activeTab]);
                        }

                        setActiveTab(nextTab.id);
                      } catch (errors) {
                        const errorMessages = {};
                        errors.inner.forEach((error) => {
                          errorMessages[error.path] = error.message;
                        });
                        formik.setErrors(errorMessages);
                      }
                    } else {
                      setActiveTab(nextTab.id);
                    }
                  }}
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={formik.isSubmitting}
                >
                  Submit
                </button>
              )}
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default ClientForm;
