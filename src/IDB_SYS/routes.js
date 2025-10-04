import List from './Views/Clients/List';
import Agencies from './Views/Clients/Agencies/Angencies';
import Notes from './Views/Clients/Notes/Notes';
import ClientType from './Views/Clients/ClientType/ClientType';
import Country from './Views/Clients/Country/Country';
import CustomField from './Views/Clients/CustomField/CustomField';
import Discipline from './Views/Clients/Discipline/Discipline';
import Location from './Views/Clients/Location/Location';
import Medication from './Views/Clients/Medication/Medication';
import Need from './Views/Clients/Need/Need';
import OtherNoteType from './Views/Clients/OtherNoteType/OtherNoteType';
import Reason from './Views/Clients/Reason/Reason';
import Relationship from './Views/Clients/Relationship/Relationship';
import SalesRep from './Views/Clients/SalesRep/SalesRep';
import ReminderList from './Views/Clients/ReminderList/ReminderList';
import TimeSpan from './Views/Clients/TimeSpan/TimeSpan';
import ServiceCode from './Views/Clients/ServiceCode/ServiceCode';
import CaseManager from './Views/Clients/CaseManager/CaseManager';
import Caregiver from './Views/Clients/Caregiver/Caregiver';
import ClientForm from './Views/Clients/ClientForm';
import Physician from './Views/Clients/Physician/Physician';
import Payor from './Views/Clients/Payor/Payor';
import MonthView from './Views/Schedule/Month/MonthView';
import TimesheetWeeksForm from './Views/TimeSheet/TimesheetWeeks/TimesheetWeeksForm';
import TimesheetManager from './Views/TimeSheet/TimesheetManager/TimesheetManager';
import InsuranceFormReplica from './Views/Clients/Forms/InsuranceFormReplica';
import Home from './Views/Home';
import ReferralSources from './Views/Clients/ReferralSources/ReferralSources';

const routes = [
  { path: "/home", name: "Home", element: Home, roles: ["vendor"] },
  { path: "/clients/listing", name: "Dashboard", element: List, roles: ["vendor"] },
  { path: "/clients/agencies", name: "Agencies", element: Agencies, roles: ["vendor"] },
  { path: "/clients/noteTypes", name: "Notes", element: Notes, roles: ["vendor"] },
  { path: "/clients/clientTypes", name: "Notes", element: ClientType, roles: ["vendor"] },
  { path: "/clients/country", name: "Notes", element: Country, roles: ["vendor"] },
  { path: "/clients/customFields", name: "Notes", element: CustomField, roles: ["vendor"] },
  { path: "/clients/discipline", name: "Notes", element: Discipline, roles: ["vendor"] },
  { path: "/clients/location", name: "Notes", element: Location, roles: ["vendor"] },
  { path: "/clients/medication", name: "Notes", element: Medication, roles: ["vendor"] },
  { path: "/clients/needs", name: "Need", element: Need, roles: ["vendor"] },
  { path: "/clients/otherNoteType", name: "Other Note Types", element: OtherNoteType, roles: ["vendor"] },
  { path: "/clients/reason", name: "Reasons", element: Reason, roles: ["vendor"] },
  { path: "/clients/relationship", name: "RelationShips", element: Relationship, roles: ["vendor"] },
  { path: "/clients/sales-rep", name: "Sales Representator", element: SalesRep, roles: ["vendor"] },
  { path: "/clients/reminderList", name: "RFeminder List", element: ReminderList, roles: ["vendor"] },
  { path: "/clients/timeSpan", name: "Time Spans", element: TimeSpan, roles: ["vendor"] },
  { path: "/clients/serviceCode", name: "Time Spans", element: ServiceCode, roles: ["vendor"] },
  { path: "/clients/caseManager", name: "Case Managers", element: CaseManager, roles: ["vendor"] },
  { path: "/clients/careGiver", name: "Care Giver", element: Caregiver, roles: ["vendor"] },
  { path: "/clients/add", name: "Add Client", element: ClientForm, roles: ["vendor"] },
  { path: "/clients/edit/:clientId", name: "Edit Client", element: ClientForm, roles: ["vendor"] },
  { path: "/clients/physician", name: "Add Physician", element: Physician, roles: ["vendor"] },
  { path: "/clients/payors", name: "Payors", element: Payor, roles: ["vendor"] },
  { path: "/clients/form-1500B", name: "Payors", element: InsuranceFormReplica, roles: ["vendor"] },
  { path: "/clients/referral-sources", name: "Referral Sources", element: ReferralSources, roles: ["vendor"] },
  // Scheduler routes
  {
    path: "/schedule/:view",
    name: "Schedule",
    element: MonthView,
    roles: ["vendor"],
  },
  // timesheet routes
  { path: "/timesheet/maintaintimesheetweeks", name: "Weekly TimeSheets", element: TimesheetWeeksForm, roles: ["vendor"] },
  { path: "/timesheet/createtimesheet", name: "Weekly TimeSheets", element: TimesheetManager, roles: ["vendor"] },

];

export default routes;
