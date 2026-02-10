import React, { useState, useEffect } from 'react';
import { useField, FieldArray } from 'formik';
import { Form, Button, Table, Badge, Modal, Alert, Row, Col } from 'react-bootstrap';
import { FaBell, FaCalendarCheck, FaExclamationTriangle } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faSave } from '@fortawesome/free-solid-svg-icons';

const Reminders = ({ formik, clientData, onSaveTab, isSaved, isSaving }) => {
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [newReminder, setNewReminder] = useState({
    type: '',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '00:00',
    priority: 'medium',
    description: '',
    notes: ''
  });

  // Initialize reminders from API when clientData is available
  useEffect(() => {
    if (clientData && clientData.reminders && Array.isArray(clientData.reminders)) {
      formik.setFieldValue('reminders', clientData.reminders);
    }
  }, [clientData, formik.setFieldValue]);

  const reminderTypes = [
    'Medication',
    'Appointment',
    'Assessment',
    'Follow-up',
    'Documentation',
    'Payment',
    'Other'
  ];

  const priorityLevels = [
    { value: 'high', label: 'High', variant: 'danger' },
    { value: 'medium', label: 'Medium', variant: 'warning' },
    { value: 'low', label: 'Low', variant: 'primary' }
  ];

  const handleSaveReminder = () => {
    const dueDateTime = `${newReminder.dueDate}T${newReminder.dueTime}:00`;

    // Get existing completedDate - use null instead of empty string for optional date fields
    const existingCompletedDate = editIndex !== null 
      ? formik.values.reminders[editIndex].completedDate 
      : null;

    const reminderData = {
      ...newReminder,
      dueDate: dueDateTime,
      id: editIndex !== null ? formik.values.reminders[editIndex].id : Date.now(),
      createdDate: editIndex !== null ? formik.values.reminders[editIndex].createdDate : new Date().toISOString(),
      createdBy: editIndex !== null ? formik.values.reminders[editIndex].createdBy : 'Current User',
      completed: editIndex !== null ? formik.values.reminders[editIndex].completed : false,
      // Use null for empty/undefined completedDate to avoid MongoDB validation errors
      completedDate: existingCompletedDate || null
    };

    if (editIndex !== null) {
      // Update existing reminder
      formik.setFieldValue(`reminders.${editIndex}`, reminderData);
    } else {
      // Add new reminder
      formik.setFieldValue('reminders', [
        ...(formik.values.reminders || []),
        reminderData
      ]);
    }

    setShowModal(false);
    setEditIndex(null);
    setNewReminder({
      type: '',
      dueDate: new Date().toISOString().split('T')[0],
      dueTime: '00:00',
      priority: 'medium',
      description: '',
      notes: ''
    });
  };

  const handleCompleteReminder = (index) => {
    formik.setFieldValue(`reminders.${index}.completed`, true);
    formik.setFieldValue(`reminders.${index}.completedDate`, new Date().toISOString());
  };

  const handleModalShow = (index = null) => {
    if (index !== null) {
      const reminder = formik.values.reminders[index];
      const [datePart, timePart] = reminder.dueDate.split('T');
      setNewReminder({
        type: reminder.type || '',
        dueDate: datePart || new Date().toISOString().split('T')[0],
        dueTime: timePart ? timePart.substring(0, 5) : '00:00',
        priority: reminder.priority || 'medium',
        description: reminder.description || '',
        notes: reminder.notes || ''
      });
      setEditIndex(index);
    } else {
      setNewReminder({
        type: '',
        dueDate: new Date().toISOString().split('T')[0],
        dueTime: '00:00',
        priority: 'medium',
        description: '',
        notes: ''
      });
      setEditIndex(null);
    }
    setShowModal(true);
  };

  const activeReminders = formik.values.reminders?.filter(r => !r.completed) || [];
  const completedReminders = formik.values.reminders?.filter(r => r.completed) || [];

  return (
    <div className="reminders-tab">

      <p className="text-muted">
        Set and manage important reminders for client care and follow-ups.
      </p>

      <div className="mb-4">
        <Button
          variant="primary"
          onClick={() => handleModalShow()}
        >
          <FaBell className="me-2" />
          Add New Reminder
        </Button>
      </div>

      {(!formik.values.reminders || formik.values.reminders.length === 0) && (
        <Alert variant="info">
          No reminders set up yet. Add reminders to stay on top of important client care tasks.
        </Alert>
      )}

      {activeReminders.length > 0 && (
        <div className="active-reminders mb-4">
          <h5>
            <FaExclamationTriangle className="text-warning me-2" />
            Active Reminders ({activeReminders.length})
          </h5>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Type</th>
                <th>Due Date</th>
                <th>Description</th>
                <th>Priority</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeReminders.map((reminder, index) => {
                const originalIndex = formik.values.reminders.findIndex(r => r.id === reminder.id);
                return (
                  <tr key={reminder.id || index}>
                    <td>
                      <Badge bg="info">
                        {reminder.type}
                      </Badge>
                    </td>
                    <td className={reminder.dueDate && new Date(reminder.dueDate) < new Date() ? 'text-danger fw-bold' : ''}>
                      {reminder.dueDate ? new Date(reminder.dueDate).toLocaleDateString() : 'No date'}
                      {reminder.dueDate && new Date(reminder.dueDate) < new Date() && ' (Overdue)'}
                    </td>
                    <td>{reminder.description}</td>
                    <td>
                      <Badge bg={priorityLevels.find(p => p.value === reminder.priority)?.variant || 'secondary'}>
                        {priorityLevels.find(p => p.value === reminder.priority)?.label || 'Unknown'}
                      </Badge>
                    </td>
                    <td className="text-center">
                      <Button
                        variant="outline-success"
                        size="sm"
                        className="me-2"
                        onClick={() => handleCompleteReminder(originalIndex)}
                        title="Mark Complete"
                      >
                        ✓
                      </Button>
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
        </div>
      )}

      {completedReminders.length > 0 && (
        <div className="completed-reminders">
          <h5>
            <FaCalendarCheck className="text-success me-2" />
            Completed Reminders ({completedReminders.length})
          </h5>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Type</th>
                <th>Due Date</th>
                <th>Completed Date</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {completedReminders.map((reminder, index) => {
                const originalIndex = formik.values.reminders.findIndex(r => r.id === reminder.id);
                return (
                  <tr key={reminder.id || index} className="text-muted">
                    <td>
                      <Badge bg="secondary">
                        {reminder.type}
                      </Badge>
                    </td>
                    <td>{reminder.dueDate ? new Date(reminder.dueDate).toLocaleDateString() : 'No date'}</td>
                    <td>{reminder.completedDate ? new Date(reminder.completedDate).toLocaleDateString() : 'Unknown'}</td>
                    <td>{reminder.description}</td>
                    <td className="text-center">
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
        </div>
      )}

      {/* Add/Edit Reminder Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editIndex !== null ? 'Edit Reminder' : 'Add New Reminder'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Reminder Type*</Form.Label>
            <Form.Select
              name="type"
              value={newReminder.type}
              onChange={(e) => setNewReminder({ ...newReminder, type: e.target.value })}
            >
              <option value="">Select type</option>
              {reminderTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Due Date/Time*</Form.Label>
            <Row>
              <Col md={8}>
                <Form.Control
                  type="date"
                  name="dueDate"
                  value={newReminder.dueDate}
                  onChange={(e) => setNewReminder({ ...newReminder, dueDate: e.target.value })}
                />
              </Col>
              <Col md={4}>
                <Form.Control
                  type="time"
                  name="dueTime"
                  value={newReminder.dueTime}
                  onChange={(e) => setNewReminder({ ...newReminder, dueTime: e.target.value })}
                />
              </Col>
            </Row>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Priority*</Form.Label>
            <Form.Select
              name="priority"
              value={newReminder.priority}
              onChange={(e) => setNewReminder({ ...newReminder, priority: e.target.value })}
            >
              {priorityLevels.map(level => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description*</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={newReminder.description}
              onChange={(e) => setNewReminder({ ...newReminder, description: e.target.value })}
              placeholder="Enter reminder details..."
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Notes</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="notes"
              value={newReminder.notes}
              onChange={(e) => setNewReminder({ ...newReminder, notes: e.target.value })}
              placeholder="Additional notes (optional)"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveReminder}
            disabled={!newReminder.type || !newReminder.description || !newReminder.dueDate}
          >
            {editIndex !== null ? 'Update' : 'Add'} Reminder
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={deleteIndex !== null} onHide={() => setDeleteIndex(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this reminder?
          {deleteIndex !== null && formik.values.reminders[deleteIndex] && (
            <div className="mt-3 p-2 bg-light border rounded">
              <strong>Type:</strong> {formik.values.reminders[deleteIndex].type || 'Unknown'}<br />
              <strong>Due:</strong> {formik.values.reminders[deleteIndex].dueDate ? new Date(formik.values.reminders[deleteIndex].dueDate).toLocaleString() : 'No date'}<br />
              <strong>Description:</strong> {formik.values.reminders[deleteIndex].description || 'No description'}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDeleteIndex(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              if (deleteIndex !== null) {
                formik.setFieldValue(
                  'reminders',
                  formik.values.reminders.filter((_, idx) => idx !== deleteIndex)
                );
                setDeleteIndex(null);
              }
            }}
          >
            Delete Reminder
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

export default Reminders;