import { Link } from "react-router-dom";

const AppNavigation = () => {
  return (
    <div className="bg-green navBar">
      <div className="text-white d-flex flex-wrap">
        <div className="p-2 flex-fill text-center navbar-item">
          <span><Link to="/generations.idb-sys/home">Home</Link></span>
        </div>
        <div className="p-2 flex-fill text-center navbar-item">
          <span><Link to="/dashboard">Dashboard</Link></span>
        </div>

        <div className="p-2 flex-fill text-center navbar-item position-relative dropdown-wrapper">
          <span>Clients</span>
          <div className="custom-dropdown f-12 text-left  bg-green">
            <div className="dropdown-section p-1 round">
              <div className="bg-light-green-new p-2">
                <p className="h7">Main</p>
                <ul>
                  <li><Link to="/generations.idb-sys/clients/caseManager">Case Managers</Link></li>
                  <li><Link to="/generations.idb-sys/clients/listing">Client List</Link></li>
                  <li>Online Service Request</li>
                  <li><Link to="/generations.idb-sys/clients/payors">Payors</Link></li>
                  <li>Payor-Client List</li>
                  <li><Link to="/generations.idb-sys/clients/physician">Physicians</Link></li>
                  <li><Link to="/generations.idb-sys/clients/referral-sources">Referral Sources</Link></li>
                </ul>
              </div>
            </div>
            <div className="dropdown-section p-1 round">
              <div className="bg-light-green-new p-2">
                <p className="h7">Master Lists</p>
                <ul>
                  <li><Link to="/generations.idb-sys/clients/agencies">Agencies</Link></li>
                  <li><Link to="/generations.idb-sys/clients/noteTypes">Client Note Type</Link></li>
                  <li><Link to="/generations.idb-sys/clients/clientTypes">Client Type</Link></li>
                  <li><Link to="/generations.idb-sys/clients/country">County</Link></li>
                  <li><Link to="/generations.idb-sys/clients/customFields">Custom Fields</Link></li>
                  <li><Link to="/generations.idb-sys/clients/discipline">Discipline</Link></li>
                  <li><Link to="/generations.idb-sys/clients/location">Location</Link></li>
                  <li><Link to="/generations.idb-sys/clients/medication">Medications Master List</Link></li>
                  <li><Link to="/generations.idb-sys/clients/needs">Needs</Link></li>
                  <li><Link to="/generations.idb-sys/clients/otherNoteType">Other Note Type</Link></li>
                  <li><Link to="/generations.idb-sys/clients/reason">Reasons</Link></li>
                  <li><Link to="/generations.idb-sys/clients/relationship">Relationships</Link></li>
                  <li><Link to="/generations.idb-sys/clients/reminderList">Reminders</Link></li>
                  <li><Link to="/generations.idb-sys/clients/sales-rep">Sales Rep</Link></li>
                  <li><Link to="/generations.idb-sys/clients/timeSpan">Timespan</Link></li>
                  <li><Link to="/generations.idb-sys/clients/serviceCode">Service Codes</Link></li>
                  <li>Wound Notes Stage</li>
                  <li>Required Fields</li>
                </ul>
              </div>
            </div>
            <div className="dropdown-section p-1 round">
              <div className="bg-light-green-new p-2">
                <p className="h7">Tasks</p>
                <ul>
                  <li>Task Categories</li>
                  <li>Task Master List</li>
                </ul>
              </div>
            </div>
            <div className="dropdown-section p-1 round">
              <div className="bg-light-green-new p-2">
                <p className="h7">Wellness</p>
                <ul>
                  <li>Wellness Groups</li>
                  <li>Wellness Questions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="p-2 flex-fill text-center navbar-item position-relative dropdown-wrapper">
          <span>Caregivers</span>
          <div className="custom-dropdown f-12 text-left bg-green">
            <div className="dropdown-section  p-1 round">
              <div className="bg-light-green-new p-2">
                <ul className="mb-0 " align={"left"}>
                  <li><Link to="/generations.idb-sys/clients/careGiver">Caregiver List</Link></li>
                  <li>ACA Status</li>
                  <li>Applicant List</li>
                  <li>Attributes</li>
                  <li>Caregiver Note Type</li>
                  <li>Cell Carriers</li>
                  <li>City Minimum Wage</li>
                  <li>Class</li>
                  <li>Classification</li>
                  <li>County</li>
                  <li>Custom Fields</li>
                  <li>Holiday</li>
                  <li>In-Services</li>
                  <li>Letter Writer</li>
                  <li>Mass Update</li>
                  <li>Online Application</li>
                  <li>Payroll Items</li>
                  <li>Reasons</li>
                  <li>Reminders</li>
                  <li>Text Msg Group</li>
                  <li>Referral Source</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="p-2 flex-fill text-center navbar-item position-relative dropdown-wrapper">
          <span>Schedule</span>
          <div className="custom-dropdown f-12 text-left bg-green">
            <div className="dropdown-section p-1 round">
              <div className="bg-light-green-new p-2">
                <p className="h7">Scheduling Views</p>

                <ul className="mb-0" align={"left"}>
                  <li><Link to="/generations.idb-sys/schedule/day">Day</Link></li>
                  <li><Link to="/generations.idb-sys/schedule/week">Week</Link></li>
                  <li><Link to="/generations.idb-sys/schedule/month">Month</Link></li>
                  <li><Link to="/generations.idb-sys/schedule/month">Grid</Link></li>
                </ul>
              </div>
            </div>
            <div className="dropdown-section p-1 round">
              <div className="bg-light-green-new p-2">
                <p className="h7">Other</p>
                <ul className="mb-0" align={"left"}>
                  <li>Charting Management</li>
                  <li>Create Travel Time</li>
                  <li>Cancelled Shift Reasons</li>
                  <li>Cancelled Shift Actions</li>
                  <li>Month (old)</li>
                  <li>Week (old)</li>
                  <li>Grid (old)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="p-2 flex-fill text-center navbar-item position-relative dropdown-wrapper">
          <span>Timesheets</span>
          <div className="custom-dropdown f-12 text-left bg-green">
            <div className="dropdown-section p-1 round">
              <div className="bg-light-green-new p-2">
                <p className="h7">Timesheets</p>
                <ul className="mb-0">
                  <li><Link to="/generations.idb-sys/timesheet/createTimeSheet">Create Timesheet</Link></li>
                  <li>Edit Timesheets</li>
                  <li><Link to="/generations.idb-sys/timesheet/maintaintimesheetweeks">Maintain Timesheet Weeks</Link></li>
                </ul>
              </div>
            </div>
            <div className="dropdown-section p-1 round">
              <div className="bg-light-green-new p-2">
                <p className="h7">Invoicing</p>
                <ul className="mb-0">
                  <li>Create Invoices/Estimates</li>
                  <li>Payment Method</li>
                  <li>Invoice Details</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="p-2 flex-fill text-center navbar-item position-relative dropdown-wrapper">
          <span>Interfaces</span>
          <div className="custom-dropdown f-12 text-left bg-green">
            <div className="dropdown-section p-1 round">
              <div className="bg-light-green-new p-2">
                <ul className="mb-0">
                  <li>Send Secure Message</li>
                  <li>Payroll Export</li>
                  <li>Billing Export</li>
                  <li>Paychex Export</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="p-2 flex-fill text-center navbar-item position-relative dropdown-wrapper">
          <span>EVV</span>
          <div className="custom-dropdown f-12 text-left bg-green">
            <div className="dropdown-section p-1 round">
              <div className="bg-light-green-new p-2">
                <ul className="mb-0">
                  <li>EVV Schedules</li>
                  <li>EVV Calls</li>
                  <li>Alert Log</li>
                  <li>EVV Audit Trail</li>
                  <li>EVV Messaging</li>
                  <li>EVV Reasons</li>
                  <li>EVV Resolutions</li>
                  <li>Offline Details</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="p-2 flex-fill text-center navbar-item position-relative dropdown-wrapper">
          <span>Reports</span>
          <div className="custom-dropdown f-12 text-left bg-green">
            <div className="dropdown-section p-1 round">
              <div className="bg-light-green-new p-2">
                <ul className="mb-0">
                  <li>All</li>
                  <li>Billing</li>
                  <li>Caregivers</li>
                  <li>Case Manager</li>
                  <li>Clients</li>
                  <li>Covid-19</li>
                  <li>Letter Writer</li>
                  <li>Mailing Labels</li>
                  <li>Report Writer</li>
                  <li>Schedule</li>
                  <li>EVV</li>
                  <li>Timesheets (Payroll)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="p-2 flex-fill text-center navbar-item position-relative dropdown-wrapper">
          <span>Admin</span>
          <div className="custom-dropdown f-12 text-left bg-green">
            <div className="dropdown-section p-1 round">
              <div className="bg-light-green-new p-2">
                <ul className="mb-0">
                  <li>Company Settings</li>
                  <li>User Settings</li>
                  <li>Audit Client Access</li>
                  <li>Audit User Log</li>
                  <li>Client Audit Trail</li>
                  <li>Delete Schedule Audit</li>
                  <li>Daily Schedule Reminders</li>
                  <li>Email Log</li>
                  <li>Mass Email Summary</li>
                  <li>Training Video Log</li>
                  <li>Order Additional Licenses</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="p-2 flex-fill text-center navbar-item position-relative dropdown-wrapper">
          <span>Caregiver Search</span>
        </div>
        <div className="p-2 flex-fill text-center navbar-item position-relative dropdown-wrapper">
          <span>Call Center</span>
        </div>
        <div className="p-2 flex-fill text-center navbar-item position-relative dropdown-wrapper">
          <span>Help</span>
          <div className="custom-dropdown f-12 text-left bg-green">
            <div className="dropdown-section p-1 round">
              <div className="bg-light-green-new p-2">
                <ul className="mb-0">
                  <li>Help And Support</li>
                  <li>Training Videos</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppNavigation;
