import React, { useState, useEffect } from 'react';
import { useField, FieldArray } from 'formik';
import { Form, Button, Table, Badge, Modal, Accordion, Row, Col } from 'react-bootstrap';
import { FaFileMedical, FaCalendarAlt, FaUserMd } from 'react-icons/fa';

const Plan = ({ formik, clientData }) => {
  const [showCarePlanModal, setShowCarePlanModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [showMARModal, setShowMARModal] = useState(false);
  const [newCarePlan, setNewCarePlan] = useState({
    discipline: '',
    frequency: '',
    startDate: '',
    endDate: '',
    goals: '',
    interventions: '',
    status: 'Active',
    physician: '',
    signedDate: ''
  });

  // Initialize plan data from API when clientData is available
  useEffect(() => {
    if (clientData) {
      // Set plan-related fields from API
      const planFields = [
        'enableMarDocumentation',
        'marSchedule',
        'marTimes',
        'requireMarSignature',
        'requirePrnReason'
      ];
      
      planFields.forEach(field => {
        if (clientData[field] !== undefined) {
          formik.setFieldValue(field, clientData[field]);
        }
      });

      // Set care plans from API
      if (clientData.carePlans && Array.isArray(clientData.carePlans)) {
        formik.setFieldValue('carePlans', clientData.carePlans);
      }
    }
  }, [clientData, formik.setFieldValue]);

  const disciplines = [
    'Skilled Nursing',
    'Physical Therapy',
    'Occupational Therapy',
    'Speech Therapy',
    'Medical Social Work',
    'Home Health Aide'
  ];

  const frequencies = [
    '1x/week',
    '2x/week',
    '3x/week',
    'Daily',
    'As Needed',
    '1x/month',
    '2x/month'
  ];

  const handleSaveCarePlan = () => {
    if (editIndex !== null) {
      // Update existing care plan
      formik.setFieldValue(`carePlans.${editIndex}`, {
        ...newCarePlan,
        id: formik.values.carePlans[editIndex].id || Date.now()
      });
    } else {
      // Add new care plan
      formik.setFieldValue('carePlans', [
        ...(formik.values.carePlans || []),
        {
          ...newCarePlan,
          id: Date.now(),
          createdDate: new Date().toISOString(),
          createdBy: 'Current User'
        }
      ]);
    }
    resetModal();
  };

  const handleEditCarePlan = (index) => {
    setEditIndex(index);
    setNewCarePlan({
      discipline: formik.values.carePlans[index].discipline || '',
      frequency: formik.values.carePlans[index].frequency || '',
      startDate: formik.values.carePlans[index].startDate || '',
      endDate: formik.values.carePlans[index].endDate || '',
      goals: formik.values.carePlans[index].goals || '',
      interventions: formik.values.carePlans[index].interventions || '',
      status: formik.values.carePlans[index].status || 'Active',
      physician: formik.values.carePlans[index].physician || '',
      signedDate: formik.values.carePlans[index].signedDate || ''
    });
    setShowCarePlanModal(true);
  };

  const handleModalChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewCarePlan(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? new Date().toISOString() : '') : value
    }));
  };

  const resetModal = () => {
    setShowCarePlanModal(false);
    setEditIndex(null);
    setNewCarePlan({
      discipline: '',
      frequency: '',
      startDate: '',
      endDate: '',
      goals: '',
      interventions: '',
      status: 'Active',
      physician: '',
      signedDate: ''
    });
  };

  return (
    <div className="plan-tab">
      <h3>Plan of Care (485)</h3>
      <p className="text-muted">
        Manage the client's comprehensive care plan and physician orders.
      </p>

      <Row className="mb-4">
        <Col md={6}>
          <Form.Check
            type="switch"
            id="enableMarDocumentation"
            label="Enable MAR Documentation"
            checked={formik.values.enableMarDocumentation || false}
            onChange={() => {
              formik.setFieldValue(
                'enableMarDocumentation',
                !formik.values.enableMarDocumentation
              );
            }}
          />
          {formik.values.enableMarDocumentation && (
            <Button
              variant="outline-primary"
              size="sm"
              className="ms-3"
              onClick={() => setShowMARModal(true)}
            >
              Configure MAR Settings
            </Button>
          )}
        </Col>
        <Col md={6} className="text-end">
          <Button
            variant="primary"
            onClick={() => {
              setEditIndex(null);
              setShowCarePlanModal(true);
            }}
          >
            <FaFileMedical className="me-2" />
            Add Care Plan Item
          </Button>
        </Col>
      </Row>

      <FieldArray name="carePlans">
        {({ remove, push }) => (
          <div className="care-plan-items">
            {(!formik.values.carePlans || formik.values.carePlans.length === 0) ? (
              <div className="alert alert-info">
                No care plan items added yet. Click "Add Care Plan Item" to create one.
              </div>
            ) : (
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Discipline</th>
                    <th>Frequency</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Goals</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {formik.values.carePlans?.map((item, index) => (
                    <tr key={item.id || index}>
                      <td>
                        <Badge bg="info">
                          <FaUserMd className="me-1" />
                          {item.discipline}
                        </Badge>
                      </td>
                      <td>{item.frequency}</td>
                      <td>{item.startDate ? new Date(item.startDate).toLocaleDateString() : 'N/A'}</td>
                      <td>{item.endDate ? new Date(item.endDate).toLocaleDateString() : 'N/A'}</td>
                      <td>
                        {item.goals ? (
                          <>
                            {item.goals.substring(0, 50)}
                            {item.goals.length > 50 ? '...' : ''}
                          </>
                        ) : 'No goals specified'}
                      </td>
                      <td>
                        <Badge
                          bg={
                            item.endDate && new Date(item.endDate) < new Date() ? 'secondary' :
                            item.status === 'Active' ? 'success' :
                            item.status === 'Pending' ? 'warning' :
                            item.status === 'Discontinued' ? 'danger' :
                            'secondary'
                          }
                        >
                          {item.endDate && new Date(item.endDate) < new Date() ? 'Expired' : item.status || 'Unknown'}
                        </Badge>
                      </td>
                      <td className="text-center">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-2"
                          onClick={() => handleEditCarePlan(index)}
                          title="Edit"
                        >
                          ✏️
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => remove(index)}
                          title="Remove"
                        >
                          ×
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </div>
        )}
      </FieldArray>

      <div className="physician-orders mt-4">
        <h5>Physician Orders</h5>
        <div className="border p-3 bg-light">
          {formik.values.carePlans?.some(item => item.signedDate) ? (
            <Table striped bordered>
              <thead>
                <tr>
                  <th>Order Date</th>
                  <th>Signed Date</th>
                  <th>Discipline</th>
                  <th>Physician</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {formik.values.carePlans
                  ?.filter(item => item.signedDate)
                  .map((item, index) => (
                    <tr key={`order-${index}`}>
                      <td>{item.startDate ? new Date(item.startDate).toLocaleDateString() : 'N/A'}</td>
                      <td>{item.signedDate ? new Date(item.signedDate).toLocaleDateString() : 'N/A'}</td>
                      <td>{item.discipline || 'Not specified'}</td>
                      <td>{item.physician || 'Not specified'}</td>
                      <td>
                        <Badge bg={item.signedDate ? 'success' : 'warning'}>
                          {item.signedDate ? 'Signed' : 'Pending'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </Table>
          ) : (
            <div className="text-muted">No physician orders recorded</div>
          )}
        </div>
      </div>

      {/* Care Plan Item Modal */}
      <Modal show={showCarePlanModal} onHide={resetModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editIndex !== null ? 'Edit Care Plan Item' : 'Add Care Plan Item'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Discipline*</Form.Label>
                <Form.Select
                  name="discipline"
                  value={newCarePlan.discipline}
                  onChange={handleModalChange}
                  required
                >
                  <option value="">Select discipline</option>
                  {disciplines.map(discipline => (
                    <option key={discipline} value={discipline}>{discipline}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Frequency*</Form.Label>
                <Form.Select
                  name="frequency"
                  value={newCarePlan.frequency}
                  onChange={handleModalChange}
                  required
                >
                  <option value="">Select frequency</option>
                  {frequencies.map(freq => (
                    <option key={freq} value={freq}>{freq}</option>
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
                  value={newCarePlan.startDate}
                  onChange={handleModalChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="date"
                  name="endDate"
                  min={newCarePlan.startDate}
                  value={newCarePlan.endDate}
                  onChange={handleModalChange}
                />
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-3">
            <Form.Label>Goals*</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="goals"
              value={newCarePlan.goals}
              onChange={handleModalChange}
              placeholder="Describe the goals for this care plan item"
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Interventions</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="interventions"
              value={newCarePlan.interventions}
              onChange={handleModalChange}
              placeholder="Describe specific interventions"
            />
          </Form.Group>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Status*</Form.Label>
                <Form.Select
                  name="status"
                  value={newCarePlan.status}
                  onChange={handleModalChange}
                >
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Discontinued">Discontinued</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Physician</Form.Label>
                <Form.Control
                  type="text"
                  name="physician"
                  value={newCarePlan.physician}
                  onChange={handleModalChange}
                  placeholder="Physician name"
                />
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              label="Physician Signed"
              name="signedDate"
              checked={!!newCarePlan.signedDate}
              onChange={handleModalChange}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={resetModal}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSaveCarePlan}
            disabled={!newCarePlan.discipline || !newCarePlan.frequency || !newCarePlan.startDate || !newCarePlan.goals}
          >
            {editIndex !== null ? 'Update' : 'Add'} Care Plan
          </Button>
        </Modal.Footer>
      </Modal>

      {/* MAR Configuration Modal */}
      <Modal show={showMARModal} onHide={() => setShowMARModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>MAR Documentation Settings</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>MAR Schedule</Form.Label>
            <Form.Select
              name="marSchedule"
              value={formik.values.marSchedule || 'BeforeAfter'}
              onChange={formik.handleChange}
            >
              <option value="BeforeAfter">Before/After Care</option>
              <option value="SpecificTimes">Specific Times</option>
              <option value="PRN">PRN (As Needed)</option>
            </Form.Select>
          </Form.Group>
          {formik.values.marSchedule === 'SpecificTimes' && (
            <Form.Group className="mb-3">
              <Form.Label>Administration Times</Form.Label>
              <Form.Control
                type="text"
                name="marTimes"
                value={formik.values.marTimes || ''}
                onChange={formik.handleChange}
                placeholder="e.g., 08:00, 12:00, 18:00"
              />
              <Form.Text className="text-muted">
                Enter comma-separated times in 24-hour format
              </Form.Text>
            </Form.Group>
          )}
          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              label="Require Staff Signature"
              name="requireMarSignature"
              checked={formik.values.requireMarSignature || false}
              onChange={formik.handleChange}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              label="Require Reason for PRN Medications"
              name="requirePrnReason"
              checked={formik.values.requirePrnReason || false}
              onChange={formik.handleChange}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowMARModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={() => setShowMARModal(false)}>
            Save Settings
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Plan;