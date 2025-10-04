import React, { useState } from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Input,
} from "reactstrap";
import html2pdf from "html2pdf.js";
import "./Invoice.css"; // Custom CSS file for styling
import { MdEditSquare } from "react-icons/md";
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";
import { calculateTotalWorkingTime } from "../Helper/functions";
import axios from "axios";
import { toast } from "react-toastify";
const bashUrl = process.env.REACT_APP_BASH_URL;

const Invoice = () => {
  const [invoiceData, setInvoiceData] = useState([]);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [loading, setLoading] = useState(false); // Track loader state
  const [isFullPage, setIsFullPage] = useState(false); // Track col-md-12 class state

  const [billingAddress, setBillingAddress] = useState({
    name: "Willy wonka",
    address: "1445 West Norwood Avenue, Itasca, Illinois, USA",
    contact: "97223041054",
    email: "wm@com.com",
    siret: "362 521 879 00034",
    vat: "842-484021",
  });
  const [vendorDetails, setVendorDetails] = useState({
    company: "Sisyphis",
    contactName: "John Brandon",
    address: "786/1 Sector-2c, 38200 Gandhinagar, France",
    phone: "8787989887",
    siret: "362 521 879 00034",
    vat: "842-484021",
  });

  const [vendorDetails1, setVendorDetails1] = useState({
    billDate: "03/05/2020",
    deliveryDate: "03/05/2020",
    paymentDeadline: "03/05/2020",
  });

  const [trData, setTrData] = useState([
    {
      id: 1,
      jobName: "Task 1",
      name: "test",
      totalWorkingTime: 5,
    },
    {
      id: 2,
      jobName: "Task 2",
      name: "test",
      totalWorkingTime: 3,
    },
  ]);

  const handleFileData = (data) => {
    // Here you can process the data or update the invoice state with the extracted data
    setInvoiceData(data); // Assuming data is in a structure suitable for the invoice
  };

  // Function to handle opening the invoice modal
  const handleOpenInvoiceModal = () => {
    setShowInvoiceModal(true);
  };

  // Function to handle closing the invoice modal
  const handleCloseInvoiceModal = () => {
    setShowInvoiceModal(false);
  };
  // Function to handle file drop and extraction
  const handleFileDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const data = reader.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        console.log(jsonData);

        let output = calculateTotalWorkingTime(jsonData);
        setTrData(output);
        console.log(output);
        handleCloseInvoiceModal();
      };
      reader.readAsBinaryString(file);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: handleFileDrop,
    accept: ".xlsx", // Only accept .xlsx files
  });

  const [totalDisbursements, setTotalDisbursements] = useState(0);
  const [vatInput, setVatInput] = useState(0);
  const handleRateChange = (id, value) => {
    const updatedTrData = trData.map((tr) => {
      if (tr.id === id) {
        const newAmount = tr.totalWorkingTime * value;
        return { ...tr, ratePerHour: value, amount: newAmount };
      }
      return tr;
    });
    setTrData(updatedTrData);
  };

  // Calculate total HT
  const totalHT = trData.reduce((sum, tr) => sum + tr.amount, 0);

  // Calculate final total
  const finalTotal = totalHT + Number(vatInput) + Number(totalDisbursements);

  const [modal, setModal] = useState(false);
  const [email, setEmail] = useState("");
  const [emailModel, setEmailModel] = useState(false);
  const [modalVendor, setModalVendor] = useState(false);
  const [modalVendor1, setModalVendor1] = useState(false);
  const [formData, setFormData] = useState({ ...billingAddress });
  const [vendorFormData, setVendorFormData] = useState({ ...vendorDetails });
  const [vendorFormData1, setVendorFormData1] = useState({ ...vendorDetails1 });

  const toggleModal = () => {
    setModal(!modal);
  };

  const toggleEmailModel = () => {
    setEmailModel(!emailModel);
  };
  const toggleVendorModal = () => {
    setModalVendor(!modalVendor);
  }
  const toggleVendorModal1 = () => {
    setModalVendor1(!modalVendor1);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleVendorChange = (e) => {
    const { name, value } = e.target;
    setVendorFormData({ ...vendorFormData, [name]: value });
  };

  
  const handleVendorChange1 = (e) => {
    const { name, value } = e.target;
    setVendorFormData1({ ...vendorFormData1, [name]: value });
  };
  const handleSave = () => {
    setBillingAddress({ ...formData });
    toggleModal();
  };

  const handleVendorSave = () => {
    setVendorDetails({ ...vendorFormData });
    toggleVendorModal();
  };

  
  const handleVendorSave1 = () => {
    setVendorDetails1({ ...vendorFormData1 });
    toggleVendorModal1();
  };

  const captureAndConvert = () => {
    const element = document.getElementById("captureInvoice"); // The element to capture
    const originalClass = element.className; // Store the original class name

    setLoading(true); // Show the loader
    setIsFullPage(true); // Change the class to col-md-12 to make it fullscreen

    const options = {
      filename: "invoice.pdf",
      margin: 10,
      image: { type: "jpeg", quality: 1 }, // High-quality image
      html2canvas: { scale: 2 }, // Use CORS for external CSS
    };

    // Convert the element to PDF and download
    html2pdf()
      .from(element)
      .set(options)
      .toPdf()
      .get("pdf")
      .then((pdf) => {
        // Convert PDF to Blob
        const pdfBlob = pdf.output("blob");
  
        // Create FormData
        const formData = new FormData();
        formData.append("file", pdfBlob, "invoice.pdf");
        formData.append("email", email);
        const options = {
          Authorization: `Bearer ${localStorage.getItem("shinpay-vendor-token")}`,
          "Content-Type": "multipart/form-data",
        };

        // Send to API
        axios.post(`${bashUrl}/vendor/invoices/send-invoice`, formData,  {
          headers: options,
        })
        .then((res) => {
          toast.success("invoice sent successfully");
        })
        .catch((err) => {
          console.error("Error saving PDF:", err);
          alert("Failed to save PDF.");
        })
        .finally(() => {
          setLoading(false);
          toggleEmailModel();
          setEmail('')
          element.className = originalClass; // Reset class
        });
      });
  };

  const handleSendEmail = async () => {
    if (!email) {
      alert("Please enter an email address");
      return;
    }
    captureAndConvert();
  }

  return (
    <div className="container my-4 invoice-container pb-5">
      {loading && (
        <div className="loader-overlay bg-light">
          <div className="spinner"></div>
        </div>
      )}

      <div className="row">
        <div className="col-md-12 text-end py-3">
          <Button variant="secondary" onClick={handleOpenInvoiceModal}>
            Upload Excel Sheet
          </Button>
        </div>
        <div
          className={`col-md-8 ${isFullPage ? "col-md-12" : ""}`}
          id="captureInvoice"
        >
          <div className="p-4 pb-0 card">
            <div className="row">
              <div className="col-md-2">
                <img
                  src="./logo/sky.png"
                  className="logo"
                  alt="Logo"
                  style={{
                    width: "130px",
                    background: "#ffead5",
                    padding: "11px",
                    borderRadius: "7px",
                  }}
                />
              </div>
              <div
                className="col-md-7 d-flex justify-content-between position-relative"
                style={{
                  paddingLeft: "20px",
                }}
              >
                <ul
                  className="vendorDetail"
                  style={{
                    listStyle: "none",
                    fontSize: "14px",
                    paddingLeft: "14px",
                  }}
                >
                  <li
                    className="nameHeading"
                    style={{
                      fontSize: "16px",
                      paddingBottom: "4px",
                    }}
                  >
                    <strong>{vendorDetails.company}</strong>
                  </li>
                  <li
                    className="normalHeading"
                    style={{ fontSize: "13px", color: "#aaafba" }}
                  >
                    {vendorDetails.contactName}
                  </li>
                  <li
                    className="normalHeading"
                    style={{ fontSize: "13px", color: "#aaafba" }}
                  >
                    {vendorDetails.address}
                  </li>
                  <li
                    className="normalHeading"
                    style={{ fontSize: "13px", color: "#aaafba" }}
                  >
                    {vendorDetails.phone}
                  </li>
                  <li
                    className="normalHeading"
                    style={{ fontSize: "13px", color: "#aaafba" }}
                  >
                    <strong>SIRET : {vendorDetails.siret}</strong>
                  </li>
                  <li
                    className="normalHeading"
                    style={{ fontSize: "13px", color: "#aaafba" }}
                  >
                    <strong>VAT: {vendorDetails.vat}</strong>
                  </li>
                </ul>
                <MdEditSquare
                  onClick={toggleVendorModal}
                  className="editButton"
                />
              </div>
              <div className="col-md-3 amountDiv">
                <div className="billNo"> #2025-01-0001</div>
                <div>
                  <p
                    className="normalHeading mb-0"
                    style={{ fontSize: "13px", color: "#aaafba" }}
                  >
                    <strong>Total Amount</strong>
                  </p>
                  <h5>${isNaN(finalTotal) ? "0" : finalTotal.toFixed(2)}</h5>
                </div>
              </div>
            </div>
            <div className="border p-3 rounded mt-3">
              
              <div className="row p-20 pb-0">
                <div className="col-md-4 p-3 bg-grey rounded position-relative">
                <MdEditSquare
                  onClick={toggleVendorModal1}
                  className="editButton"
                />
                  <div className="billing mb-0">
                    <p
                      className="normalHeading  mb-0"
                      style={{ fontSize: "13px", color: "#aaafba" }}
                    >
                      Bill Date
                    </p>
                    <p
                      className="nameHeading"
                      style={{
                        fontSize: "16px",
                        paddingBottom: "4px",
                      }}
                    >
                      <strong>{vendorDetails1?.billDate}</strong>
                    </p>
                  </div>
                  <div className="billing mb-0">
                    <p
                      className="normalHeading mb-0"
                      style={{ fontSize: "13px", color: "#aaafba" }}
                    >
                      Delivery Date
                    </p>
                    <p
                      className="nameHeading"
                      style={{
                        fontSize: "16px",
                        paddingBottom: "4px",
                      }}
                    >
                      <strong>{vendorDetails1?.deliveryDate}</strong>
                    </p>
                  </div>
                  <div className="billing mb-0">
                    <p
                      className="normalHeading mb-0"
                      style={{ fontSize: "13px", color: "#aaafba" }}
                    >
                      Terms of Payment
                    </p>
                    <p
                      className="nameHeading"
                      style={{
                        fontSize: "16px",
                        paddingBottom: "4px",
                      }}
                    >
                      <strong>Within 15 days</strong>
                    </p>
                  </div>
                  <div className="billing mb-0">
                    <p
                      className="normalHeading mb-0"
                      style={{ fontSize: "13px", color: "#aaafba" }}
                    >
                      Payment Deadline
                    </p>
                    <p
                      className="nameHeading"
                      style={{
                        fontSize: "16px",
                        paddingBottom: "4px",
                      }}
                    >
                      <strong>{vendorDetails1?.paymentDeadline}</strong>
                    </p>
                  </div>
                </div>
                <div className="col-md-8">
                  <div className="d-flex justify-content-between position-relative">
                    <div>
                      <p
                        className="normalHeading"
                        style={{ fontSize: "13px", color: "#aaafba" }}
                      >
                        Billing Address
                      </p>
                      <p
                        className="nameHeading"
                        style={{
                          fontSize: "16px",
                          paddingBottom: "4px",
                        }}
                      >
                        {billingAddress.name}
                      </p>
                      <p
                        className="normalHeading mb-0"
                        style={{ fontSize: "13px", color: "#aaafba" }}
                      >
                        {billingAddress.address}
                      </p>
                      <p
                        className="normalHeading mb-0"
                        style={{ fontSize: "13px", color: "#aaafba" }}
                      >
                        {billingAddress.contact} | {billingAddress.email}
                      </p>
                      <p
                        className="normalHeading mb-0"
                        style={{ fontSize: "13px", color: "#aaafba" }}
                      >
                        <strong>SIRET: {billingAddress.siret}</strong>
                      </p>
                      <p
                        className="normalHeading mb-0"
                        style={{ fontSize: "13px", color: "#aaafba" }}
                      >
                        <strong>VAT: {billingAddress.vat}</strong>
                      </p>
                    </div>
                    <MdEditSquare
                      onClick={toggleModal}
                      className="editButton"
                    />
                  </div>
                  <div className="noteText">
                    <p
                      className="normalHeading mb-0"
                      style={{ fontSize: "13px", color: "#aaafba" }}
                    >
                      Note
                    </p>
                    <p
                      className="normalHeading mb-0"
                      style={{ fontSize: "13px", color: "#aaafba" }}
                    >
                      <strong>
                        This is a custom message that might be relevant to the
                        customer. It can span up to three or four rows. It can
                        span up to three or four rows.
                      </strong>
                    </p>
                  </div>
                </div>

                <table className="w-100 table p-3 mt-4">
                  <thead className="thead-light">
                    <tr>
                      <th className="text-right">No.</th>
                      <th className="text-right">Items</th>
                      <th className="text-right">Employee Name</th>
                      <th className="text-right">Hours</th>
                      <th className="text-right">Rate/Hour</th>
                      <th className="text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trData?.map((tr, index) => (
                      <tr scope="row" key={tr.id}>
                        <td align="center">{index + 1}</td>
                        <td>{tr.jobName}</td>
                        <td align="center">{tr.name}</td>
                        <td align="center">{tr.totalWorkingTime} hours</td>
                        <td className="text-right">
                          ${" "}
                          <input
                            className="form-control inputNumber "
                            type="number"
                            value={tr.ratePerHour || 0}
                            onChange={(e) =>
                              handleRateChange(tr.id, Number(e.target.value))
                            }
                          />
                        </td>
                        <td>${tr?.amount?.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="d-flex justify-content-end">
                  <div className="col-md-5">
                    <div className="d-flex justify-content-between mb-0">
                      <p
                        className="normalHeading mb-0"
                        style={{ fontSize: "13px", color: "#aaafba" }}
                      >
                        Total HT
                      </p>
                      <p
                        className="nameHeading f-14 mb-0"
                        style={{
                          fontSize: "16px",
                          paddingBottom: "4px",
                        }}
                      >
                        <strong>
                          $ {isNaN(totalHT) ? "0" : totalHT.toFixed(2)}
                        </strong>
                      </p>
                    </div>
                    <div className="d-flex justify-content-between mb-0">
                      <p
                        className="normalHeading mb-0"
                        style={{ fontSize: "13px", color: "#aaafba" }}
                      >
                        Total Disbursements
                      </p>
                      <p
                        className="nameHeading  f-14 mb-0"
                        style={{
                          fontSize: "16px",
                          paddingBottom: "4px",
                        }}
                      >
                        <strong>
                          ${" "}
                          <input
                            className="form-control inputNumber "
                            type="number"
                            value={totalDisbursements}
                            onChange={(e) =>
                              setTotalDisbursements(Number(e.target.value))
                            }
                          />
                        </strong>
                      </p>
                    </div>
                    <div className="d-flex justify-content-between mb-0">
                      <p
                        className="normalHeading mb-0"
                        style={{ fontSize: "13px", color: "#aaafba" }}
                      >
                        Total VAT
                      </p>
                      <p
                        className="nameHeading f-14 mb-0"
                        style={{
                          fontSize: "16px",
                          paddingBottom: "4px",
                        }}
                      >
                        <strong>
                          ${" "}
                          <input
                            className="form-control inputNumber "
                            type="number"
                            value={vatInput}
                            onChange={(e) =>
                              setVatInput(Number(e.target.value))
                            }
                          />
                        </strong>
                      </p>
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between mb-4">
                      <p
                        className="h4 nameHeading mb-0"
                        style={{
                          fontSize: "16px",
                          paddingBottom: "4px",
                        }}
                      >
                        Total Price
                      </p>
                      <p
                        className="h4 nameHeading mb-0"
                        style={{
                          fontSize: "16px",
                          paddingBottom: "4px",
                        }}
                      >
                        <strong>
                          $ {isNaN(finalTotal) ? "0" : finalTotal.toFixed(2)}
                        </strong>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="invoice-footer col-md-12 py-4">
              <p
                className="h4 normalHeading"
                style={{ fontSize: "13px", color: "#aaafba" }}
              >
                Terms &amp; Conditions:
              </p>
              <p
                className="h4 nameHeading f-14 mb-0"
                style={{
                  fontSize: "16px",
                  paddingBottom: "4px",
                }}
              >
                <strong>
                  Please pay within 15 days of receiving this invoice.
                </strong>
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="p-4 card text-center mb-4">
            <p>
              <strong>Invoice Not yet Sent!</strong>
            </p>
            <button
              className="btn btn-success px-4"
              onClick={toggleEmailModel}
            >
              Send Invoice
            </button>
          </div>
        </div>
      </div>

      {/* Reactstrap Modal for Editing Billing Address */}
      <Modal isOpen={modal} toggle={toggleModal}>
        <ModalHeader toggle={toggleModal}>Edit Billing Address</ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label for="name">Name</Label>
              <Input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </FormGroup>
            <FormGroup>
              <Label for="address">Address</Label>
              <Input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </FormGroup>
            <FormGroup>
              <Label for="contact">Contact</Label>
              <Input
                type="text"
                id="contact"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
              />
            </FormGroup>
            <FormGroup>
              <Label for="email">Email</Label>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </FormGroup>
            <FormGroup>
              <Label for="siret">SIRET</Label>
              <Input
                type="text"
                id="siret"
                name="siret"
                value={formData.siret}
                onChange={handleChange}
              />
            </FormGroup>
            <FormGroup>
              <Label for="vat">VAT</Label>
              <Input
                type="text"
                id="vat"
                name="vat"
                value={formData.vat}
                onChange={handleChange}
              />
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggleModal}>
            Close
          </Button>
          <Button color="primary" onClick={handleSave}>
            Save changes
          </Button>
        </ModalFooter>
      </Modal>

      {/* Reactstrap Modal for Editing Vendor Details */}
      <Modal isOpen={modalVendor} toggle={toggleVendorModal}>
        <ModalHeader toggle={toggleVendorModal}>
          Edit Company Details
        </ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label for="vendorCompany">Company</Label>
              <Input
                type="text"
                id="vendorCompany"
                name="company"
                value={vendorFormData.company}
                onChange={handleVendorChange}
              />
            </FormGroup>
            <FormGroup>
              <Label for="vendorContactName">Contact Name</Label>
              <Input
                type="text"
                id="vendorContactName"
                name="contactName"
                value={vendorFormData.contactName}
                onChange={handleVendorChange}
              />
            </FormGroup>
            <FormGroup>
              <Label for="vendorAddress">Address</Label>
              <Input
                type="text"
                id="vendorAddress"
                name="address"
                value={vendorFormData.address}
                onChange={handleVendorChange}
              />
            </FormGroup>
            <FormGroup>
              <Label for="vendorPhone">Phone</Label>
              <Input
                type="text"
                id="vendorPhone"
                name="phone"
                value={vendorFormData.phone}
                onChange={handleVendorChange}
              />
            </FormGroup>
            <FormGroup>
              <Label for="vendorSiret">SIRET</Label>
              <Input
                type="text"
                id="vendorSiret"
                name="siret"
                value={vendorFormData.siret}
                onChange={handleVendorChange}
              />
            </FormGroup>
            <FormGroup>
              <Label for="vendorVat">VAT</Label>
              <Input
                type="text"
                id="vendorVat"
                name="vat"
                value={vendorFormData.vat}
                onChange={handleVendorChange}
              />
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggleVendorModal}>
            Close
          </Button>
          <Button color="primary" onClick={handleVendorSave}>
            Save changes
          </Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={modalVendor1} toggle={toggleVendorModal1}>
        <ModalHeader toggle={toggleVendorModal1}>
          Edit Details
        </ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label for="BillDate">Bill Date</Label>
              <Input
                type="date"
                id="BillDate"
                name="billDate"
                value={vendorFormData1.billlDate}
                onChange={handleVendorChange1}
              />
            </FormGroup>
            <FormGroup>
              <Label for="DeliveryDate">Delivery Date</Label>
              <Input
                type="date"
                id="DeliveryDate"
                name="deliveryDate"
                value={vendorFormData.deliveryDate}
                onChange={handleVendorChange1}
              />
            </FormGroup>
            <FormGroup>
              <Label for="paymentDeadline">Payment Deadline</Label>
              <Input
                type="date"
                id="paymentDeadline"
                name="paymentDeadline"
                value={vendorFormData.paymentDeadline}
                onChange={handleVendorChange1}
              />
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggleVendorModal1}>
            Close
          </Button>
          <Button color="primary" onClick={handleVendorSave1}>
            Save changes
          </Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={emailModel} toggle={toggleEmailModel}>
        <ModalHeader toggle={toggleEmailModel}>
          Enter Email to send invoice
        </ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label for="email">Email</Label>
              <Input
                type="text"
                id="email"
                name="email"
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
        <Button color="primary" onClick={handleSendEmail} disabled={loading}>
          {loading ? "Sending..." : "Send"}
        </Button>
        <Button color="secondary" onClick={toggleEmailModel}>
            Close
          </Button>
        </ModalFooter>
      </Modal>


      <Modal isOpen={showInvoiceModal} toggle={handleCloseInvoiceModal}>
        <div className="modal-header">
          <h5 className="modal-title">Upload Excel File</h5>
        </div>
        <div className="modal-body">
          <div
            {...getRootProps()}
            style={{
              border: "2px dashed #ccc",
              padding: "20px",
              textAlign: "center",
              cursor: "pointer",
            }}
          >
            <input {...getInputProps()} />
            <p>Drag & drop an .xlsx file here, or click to select one.</p>
          </div>
        </div>
        <div className="modal-footer">
          <Button color="secondary" onClick={handleCloseInvoiceModal}>
            Close
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Invoice;
