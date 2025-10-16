import React, { useEffect } from 'react';
import { useField, FieldArray } from 'formik';
import { Form, Row, Col, Button } from 'react-bootstrap';
import { FaSave } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faSave } from '@fortawesome/free-solid-svg-icons';

const Exclusions = ({ formik, clientData, onSaveTab, isSaved, isSaving }) => {
  // Initialize exclusions and preferences from API when clientData is available
  useEffect(() => {
    if (clientData) {
      // Set exclusions from API
      if (clientData.exclusions && Array.isArray(clientData.exclusions)) {
        formik.setFieldValue('exclusions', clientData.exclusions);
      }
      
      // Set preferences from API
      if (clientData.preferences && Array.isArray(clientData.preferences)) {
        formik.setFieldValue('preferences', clientData.preferences);
      }
    }
  }, [clientData, formik.setFieldValue]);

  return (
    <div className="exclusions-tab">

      <h3>Exclusions & Preferences</h3>
      <p className="text-muted">
        Specify any services or caregivers the client should be excluded from, and any special preferences.
      </p>

      <FieldArray name="exclusions">
        {({ push, remove, form }) => (
          <div className="exclusions-section">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5>Service Exclusions</h5>
              <Button
                variant="primary"
                size="sm"
                onClick={() => push({ type: '', comment: '', isPermanent: false })}
              >
                Add Exclusion
              </Button>
            </div>

            {(!form.values.exclusions || form.values.exclusions.length === 0) ? (
              <div className="alert alert-info">
                No exclusions added yet. Click "Add Exclusion" to create one.
              </div>
            ) : (
              form.values.exclusions?.map((exclusion, index) => (
                <div key={index} className="exclusion-item mb-4 p-3 border rounded">
                  <Row className="mb-3">
                    <Col md={4}>
                      <Form.Group controlId={`exclusions.${index}.type`}>
                        <Form.Label>Exclusion Type*</Form.Label>
                        <Form.Select
                          name={`exclusions.${index}.type`}
                          value={exclusion.type || ''}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          isInvalid={
                            formik.touched.exclusions?.[index]?.type &&
                            formik.errors.exclusions?.[index]?.type
                          }
                        >
                          <option value="">Select type</option>
                          <option value="service">Service Type</option>
                          <option value="caregiver">Specific Caregiver</option>
                          <option value="gender">Gender Preference</option>
                          <option value="language">Language</option>
                          <option value="other">Other</option>
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                          {formik.errors.exclusions?.[index]?.type}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group controlId={`exclusions.${index}.isPermanent`}>
                        <Form.Label>Duration</Form.Label>
                        <div>
                          <Form.Check
                            type="radio"
                            id={`exclusions.${index}.permanent-temp`}
                            label="Temporary"
                            name={`exclusions.${index}.isPermanent`}
                            checked={!exclusion.isPermanent}
                            onChange={() =>
                              formik.setFieldValue(`exclusions.${index}.isPermanent`, false)
                            }
                            inline
                          />
                          <Form.Check
                            type="radio"
                            id={`exclusions.${index}.permanent-perm`}
                            label="Permanent"
                            name={`exclusions.${index}.isPermanent`}
                            checked={exclusion.isPermanent}
                            onChange={() =>
                              formik.setFieldValue(`exclusions.${index}.isPermanent`, true)
                            }
                            inline
                          />
                        </div>
                      </Form.Group>
                    </Col>
                    {!exclusion.isPermanent && (
                      <Col md={4}>
                        <Form.Group controlId={`exclusions.${index}.endDate`}>
                          <Form.Label>End Date</Form.Label>
                          <Form.Control
                            type="date"
                            name={`exclusions.${index}.endDate`}
                            value={exclusion.endDate || ''}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                          />
                        </Form.Group>
                      </Col>
                    )}
                  </Row>

                  <Form.Group controlId={`exclusions.${index}.comment`} className="mb-3">
                    <Form.Label>Details/Reason*</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name={`exclusions.${index}.comment`}
                      placeholder="Explain the exclusion..."
                      value={exclusion.comment || ''}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      isInvalid={
                        formik.touched.exclusions?.[index]?.comment &&
                        formik.errors.exclusions?.[index]?.comment
                      }
                    />
                    <Form.Control.Feedback type="invalid">
                      {formik.errors.exclusions?.[index]?.comment}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <div className="d-flex justify-content-end">
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => remove(index)}
                    >
                      Remove Exclusion
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </FieldArray>

      <hr className="my-4" />

      <FieldArray name="preferences">
        {({ push, remove, form }) => (
          <div className="preferences-section">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5>Client Preferences</h5>
              <Button
                variant="primary"
                size="sm"
                onClick={() => push({ type: '', details: '', priority: 'medium' })}
              >
                Add Preference
              </Button>
            </div>

            {(!form.values.preferences || form.values.preferences.length === 0) ? (
              <div className="alert alert-info">
                No preferences added yet. Click "Add Preference" to create one.
              </div>
            ) : (
              form.values.preferences?.map((preference, index) => (
                <div key={index} className="preference-item mb-4 p-3 border rounded">
                  <Row>
                    <Col md={4}>
                      <Form.Group controlId={`preferences.${index}.type`}>
                        <Form.Label>Preference Type</Form.Label>
                        <Form.Select
                          name={`preferences.${index}.type`}
                          value={preference.type || ''}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        >
                          <option value="">Select type</option>
                          <option value="schedule">Schedule</option>
                          <option value="caregiver">Caregiver</option>
                          <option value="routine">Daily Routine</option>
                          <option value="food">Food</option>
                          <option value="environment">Environment</option>
                          <option value="other">Other</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group controlId={`preferences.${index}.priority`}>
                        <Form.Label>Priority</Form.Label>
                        <Form.Select
                          name={`preferences.${index}.priority`}
                          value={preference.priority || 'medium'}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="critical">Critical</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group controlId={`preferences.${index}.details`} className="mb-3 mt-3">
                    <Form.Label>Preference Details</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name={`preferences.${index}.details`}
                      placeholder="Describe the preference in detail..."
                      value={preference.details || ''}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                  </Form.Group>

                  <div className="d-flex justify-content-end">
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => remove(index)}
                    >
                      Remove Preference
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </FieldArray>

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

export default Exclusions;