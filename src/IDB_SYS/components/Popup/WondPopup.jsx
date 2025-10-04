import React, { useState, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const WoundFormModal = ({ show, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    firstName: '',
    access: 'no-access',
    discoveryDate: '',
    description: '',
    length: '',
    width: '',
    depth: '',
    drainage: '',
    odor: 'no',
    condition: 'S',
    stage: 'S',
    comment: '',
    selectedImage: null,
    woundLocation: null
  });

  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(null);
  const imageRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      setFormData({
        ...formData,
        [name]: files[0]
      });
    } else if (type === 'radio') {
      setFormData({
        ...formData,
        [name]: value
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Here you would typically send the data to an API
    onClose();
  };

  const handleImageSelect = (imageId) => {
    setSelectedLocation(imageId);
    // In a real app, you would set the actual image URL here
    setSelectedImage(`images/0${imageId}-thumb.jpeg`);
  };

  const handleImageClick = (e) => {
    if (!imageRef.current) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setMarkerPosition({ x, y });
  };

  const woundLocations = [
    { id: 1, src: 'images/01-thumb.jpeg', alt: 'Thumb' },
    { id: 2, src: 'images/02-thumb.jpeg', alt: 'Thumb' },
    { id: 3, src: 'images/03-thumb.jpeg', alt: 'Thumb' },
    { id: 4, src: 'images/04-thumb.jpeg', alt: 'Thumb' },
    { id: 5, src: 'images/05-thumb.jpeg', alt: 'Thumb' },
    { id: 6, src: 'images/06-thumb.jpeg', alt: 'Thumb' },
    { id: 7, src: 'images/07-thumb.jpeg', alt: 'Thumb' },
    { id: 8, src: 'images/08-thumb.jpeg', alt: 'Thumb' },
  ];

  if (!show) return null;

  return (
    <div className="modal fade show wound" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">New Wound</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          
          <div className="modal-body">
            <form onSubmit={handleSubmit} className="wound-form frm-outer">
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
                    <label className="col-sm-2 col-form-label">First Name</label>
                    <div className="form-check form-check-inline">
                      <input
                        type="radio"
                        className="form-check-input"
                        name="access"
                        id="noAccess"
                        value="no-access"
                        checked={formData.access === 'no-access'}
                        onChange={handleInputChange}
                      />
                      <label className="form-check-label" htmlFor="noAccess">No Access</label>
                    </div>
                    
                    <div className="form-check form-check-inline">
                      <input
                        type="radio"
                        className="form-check-input"
                        name="access"
                        id="limitedAccess"
                        value="limited-access"
                        checked={formData.access === 'limited-access'}
                        onChange={handleInputChange}
                      />
                      <label className="form-check-label" htmlFor="limitedAccess">Limited Access</label>
                    </div>
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
                  <ul className="list-unstyled d-flex flex-wrap">
                    {woundLocations.map(location => (
                      <li 
                        key={location.id} 
                        className={selectedLocation === location.id ? 'selected' : ''}
                        onClick={() => handleImageSelect(location.id)}
                        style={{ cursor: 'pointer', margin: '5px' }}
                      >
                        <img 
                          src={location.src} 
                          alt={location.alt} 
                          style={{ 
                            width: '80px', 
                            height: '80px', 
                            border: selectedLocation === location.id ? '2px solid red' : '1px solid #ddd',
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
                      ref={imageRef}
                    >
                      <img 
                        src="images/download.png" 
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
                        <option value="S">Stable</option>
                        <option value="W">Worsening</option>
                        <option value="I">Improving</option>
                        <option value="H">Healed</option>
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
                        <option value="S">Select</option>
                        <option value="1">Stage 1</option>
                        <option value="2">Stage 2</option>
                        <option value="3">Stage 3</option>
                        <option value="4">Stage 4</option>
                      </select>
                    </div>

                    <div className="form-row">
                      <label htmlFor="image" className="col-sm-2 col-form-label">Upload Images</label>
                      <input
                        type="file"
                        name="image"
                        onChange={handleInputChange}
                        className="form-control"
                      />
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
                <button className="custom-btn px-3" type="submit">Save</button>
                <button className="custom-btn px-3" type="button" onClick={onClose} style={{marginLeft: '10px'}}>Close</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};


export default WoundFormModal;