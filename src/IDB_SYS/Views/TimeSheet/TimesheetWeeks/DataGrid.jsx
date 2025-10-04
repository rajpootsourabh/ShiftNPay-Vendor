// components/DataGrid.js
import React from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Formik, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { createWeeksRange, clearError, clearSuccess } from '../../../../store/IDB_SYS/timesheet/timesheetWeekSlice';

const DataGrid = () => {
  const dispatch = useDispatch();
  const { loading, error, success } = useSelector((state) => state.timesheetWeek);

  const validationSchema = Yup.object().shape({
    endDate: Yup.date()
      .required('End date is required')
      .max(new Date(), 'End date cannot be in the future'),
    numberOfWeeks: Yup.number()
      .required('Number of weeks is required')
      .min(1, 'Must be at least 1 week')
      .max(52, 'Cannot exceed 52 weeks'),
    payrollDays: Yup.number()
      .required('Days in week is required')
      .oneOf([5, 6, 7], 'Must be 5, 6, or 7 days')
  });

  const handleSubmit = (values, { resetForm }) => {
    const payload = {
      endDate: values.endDate,
      numberOfWeeks: parseInt(values.numberOfWeeks, 10),
      payrollDays: parseInt(values.payrollDays, 10),
    };
    
    dispatch(createWeeksRange(payload)).then(() => {
      resetForm();
    });
  };

  React.useEffect(() => {
    return () => {
      dispatch(clearError());
      dispatch(clearSuccess());
    };
  }, [dispatch]);

  return (
    <div className="p-5 border bg-white">
      {/* Instructions */}
      <div className="mb-3">
        <h6 className="fw-bold">Steps to Auto-Create TimesheetWeeks</h6>
        <ol className="ps-3">
          <li>
            Enter the timesheet week end date for the first timesheet you are
            going to create timesheet weeks for.
          </li>
          <li>Enter the number of timesheet weeks to create.</li>
          <li>Select the number of days in your payroll week.</li>
          <li>
            Click the <b>'Create TimesheetWeeks'</b> button.
            <p className="text-danger small m-0">
              Note: If your timesheet weeks do not occur a standard number of
              days then you will need to manually add them by clicking on the
              'Add/Edit Individual TimesheetWeeks' tab. An example would be
              paying on 1st and 15th of each month.
            </p>
          </li>
          <li>
            View the weeks you just created by clicking on the 'Add/Edit
            Individual TimesheetWeeks' tab.
          </li>
        </ol>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <Alert variant="danger" onClose={() => dispatch(clearError())} dismissible>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert variant="success" onClose={() => dispatch(clearSuccess())} dismissible>
          Timesheet weeks created successfully!
        </Alert>
      )}

      <Formik
        initialValues={{
          endDate: '',
          numberOfWeeks: '',
          payrollDays: ''
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ handleSubmit, handleChange, values, touched, errors }) => (
          <Form onSubmit={handleSubmit}>
            {/* End Date Field */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">
                1. Enter the timesheet week end date for the first timesheet you are
                going to create timesheet weeks for.
              </Form.Label>
              <Field
                as={Form.Control}
                type="date"
                name="endDate"
                value={values.endDate}
                onChange={handleChange}
                isInvalid={touched.endDate && !!errors.endDate}
                className="w-100"
                style={{ maxWidth: '300px' }}
              />
              <ErrorMessage name="endDate" component="div" className="text-danger small" />
            </Form.Group>

            {/* Number of Weeks Field */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">
                2. Enter the number of timesheet weeks to create.
              </Form.Label>
              <Field
                as={Form.Control}
                type="number"
                name="numberOfWeeks"
                value={values.numberOfWeeks}
                onChange={handleChange}
                isInvalid={touched.numberOfWeeks && !!errors.numberOfWeeks}
                min="1"
                max="52"
                className="w-100"
                style={{ maxWidth: '300px' }}
              />
              <ErrorMessage name="numberOfWeeks" component="div" className="text-danger small" />
            </Form.Group>

            {/* Days in Week Field */}
            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">
                3. Select the number of days in your payroll week.
              </Form.Label>
              <Field
                as={Form.Select}
                name="payrollDays"
                value={values.payrollDays}
                onChange={handleChange}
                isInvalid={touched.payrollDays && !!errors.payrollDays}
                className="w-100"
                style={{ maxWidth: '300px' }}
              >
                <option value="">Select days</option>
                <option value="5">5 days</option>
                <option value="6">6 days</option>
                <option value="7">7 days</option>
              </Field>
              <ErrorMessage name="payrollDays" component="div" className="text-danger small" />
            </Form.Group>

            <div className="text-center">
              <Button 
                type="submit" 
                className="btn btn-success custom-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Creating...
                  </>
                ) : (
                  'Create TimesheetWeeks'
                )}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default DataGrid;