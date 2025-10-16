import React, { useState, useEffect } from 'react';
import { useField, FieldArray } from 'formik';
import { Form, Button, Table, Badge, Modal, Alert, Row, Col } from 'react-bootstrap';
import { FaHistory, FaSearch, FaFilter, FaCalendarAlt } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faSave } from '@fortawesome/free-solid-svg-icons';

const Visit = ({ formik, clientData, onSaveTab, isSaved, isSaving }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [serviceTypeFilter, setServiceTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedVisit, setSelectedVisit] = useState(null);

  // Initialize visit history from API when clientData is available
  useEffect(() => {
    if (clientData && clientData.visitHistory && Array.isArray(clientData.visitHistory)) {
      formik.setFieldValue('visitHistory', clientData.visitHistory);
    }
  }, [clientData, formik.setFieldValue]);

  // Extract unique service types from visits
  const serviceTypes = [
    ...new Set(
      formik.values.visitHistory?.map(visit => visit.serviceType).filter(Boolean)
    )
  ];

  const statusTypes = [
    'Completed',
    'Missed',
    'Cancelled',
    'In Progress',
    'No Show'
  ];

  const filteredVisits = formik.values.visitHistory?.filter(visit => {
    // Search term filter
    const matchesSearch =
      visit.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.caregiverName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.serviceType?.toLowerCase().includes(searchTerm.toLowerCase());

    // Date range filter
    const visitDate = new Date(visit.visitDate);
    const matchesDateRange = (
      (!dateRange.start || visitDate >= new Date(dateRange.start)) &&
      (!dateRange.end || visitDate <= new Date(dateRange.end)));

    // Service type filter
    const matchesServiceType =
      serviceTypeFilter === 'All' || visit.serviceType === serviceTypeFilter;

    // Status filter
    const matchesStatus =
      statusFilter === 'All' || visit.status === statusFilter;

    return matchesSearch && matchesDateRange && matchesServiceType && matchesStatus;
  }) || [];

  const calculateDuration = (start, end) => {
    if (!start || !end) return 'N/A';
    const startTime = new Date(start);
    const endTime = new Date(end);
    const diffMs = endTime - startTime;
    const diffMins = Math.round(diffMs / 60000);
    return `${diffMins} minutes`;
  };

  const resetFilters = () => {
    setSearchTerm('');
    setDateRange({ start: '', end: '' });
    setServiceTypeFilter('All');
    setStatusFilter('All');
  };

  return (
    <div className="visit-tab">
      <p className="text-muted">
        Track all completed and scheduled visits for the client.
      </p>

      <Row className="mb-3">
        <Col md={6}>
          <div className="input-group">
            <span className="input-group-text">
              <FaSearch />
            </span>
            <Form.Control
              type="text"
              placeholder="Search visits..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button
              variant={showFilters ? 'primary' : 'outline-secondary'}
              onClick={() => setShowFilters(!showFilters)}
            >
              <FaFilter className="me-1" />
              Filters
            </Button>
          </div>
        </Col>
        <Col md={6} className="text-end">
          <Badge bg="info" className="me-2">
            Total: {formik.values.visitHistory?.length || 0}
          </Badge>
          <Badge bg="success" className="me-2">
            Completed: {formik.values.visitHistory?.filter(v => v.status === 'Completed').length || 0}
          </Badge>
          <Badge bg="danger">
            Missed: {formik.values.visitHistory?.filter(v => v.status === 'Missed').length || 0}
          </Badge>
        </Col>
      </Row>

      {showFilters && (
        <div className="filters-panel mb-3 p-3 bg-light border rounded">
          <Row>
            <Col md={3}>
              <Form.Group>
                <Form.Label>From Date</Form.Label>
                <Form.Control
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>To Date</Form.Label>
                <Form.Control
                  type="date"
                  value={dateRange.end}
                  min={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Service Type</Form.Label>
                <Form.Select
                  value={serviceTypeFilter}
                  onChange={(e) => setServiceTypeFilter(e.target.value)}
                >
                  <option value="All">All Services</option>
                  {serviceTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  {statusTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          <div className="text-end mt-2">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={resetFilters}
            >
              Reset Filters
            </Button>
          </div>
        </div>
      )}

      {formik.values.visitHistory?.length === 0 ? (
        <Alert variant="info">
          No visit history recorded yet.
        </Alert>
      ) : filteredVisits.length === 0 ? (
        <Alert variant="info">
          No visits match your current filters.
        </Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Date</th>
              <th>Service Type</th>
              <th>Caregiver</th>
              <th>Duration</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVisits.map((visit, index) => (
              <tr key={visit.id || index}>
                <td>
                  {new Date(visit.visitDate).toLocaleDateString()}
                  <div className="small text-muted">
                    {visit.startTime && new Date(visit.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {visit.endTime && ` - ${new Date(visit.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                  </div>
                </td>
                <td>{visit.serviceType}</td>
                <td>{visit.caregiverName || 'Not assigned'}</td>
                <td>{calculateDuration(visit.startTime, visit.endTime)}</td>
                <td>
                  <Badge
                    bg={
                      visit.status === 'Completed' ? 'success' :
                        visit.status === 'Missed' ? 'danger' :
                          visit.status === 'Cancelled' ? 'secondary' :
                            visit.status === 'In Progress' ? 'primary' :
                              'warning'
                    }
                  >
                    {visit.status}
                  </Badge>
                </td>
                <td className="text-center">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => setSelectedVisit(visit)}
                  >
                    Details
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Visit Details Modal */}
      <Modal show={selectedVisit !== null} onHide={() => setSelectedVisit(null)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            Visit Details - {selectedVisit && new Date(selectedVisit.visitDate).toLocaleDateString()}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedVisit && (
            <div>
              <Row className="mb-3">
                <Col md={4}>
                  <div className="detail-item">
                    <div className="detail-label">Service Type</div>
                    <div className="detail-value">{selectedVisit.serviceType}</div>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="detail-item">
                    <div className="detail-label">Caregiver</div>
                    <div className="detail-value">{selectedVisit.caregiverName || 'Not specified'}</div>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="detail-item">
                    <div className="detail-label">Status</div>
                    <div className="detail-value">
                      <Badge
                        bg={
                          selectedVisit.status === 'Completed' ? 'success' :
                            selectedVisit.status === 'Missed' ? 'danger' :
                              selectedVisit.status === 'Cancelled' ? 'secondary' :
                                selectedVisit.status === 'In Progress' ? 'primary' :
                                  'warning'
                        }
                      >
                        {selectedVisit.status}
                      </Badge>
                    </div>
                  </div>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={4}>
                  <div className="detail-item">
                    <div className="detail-label">Scheduled Date</div>
                    <div className="detail-value">
                      {new Date(selectedVisit.visitDate).toLocaleDateString()}
                    </div>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="detail-item">
                    <div className="detail-label">Actual Time</div>
                    <div className="detail-value">
                      {selectedVisit.startTime ? (
                        <>
                          {new Date(selectedVisit.startTime).toLocaleTimeString()}
                          {selectedVisit.endTime && ` - ${new Date(selectedVisit.endTime).toLocaleTimeString()}`}
                        </>
                      ) : 'N/A'}
                    </div>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="detail-item">
                    <div className="detail-label">Duration</div>
                    <div className="detail-value">
                      {calculateDuration(selectedVisit.startTime, selectedVisit.endTime)}
                    </div>
                  </div>
                </Col>
              </Row>

              <div className="detail-item mb-3">
                <div className="detail-label">Service Tasks</div>
                <div className="detail-value">
                  {selectedVisit.tasks?.length > 0 ? (
                    <ul>
                      {selectedVisit.tasks.map((task, i) => (
                        <li key={i}>
                          {task.completed ? '✓' : '○'} {task.description}
                        </li>
                      ))}
                    </ul>
                  ) : 'No tasks recorded'}
                </div>
              </div>

              <div className="detail-item mb-3">
                <div className="detail-label">Notes</div>
                <div className="detail-value" style={{ whiteSpace: 'pre-wrap' }}>
                  {selectedVisit.notes || 'No notes recorded'}
                </div>
              </div>

              {selectedVisit.status === 'Completed' && (
                <div className="detail-item mb-3">
                  <div className="detail-label">Outcomes</div>
                  <div className="detail-value" style={{ whiteSpace: 'pre-wrap' }}>
                    {selectedVisit.outcomes || 'No outcomes recorded'}
                  </div>
                </div>
              )}

              {selectedVisit.status === 'Missed' || selectedVisit.status === 'Cancelled' ? (
                <div className="detail-item mb-3">
                  <div className="detail-label">Reason</div>
                  <div className="detail-value">
                    {selectedVisit.reason || 'No reason specified'}
                  </div>
                </div>
              ) : null}

              <div className="detail-item">
                <div className="detail-label">Documents</div>
                <div className="detail-value">
                  {selectedVisit.documents?.length > 0 ? (
                    <ul>
                      {selectedVisit.documents.map((doc, i) => (
                        <li key={i}>
                          <a href={doc.url} target="_blank" rel="noopener noreferrer">
                            {doc.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : 'No documents attached'}
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setSelectedVisit(null)}>
            Close
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

export default Visit;