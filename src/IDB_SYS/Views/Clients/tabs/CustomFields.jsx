import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ErrorMessage, Field, FieldArray, useFormikContext } from 'formik';
import { FaPlus, FaTrash, FaEdit, FaInfoCircle, FaSearch } from 'react-icons/fa';
import { fetchCustomFieldsByVendor } from '../../../../store/IDB_SYS/Clients/customFieldsSlice';

const CustomFields = ({ formik, clientData }) => {
  const dispatch = useDispatch();
  const { values, setFieldValue } = useFormikContext();
  const [editingIndex, setEditingIndex] = useState(null);
  const [currentDescription, setCurrentDescription] = useState('');
  
  // Get fields from Redux store
  const { customFields: existingFields, loading, error } = useSelector((state) => state.customFields);
  
  // Fetch fields on component mount
  useEffect(() => {
    dispatch(fetchCustomFieldsByVendor());
  }, [dispatch]);

  // Initialize formik values with data from API when clientData is available
  useEffect(() => {
    if (clientData) {
      // If we have custom fields from API, use them
      if (clientData.customFields && Array.isArray(clientData.customFields)) {
        // Map API custom fields to the expected format
        const formattedCustomFields = clientData.customFields.map(apiField => {
          // Find the corresponding field definition from existingFields
          const fieldDefinition = existingFields.find(f => f._id === apiField.field);
          
          return {
            field: apiField.field,
            customField: fieldDefinition ? fieldDefinition.customField : apiField.field,
            description: apiField.description || '',
            value: apiField.value || ''
          };
        });
        
        setFieldValue('customFields', formattedCustomFields);
      } 
      // If no custom fields from API but we have existing fields, initialize with empty values
      else if (existingFields.length > 0 && (!values.customFields || values.customFields.length === 0)) {
        const initialFields = existingFields.map(field => ({
          field: field._id,
          customField: field.customField,
          description: '',
          value: ''
        }));
        setFieldValue('customFields', initialFields);
      }
    }
  }, [clientData, existingFields, setFieldValue, values.customFields]);

  const handleEditDescription = (index) => {
    setCurrentDescription(values.customFields[index].description || '');
    setEditingIndex(index);
  };

  const handleSaveDescription = () => {
    if (editingIndex !== null) {
      const updatedFields = [...values.customFields];
      updatedFields[editingIndex] = {
        ...updatedFields[editingIndex],
        description: currentDescription
      };
      setFieldValue('customFields', updatedFields);
      setEditingIndex(null);
      setCurrentDescription('');
    }
  };

  const handleValueChange = (index, value) => {
    const updatedFields = [...values.customFields];
    updatedFields[index] = {
      ...updatedFields[index],
      value: value
    };
    setFieldValue('customFields', updatedFields);
  };

  return (
    <div className="custom-fields-container">
      <div className="mb-4">
        <h3>Custom Fields</h3>
        <p className="text-muted">Manage custom fields for this client</p>
      </div>

      {loading && <div className="alert alert-info">Loading fields...</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card">
        <div className="card-header bg-light d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Client Custom Fields</h5>
          <small>{values.customFields ? values.customFields.length : 0} fields available</small>
        </div>
        <div className="card-body">
          <FieldArray name="customFields">
            {(arrayHelpers) => (
              <div>
                {values.customFields && values.customFields.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Field Name</th>
                          <th>Value</th>
                          <th>Description</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {values.customFields.map((field, index) => (
                          <tr key={index}>
                            <td className="align-middle">
                              <span className="badge bg-secondary">
                                {field.customField || field.field}
                              </span>
                            </td>
                            <td className="align-middle">
                              <input
                                type="text"
                                className="form-control"
                                value={field.value || ''}
                                onChange={(e) => handleValueChange(index, e.target.value)}
                                placeholder="Enter value"
                              />
                            </td>
                            <td className="align-middle">
                              {editingIndex === index ? (
                                <div className="input-group">
                                  <input
                                    type="text"
                                    className="form-control"
                                    value={currentDescription}
                                    onChange={(e) => setCurrentDescription(e.target.value)}
                                    placeholder="Enter description"
                                  />
                                  <button
                                    className="btn btn-success"
                                    onClick={handleSaveDescription}
                                  >
                                    Save
                                  </button>
                                </div>
                              ) : (
                                <div className="d-flex align-items-center">
                                  <span className="me-2">
                                    {field.description || 'No description added'}
                                  </span>
                                  <button
                                    className="btn btn-sm btn-link p-0"
                                    onClick={() => handleEditDescription(index)}
                                    title="Edit description"
                                  >
                                    <FaEdit size={14} />
                                  </button>
                                </div>
                              )}
                            </td>
                            <td>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => arrayHelpers.remove(index)}
                                title="Remove field"
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
                  <div className="alert alert-info mb-0">
                    <FaInfoCircle className="me-2" />
                    No custom fields available. Add some custom fields first in the system settings.
                  </div>
                )}
              </div>
            )}
          </FieldArray>
        </div>
      </div>
    </div>
  );
};

export default CustomFields;