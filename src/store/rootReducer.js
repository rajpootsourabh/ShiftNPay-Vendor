import { combineReducers } from '@reduxjs/toolkit';
import dashboardReducer from './Dashboard/dashboardSlice';
import trackerReducer from './Tracker/trackerSlice';
import overTimeReducer from './OverTimeList/overTimeSlice';
import InVoiceReducer from './Invoice/InvoiceSlice';
import memberShipSlice from './MemberShip/memberShipSlice';
import userReducer from './userSlice';
import notificationReducer from './Notification/userNotificationsSlice';
import checkListReducer from './CheckList/checklistSlice';
import assignedDocumentReducer from './AssignedDocument/assignedDocumentSlice';
import documentReducer from './Product/documentSlice';
import employeeAccessReducer from './Product/employeeAccessSlice';
import jobReducer from './jobSlice';
import CategoryReducer from './Category/categoriesSlice';
import chatReducer from './chatSlice';
import agencyReducer from './IDB_SYS/Clients/agencySlice';
import noteTypesReducer from './IDB_SYS/Clients/noteTypesSlice';
import clientTypeReducer from './IDB_SYS/Clients/clientTypeSlice';
import countryReducer from './IDB_SYS/Clients/countrySlice';
import customFieldsReducer from './IDB_SYS/Clients/customFieldsSlice';
import disciplineReducer from './IDB_SYS/Clients/disciplineSlice';
import locationReducer from './IDB_SYS/Clients/locationSlice';
import medicationReducer from './IDB_SYS/Clients/medicationSlice';
import needReducer from './IDB_SYS/Clients/needSlice';
import otherNoteTypeReducer from './IDB_SYS/Clients/otherNoteTypesSlice';
import reasonReducer from './IDB_SYS/Clients/reasonSlice';
import referralSourceReducer from './IDB_SYS/Clients/referralSourceSlice';
import relationshipReducer from './IDB_SYS/Clients/relationshipSlice';
import salesRepReducer from './IDB_SYS/Clients/salesRepSlice';
import reminderListReducer from './IDB_SYS/Clients/reminderListSlice';
import timeSpanReducer from './IDB_SYS/Clients/timeSpanSlice';
import serviceCodeReducer from './IDB_SYS/Clients/serviceCodeSlice';
import caseManagerReducer from './IDB_SYS/Clients/caseManagerSlice';
import careGiverReducer from './IDB_SYS/Clients/careGiverSlice';
import clientReducer from './IDB_SYS/Clients/clientSlice';
import PhysicianReducer from './IDB_SYS/Clients/physicianSlice';
import PayorReducer from './IDB_SYS/Clients/payorSlice';
import ScheduleReducer from './IDB_SYS/scheduler/scheduleSlice';
import TimesheetWeekReducer from './IDB_SYS/timesheet/timesheetWeekSlice';

const rootReducer = combineReducers({
  dashboard: dashboardReducer,
  timeTracker: trackerReducer,
  overTime: overTimeReducer,
  invoice: InVoiceReducer,
  user: userReducer,
  membership: memberShipSlice,
  notifications: notificationReducer,
  checklistitems: checkListReducer,
  documents: documentReducer,
  employeeAccess: employeeAccessReducer,
  assignedDocuments: assignedDocumentReducer,
  job: jobReducer,
  categories: CategoryReducer,
  chat: chatReducer,


  // ------new system states -------- //
  agency: agencyReducer,
  noteTypes: noteTypesReducer,
  clientType: clientTypeReducer,
  country: countryReducer,
  customFields: customFieldsReducer,
  discipline: disciplineReducer,
  location: locationReducer,
  medication: medicationReducer,
  need: needReducer,
  otherNoteType: otherNoteTypeReducer,
  reason: reasonReducer,
  referralSource: referralSourceReducer,
  relationship: relationshipReducer,
  salesRep: salesRepReducer,
  reminderList: reminderListReducer,
  timeSpan: timeSpanReducer,
  serviceCode: serviceCodeReducer,
  caseManager: caseManagerReducer,
  careGiver: careGiverReducer,
  client: clientReducer,
  physician: PhysicianReducer,
  payor: PayorReducer,
  //  schedule slice
  schedule :ScheduleReducer,

  // timesheet slices
  timesheetWeek :TimesheetWeekReducer,
  

});

export default rootReducer;
