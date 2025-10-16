import React, { useEffect } from 'react';
import { useField, FieldArray } from 'formik';
import { Form, Row, Col, Button, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faSave } from '@fortawesome/free-solid-svg-icons';

const History = ({ formik, clientData, onSaveTab, isSaved, isSaving }) => {
  // Initialize history items from API when clientData is available
  useEffect(() => {
    if (clientData && clientData.historyItems && Array.isArray(clientData.historyItems)) {
      formik.setFieldValue('historyItems', clientData.historyItems);
    }
  }, [clientData, formik.setFieldValue]);

  return (
    <div className="history-tab">

      <h3>Client History</h3>
      <p className="text-muted">
        Record important historical information about the client's care.
      </p>

      <FieldArray name="historyItems">
        {({ push, remove, form }) => (
          <div className="history-section">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5>History Entries</h5>
              <Button
                variant="primary"
                size="sm"
                onClick={() => push({
                  date: '',
                  type: '',
                  description: '',
                  enteredBy: '',
                  isSignificant: false
                })}
              >
                Add History Item
              </Button>
            </div>

            {(!form.values.historyItems || form.values.historyItems.length === 0) ? (
              <div className="alert alert-info">
                No history entries yet. Click "Add History Item" to create one.
              </div>
            ) : (
              <Table striped bordered hover className="mt-3">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Entered By</th>
                    <th>Significant</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {form.values.historyItems?.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <Form.Control
                          type="date"
                          value={item.date || ''}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          name={`historyItems.${index}.date`}
                          isInvalid={
                            formik.touched.historyItems?.[index]?.date &&
                            formik.errors.historyItems?.[index]?.date
                          }
                        />
                        <Form.Control.Feedback type="invalid">
                          {formik.errors.historyItems?.[index]?.date}
                        </Form.Control.Feedback>
                      </td>
                      <td>
                        <Form.Select
                          value={item.type || ''}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          name={`historyItems.${index}.type`}
                          isInvalid={
                            formik.touched.historyItems?.[index]?.type &&
                            formik.errors.historyItems?.[index]?.type
                          }
                        >
                          <option value="">Select type</option>
                          <option value="assessment">Assessment</option>
                          <option value="hospitalization">Hospitalization</option>
                          <option value="medication">Medication Change</option>
                          <option value="condition">Condition Change</option>
                          <option value="other">Other</option>
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                          {formik.errors.historyItems?.[index]?.type}
                        </Form.Control.Feedback>
                      </td>
                      <td>
                        <Form.Control
                          as="textarea"
                          rows={2}
                          value={item.description || ''}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          name={`historyItems.${index}.description`}
                          isInvalid={
                            formik.touched.historyItems?.[index]?.description &&
                            formik.errors.historyItems?.[index]?.description
                          }
                        />
                        <Form.Control.Feedback type="invalid">
                          {formik.errors.historyItems?.[index]?.description}
                        </Form.Control.Feedback>
                      </td>
                      <td>
                        <Form.Control
                          type="text"
                          value={item.enteredBy || ''}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          name={`historyItems.${index}.enteredBy`}
                          placeholder="Staff name"
                        />
                      </td>
                      <td className="text-center">
                        <Form.Check
                          type="checkbox"
                          checked={item.isSignificant || false}
                          onChange={(e) =>
                            formik.setFieldValue(
                              `historyItems.${index}.isSignificant`,
                              e.target.checked
                            )
                          }
                          label=""
                        />
                      </td>
                      <td className="text-center">
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => remove(index)}
                          title="Remove entry"
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

      <div className="mt-4">
        <h5>Significant Event Log</h5>
        <div className="significant-events border p-3 bg-light">
          {formik.values.historyItems
            ?.filter(item => item.isSignificant)
            .map((item, index) => (
              <div key={index} className="mb-2">
                <strong>{item.date}</strong>: {item.type} - {item.description}
                {item.enteredBy && ` (Recorded by: ${item.enteredBy})`}
              </div>
            ))}
          {!formik.values.historyItems?.some(item => item.isSignificant) && (
            <div className="text-muted">No significant events recorded</div>
          )}
        </div>
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

export default History;