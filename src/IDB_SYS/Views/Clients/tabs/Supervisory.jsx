import React, { useState } from 'react';
import { Form, Button, Table, Badge, Modal, Alert, Row, Col } from 'react-bootstrap';
import { FaUserMd, FaCalendarPlus, FaFileSignature } from 'react-icons/fa';

const Supervisory = ({ formik }) => {
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [newVisit, setNewVisit] = useState({
    visitType: '',
    status: 'scheduled',
    visitDate: new Date().toISOString().substring(0, 16),
    supervisorName: '',
    duration: 30,
    location: '',
    purpose: '',
    notes: '',
    requireFollowUp: false,
    followUpActions: '',
    completedDate: '',
    findings: ''
  });

  const visitTypes = [
    'Skilled Nurse Supervision',
    'Therapy Supervision',
    'Clinical Director Visit',
    'Quality Assurance Visit',
    'Administrative Review'
  ];

  const statusOptions = [
    { value: 'scheduled', label: 'Scheduled', variant: 'info' },
    { value: 'completed', label: 'Completed', variant: 'success' },
    { value: 'missed', label: 'Missed', variant: 'danger' },
    { value: 'rescheduled', label: 'Rescheduled', variant: 'warning' }
  ];

  const handleSaveVisit = () => {
    const visitData = {
      ...newVisit,
      id: editIndex !== null ? formik.values.supervisoryVisits[editIndex].id : Date.now(),
      enteredDate: new Date().toISOString(),
      enteredBy: 'Current User',
      visitDate: `${newVisit.visitDate}:00Z`
    };

    if (editIndex !== null) {
      // Update existing visit
      formik.setFieldValue(`supervisoryVisits.${editIndex}`, visitData);
    } else {
      // Add new visit
      formik.setFieldValue('supervisoryVisits', [
        ...(formik.values.supervisoryVisits || []),
        visitData
      ]);
    }
    
    setShowModal(false);
    setEditIndex(null);
    setNewVisit({
      visitType: '',
      status: 'scheduled',
      visitDate: new Date().toISOString().substring(0, 16),
      supervisorName: '',
      duration: 30,
      location: '',
      purpose: '',
      notes: '',
      requireFollowUp: false,
      followUpActions: '',
      completedDate: '',
      findings: ''
    });
  };

  const handleModalShow = (index = null) => {
    if (index !== null) {
      // Editing existing visit
      const visit = formik.values.supervisoryVisits[index];
      setNewVisit({
        ...visit,
        visitDate: visit.visitDate ? visit.visitDate.replace('Z', '').substring(0, 16) : new Date().toISOString().substring(0, 16),
        completedDate: visit.completedDate ? visit.completedDate.replace('Z', '').substring(0, 16) : ''
      });
      setEditIndex(index);
    } else {
      // Adding new visit
      setNewVisit({
        visitType: '',
        status: 'scheduled',
        visitDate: new Date().toISOString().substring(0, 16),
        supervisorName: '',
        duration: 30,
        location: '',
        purpose: '',
        notes: '',
        requireFollowUp: false,
        followUpActions: '',
        completedDate: '',
        findings: ''
      });
      setEditIndex(null);
    }
    setShowModal(true);
  };

  const filteredVisits = formik.values.supervisoryVisits?.filter(visit => 
    showCompleted || visit.status !== 'completed'
  ) || [];

  const upcomingVisits = formik.values.supervisoryVisits?.filter(
    visit => visit.status === 'scheduled' && new Date(visit.visitDate) >= new Date()
  ).length || 0;

  const overdueVisits = formik.values.supervisoryVisits?.filter(
    visit => visit.status === 'scheduled' && new Date(visit.visitDate) < new Date()
  ).length || 0;
  return (
    <div className="supervisory-tab">
      <h3>Supervisory Visits</h3>
      <p className="text-muted">
        Track clinical supervision and oversight visits for quality care assurance.
      </p>

      <Row className="mb-4 align-items-center">
        <Col md={6}>
          <Button
            variant="primary"
            onClick={() => {
              setEditIndex(null);
              setShowModal(true);
            }}
          >
            <FaCalendarPlus className="me-2" />
            Schedule Visit
          </Button>
          <Form.Check
            type="switch"
            id="showCompletedVisits"
            label="Show Completed Visits"
            checked={showCompleted}
            onChange={() => setShowCompleted(!showCompleted)}
            className="d-inline-block ms-3"
          />
        </Col>
        <Col md={6} className="text-end">
          <Badge bg="info" className="me-2">
            Upcoming: {upcomingVisits}
          </Badge>
          <Badge bg="danger" className="me-2">
            Overdue: {overdueVisits}
          </Badge>
          <Badge bg="secondary">
            Total: {formik.values.supervisoryVisits?.length || 0}
          </Badge>
        </Col>
      </Row>

      {formik.values.supervisoryVisits?.length === 0 ? (
        <Alert variant="info">
          No supervisory visits scheduled. Add visits to ensure proper clinical oversight.
        </Alert>
      ) : filteredVisits.length === 0 ? (
        <Alert variant="info">
          No {showCompleted ? '' : 'pending'} supervisory visits match your criteria.
        </Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Visit Type</th>
              <th>Scheduled Date</th>
              <th>Supervisor</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVisits.map((visit, index) => {
              const originalIndex = formik.values.supervisoryVisits.findIndex(
                v => v.id === visit.id
              );
              const isOverdue = visit.status === 'scheduled' && new Date(visit.visitDate) < new Date();
              
              return (
                <tr key={visit.id} className={isOverdue ? 'table-warning' : ''}>
                  <td>
                    <div className="fw-bold">{visit.visitType}</div>
                    {visit.notes && (
                      <div className="small text-muted">
                        {visit.notes.substring(0, 50)}
                        {visit.notes.length > 50 ? '...' : ''}
                      </div>
                    )}
                  </td>
                  <td>
                    {new Date(visit.visitDate).toLocaleDateString()}
                    {isOverdue && (
                      <Badge bg="danger" className="ms-2">
                        Overdue
                      </Badge>
                    )}
                  </td>
                  <td>{visit.supervisorName || 'Not specified'}</td>
                  <td>
                    <Badge
                      bg={
                        statusOptions.find(s => s.value === visit.status)?.variant ||
                        'secondary'
                      }
                    >
                      {statusOptions.find(s => s.value === visit.status)?.label}
                    </Badge>
                  </td>
                  <td className="text-center">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => {
                        setEditIndex(originalIndex);
                        setShowModal(true);
                      }}
                      title="Edit"
                    >
                      ✏️
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => setDeleteIndex(originalIndex)}
                      title="Delete"
                    >
                      ×
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}

      {/* Supervisory Visit Modal */}
       <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editIndex !== null ? 'Edit Supervisory Visit' : 'Schedule New Visit'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Visit Type*</Form.Label>
                <Form.Select
                  name="visitType"
                  value={newVisit.visitType}
                  onChange={(e) => setNewVisit({...newVisit, visitType: e.target.value})}
                >
                  <option value="">Select visit type</option>
                  {visitTypes.map(type => (
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
                  value={newVisit.status}
                  onChange={(e) => setNewVisit({...newVisit, status: e.target.value})}
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
                <Form.Label>Visit Date*</Form.Label>
                <Form.Control
                  type="datetime-local"
                  name="visitDate"
                  value={newVisit.visitDate}
                  onChange={(e) => setNewVisit({...newVisit, visitDate: e.target.value})}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Supervisor Name*</Form.Label>
                <Form.Control
                  type="text"
                  name="supervisorName"
                  value={newVisit.supervisorName}
                  onChange={(e) => setNewVisit({...newVisit, supervisorName: e.target.value})}
                  placeholder="Enter supervisor's name"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Duration (minutes)</Form.Label>
                <Form.Control
                  type="number"
                  name="duration"
                  min="15"
                  step="15"
                  value={newVisit.duration}
                  onChange={(e) => setNewVisit({...newVisit, duration: parseInt(e.target.value) || 30})}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Visit Location</Form.Label>
                <Form.Select
                  name="location"
                  value={newVisit.location}
                  onChange={(e) => setNewVisit({...newVisit, location: e.target.value})}
                >
                  <option value="">Select location</option>
                  <option value="client_home">Client's Home</option>
                  <option value="office">Office</option>
                  <option value="telehealth">Telehealth</option>
                  <option value="other">Other</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Purpose/Objectives*</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="purpose"
              value={newVisit.purpose}
              onChange={(e) => setNewVisit({...newVisit, purpose: e.target.value})}
              placeholder="Describe the purpose and objectives of this visit..."
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Notes</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="notes"
              value={newVisit.notes}
              onChange={(e) => setNewVisit({...newVisit, notes: e.target.value})}
              placeholder="Any additional notes..."
            />
          </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Completed Date</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="completedDate"
                    value={newVisit.completedDate}
                    onChange={(e) => setNewVisit({...newVisit, completedDate: e.target.value})}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Findings/Outcome</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="findings"
                    value={newVisit.findings}
                    onChange={(e) => setNewVisit({...newVisit, findings: e.target.value})}
                    placeholder="Visit findings and outcomes..."
                  />
                </Form.Group>
              </Col>
            </Row>

          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              label="Require Follow-up"
              name="requireFollowUp"
              checked={newVisit.requireFollowUp}
              onChange={(e) => setNewVisit({...newVisit, requireFollowUp: e.target.checked})}
            />
          </Form.Group>

          {newVisit.requireFollowUp && (
            <Form.Group className="mb-3">
              <Form.Label>Follow-up Actions</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="followUpActions"
                value={newVisit.followUpActions}
                onChange={(e) => setNewVisit({...newVisit, followUpActions: e.target.value})}
                placeholder="Describe required follow-up actions..."
              />
            </Form.Group>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveVisit}
            disabled={
              !newVisit.visitType ||
              !newVisit.visitDate ||
              !newVisit.supervisorName ||
              !newVisit.purpose
            }
          >
            Save Visit
          </Button>
        </Modal.Footer>
      </Modal>
        </div>
      );
    };

    export default Supervisory;