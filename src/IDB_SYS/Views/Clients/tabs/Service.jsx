import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Button, Table, Badge, Modal, Alert, Row, Col } from 'react-bootstrap';
import { FaClipboardCheck, FaCalendarAlt, FaNotesMedical } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faSave } from '@fortawesome/free-solid-svg-icons';
import { fetchAllServiceCodes } from '../../../../store/IDB_SYS/Clients/serviceCodeSlice';
import { fetchCareGiverByVendor } from '../../../../store/IDB_SYS/Clients/careGiverSlice';

const Service = ({ formik, clientData, onSaveTab, isSaved, isSaving }) => {
  const dispatch = useDispatch();
  const { allServiceCodes: serviceCodeOptions, loading: serviceCodeLoading } = useSelector((state) => state.serviceCode);
  const { careGiver: caregivers, loading: caregiverLoading } = useSelector((state) => state.careGiver);

  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [showInactive, setShowInactive] = useState(false);
  const [serviceSearch, setServiceSearch] = useState('');
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  const [newServiceOrder, setNewServiceOrder] = useState({
    serviceType: '',
    costPerHour: '',
    dailyHours: '',
    unitsPerHour: '',
    payor: '',
    patientNumber: '',
    status: 'active',
    diagnosisCode1: '',
    diagnosisCode2: '',
    isDefault: false,
    includeModifiers: false,
    startDate: new Date().toISOString().split('T')[0],
    startTime: '12:00',
    endDate: '',
    endTime: '12:00',
    isFlexibleTime: false,
    frequencyType: 'weekly',
    recurEvery: 1,
    daysOfWeek: [],
    isFlexibleDays: false,
    authNumber: '',
    totalUnits: '',
    totalAmount: '',
    totalVisits: '',
    description: '',
    physicianNotes: '',
    requireSignature: false,
    autoCreateSchedules: false,
    caregiver: '',
    payrollItem1: '',
    payrollItem2: ''
  });

  // Initialize service orders from API when clientData is available
  useEffect(() => {
    dispatch(fetchAllServiceCodes());
    dispatch(fetchCareGiverByVendor());
  }, [dispatch]);

  // Helper function to get caregiver name by ID
  const getCaregiverName = (caregiverId) => {
    if (!caregiverId) return 'Not Assigned';
    const caregiver = caregivers?.find(c => c._id === caregiverId);
    if (caregiver) {
      const firstName = caregiver.firstName || '';
      const lastName = caregiver.lastName || '';
      return `${firstName} ${lastName}`.trim() || 'Not Assigned';
    }
    return 'Not Assigned';
  };

  useEffect(() => {
    if (clientData) {
      // Set service-related fields from API
      const serviceFields = [
        'showInactiveServiceOrders',
        'requireServiceOrder'
      ];

      serviceFields.forEach(field => {
        if (clientData[field] !== undefined) {
          formik.setFieldValue(field, clientData[field]);
        }
      });

      // Set service orders from API
      if (clientData.serviceOrders && Array.isArray(clientData.serviceOrders)) {
        formik.setFieldValue('serviceOrders', clientData.serviceOrders);
      }
    }
  }, [clientData, formik.setFieldValue]);

  const serviceTypes = [
    'Skilled Nursing',
    'Physical Therapy',
    'Occupational Therapy',
    'Speech Therapy',
    'Home Health Aide',
    'Medical Social Work',
    'Dietary Services'
  ];

  const statusOptions = [
    { value: 'active', label: 'Active', variant: 'success' },
    { value: 'pending', label: 'Pending', variant: 'warning' },
    { value: 'expired', label: 'Expired', variant: 'secondary' },
    { value: 'denied', label: 'Denied', variant: 'danger' }
  ];


  const daysOfWeekOptions = [
    { value: 'Su', label: 'Su' },
    { value: 'Mo', label: 'Mo' },
    { value: 'Tu', label: 'Tu' },
    { value: 'We', label: 'We' },
    { value: 'Th', label: 'Th' },
    { value: 'Fr', label: 'Fr' },
    { value: 'Sa', label: 'Sa' }
  ];

  const handleDayToggle = (day) => {
    const currentDays = [...newServiceOrder.daysOfWeek];
    if (currentDays.includes(day)) {
      setNewServiceOrder({ ...newServiceOrder, daysOfWeek: currentDays.filter(d => d !== day) });
    } else {
      setNewServiceOrder({ ...newServiceOrder, daysOfWeek: [...currentDays, day] });
    }
  };

  const handleQuickSelectDays = (type) => {
    if (type === 'M-F') {
      setNewServiceOrder({ ...newServiceOrder, daysOfWeek: ['Mo', 'Tu', 'We', 'Th', 'Fr'] });
    } else if (type === 'All Days') {
      setNewServiceOrder({ ...newServiceOrder, daysOfWeek: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] });
    }
  };

  const handleSaveServiceOrder = () => {
    const orderData = {
      ...newServiceOrder,
      id: editIndex !== null ? formik.values.serviceOrders[editIndex].id : Date.now(),
      enteredDate: editIndex !== null ? formik.values.serviceOrders[editIndex].enteredDate : new Date().toISOString(),
      enteredBy: editIndex !== null ? formik.values.serviceOrders[editIndex].enteredBy : 'Current User'
    };

    if (editIndex !== null) {
      // Update existing order
      formik.setFieldValue(`serviceOrders.${editIndex}`, orderData);
    } else {
      // Add new order
      formik.setFieldValue('serviceOrders', [
        ...(formik.values.serviceOrders || []),
        orderData
      ]);
    }

    setShowModal(false);
    setEditIndex(null);
    setNewServiceOrder({
      serviceType: '',
      costPerHour: '',
      dailyHours: '',
      unitsPerHour: '',
      payor: '',
      patientNumber: '',
      status: 'active',
      diagnosisCode1: '',
      diagnosisCode2: '',
      isDefault: false,
      includeModifiers: false,
      startDate: new Date().toISOString().split('T')[0],
      startTime: '12:00',
      endDate: '',
      endTime: '12:00',
      isFlexibleTime: false,
      frequencyType: 'weekly',
      recurEvery: 1,
      daysOfWeek: [],
      isFlexibleDays: false,
      authNumber: '',
      totalUnits: '',
      totalAmount: '',
      totalVisits: '',
      description: '',
      physicianNotes: '',
      requireSignature: false,
      autoCreateSchedules: false,
      caregiver: '',
      payrollItem1: '',
      payrollItem2: ''
    });
  };

  const handleModalShow = (index = null) => {
    if (index !== null) {
      // Editing existing order
      const order = formik.values.serviceOrders[index];
      setNewServiceOrder({
        serviceType: order.serviceType || '',
        costPerHour: order.costPerHour || '',
        dailyHours: order.dailyHours || '',
        unitsPerHour: order.unitsPerHour || '',
        payor: order.payor || '',
        patientNumber: order.patientNumber || '',
        status: order.status || 'active',
        diagnosisCode1: order.diagnosisCode1 || '',
        diagnosisCode2: order.diagnosisCode2 || '',
        isDefault: order.isDefault || false,
        includeModifiers: order.includeModifiers || false,
        startDate: order.startDate ? order.startDate.split('T')[0] : new Date().toISOString().split('T')[0],
        startTime: order.startTime || '12:00',
        endDate: order.endDate ? order.endDate.split('T')[0] : '',
        endTime: order.endTime || '12:00',
        isFlexibleTime: order.isFlexibleTime || false,
        frequencyType: order.frequencyType || 'weekly',
        recurEvery: order.recurEvery || 1,
        daysOfWeek: order.daysOfWeek || [],
        isFlexibleDays: order.isFlexibleDays || false,
        authNumber: order.authNumber || '',
        totalUnits: order.totalUnits || '',
        totalAmount: order.totalAmount || '',
        totalVisits: order.totalVisits || '',
        description: order.description || '',
        physicianNotes: order.physicianNotes || '',
        requireSignature: order.requireSignature || false,
        autoCreateSchedules: order.autoCreateSchedules || false,
        caregiver: order.caregiver || '',
        payrollItem1: order.payrollItem1 || '',
        payrollItem2: order.payrollItem2 || ''
      });
      setEditIndex(index);
    } else {
      // Adding new order
      setNewServiceOrder({
        serviceType: '',
        costPerHour: '',
        dailyHours: '',
        unitsPerHour: '',
        payor: '',
        patientNumber: '',
        status: 'active',
        diagnosisCode1: '',
        diagnosisCode2: '',
        isDefault: false,
        includeModifiers: false,
        startDate: new Date().toISOString().split('T')[0],
        startTime: '12:00',
        endDate: '',
        endTime: '12:00',
        isFlexibleTime: false,
        frequencyType: 'weekly',
        recurEvery: 1,
        daysOfWeek: [],
        isFlexibleDays: false,
        authNumber: '',
        totalUnits: '',
        totalAmount: '',
        totalVisits: '',
        description: '',
        physicianNotes: '',
        requireSignature: false,
        autoCreateSchedules: false,
        caregiver: '',
        payrollItem1: '',
        payrollItem2: ''
      });
      setEditIndex(null);
      setServiceSearch('');
    }
    setShowModal(true);
  };

  const filteredOrders = (formik.values.serviceOrders || []).filter(order =>
    showInactive || order.status === 'active' || order.status === 'pending'
  );

  const activeOrdersCount = (formik.values.serviceOrders || []).filter(
    order => order.status === 'active'
  ).length;

  // Helper function to format client name
  const getClientName = () => {
    if (!clientData) return 'Client Name Not Available';

    const { lastName = '', firstName = '', middleInitial = '' } = clientData;

    if (!lastName && !firstName) return 'Client Name Not Available';

    // Format: "LastName, FirstName MiddleInitial"
    let name = lastName;
    if (firstName) {
      name += name ? `, ${firstName}` : firstName;
    }
    if (middleInitial) {
      name += ` ${middleInitial}`;
    }

    return name || 'Client Name Not Available';
  };

  return (
    <div className="service-tab">
      <style>
        {`
          .dropdown-search-item {
            height: 50px;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
          .dropdown-search-item:hover {
            background-color: #f8f9fa;
          }
          .custom-scroll::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scroll::-webkit-scrollbar-thumb {
            background: #ccc;
            border-radius: 10px;
          }
          .custom-scroll::-webkit-scrollbar-track {
            background: #f1f1f1;
          }
        `}
      </style>
      <p className="text-muted">
        Manage authorized services and care directives for the client.
      </p>

      <Row className="mb-4 align-items-center">
        <Col md={6}>
          <Button
            variant="primary"
            onClick={() => handleModalShow()}
          >
            <FaClipboardCheck className="me-2" />
            Add Service Order
          </Button>
          <Form.Check
            type="switch"
            id="showInactiveServiceOrders"
            label="Show Inactive Orders"
            checked={showInactive}
            onChange={() => setShowInactive(!showInactive)}
            className="d-inline-block ms-3"
          />
        </Col>
        <Col md={6} className="text-end">
          <Badge bg="success" className="me-2">
            Active Orders: {activeOrdersCount}
          </Badge>
          <Badge bg="info">
            Total Orders: {formik.values.serviceOrders?.length || 0}
          </Badge>
        </Col>
      </Row>

      {(!formik.values.serviceOrders || formik.values.serviceOrders.length === 0) ? (
        <Alert variant="info">
          No service orders recorded. Add service orders to authorize care.
        </Alert>
      ) : filteredOrders.length === 0 ? (
        <Alert variant="info">
          No {showInactive ? '' : 'active'} service orders match your criteria.
        </Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Service Type</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Frequency</th>
              <th>Caregiver</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order, index) => {
              const originalIndex = formik.values.serviceOrders.findIndex(
                o => o.id === order.id
              );
              return (
                <tr key={order.id || index}>
                  <td>
                    <div className="fw-bold">{order.serviceType}</div>
                  </td>
                  <td>{order.startDate ? new Date(order.startDate).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    {order.endDate ? (
                      new Date(order.endDate).toLocaleDateString()
                    ) : (
                      <span className="text-muted">N/A</span>
                    )}
                  </td>
                  <td>{order.frequency || 'N/A'}</td>
                  <td>
                    <span className={order.caregiver ? 'text-dark' : 'text-muted'}>
                      {getCaregiverName(order.caregiver)}
                    </span>
                  </td>
                  <td>
                    <Badge
                      bg={
                        statusOptions.find(s => s.value === order.status)?.variant ||
                        'secondary'
                      }
                    >
                      {statusOptions.find(s => s.value === order.status)?.label || order.status}
                    </Badge>
                  </td>
                  <td className="text-center">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => handleModalShow(originalIndex)}
                      title="Edit"
                    >
                      ✏️
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => {
                        formik.setFieldValue(
                          `serviceOrders.${originalIndex}.status`,
                          order.status === 'active' ? 'expired' : 'active'
                        );
                      }}
                      title={order.status === 'active' ? 'Deactivate' : 'Reactivate'}
                    >
                      {order.status === 'active' ? '×' : '↻'}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}

      {/* Service Order Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editIndex !== null ? 'Edit Service Order' : 'New Service Order'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Client Header */}
          <div className="mb-4 text-center">
            <h5>Client: {getClientName()}</h5>
          </div>

          {/* Section 1: Service Info */}
          <Row className="mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Service Type</Form.Label>
                <div className="custom-searchable-dropdown" style={{ position: 'relative' }}>
                  <Form.Control
                    type="text"
                    placeholder="Search or select code..."
                    value={serviceSearch || (showServiceDropdown ? '' : newServiceOrder.serviceType)}
                    onChange={(e) => {
                      setServiceSearch(e.target.value);
                      setShowServiceDropdown(true);
                    }}
                    onFocus={() => setShowServiceDropdown(true)}
                    onBlur={() => setShowServiceDropdown(false)}
                    className="mb-1"
                  />
                  {showServiceDropdown && (
                    <div
                      className="border rounded bg-white w-100 shadow-lg custom-scroll"
                      style={{
                        maxHeight: '250px',
                        overflowY: 'auto',
                        position: 'absolute',
                        zIndex: 1000
                      }}
                    >
                      {serviceCodeOptions && serviceCodeOptions
                        .filter(opt =>
                          !serviceSearch ||
                          opt.description.toLowerCase().includes(serviceSearch.toLowerCase()) ||
                          (opt.procedureCode && opt.procedureCode.toLowerCase().includes(serviceSearch.toLowerCase()))
                        )
                        .map((opt) => (
                          <div
                            key={opt._id}
                            className="px-3 border-bottom dropdown-search-item"
                            style={{ cursor: 'pointer', transition: 'background 0.2s' }}
                            onMouseDown={(e) => {
                              // Prevent blur from closing dropdown before selection
                              e.preventDefault();
                              setNewServiceOrder({
                                ...newServiceOrder,
                                serviceType: opt.description,
                                costPerHour: opt.cost
                              });
                              setServiceSearch('');
                              setShowServiceDropdown(false);
                            }}
                          >
                            <div className="fw-bold small text-truncate" title={opt.description}>
                              {opt.description}
                            </div>
                            <div className="text-muted d-flex justify-content-between" style={{ fontSize: '11px' }}>
                              <span>{opt.procedureCode || 'N/A'}</span>
                              <span className="text-success fw-bold">${opt.cost}</span>
                            </div>
                          </div>
                        ))}
                      {serviceCodeOptions && serviceCodeOptions.filter(opt =>
                        !serviceSearch ||
                        opt.description.toLowerCase().includes(serviceSearch.toLowerCase()) ||
                        (opt.procedureCode && opt.procedureCode.toLowerCase().includes(serviceSearch.toLowerCase()))
                      ).length === 0 && (
                          <div className="p-3 text-center text-muted small italic">No matching codes found</div>
                        )}
                    </div>
                  )}
                  {newServiceOrder.serviceType && (
                    <div className="mt-1 px-1 d-flex justify-content-between align-items-center">
                      <span className="small text-primary fw-medium" style={{ fontSize: '10px' }}>
                        Selected: <span className="fw-bold text-dark">{newServiceOrder.serviceType}</span>
                      </span>
                    </div>
                  )}
                </div>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Cost Per Hour</Form.Label>
                <Form.Control
                  type="number"
                  value={newServiceOrder.costPerHour}
                  onChange={(e) => setNewServiceOrder({ ...newServiceOrder, costPerHour: e.target.value })}
                  placeholder="37.000"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Daily Hours</Form.Label>
                <Form.Control
                  type="number"
                  value={newServiceOrder.dailyHours}
                  onChange={(e) => setNewServiceOrder({ ...newServiceOrder, dailyHours: e.target.value })}
                  placeholder="4.00"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Diagnosis/Code</Form.Label>
                <div className="d-flex gap-2">
                  <Form.Control
                    type="text"
                    value={newServiceOrder.diagnosisCode1}
                    onChange={(e) => setNewServiceOrder({ ...newServiceOrder, diagnosisCode1: e.target.value })}
                    placeholder="F0390"
                  />
                  <Form.Control
                    type="text"
                    value={newServiceOrder.diagnosisCode2}
                    onChange={(e) => setNewServiceOrder({ ...newServiceOrder, diagnosisCode2: e.target.value })}
                  />
                </div>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Patient Number</Form.Label>
                <Form.Control
                  type="text"
                  value={newServiceOrder.patientNumber}
                  onChange={(e) => setNewServiceOrder({ ...newServiceOrder, patientNumber: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={newServiceOrder.status}
                  onChange={(e) => setNewServiceOrder({ ...newServiceOrder, status: e.target.value })}
                >
                  <option value="active">A</option>
                  <option value="inactive">I</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col md={4}>
              <Form.Check
                type="checkbox"
                label="Set as default"
                checked={newServiceOrder.isDefault}
                onChange={(e) => setNewServiceOrder({ ...newServiceOrder, isDefault: e.target.checked })}
              />
            </Col>
            <Col md={8}>
              <Form.Check
                type="checkbox"
                label="Include service modifiers when billing using 837I"
                checked={newServiceOrder.includeModifiers}
                onChange={(e) => setNewServiceOrder({ ...newServiceOrder, includeModifiers: e.target.checked })}
              />
            </Col>
          </Row>

          {/* Section 2: Date/Time */}
          <div className="p-3 mb-4 border rounded shadow-sm">
            <h6>Date/Time</h6>
            <Row className="mb-3">
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={newServiceOrder.startDate}
                    onChange={(e) => setNewServiceOrder({ ...newServiceOrder, startDate: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Start Time</Form.Label>
                  <Form.Control
                    type="time"
                    value={newServiceOrder.startTime}
                    onChange={(e) => setNewServiceOrder({ ...newServiceOrder, startTime: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={1} className="d-flex align-items-end mb-1">
                <FaCalendarAlt className="text-primary mb-2" />
              </Col>
              <Col md={5} className="d-flex align-items-end">
                <Form.Check
                  type="checkbox"
                  label="Flexible time"
                  checked={newServiceOrder.isFlexibleTime}
                  onChange={(e) => setNewServiceOrder({ ...newServiceOrder, isFlexibleTime: e.target.checked })}
                  className="mb-2"
                />
              </Col>
            </Row>
            <Row>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>End Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={newServiceOrder.endDate}
                    onChange={(e) => setNewServiceOrder({ ...newServiceOrder, endDate: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>End Time</Form.Label>
                  <Form.Control
                    type="time"
                    value={newServiceOrder.endTime}
                    onChange={(e) => setNewServiceOrder({ ...newServiceOrder, endTime: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>
          </div>

          {/* Section 3: Frequency */}
          <div className="p-3 mb-4 border rounded shadow-sm">
            <h6>Frequency</h6>
            <Row>
              <Col md={3}>
                <div className="border p-2 rounded">
                  <Form.Check
                    type="radio"
                    label="Weekly"
                    name="freqType"
                    checked={newServiceOrder.frequencyType === 'weekly'}
                    onChange={() => setNewServiceOrder({ ...newServiceOrder, frequencyType: 'weekly' })}
                  />
                  <Form.Check
                    type="radio"
                    label="Monthly"
                    name="freqType"
                    checked={newServiceOrder.frequencyType === 'monthly'}
                    onChange={() => setNewServiceOrder({ ...newServiceOrder, frequencyType: 'monthly' })}
                  />
                </div>
              </Col>
              <Col md={9}>
                <div className="d-flex align-items-center gap-2 mb-3">
                  <span>Recur Every</span>
                  <Form.Select
                    style={{ width: '80px' }}
                    value={newServiceOrder.recurEvery}
                    onChange={(e) => setNewServiceOrder({ ...newServiceOrder, recurEvery: e.target.value })}
                  >
                    {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n}</option>)}
                  </Form.Select>
                  <span>Week(s)</span>
                  <Button variant="outline-primary" size="sm" onClick={() => handleQuickSelectDays('M-F')}>M-F</Button>
                  <Button variant="outline-primary" size="sm" onClick={() => handleQuickSelectDays('All Days')}>All Days</Button>
                </div>
                <div className="d-flex align-items-center gap-3">
                  {daysOfWeekOptions.map(day => (
                    <div key={day.value} className="text-center">
                      <div className="small mb-1">{day.label}</div>
                      <Form.Check
                        type="checkbox"
                        checked={newServiceOrder.daysOfWeek.includes(day.value)}
                        onChange={() => handleDayToggle(day.value)}
                      />
                    </div>
                  ))}
                  <Form.Check
                    type="checkbox"
                    label="Flexible days"
                    checked={newServiceOrder.isFlexibleDays}
                    onChange={(e) => setNewServiceOrder({ ...newServiceOrder, isFlexibleDays: e.target.checked })}
                    className="ms-3"
                  />
                </div>
              </Col>
            </Row>
          </div>

          {/* Section 4: Authorization */}
          <div className="p-3 mb-4 border rounded shadow-sm">
            <h6>Authorization</h6>
            <Row className="mb-2">
              <Col md={7}>
                <Form.Label className="small">Total approved units for this service order</Form.Label>
              </Col>
              <Col md={5}>
                <Form.Control
                  type="number"
                  size="sm"
                  value={newServiceOrder.totalUnits}
                  onChange={(e) => setNewServiceOrder({ ...newServiceOrder, totalUnits: e.target.value })}
                />
              </Col>
            </Row>
            <Row className="mb-2">
              <Col md={7}>
                <Form.Label className="small">Total approved amount for this service order</Form.Label>
              </Col>
              <Col md={5}>
                <Form.Control
                  type="number"
                  size="sm"
                  value={newServiceOrder.totalAmount}
                  onChange={(e) => setNewServiceOrder({ ...newServiceOrder, totalAmount: e.target.value })}
                />
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={7}>
                <Form.Label className="small">Total approved visits for this service order</Form.Label>
              </Col>
              <Col md={5}>
                <Form.Control
                  type="number"
                  size="sm"
                  value={newServiceOrder.totalVisits}
                  onChange={(e) => setNewServiceOrder({ ...newServiceOrder, totalVisits: e.target.value })}
                />
              </Col>
            </Row>
            <div className="d-flex justify-content-end gap-2">
              <Button variant="primary" size="sm">Manual Override</Button>
            </div>
          </div>

          {/* Section 5: Notes */}
          <Form.Group className="mb-4">
            <Form.Label>Notes:</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={newServiceOrder.description}
              onChange={(e) => setNewServiceOrder({ ...newServiceOrder, description: e.target.value })}
            />
          </Form.Group>

          {/* Section 6: Scheduling */}
          <div className="p-3 border rounded shadow-sm">
            <h6>Scheduling</h6>
            <Form.Check
              type="checkbox"
              label="Auto create schedules when adding service order"
              checked={newServiceOrder.autoCreateSchedules}
              onChange={(e) => setNewServiceOrder({ ...newServiceOrder, autoCreateSchedules: e.target.checked })}
              className="mb-3"
            />
            <Row>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Caregiver</Form.Label>
                  <Form.Select
                    value={newServiceOrder.caregiver}
                    onChange={(e) => setNewServiceOrder({ ...newServiceOrder, caregiver: e.target.value })}
                  >
                    <option value="">Select Caregiver</option>
                    {caregivers && caregivers.map((cg) => (
                      <option key={cg._id} value={cg._id}>
                        {`${cg.firstName || ''} ${cg.lastName || ''}`.trim() || cg.email}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Payroll Item</Form.Label>
                  <Form.Control
                    type="text"
                    value={newServiceOrder.payrollItem1}
                    onChange={(e) => setNewServiceOrder({ ...newServiceOrder, payrollItem1: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mt-4">
                  <Form.Control
                    type="text"
                    value={newServiceOrder.payrollItem2}
                    onChange={(e) => setNewServiceOrder({ ...newServiceOrder, payrollItem2: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveServiceOrder}
            disabled={
              !newServiceOrder.serviceType ||
              !newServiceOrder.startDate
            }
          >
            {editIndex !== null ? 'Update' : 'Add'} Service Order
          </Button>
        </Modal.Footer>
      </Modal>

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

export default Service;