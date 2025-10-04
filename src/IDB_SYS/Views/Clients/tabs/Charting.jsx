import React, { useEffect, useState } from "react";
import { ErrorMessage, Field, FieldArray, useFormikContext } from "formik";
import { FaPlus, FaTrash, FaEdit } from "react-icons/fa";
import image1 from './../../../assets/images/wound/01-thumb.jpeg';
import image2 from './../../../assets/images/wound/02-thumb.jpeg';
import image3 from './../../../assets/images/wound/03-thumb.jpeg';
import image4 from './../../../assets/images/wound/04-thumb.jpeg';
import image5 from './../../../assets/images/wound/05-thumb.jpeg';
import image6 from './../../../assets/images/wound/06-thumb.jpeg';
import image7 from './../../../assets/images/wound/07-thumb.jpeg';
import image8 from './../../../assets/images/wound/08-thumb.jpeg';
import mainImg from './../../../assets/images/wound/download.png';

const Charting = ({ isEditMode, clientData }) => {
  const { values, setFieldValue } = useFormikContext();
  const [showWoundForm, setShowWoundForm] = useState(false);
  const [selectedWoundIndex, setSelectedWoundIndex] = useState(null);

  // Initialize charting values from API data when in edit mode
  useEffect(() => {
    if (isEditMode && clientData) {
      // Set charting-related fields from API
      const chartingFields = [
        'careNotesAccess',
        'woundNotesAccess',
        'clientLoginNotes',
        'chartingNotes'
      ];
      
      chartingFields.forEach(field => {
        if (clientData[field] !== undefined) {
          setFieldValue(field, clientData[field]);
        }
      });

      // Initialize wounds if available in clientData
      if (clientData.wounds && Array.isArray(clientData.wounds)) {
        setFieldValue('wounds', clientData.wounds);
      }
    }
  }, [isEditMode, clientData, setFieldValue]);

  const handleCareNotesChange = (e) => {
    setFieldValue('careNotesAccess', e.target.value);
    // If disabling caregiver access, also disable client access
    if (e.target.value === 'disabled') {
      setFieldValue('clientLoginNotes', 'no-access');
    }
  };

  const handleClientAccessChange = (e) => {
    // If enabling client access, ensure caregiver access is enabled
    if (e.target.value !== 'no-access' && values.careNotesAccess === 'disabled') {
      setFieldValue('careNotesAccess', 'enabled');
    }
    setFieldValue('clientLoginNotes', e.target.value);
  };

  const handleEditWound = (index) => {
    setSelectedWoundIndex(index);
    setShowWoundForm(true);
  };

  return (
    <div className="charting-container">
      <div className="mb-4">
        <h3>Charting Configuration</h3>
        <p className="text-muted">Configure documentation settings for this client</p>
      </div>

      <div className="row">
        {/* Care Notes Access */}
        <div className="col-md-4 mb-4">
          <div className="card h-100">
            <div className="card-header bg-light">
              <h5 className="mb-0">Care Notes: Caregiver Access</h5>
            </div>
            <div className="card-body">
              <div className="form-check">
                <Field
                  type="radio"
                  id="careNotesDisabled"
                  name="careNotesAccess"
                  value="disabled"
                  className="form-check-input"
                  checked={values.careNotesAccess === 'disabled'}
                  onChange={handleCareNotesChange}
                />
                <label htmlFor="careNotesDisabled" className="form-check-label">
                  Disabled
                </label>
              </div>
              <div className="form-check">
                <Field
                  type="radio"
                  id="careNotesEnabled"
                  name="careNotesAccess"
                  value="enabled"
                  className="form-check-input"
                  checked={values.careNotesAccess === 'enabled'}
                  onChange={handleCareNotesChange}
                />
                <label htmlFor="careNotesEnabled" className="form-check-label">
                  Enabled
                </label>
              </div>
              <div className="form-check">
                <Field
                  type="radio"
                  id="careNotesRequired"
                  name="careNotesAccess"
                  value="required"
                  className="form-check-input"
                  checked={values.careNotesAccess === 'required'}
                  onChange={handleCareNotesChange}
                />
                <label htmlFor="careNotesRequired" className="form-check-label">
                  Required
                </label>
              </div>
              <ErrorMessage name="careNotesAccess" component="div" className="invalid-feedback" />
            </div>
          </div>
        </div>

        {/* Wound Notes Access */}
        <div className="col-md-4 mb-4">
          <div className="card h-100">
            <div className="card-header bg-light">
              <h5 className="mb-0">Wound Notes: Caregiver Access</h5>
            </div>
            <div className="card-body">
              <div className="form-check">
                <Field
                  type="radio"
                  id="woundNotesDisabled"
                  name="woundNotesAccess"
                  value="disabled"
                  className="form-check-input"
                  checked={values.woundNotesAccess === 'disabled'}
                />
                <label htmlFor="woundNotesDisabled" className="form-check-label">
                  Disabled
                </label>
              </div>
              <div className="form-check">
                <Field
                  type="radio"
                  id="woundNotesEnabled"
                  name="woundNotesAccess"
                  value="enabled"
                  className="form-check-input"
                  checked={values.woundNotesAccess === 'enabled'}
                />
                <label htmlFor="woundNotesEnabled" className="form-check-label">
                  Enabled
                </label>
              </div>
              <div className="form-check">
                <Field
                  type="radio"
                  id="woundNotesRequired"
                  name="woundNotesAccess"
                  value="required-active"
                  className="form-check-input"
                  checked={values.woundNotesAccess === 'required-active'}
                />
                <label htmlFor="woundNotesRequired" className="form-check-label">
                  Required (Active Wounds)
                </label>
              </div>
              <ErrorMessage name="woundNotesAccess" component="div" className="invalid-feedback" />
            </div>
          </div>
        </div>

        {/* Client Login Access */}
        <div className="col-md-4 mb-4">
          <div className="card h-100">
            <div className="card-header bg-light">
              <h5 className="mb-0">Client Login - All Notes</h5>
            </div>
            <div className="card-body">
              <div className="form-check">
                <Field
                  type="radio"
                  id="clientNoAccess"
                  name="clientLoginNotes"
                  value="no-access"
                  className="form-check-input"
                  checked={values.clientLoginNotes === 'no-access'}
                  onChange={handleClientAccessChange}
                />
                <label htmlFor="clientNoAccess" className="form-check-label">
                  No Access
                </label>
              </div>
              <div className="form-check">
                <Field
                  type="radio"
                  id="clientViewApproved"
                  name="clientLoginNotes"
                  value="view-approved"
                  className="form-check-input"
                  checked={values.clientLoginNotes === 'view-approved'}
                  onChange={handleClientAccessChange}
                />
                <label htmlFor="clientViewApproved" className="form-check-label">
                  View Approved Notes
                </label>
              </div>
              <div className="form-check">
                <Field
                  type="radio"
                  id="clientViewSign"
                  name="clientLoginNotes"
                  value="view-sign"
                  className="form-check-input"
                  checked={values.clientLoginNotes === 'view-sign'}
                  onChange={handleClientAccessChange}
                />
                <label htmlFor="clientViewSign" className="form-check-label">
                  View/Sign Approved Notes
                </label>
              </div>
              <ErrorMessage name="clientLoginNotes" component="div" className="invalid-feedback" />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Notes */}
      <div className="card mb-4">
        <div className="card-header bg-light">
          <h5 className="mb-0">Additional Charting Notes</h5>
        </div>
        <div className="card-body">
          <Field
            as="textarea"
            name="chartingNotes"
            className="form-control"
            rows="4"
            placeholder="Enter any additional charting instructions..."
          />
          <ErrorMessage name="chartingNotes" component="div" className="invalid-feedback" />
        </div>
      </div>

      {/* Wounds Section - Using FieldArray similar to Contacts */}
      <div className="card">
        <div className="card-header bg-light d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Wound Documentation</h5>
        </div>
        <div className="card-body">
          <FieldArray name="wounds">
            {(arrayHelpers) => (
              <div>
                {values.wounds && values.wounds.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Location</th>
                          <th>Discovery Date</th>
                          <th>Size (cm)</th>
                          <th>Condition</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {values.wounds.map((wound, index) => (
                          <tr key={index}>
                            <td>
                              <Field
                                name={`wounds[${index}].title`}
                                className="form-control"
                                placeholder="Wound title"
                              />
                              <ErrorMessage
                                name={`wounds[${index}].title`}
                                component="div"
                                className="invalid-feedback"
                              />
                            </td>
                            <td>
                              <Field
                                as="select"
                                name={`wounds[${index}].location`}
                                className="form-select"
                              >
                                <option value="">Select location</option>
                                <option value="Head">Head</option>
                                <option value="Arm">Arm</option>
                                <option value="Leg">Leg</option>
                                <option value="Torso">Torso</option>
                                <option value="Back">Back</option>
                                <option value="Foot">Foot</option>
                                <option value="Hand">Hand</option>
                                <option value="Other">Other</option>
                              </Field>
                            </td>
                            <td>
                              <Field
                                type="date"
                                name={`wounds[${index}].discoveryDate`}
                                className="form-control"
                              />
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                <Field
                                  type="number"
                                  name={`wounds[${index}].length`}
                                  className="form-control me-1"
                                  placeholder="L"
                                  style={{ width: "60px" }}
                                />
                                ×
                                <Field
                                  type="number"
                                  name={`wounds[${index}].width`}
                                  className="form-control mx-1"
                                  placeholder="W"
                                  style={{ width: "60px" }}
                                />
                                ×
                                <Field
                                  type="number"
                                  name={`wounds[${index}].depth`}
                                  className="form-control ms-1"
                                  placeholder="D"
                                  style={{ width: "60px" }}
                                />
                              </div>
                            </td>
                            <td>
                              <Field
                                as="select"
                                name={`wounds[${index}].condition`}
                                className="form-select"
                              >
                                <option value="Stable">Stable</option>
                                <option value="Improving">Improving</option>
                                <option value="Worsening">Worsening</option>
                                <option value="Healed">Healed</option>
                              </Field>
                            </td>
                            <td className="text-nowrap">
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary me-2"
                                onClick={() => handleEditWound(index)}
                              >
                                <FaEdit />
                              </button>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => arrayHelpers.remove(index)}
                              >
                                <FaTrash />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted">No wounds documented yet</p>
                )}

                <button
                  type="button"
                  className="btn btn-primary mt-3"
                  onClick={() => {
                    arrayHelpers.push({
                      title: "",
                      location: "",
                      discoveryDate: "",
                      length: "",
                      width: "",
                      depth: "",
                      drainage: "",
                      odor: "no",
                      condition: "Stable",
                      stage: "",
                      comment: "",
                      description: ""
                    });
                    setSelectedWoundIndex(null);
                    setShowWoundForm(true);
                  }}
                >
                  <FaPlus className="me-1" /> Add Wound
                </button>
              </div>
            )}
          </FieldArray>
        </div>
      </div>

      {/* Wound Detail Modal */}
      {showWoundForm && (
        <WoundDetailModal
          woundIndex={selectedWoundIndex}
          wound={selectedWoundIndex !== null ? values.wounds[selectedWoundIndex] : null}
          onClose={() => {
            setShowWoundForm(false);
            setSelectedWoundIndex(null);
          }}
          onSave={(woundData) => {
            if (selectedWoundIndex !== null) {
              // Update existing wound
              setFieldValue(`wounds[${selectedWoundIndex}]`, woundData);
            } else {
              // Add new wound
              setFieldValue('wounds', [...(values.wounds || []), woundData]);
            }
            setShowWoundForm(false);
            setSelectedWoundIndex(null);
          }}
        />
      )}
    </div>
  );
};

// Wound Detail Modal Component
const WoundDetailModal = ({ woundIndex, wound, onClose, onSave }) => {
  const [formData, setFormData] = useState(
    wound || {
      title: "",
      location: "",
      discoveryDate: "",
      length: "",
      width: "",
      depth: "",
      drainage: "",
      odor: "no",
      condition: "Stable",
      stage: "",
      comment: "",
      description: ""
    }
  );

  const [selectedLocation, setSelectedLocation] = useState(wound?.location || null);
  const [selectedImage, setSelectedImage] = useState(wound?.image || null);
  const [markerPosition, setMarkerPosition] = useState(wound?.markerPosition || null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSave = () => {
    onSave({
      ...formData,
      location: selectedLocation,
      image: selectedImage,
      markerPosition
    });
  };

  const handleImageSelect = (location, imageSrc) => {
    setSelectedLocation(location);
    setSelectedImage(imageSrc);
    setFormData({
      ...formData,
      location
    });
  };

  const handleImageClick = (e) => {
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMarkerPosition({ x, y });
  };

  const woundLocations = [
    { id: 1, src: image1, alt: 'Thumb', name: 'Thumb' },
    { id: 2, src: image2, alt: 'Index Finger', name: 'Index Finger' },
    { id: 3, src: image3, alt: 'Middle Finger', name: 'Middle Finger' },
    { id: 4, src: image4, alt: 'Ring Finger', name: 'Ring Finger' },
    { id: 5, src: image5, alt: 'Little Finger', name: 'Little Finger' },
    { id: 6, src: image6, alt: 'Palm', name: 'Palm' },
    { id: 7, src: image7, alt: 'Wrist', name: 'Wrist' },
    { id: 8, src: image8, alt: 'Forearm', name: 'Forearm' },
  ];

  return (
    <div className="modal fade show wound" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{wound ? 'Edit Wound' : 'New Wound'}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          
          <div className="modal-body">
            <div className="wound-form frm-outer">
              <div className="row">
                <div className="col-md-4">
                  <div className="form-row">
                    <label htmlFor="title" className="col-sm-2 col-form-label">Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-row">
                    <label htmlFor="discoveryDate" className="col-sm-2 col-form-label">Discovery Date</label>
                    <input
                      type="date"
                      className="form-control"
                      id="discoveryDate"
                      name="discoveryDate"
                      value={formData.discoveryDate}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="col-md-8">
                  <div className="form-row">
                    <label htmlFor="description" className="col-sm-2 col-form-label">Description</label>
                    <textarea
                      style={{width: '100%'}}
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="col-md-12 mt-3">
                <div className="wound-location">
                  <ul className="list-unstyled d-flex flex-wrap justify-content-center">
                    {woundLocations.map(location => (
                      <li 
                        key={location.id} 
                        className={selectedLocation === location.name ? 'selected' : ''}
                        onClick={() => handleImageSelect(location.name, location.src)}
                        style={{ cursor: 'pointer', margin: '2px' }}
                      >
                        <img 
                          src={location.src} 
                          alt={location.alt} 
                          style={{ 
                            width: '80px', 
                            height: '80px', 
                            border: selectedLocation === location.name ? '2px solid red' : '1px solid #ddd',
                            borderRadius: '4px'
                          }} 
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="col-md-12 mt-3">
                <div className="row">
                  <div className="col-md-6">
                    <div 
                      style={{ position: 'relative', cursor: 'crosshair' }}
                      onClick={handleImageClick}
                    >
                      <img 
                        src={selectedImage || mainImg} 
                        alt="Body diagram" 
                        style={{ width: '100%' }} 
                      />
                      {markerPosition && (
                        <div 
                          style={{
                            position: 'absolute',
                            left: markerPosition.x - 10,
                            top: markerPosition.y - 10,
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            backgroundColor: 'red',
                            border: '2px solid white',
                            boxShadow: '0 0 5px rgba(0,0,0,0.5)'
                          }}
                        ></div>
                      )}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="form-row">
                      <label htmlFor="length" className="col-sm-2 col-form-label">Length (cm)*</label>
                      <input
                        type="text"
                        className="form-control"
                        id="length"
                        name="length"
                        value={formData.length}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="form-row">
                      <label htmlFor="width" className="col-sm-2 col-form-label">Width (cm)</label>
                      <input
                        type="text"
                        className="form-control"
                        id="width"
                        name="width"
                        value={formData.width}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="form-row">
                      <label htmlFor="depth" className="col-sm-2 col-form-label">Depth (cm)</label>
                      <input
                        type="text"
                        className="form-control"
                        id="depth"
                        name="depth"
                        value={formData.depth}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="form-row">
                      <label htmlFor="drainage" className="col-sm-2 col-form-label">Drainage</label>
                      <textarea
                        style={{width: '100%'}}
                        name="drainage"
                        value={formData.drainage}
                        onChange={handleInputChange}
                      ></textarea>
                    </div>

                    <div className="form-row">
                      <label className="col-sm-2 col-form-label">Odor</label>
                      <div className="form-check form-check-inline">
                        <input
                          type="radio"
                          className="form-check-input"
                          name="odor"
                          id="odorYes"
                          value="yes"
                          checked={formData.odor === 'yes'}
                          onChange={handleInputChange}
                        />
                        <label className="form-check-label" htmlFor="odorYes">Yes</label>
                      </div>
                      <div className="form-check form-check-inline">
                        <input
                          type="radio"
                          className="form-check-input"
                          name="odor"
                          id="odorNo"
                          value="no"
                          checked={formData.odor === 'no'}
                          onChange={handleInputChange}
                        />
                        <label className="form-check-label" htmlFor="odorNo">No</label>
                      </div>
                    </div>

                    <div className="form-row">
                      <label htmlFor="condition" className="col-sm-2 col-form-label">Condition</label>
                      <select
                        name="condition"
                        value={formData.condition}
                        onChange={handleInputChange}
                        className="form-control"
                      >
                        <option value="Stable">Stable</option>
                        <option value="Worsening">Worsening</option>
                        <option value="Improving">Improving</option>
                        <option value="Healed">Healed</option>
                      </select>
                    </div>

                    <div className="form-row">
                      <label htmlFor="stage" className="col-sm-2 col-form-label">Stage</label>
                      <select
                        name="stage"
                        value={formData.stage}
                        onChange={handleInputChange}
                        className="form-control"
                      >
                        <option value="">Select</option>
                        <option value="1">Stage 1</option>
                        <option value="2">Stage 2</option>
                        <option value="3">Stage 3</option>
                        <option value="4">Stage 4</option>
                      </select>
                    </div>

                    <div className="form-row">
                      <label htmlFor="comment" className="col-sm-2 col-form-label">Comment</label>
                      <textarea
                        style={{width: '100%'}}
                        name="comment"
                        value={formData.comment}
                        onChange={handleInputChange}
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{display: 'flex', justifyContent: 'right'}} className="col-md-12 mt-3 mb-3">
                <button className="custom-btn px-3" type="button" onClick={handleSave}>Save</button>
                <button className="custom-btn px-3" type="button" onClick={onClose} style={{marginLeft: '10px'}}>Close</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Charting;