import React, { useState } from 'react';

// Import images
import clientsImg from './../assets/home/clients.png';
import potentialClientsImg from './../assets/home/potential-clients.png';
import serviceCodesImg from './../assets/home/service-codes.png';
import documentImg from './../assets/home/Icon-Document.png';
import sourcesImg from './../assets/home/sources.png';
import dashImg from './../assets/home/dash.png';
import helpIconImg from './../assets/home/HelpIcon.png';
import careGiversImg from './../assets/home/care-givers.png';
import applicantListImg from './../assets/home/applicant-list.png';
import scheduleImg from './../assets/home/schedule.png';
import telephoneImg from './../assets/home/telephone.png';
import careSearchImg from './../assets/home/care-search.png';
import mappingImg from './../assets/home/mapping.png';
import callCenterImg from './../assets/home/call-center.png';
import timesheetImg from './../assets/home/timesheet.png';
import editTimesheetImg from './../assets/home/edit-timesheet.png';
import quickBooksImg from './../assets/home/quick-books.png';
import billingExportImg from './../assets/home/billing-export.png';
import payrollExportImg from './../assets/home/payroll-export.png';
import payorsImg from './../assets/home/payors.png';
import viewReportImg from './../assets/home/view-report.png';
import { useNavigate } from 'react-router-dom';
import ClientNav from '../components/InnerNavBars/ClientNav';

const Home = () => {
  const [activeMenu, setActiveMenu] = useState(null);
  const navigate = useNavigate();

  const menuItems = [
    { id: '/generations.idb-sys/clients/listing', name: 'Clients', image: clientsImg },
    { id: '#', name: 'Potential Client', image: potentialClientsImg },
    { id: '#', name: 'Service Codes', image: serviceCodesImg },
    { id: '#', name: 'Document Management', image: documentImg },
    { id: '#', name: 'Referral Sources', image: sourcesImg },
    { id: '/generations.idb-sys/dashboard', name: 'Dashboard', image: dashImg },
    { id: '#', name: 'Help', image: helpIconImg },
    { id: '/generations.idb-sys/clients/careGiver', name: 'Caregivers', image: careGiversImg },
    { id: '#', name: 'Applicant List', image: applicantListImg },
    { id: '/generations.idb-sys/schedule/month', name: 'Schedules', image: scheduleImg },
    { id: '#', name: 'EVV', image: telephoneImg },
    { id: '/generations.idb-sys/clients/careGiver', name: 'Caregiver Search', image: careSearchImg },
    { id: '#', name: 'Mapping', image: mappingImg },
    { id: '#', name: 'Call Center', image: callCenterImg },
    { id: '/generations.idb-sys/timesheet/createTimeSheet', name: 'Create Timesheet', image: timesheetImg },
    { id: '/generations.idb-sys/timesheet/createTimeSheet', name: 'Edit Timesheet', image: editTimesheetImg },
    { id: '#', name: 'QuickBooks', image: quickBooksImg },
    { id: '#', name: 'Billing Export', image: billingExportImg },
    { id: '#', name: 'Payroll Export', image: payrollExportImg },
    { id: '/generations.idb-sys/clients/payors', name: 'Payors', image: payorsImg },
    { id: '/generations.idb-sys/timesheet/createTimeSheet', name: 'View All Reports', image: viewReportImg }
  ];

  const handleMenuClick = (menuId) => {
    setActiveMenu(menuId);
    navigate(menuId);
  };

  return (
    <>
    <ClientNav />
    <div className="p-4">
      <div className="row mb-4">
        <div className="col-12">
          <h2 className="text-center">Mastercare Homecare & Healthcare</h2>
        </div>
      </div>

     <div className="row g-0">
  {menuItems.map((item, index) => (
    <div
      key={item.id}
      className={`col-md-1-7 d-flex justify-content-center p-3 menu-item ${
        index % 7 === 0 ? 'first-in-row' : ''
      } ${
          activeMenu === item.id ? 'active' : ''
        }`}
      onClick={() => handleMenuClick(item.id)}
      style={{ cursor: 'pointer' }}
    >
      <div
        className={`text-center dashboard-card `}
      >
        <div className="mb-3 dashboard-icon">
          <img
            src={item.image}
            alt={item.name}
            style={{ width: '70px', height: '70px', objectFit: 'contain' }}
          />
        </div>
        <h6 className="card-title">{item.name}</h6>
      </div>
    </div>
  ))}
</div>

     <style>{`ashboard-card {
        padding: 10px;
      }
      .dashboard-card.active {
        background-color: #f8f9fa;
        border-radius: 6px;
      }
        .col-md-1-7 {
  flex: 0 0 14.2857%;
  max-width: 14.2857%;
  position: relative;
}

.menu-item:not(.first-in-row)::before {
  content: "";
  position: absolute;
  left: 0;
  top: 20%;        /* start a little below top */
  bottom: 20%;     /* end a little above bottom */
  width: 1px;
  background-color: #ddd; /* divider color */
}

    `}</style>
    </div>
    </>
  );
};

export default Home;
