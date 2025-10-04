import React, { useState, useEffect } from 'react';
import { ErrorMessage, Field, useFormikContext } from 'formik';
import { FaDirections, FaMapMarkerAlt, FaCopy, FaCheck } from 'react-icons/fa';
import { Button, Modal } from 'react-bootstrap';

const Directions = ({ formik, clientData }) => {
  const { values, setFieldValue } = useFormikContext();
  const [showMapModal, setShowMapModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [geocodeStatus, setGeocodeStatus] = useState('');

  // Initialize directions data from API when clientData is available
  useEffect(() => {
    if (clientData) {
      // Set directions-related fields from API
      const directionsFields = [
        'directions',
        'parkingInfo',
        'accessInstructions',
        'specialInstructions'
      ];
      
      directionsFields.forEach(field => {
        if (clientData[field] !== undefined) {
          setFieldValue(field, clientData[field]);
        }
      });
    }
  }, [clientData, setFieldValue]);

  const handleGetDirections = () => {
    // In a real app, this would integrate with Google Maps API
    setGeocodeStatus('Geocoding address...');
    setTimeout(() => {
      setGeocodeStatus('Address geocoded successfully');
      setShowMapModal(true);
    }, 1500);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(values.directions);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="directions-container">
      <div className="mb-4">
        <h3>Directions & Miscellaneous Notes</h3>
        <p className="text-muted">Enter special directions and notes for this client</p>
      </div>

      <div className="card mb-4">
        <div className="card-header bg-light d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <FaDirections className="me-2" />
            Directions to Client
          </h5>
          <div>
            <button
              type="button"
              className="btn btn-sm btn-outline-primary me-2"
              onClick={handleGetDirections}
            >
              <FaMapMarkerAlt className="me-1" />
              Get Directions
            </button>
            {geocodeStatus && (
              <span className={`badge ${geocodeStatus.includes('success') ? 'bg-success' : 'bg-info'}`}>
                {geocodeStatus}
              </span>
            )}
          </div>
        </div>
        <div className="card-body">
          <div className="mb-3">
            <label htmlFor="directions" className="form-label">
              Special Directions
            </label>
            <div className="input-group">
              <Field
                as="textarea"
                name="directions"
                className="form-control"
                rows="6"
                placeholder="Enter detailed directions, access codes, gate information, etc."
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={copyToClipboard}
                disabled={!values.directions}
              >
                {copied ? <FaCheck className="text-success" /> : <FaCopy />}
              </button>
            </div>
            <ErrorMessage name="directions" component="div" className="invalid-feedback" />
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="parkingInfo" className="form-label">
                Parking Information
              </label>
              <Field
                as="textarea"
                name="parkingInfo"
                className="form-control"
                rows="3"
                placeholder="Parking instructions, restrictions, etc."
              />
              <ErrorMessage name="parkingInfo" component="div" className="invalid-feedback" />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="accessInstructions" className="form-label">
                Access Instructions
              </label>
              <Field
                as="textarea"
                name="accessInstructions"
                className="form-control"
                rows="3"
                placeholder="Building access codes, doorbell instructions, etc."
              />
              <ErrorMessage name="accessInstructions" component="div" className="invalid-feedback" />
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header bg-light">
          <h5 className="mb-0">Additional Miscellaneous Notes</h5>
        </div>
        <div className="card-body">
          <div className="mb-3">
            <label htmlFor="specialInstructions" className="form-label">
              Special Instructions
            </label>
            <Field
              as="textarea"
              name="specialInstructions"
              className="form-control"
              rows="4"
              placeholder="Any other important notes about this client or location"
            />
            <ErrorMessage name="specialInstructions" component="div" className="invalid-feedback" />
          </div>
        </div>
      </div>

      {/* Map Modal */}
      <Modal show={showMapModal} onHide={() => setShowMapModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaMapMarkerAlt className="me-2" />
            Client Location
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="map-placeholder" style={{ height: '400px', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="text-center">
              <FaMapMarkerAlt size={48} className="text-danger mb-3" />
              <p>Map integration would show here</p>
              <p className="text-muted">
                {clientData?.homeAddress1 || 'Client Address'}, 
                {clientData?.homeCity ? ` ${clientData.homeCity},` : ''}
                {clientData?.homeState ? ` ${clientData.homeState}` : ''}
                {clientData?.homeZip ? ` ${clientData.homeZip}` : ''}
              </p>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowMapModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={() => {
            // In a real app, this would open directions in Google Maps
            alert('Opening directions in Google Maps');
            setShowMapModal(false);
          }}>
            Open in Google Maps
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Directions;