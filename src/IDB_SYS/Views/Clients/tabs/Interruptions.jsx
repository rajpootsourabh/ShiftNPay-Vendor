import React, { useEffect } from 'react';
import { useField, FieldArray } from 'formik';
import { Form, Row, Col, Button, Table, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faSave } from '@fortawesome/free-solid-svg-icons';

const Interruptions = ({ formik, clientData, onSaveTab, isSaved, isSaving }) => {
  // Initialize interruptions from API when clientData is available
  useEffect(() => {
    if (clientData && clientData.interruptions && Array.isArray(clientData.interruptions)) {
      formik.setFieldValue('interruptions', clientData.interruptions);
    }
  }, [clientData, formik.setFieldValue]);

  // Calculate duration of interruptions
  const calculateDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return '0 days';
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  };

  return (
    <div className="interruptions-tab">

      <h3>Interruptions of Service</h3>
      <p className="text-muted">
        Record any periods where services were paused or interrupted.
      </p>

      <FieldArray name="interruptions">
        {({ push, remove, form }) => (
          <div className="interruptions-section">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5>Service Interruptions</h5>
              <Button
                variant="primary"
                size="sm"
                onClick={() => push({
                  startDate: '',
                  endDate: '',
                  type: 'voluntary',
                  reason: '',
                  authorizationNumber: '',
                  notes: '',
                  status: 'pending'
                })}
              >
                Add Interruption
              </Button>
            </div>

            {(!form.values.interruptions || form.values.interruptions.length === 0) ? (
              <div className="alert alert-info">
                No service interruptions recorded.
              </div>
            ) : (
              <Table striped bordered hover responsive className="mt-3">
                <thead>
                  <tr>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Duration</th>
                    <th>Type</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {form.values.interruptions?.map((interruption, index) => (
                    <tr key={index}>
                      <td>
                        <Form.Control
                          type="date"
                          name={`interruptions.${index}.startDate`}
                          value={interruption.startDate || ''}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          isInvalid={
                            formik.touched.interruptions?.[index]?.startDate &&
                            formik.errors.interruptions?.[index]?.startDate
                          }
                        />
                        <Form.Control.Feedback type="invalid">
                          {formik.errors.interruptions?.[index]?.startDate}
                        </Form.Control.Feedback>
                      </td>
                      <td>
                        <Form.Control
                          type="date"
                          name={`interruptions.${index}.endDate`}
                          value={interruption.endDate || ''}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          isInvalid={
                            formik.touched.interruptions?.[index]?.endDate &&
                            formik.errors.interruptions?.[index]?.endDate
                          }
                          min={interruption.startDate}
                        />
                        <Form.Control.Feedback type="invalid">
                          {formik.errors.interruptions?.[index]?.endDate}
                        </Form.Control.Feedback>
                      </td>
                      <td>
                        {calculateDuration(interruption.startDate, interruption.endDate)}
                      </td>
                      <td>
                        <Form.Select
                          name={`interruptions.${index}.type`}
                          value={interruption.type || 'voluntary'}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          isInvalid={
                            formik.touched.interruptions?.[index]?.type &&
                            formik.errors.interruptions?.[index]?.type
                          }
                        >
                          <option value="voluntary">Voluntary</option>
                          <option value="hospitalization">Hospitalization</option>
                          <option value="administrative">Administrative</option>
                          <option value="emergency">Emergency</option>
                          <option value="other">Other</option>
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                          {formik.errors.interruptions?.[index]?.type}
                        </Form.Control.Feedback>
                      </td>
                      <td>
                        <Form.Control
                          as="textarea"
                          rows={2}
                          name={`interruptions.${index}.reason`}
                          value={interruption.reason || ''}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          placeholder="Reason for interruption"
                          isInvalid={
                            formik.touched.interruptions?.[index]?.reason &&
                            formik.errors.interruptions?.[index]?.reason
                          }
                          style={{ minHeight: '80px', resize: 'none' }}
                          className="reason-textarea"
                        />
                        <Form.Control.Feedback type="invalid">
                          {formik.errors.interruptions?.[index]?.reason}
                        </Form.Control.Feedback>
                      </td>
                      <td>
                        <Form.Select
                          name={`interruptions.${index}.status`}
                          value={interruption.status || 'pending'}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          isInvalid={
                            formik.touched.interruptions?.[index]?.status &&
                            formik.errors.interruptions?.[index]?.status
                          }
                        >
                          <option value="pending">Pending Approval</option>
                          <option value="approved">Approved</option>
                          <option value="denied">Denied</option>
                          <option value="completed">Completed</option>
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                          {formik.errors.interruptions?.[index]?.status}
                        </Form.Control.Feedback>
                      </td>
                      <td className="text-center">
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => remove(index)}
                          title="Remove interruption"
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

      <div className="current-status mt-4 p-3 bg-light border rounded">
        <h5>Current Service Status</h5>
        {formik.values.interruptions?.some(i =>
          i.status !== 'completed' &&
          new Date(i.endDate) >= new Date()
        ) ? (
          <div>
            <Badge bg="warning" className="mb-2">
              Service Interrupted
            </Badge>
            <ul className="mt-2">
              {formik.values.interruptions
                .filter(i => i.status !== 'completed' && new Date(i.endDate) >= new Date())
                .map((interruption, index) => (
                  <li key={index}>
                    {interruption.type} interruption until {interruption.endDate}
                    {interruption.reason && ` (${interruption.reason})`}
                  </li>
                ))}
            </ul>
          </div>
        ) : (
          <Badge bg="success">Services Active</Badge>
        )}
      </div>

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

export default Interruptions;