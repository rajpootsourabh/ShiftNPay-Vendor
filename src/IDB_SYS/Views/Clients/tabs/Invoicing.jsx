import React, { useEffect } from 'react';
import { useField, FieldArray } from 'formik';
import { Form, Row, Col, Button, Table, Badge, Card } from 'react-bootstrap';

const formatCurrency = (value) => {
  if (isNaN(value)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(value);
};

const Invoicing = ({ formik, clientData }) => {
  // Initialize invoicing data from API when clientData is available
  useEffect(() => {
    if (clientData) {
      // Set invoicing-related fields from API
      const invoicingFields = [
        'openBalance',
        'overdueBalance',
        'lastPaymentDate',
        'invoiceType',
        'invoiceStatus',
        'dateFrom',
        'dateTo'
      ];
      
      invoicingFields.forEach(field => {
        if (clientData[field] !== undefined) {
          formik.setFieldValue(field, clientData[field]);
        }
      });

      // Set invoices from API
      if (clientData.invoices && Array.isArray(clientData.invoices)) {
        formik.setFieldValue('invoices', clientData.invoices);
      }

      // Set payments from API
      if (clientData.payments && Array.isArray(clientData.payments)) {
        formik.setFieldValue('payments', clientData.payments);
      }
    }
  }, [clientData, formik.setFieldValue]);

  // Calculate totals
  const calculateTotals = () => {
    const invoices = formik.values.invoices || [];
    return {
      totalBalance: invoices.reduce((sum, inv) => sum + (parseFloat(inv.balance) || 0), 0),
      totalPaid: invoices.reduce((sum, inv) => sum + (parseFloat(inv.paid) || 0), 0),
      totalAmount: invoices.reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0)
    };
  };

  const { totalBalance, totalPaid, totalAmount } = calculateTotals();

  return (
    <div className="invoicing-tab">
      <h3>Invoicing</h3>
      <p className="text-muted">
        Manage client billing information and payment history.
      </p>

      <Row className="mb-4">
        <Col md={4}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Open Balance</Card.Title>
              <Card.Text className="fs-3 text-primary">
                {formatCurrency(formik.values.openBalance || 0)}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Overdue Balance</Card.Title>
              <Card.Text className="fs-3 text-danger">
                {formatCurrency(formik.values.overdueBalance || 0)}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Last Payment</Card.Title>
              <Card.Text className="fs-3 text-success">
                {formik.values.lastPaymentDate 
                  ? new Date(formik.values.lastPaymentDate).toLocaleDateString()
                  : 'None'}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <div className="filters mb-3 p-3 bg-light border rounded">
        <Row>
          <Col md={3}>
            <Form.Group controlId="invoiceType">
              <Form.Label>Invoice Type</Form.Label>
              <Form.Select
                name="invoiceType"
                value={formik.values.invoiceType || 'All'}
                onChange={formik.handleChange}
              >
                <option value="All">All Types</option>
                <option value="Service">Service</option>
                <option value="Product">Product</option>
                <option value="Adjustment">Adjustment</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group controlId="invoiceStatus">
              <Form.Label>Status</Form.Label>
              <Form.Select
                name="invoiceStatus"
                value={formik.values.invoiceStatus || 'All'}
                onChange={formik.handleChange}
              >
                <option value="All">All Statuses</option>
                <option value="Open">Open</option>
                <option value="Paid">Paid</option>
                <option value="Overdue">Overdue</option>
                <option value="Void">Void</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group controlId="dateFrom">
              <Form.Label>From Date</Form.Label>
              <Form.Control
                type="date"
                name="dateFrom"
                value={formik.values.dateFrom || ''}
                onChange={formik.handleChange}
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group controlId="dateTo">
              <Form.Label>To Date</Form.Label>
              <Form.Control
                type="date"
                name="dateTo"
                value={formik.values.dateTo || ''}
                onChange={formik.handleChange}
                min={formik.values.dateFrom}
              />
            </Form.Group>
          </Col>
        </Row>
      </div>

      <FieldArray name="invoices">
        {({ push, remove, form }) => (
          <div className="invoices-section">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5>Invoice History</h5>
              <Button
                variant="primary"
                size="sm"
                onClick={() => push({
                  invoiceNumber: '',
                  date: new Date().toISOString().split('T')[0],
                  dueDate: '',
                  amount: 0,
                  paid: 0,
                  balance: 0,
                  status: 'Open',
                  type: 'Service',
                  description: ''
                })}
              >
                Add Invoice
              </Button>
            </div>

            <Table striped bordered hover responsive className="mt-3">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Date</th>
                  <th>Due Date</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Paid</th>
                  <th>Balance</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(!form.values.invoices || form.values.invoices.length === 0) ? (
                  <tr>
                    <td colSpan="9" className="text-center text-muted">
                      No invoices found
                    </td>
                  </tr>
                ) : (
                  form.values.invoices?.map((invoice, index) => (
                    <tr key={index}>
                      <td>
                        <Form.Control
                          type="text"
                          name={`invoices.${index}.invoiceNumber`}
                          value={invoice.invoiceNumber || ''}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          isInvalid={
                            formik.touched.invoices?.[index]?.invoiceNumber &&
                            formik.errors.invoices?.[index]?.invoiceNumber
                          }
                        />
                        <Form.Control.Feedback type="invalid">
                          {formik.errors.invoices?.[index]?.invoiceNumber}
                        </Form.Control.Feedback>
                      </td>
                      <td>
                        <Form.Control
                          type="date"
                          name={`invoices.${index}.date`}
                          value={invoice.date || ''}
                          onChange={formik.handleChange}
                          isInvalid={
                            formik.touched.invoices?.[index]?.date &&
                            formik.errors.invoices?.[index]?.date
                          }
                        />
                        <Form.Control.Feedback type="invalid">
                          {formik.errors.invoices?.[index]?.date}
                        </Form.Control.Feedback>
                      </td>
                      <td>
                        <Form.Control
                          type="date"
                          name={`invoices.${index}.dueDate`}
                          value={invoice.dueDate || ''}
                          onChange={formik.handleChange}
                          min={invoice.date}
                          isInvalid={
                            formik.touched.invoices?.[index]?.dueDate &&
                            formik.errors.invoices?.[index]?.dueDate
                          }
                        />
                        <Form.Control.Feedback type="invalid">
                          {formik.errors.invoices?.[index]?.dueDate}
                        </Form.Control.Feedback>
                      </td>
                      <td>
                        <Form.Control
                          type="text"
                          name={`invoices.${index}.description`}
                          value={invoice.description || ''}
                          onChange={formik.handleChange}
                          isInvalid={
                            formik.touched.invoices?.[index]?.description &&
                            formik.errors.invoices?.[index]?.description
                          }
                        />
                        <Form.Control.Feedback type="invalid">
                          {formik.errors.invoices?.[index]?.description}
                        </Form.Control.Feedback>
                      </td>
                      <td>
                        <Form.Control
                          type="number"
                          step="0.01"
                          name={`invoices.${index}.amount`}
                          value={invoice.amount || 0}
                          onChange={formik.handleChange}
                          isInvalid={
                            formik.touched.invoices?.[index]?.amount &&
                            formik.errors.invoices?.[index]?.amount
                          }
                        />
                        <Form.Control.Feedback type="invalid">
                          {formik.errors.invoices?.[index]?.amount}
                        </Form.Control.Feedback>
                      </td>
                      <td>
                        <Form.Control
                          type="number"
                          step="0.01"
                          name={`invoices.${index}.paid`}
                          value={invoice.paid || 0}
                          onChange={(e) => {
                            formik.handleChange(e);
                            // Auto-calculate balance
                            const newPaid = parseFloat(e.target.value) || 0;
                            const amount = parseFloat(invoice.amount) || 0;
                            formik.setFieldValue(
                              `invoices.${index}.balance`,
                              amount - newPaid
                            );
                            // Update status
                            const newStatus = 
                              amount - newPaid <= 0 ? 'Paid' : 
                              new Date(invoice.dueDate) < new Date() ? 'Overdue' : 
                              'Open';
                            formik.setFieldValue(
                              `invoices.${index}.status`,
                              newStatus
                            );
                          }}
                          isInvalid={
                            formik.touched.invoices?.[index]?.paid &&
                            formik.errors.invoices?.[index]?.paid
                          }
                        />
                        <Form.Control.Feedback type="invalid">
                          {formik.errors.invoices?.[index]?.paid}
                        </Form.Control.Feedback>
                      </td>
                      <td className={invoice.balance > 0 ? 'text-danger' : 'text-success'}>
                        {formatCurrency(invoice.balance || 0)}
                      </td>
                      <td>
                        <Badge 
                          bg={
                            invoice.status === 'Paid' ? 'success' :
                            invoice.status === 'Overdue' ? 'danger' :
                            'warning'
                          }
                        >
                          {invoice.status || 'Open'}
                        </Badge>
                      </td>
                      <td className="text-center">
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => remove(index)}
                          title="Remove invoice"
                        >
                          ×
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr className="fw-bold">
                  <td colSpan="4">Totals</td>
                  <td>{formatCurrency(totalAmount)}</td>
                  <td>{formatCurrency(totalPaid)}</td>
                  <td className={totalBalance > 0 ? 'text-danger' : 'text-success'}>
                    {formatCurrency(totalBalance)}
                  </td>
                  <td colSpan="2"></td>
                </tr>
              </tfoot>
            </Table>
          </div>
        )}
      </FieldArray>

      <div className="payment-history mt-4">
        <h5>Payment History</h5>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Date</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Reference</th>
              <th>Applied To</th>
            </tr>
          </thead>
          <tbody>
            {formik.values.payments && formik.values.payments.length > 0 ? (
              formik.values.payments.map((payment, index) => (
                <tr key={index}>
                  <td>{payment.date ? new Date(payment.date).toLocaleDateString() : 'N/A'}</td>
                  <td>{formatCurrency(payment.amount || 0)}</td>
                  <td>{payment.method || ''}</td>
                  <td>{payment.reference || ''}</td>
                  <td>
                    {payment.appliedTo?.map(inv => `INV-${inv}`).join(', ') || 'None'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center text-muted">
                  No payment history
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default Invoicing;