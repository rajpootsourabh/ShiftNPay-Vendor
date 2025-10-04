import React, { useState, useEffect } from "react";
import { ErrorMessage, Field, FieldArray, useFormikContext } from "formik";
import {
  FaPlus,
  FaTrash,
  FaInfoCircle,
  FaEnvelope,
  FaPaperPlane,
} from "react-icons/fa";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

const Contacts = ({ formik, clientData }) => {
  const { values, setFieldValue } = useFormikContext();
  const [showLoginLinkModal, setShowLoginLinkModal] = useState(false);
  const [selectedContactIndex, setSelectedContactIndex] = useState(null);

  // Initialize contacts from API data when clientData is available
  useEffect(() => {
    if (clientData) {
      // Set initial contact fields
      const initialContactFields = [
        'initialContactName',
        'initialContactEmail',
        'initialContactPhone',
        'initialContactAltPhone',
        'initialContactWebPassword',
        'initialContactEnableLogin',
        'initialContactEnable2FA',
        'initialContactRelation',
        'includeOnCarePlan'
      ];
      
      initialContactFields.forEach(field => {
        if (clientData[field] !== undefined) {
          setFieldValue(field, clientData[field]);
        }
      });

      // Set additional contacts if they exist
      if (clientData.additionalContacts && Array.isArray(clientData.additionalContacts)) {
        setFieldValue('additionalContacts', clientData.additionalContacts);
      }
    }
  }, [clientData, setFieldValue]);

  const handlePhoneChange = (phone, index, fieldName) => {
    setFieldValue(`additionalContacts[${index}].${fieldName}`, phone);
  };

  const sendLoginLink = (index) => {
    setSelectedContactIndex(index);
    setShowLoginLinkModal(true);
    // In a real app, you would call an API here to send the login link
  };

  return (
    <div className="contacts-container">
      <div className="mb-4">
        <h3>Client Contacts</h3>
        <p className="text-muted">
          Manage primary and additional contacts for this client
        </p>
      </div>

      {/* Initial Contact Section */}
      <div className="card mb-4">
        <div className="card-header bg-light d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Initial Contact</h5>
          <div className="form-check form-check-inline">
            <Field
              type="checkbox"
              id="includeOnCarePlan"
              name="includeOnCarePlan"
              className="form-check-input"
              checked={values.includeOnCarePlan}
            />
            <label htmlFor="includeOnCarePlan" className="form-check-label">
              Include on Care Plan
            </label>
          </div>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="initialContactName" className="form-label">
                Name
              </label>
              <Field
                name="initialContactName"
                type="text"
                className="form-control"
                placeholder="Full name"
              />
              <ErrorMessage
                name="initialContactName"
                component="div"
                className="invalid-feedback"
              />
            </div>

            <div className="col-md-6 mb-3">
              <label htmlFor="initialContactEmail" className="form-label">
                Email
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <FaEnvelope />
                </span>
                <Field
                  name="initialContactEmail"
                  type="email"
                  className="form-control"
                  placeholder="email@example.com"
                />
              </div>
              <ErrorMessage
                name="initialContactEmail"
                component="div"
                className="invalid-feedback"
              />
            </div>

            <div className="col-md-6 mb-3">
              <label htmlFor="initialContactPhone" className="form-label">
                Phone
              </label>
              <PhoneInput
                international
                defaultCountry="US"
                value={values.initialContactPhone}
                onChange={(phone) =>
                  setFieldValue("initialContactPhone", phone)
                }
                inputClassName="form-control"
              />
              <ErrorMessage
                name="initialContactPhone"
                component="div"
                className="invalid-feedback"
              />
            </div>

            <div className="col-md-6 mb-3">
              <label htmlFor="initialContactAltPhone" className="form-label">
                Alternate Phone
              </label>
              <PhoneInput
                international
                defaultCountry="US"
                value={values.initialContactAltPhone}
                onChange={(phone) =>
                  setFieldValue("initialContactAltPhone", phone)
                }
                inputClassName="form-control"
              />
              <ErrorMessage
                name="initialContactAltPhone"
                component="div"
                className="invalid-feedback"
              />
            </div>

            <div className="col-md-6 mb-3">
              <label htmlFor="initialContactWebPassword" className="form-label">
                Web Password
              </label>
              <Field
                name="initialContactWebPassword"
                type="password"
                className="form-control"
                placeholder="Set password"
              />
              <ErrorMessage
                name="initialContactWebPassword"
                component="div"
                className="invalid-feedback"
              />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label d-block">Web Access</label>
              <div className="form-check form-check-inline">
                <Field
                  type="checkbox"
                  id="initialContactEnableLogin"
                  name="initialContactEnableLogin"
                  className="form-check-input"
                  checked={values.initialContactEnableLogin}
                />
                <label
                  htmlFor="initialContactEnableLogin"
                  className="form-check-label"
                >
                  Enable Web Login
                </label>
              </div>
              <div className="form-check form-check-inline">
                <Field
                  type="checkbox"
                  id="initialContactEnable2FA"
                  name="initialContactEnable2FA"
                  className="form-check-input"
                  checked={values.initialContactEnable2FA}
                />
                <label
                  htmlFor="initialContactEnable2FA"
                  className="form-check-label"
                >
                  Enable 2FA
                </label>
              </div>
            </div>

            <div className="col-md-6 mb-3">
              <label htmlFor="initialContactRelation" className="form-label">
                Relation to Client
              </label>
              <Field
                as="select"
                name="initialContactRelation"
                className="form-select"
              >
                <option value="0">Select relationship</option>
                <option value="spouse">Spouse</option>
                <option value="child">Child</option>
                <option value="parent">Parent</option>
                <option value="sibling">Sibling</option>
                <option value="friend">Friend</option>
                <option value="guardian">Guardian</option>
                <option value="other">Other</option>
              </Field>
              <ErrorMessage
                name="initialContactRelation"
                component="div"
                className="invalid-feedback"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Contacts Section */}
      <div className="card">
        <div className="card-header bg-light">
          <h5 className="mb-0">Additional Contacts</h5>
        </div>
        <div className="card-body">
          <FieldArray name="additionalContacts">
            {(arrayHelpers) => (
              <div>
                {values.additionalContacts && values.additionalContacts.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Phone</th>
                          <th>Email</th>
                          <th>Relation</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {values.additionalContacts.map((contact, index) => {
                          const contactErrors =
                            formik.errors.additionalContacts?.[index] || {};
                          const contactTouched =
                            formik.touched.additionalContacts?.[index] || {};

                          return (
                            <tr key={index}>
                              <td>
                                <Field
                                  name={`additionalContacts[${index}].name`}
                                  className={`form-control ${
                                    contactTouched.name && contactErrors.name
                                      ? "is-invalid"
                                      : ""
                                  }`}
                                />
                                <ErrorMessage
                                  name={`additionalContacts[${index}].name`}
                                  component="div"
                                  className="invalid-feedback"
                                />
                              </td>
                              <td>
                                <PhoneInput
                                  international
                                  defaultCountry="US"
                                  value={contact.phone}
                                  onChange={(phone) =>
                                    handlePhoneChange(phone, index, "phone")
                                  }
                                  inputClassName={`form-control ${
                                    contactTouched.phone && contactErrors.phone
                                      ? "is-invalid"
                                      : ""
                                  }`}
                                />
                                {contactTouched.phone &&
                                  contactErrors.phone && (
                                    <div className="invalid-feedback d-block">
                                      {contactErrors.phone}
                                    </div>
                                  )}
                              </td>
                              <td>
                                <Field
                                  name={`additionalContacts[${index}].email`}
                                  type="email"
                                  className="form-control"
                                  placeholder="email@example.com"
                                />
                                <ErrorMessage
                                  name={`additionalContacts[${index}].email`}
                                  component="div"
                                  className="invalid-feedback"
                                />
                              </td>
                              <td>
                                <Field
                                  as="select"
                                  name={`additionalContacts[${index}].relation`}
                                  className="form-select"
                                >
                                  <option value="0">Select relationship</option>
                                  <option value="spouse">Spouse</option>
                                  <option value="child">Child</option>
                                  <option value="parent">Parent</option>
                                  <option value="sibling">Sibling</option>
                                  <option value="friend">Friend</option>
                                  <option value="guardian">Guardian</option>
                                  <option value="other">Other</option>
                                </Field>
                              </td>
                              <td className="text-nowrap">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger me-2"
                                  onClick={() => arrayHelpers.remove(index)}
                                >
                                  <FaTrash />
                                </button>
                                {contact.email && (
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => sendLoginLink(index)}
                                    title="Send login link"
                                  >
                                    <FaPaperPlane />
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted">No additional contacts added yet</p>
                )}

                <button
                  type="button"
                  className="btn btn-primary mt-3"
                  onClick={() =>
                    arrayHelpers.push({
                      name: "",
                      phone: "",
                      email: "",
                      relation: "0",
                    })
                  }
                >
                  <FaPlus className="me-1" /> Add Contact
                </button>
              </div>
            )}
          </FieldArray>
        </div>
      </div>

      {/* Send Login Link Modal */}
      {showLoginLinkModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Send Login Link</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowLoginLinkModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  Send login instructions to{" "}
                  <strong>
                    {values.additionalContacts[selectedContactIndex]?.email}
                  </strong>
                  ?
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowLoginLinkModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    // Here you would typically call an API to send the login link
                    alert(
                      `Login link sent to ${values.additionalContacts[selectedContactIndex]?.email}`
                    );
                    setShowLoginLinkModal(false);
                  }}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contacts;