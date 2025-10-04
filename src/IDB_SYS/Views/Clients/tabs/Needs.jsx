import React, { useState, useEffect } from 'react';
import { useField, FieldArray } from 'formik';
import { Form, Row, Col, Button, Table, Badge, Modal, Accordion } from 'react-bootstrap';

const Needs = ({ formik, clientData }) => {
  const [showMasterList, setShowMasterList] = useState(false);
  const [selectedNeed, setSelectedNeed] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Initialize needs data from API when clientData is available
  useEffect(() => {
    if (clientData) {
      // Set assigned needs from API
      if (clientData.assignedNeeds && Array.isArray(clientData.assignedNeeds)) {
        formik.setFieldValue('assignedNeeds', clientData.assignedNeeds);
      }
      
      // Set master list from API if available, otherwise use sample data
      if (clientData.needsMasterList && Array.isArray(clientData.needsMasterList)) {
        formik.setFieldValue('needsMasterList', clientData.needsMasterList);
      }
    }
  }, [clientData, formik.setFieldValue]);

  // Sample master list of needs (would typically come from API)
  const needsMasterList = clientData?.needsMasterList || [
    { id: 1, category: 'Personal Care', description: 'Assistance with bathing', frequency: 'Daily' },
    { id: 2, category: 'Personal Care', description: 'Hair care', frequency: 'Weekly' },
    { id: 3, category: 'Mobility', description: 'Transfer assistance', frequency: 'As needed' },
    { id: 4, category: 'Nutrition', description: 'Meal preparation', frequency: 'Daily' },
    { id: 5, category: 'Medical', description: 'Medication reminder', frequency: 'Daily' },
    { id: 6, category: 'Household', description: 'Light housekeeping', frequency: 'Weekly' },
  ];

  const filteredMasterList = needsMasterList.filter(need =>
    need.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    need.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddNeed = (need) => {
    if (!formik.values.assignedNeeds.some(n => n.id === need.id)) {
      formik.setFieldValue('assignedNeeds', [
        ...formik.values.assignedNeeds,
        {
          ...need,
          startDate: need.startDate || new Date().toISOString().split('T')[0],
          endDate: need.endDate || '',
          notes: need.notes || '',
          priority: need.priority || 'Medium',
          status: need.status || 'Active'
        }
      ]);
    }
    setShowMasterList(false);
  };

  return (
    <div className="needs-tab">
      <h3>Client Needs Assessment</h3>
      <p className="text-muted">
        Document and manage the client's care requirements and service needs.
      </p>

      <Row className="mb-4">
        <Col md={6}>
          <Button
            variant="primary"
            onClick={() => setShowMasterList(true)}
          >
            Add From Master List
          </Button>
          <Button
            variant="outline-primary"
            className="ms-2"
            onClick={() => {
              formik.setFieldValue('assignedNeeds', [
                ...formik.values.assignedNeeds,
                {
                  id: Date.now(),
                  category: '',
                  description: '',
                  frequency: '',
                  startDate: new Date().toISOString().split('T')[0],
                  endDate: '',
                  notes: '',
                  priority: 'Medium',
                  status: 'Active'
                }
              ]);
            }}
          >
            Add Custom Need
          </Button>
        </Col>
        <Col md={6} className="text-end">
          <Badge bg="info" className="me-2">
            Active: {formik.values.assignedNeeds?.filter(n => n.status === 'Active').length || 0}
          </Badge>
          <Badge bg="secondary">
            Inactive: {formik.values.assignedNeeds?.filter(n => n.status !== 'Active').length || 0}
          </Badge>
        </Col>
      </Row>

      <FieldArray name="assignedNeeds">
        {({ remove }) => (
          <Accordion defaultActiveKey="0" alwaysOpen>
            {(!formik.values.assignedNeeds || formik.values.assignedNeeds.length === 0) ? (
              <div className="alert alert-info">
                No needs added yet. Add needs from the master list or create custom ones.
              </div>
            ) : (
              formik.values.assignedNeeds?.map((need, index) => (
                <Accordion.Item key={index} eventKey={index.toString()}>
                  <Accordion.Header>
                    <div className="d-flex w-100 align-items-center">
                      <div className="flex-grow-1">
                        <span className="fw-bold me-2">{need.description || 'New Need'}</span>
                        <Badge bg={need.status === 'Active' ? 'success' : 'secondary'} className="me-2">
                          {need.status}
                        </Badge>
                        <Badge bg={
                          need.priority === 'High' ? 'danger' :
                          need.priority === 'Medium' ? 'warning' :
                          'primary'
                        }>
                          {need.priority}
                        </Badge>
                      </div>
                      <div>
                        {need.frequency && <span className="text-muted me-3">{need.frequency}</span>}
                      </div>
                    </div>
                  </Accordion.Header>
                  <Accordion.Body>
                    <Row>
                      <Col md={4}>
                        <Form.Group controlId={`assignedNeeds.${index}.description`} className="mb-3">
                          <Form.Label>Description*</Form.Label>
                          <Form.Control
                            type="text"
                            name={`assignedNeeds.${index}.description`}
                            value={need.description || ''}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            isInvalid={
                              formik.touched.assignedNeeds?.[index]?.description &&
                              formik.errors.assignedNeeds?.[index]?.description
                            }
                          />
                          <Form.Control.Feedback type="invalid">
                            {formik.errors.assignedNeeds?.[index]?.description}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group controlId={`assignedNeeds.${index}.category`} className="mb-3">
                          <Form.Label>Category</Form.Label>
                          <Form.Control
                            type="text"
                            name={`assignedNeeds.${index}.category`}
                            value={need.category || ''}
                            onChange={formik.handleChange}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group controlId={`assignedNeeds.${index}.frequency`} className="mb-3">
                          <Form.Label>Frequency</Form.Label>
                          <Form.Control
                            type="text"
                            name={`assignedNeeds.${index}.frequency`}
                            value={need.frequency || ''}
                            onChange={formik.handleChange}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={3}>
                        <Form.Group controlId={`assignedNeeds.${index}.startDate`} className="mb-3">
                          <Form.Label>Start Date*</Form.Label>
                          <Form.Control
                            type="date"
                            name={`assignedNeeds.${index}.startDate`}
                            value={need.startDate || ''}
                            onChange={formik.handleChange}
                            isInvalid={
                              formik.touched.assignedNeeds?.[index]?.startDate &&
                              formik.errors.assignedNeeds?.[index]?.startDate
                            }
                          />
                          <Form.Control.Feedback type="invalid">
                            {formik.errors.assignedNeeds?.[index]?.startDate}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group controlId={`assignedNeeds.${index}.endDate`} className="mb-3">
                          <Form.Label>End Date</Form.Label>
                          <Form.Control
                            type="date"
                            name={`assignedNeeds.${index}.endDate`}
                            value={need.endDate || ''}
                            onChange={formik.handleChange}
                            min={need.startDate}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group controlId={`assignedNeeds.${index}.priority`} className="mb-3">
                          <Form.Label>Priority*</Form.Label>
                          <Form.Select
                            name={`assignedNeeds.${index}.priority`}
                            value={need.priority || 'Medium'}
                            onChange={formik.handleChange}
                            isInvalid={
                              formik.touched.assignedNeeds?.[index]?.priority &&
                              formik.errors.assignedNeeds?.[index]?.priority
                            }
                          >
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                          </Form.Select>
                          <Form.Control.Feedback type="invalid">
                            {formik.errors.assignedNeeds?.[index]?.priority}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group controlId={`assignedNeeds.${index}.status`} className="mb-3">
                          <Form.Label>Status*</Form.Label>
                          <Form.Select
                            name={`assignedNeeds.${index}.status`}
                            value={need.status || 'Active'}
                            onChange={formik.handleChange}
                          >
                            <option value="Active">Active</option>
                            <option value="On Hold">On Hold</option>
                            <option value="Completed">Completed</option>
                            <option value="Discontinued">Discontinued</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>
                    <Form.Group controlId={`assignedNeeds.${index}.notes`} className="mb-3">
                      <Form.Label>Notes</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        name={`assignedNeeds.${index}.notes`}
                        value={need.notes || ''}
                        onChange={formik.handleChange}
                      />
                    </Form.Group>
                    <div className="text-end">
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => remove(index)}
                      >
                        Remove Need
                      </Button>
                    </div>
                  </Accordion.Body>
                </Accordion.Item>
              ))
            )}
          </Accordion>
        )}
      </FieldArray>

      {/* Master List Modal */}
      <Modal show={showMasterList} onHide={() => setShowMasterList(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Select Needs from Master List</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="searchNeeds" className="mb-3">
            <Form.Control
              type="text"
              placeholder="Search needs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Form.Group>
          <Table striped hover>
            <thead>
              <tr>
                <th>Category</th>
                <th>Description</th>
                <th>Frequency</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredMasterList.map((need) => (
                <tr key={need.id}>
                  <td>{need.category}</td>
                  <td>{need.description}</td>
                  <td>{need.frequency}</td>
                  <td>
                    <Button
                      variant={formik.values.assignedNeeds?.some(n => n.id === need.id) ? 'success' : 'primary'}
                      size="sm"
                      onClick={() => handleAddNeed(need)}
                      disabled={formik.values.assignedNeeds?.some(n => n.id === need.id)}
                    >
                      {formik.values.assignedNeeds?.some(n => n.id === need.id) ? 'Added' : 'Add'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowMasterList(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Needs;