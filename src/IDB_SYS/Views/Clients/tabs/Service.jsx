import React, { useState, useEffect } from 'react';
import { Form, Button, Table, Badge, Modal, Alert, Row, Col } from 'react-bootstrap';
import { FaClipboardCheck, FaCalendarAlt, FaNotesMedical } from 'react-icons/fa';

const Service = ({ formik, clientData }) => {
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [showInactive, setShowInactive] = useState(false);
  const [newServiceOrder, setNewServiceOrder] = useState({
    serviceType: '',
    status: 'active',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    frequency: '',
    authNumber: '',
    description: '',
    physicianNotes: '',
    requireSignature: false
  });

  // Initialize service orders from API when clientData is available
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

  const frequencyOptions = [
    '1x/week',
    '2x/week',
    '3x/week',
    'Daily',
    'As Needed',
    '1x/month'
  ];

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
      status: 'active',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      frequency: '',
      authNumber: '',
      description: '',
      physicianNotes: '',
      requireSignature: false
    });
  };

  const handleModalShow = (index = null) => {
    if (index !== null) {
      // Editing existing order
      const order = formik.values.serviceOrders[index];
      setNewServiceOrder({
        serviceType: order.serviceType || '',
        status: order.status || 'active',
        startDate: order.startDate ? order.startDate.split('T')[0] : new Date().toISOString().split('T')[0],
        endDate: order.endDate ? order.endDate.split('T')[0] : '',
        frequency: order.frequency || '',
        authNumber: order.authNumber || '',
        description: order.description || '',
        physicianNotes: order.physicianNotes || '',
        requireSignature: order.requireSignature || false
      });
      setEditIndex(index);
    } else {
      // Adding new order
      setNewServiceOrder({
        serviceType: '',
        status: 'active',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        frequency: '',
        authNumber: '',
        description: '',
        physicianNotes: '',
        requireSignature: false
      });
      setEditIndex(null);
    }
    setShowModal(true);
  };

  const filteredOrders = (formik.values.serviceOrders || []).filter(order => 
    showInactive || order.status === 'active' || order.status === 'pending'
  );

  const activeOrdersCount = (formik.values.serviceOrders || []).filter(
    order => order.status === 'active'
  ).length;

  return (
    <div className="service-tab">
      <h3>Service Orders</h3>
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
                    <div className="small text-muted">
                      {order.description ? (
                        <>
                          {order.description.substring(0, 50)}
                          {order.description.length > 50 ? '...' : ''}
                        </>
                      ) : (
                        'No description'
                      )}
                    </div>
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
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Service Type*</Form.Label>
                <Form.Select
                  name="serviceType"
                  value={newServiceOrder.serviceType}
                  onChange={(e) => setNewServiceOrder({...newServiceOrder, serviceType: e.target.value})}
                >
                  <option value="">Select service type</option>
                  {serviceTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Status*</Form.Label>
                <Form.Select
                  name="status"
                  value={newServiceOrder.status}
                  onChange={(e) => setNewServiceOrder({...newServiceOrder, status: e.target.value})}
                >
                  {statusOptions.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Start Date*</Form.Label>
                <Form.Control
                  type="date"
                  name="startDate"
                  value={newServiceOrder.startDate}
                  onChange={(e) => setNewServiceOrder({...newServiceOrder, startDate: e.target.value})}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="date"
                  name="endDate"
                  min={newServiceOrder.startDate}
                  value={newServiceOrder.endDate}
                  onChange={(e) => setNewServiceOrder({...newServiceOrder, endDate: e.target.value})}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Frequency*</Form.Label>
                <Form.Select
                  name="frequency"
                  value={newServiceOrder.frequency}
                  onChange={(e) => setNewServiceOrder({...newServiceOrder, frequency: e.target.value})}
                >
                  <option value="">Select frequency</option>
                  {frequencyOptions.map(freq => (
                    <option key={freq} value={freq}>{freq}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Authorization Number</Form.Label>
                <Form.Control
                  type="text"
                  name="authNumber"
                  value={newServiceOrder.authNumber}
                  onChange={(e) => setNewServiceOrder({...newServiceOrder, authNumber: e.target.value})}
                  placeholder="Insurance authorization #"
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Description*</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={newServiceOrder.description}
              onChange={(e) => setNewServiceOrder({...newServiceOrder, description: e.target.value})}
              placeholder="Describe the service to be provided..."
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Physician Notes</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="physicianNotes"
              value={newServiceOrder.physicianNotes}
              onChange={(e) => setNewServiceOrder({...newServiceOrder, physicianNotes: e.target.value})}
              placeholder="Any special instructions from the physician..."
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              label="Require Caregiver Signature"
              name="requireSignature"
              checked={newServiceOrder.requireSignature}
              onChange={(e) => setNewServiceOrder({...newServiceOrder, requireSignature: e.target.checked})}
            />
          </Form.Group>
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
              !newServiceOrder.startDate ||
              !newServiceOrder.frequency ||
              !newServiceOrder.description
            }
          >
            {editIndex !== null ? 'Update' : 'Add'} Service Order
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Service;