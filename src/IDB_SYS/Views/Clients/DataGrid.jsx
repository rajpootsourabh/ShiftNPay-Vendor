import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Plus from "./../../assets/images/Plus.png";
import deleteIcon from "./../../assets/images/icons/delete.png";
import audit from "./../../assets/images/icons/audit.png";
import edit from "./../../assets/images/icons/edit.png";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import {
  createClient,
  deleteClient,
  fetchClientById,
  fetchClientByVendor,
  updateClient,
} from "../../../store/IDB_SYS/Clients/clientSlice";
import { Link, useNavigate } from "react-router-dom";

const ClientSchema = Yup.object().shape({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone1: Yup.string().required("Primary phone is required"),
  status: Yup.string().required("Status is required"),
  gender: Yup.string().required("Gender is required"),
  dob: Yup.date().required("Date of birth is required"),
});
const DataGrid = () => {
const navigate = useNavigate();

  const dispatch = useDispatch();
  const { clients } = useSelector((state) => state.client);
  const [apiLoading, setApiLoading] = useState(false);
  const editClient  = (clientId) => {
    console.log(clientId)
    navigate(`/generations.idb-sys/clients/edit/${clientId}`);
  }
  useEffect(() => {
    console.log('called listing page ')
    dispatch(fetchClientByVendor());
  }, [dispatch]);

  return (
    <>
      {apiLoading && (
        <div className="overlay">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      <div className="table-responsive table-striped custom-table-new">
        <table className="table table-bordered">
          <thead className="table-success text-white">
            <tr>
              <th style={{ width: "90px" }}>
                <div className="d-flex flex-wrap">
                  <div className="custom-btn py-1 round">
                  <Link to="/generations.idb-sys/clients/add">
                    <span className="d-flex align-items-center">
                      <span>
                        <img src={Plus} className="icons mx-1" />
                        {"New"}
                      </span>
                    </span>
                  </Link>
                </div>
                </div>
              </th>
              <th className="text-left">Name</th>
              <th className="text-left">Contact</th>
              <th className="text-left">Status</th>
              <th className="text-left">Service Dates</th>
              <th className="text-left">Address</th>
            </tr>
          </thead>
          <tbody>
            {clients?.length > 0 ? (
              clients.map((row, index) => (
                <tr key={index}>
                  <td>
                    <div className="d-flex flex-wrap">
                      <div className="action-buttons">
                        <span
                          className="d-flex align-items-center"
                          style={{ cursor: "pointer" }}
                          onClick={()=>{
                            editClient(row._id)
                          }}
                        >
                          <img src={edit} className="icons mx-1" />
                        </span>
                        <span
                          className="d-flex align-items-center"
                          style={{ cursor: "pointer" }}
                        >
                          <img src={deleteIcon} className="icons mx-1" />
                        </span>
                        <span
                          className="d-flex align-items-center"
                          style={{ cursor: "pointer" }}
                        >
                          <img src={audit} className="icons mx-1" />
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    {row.firstName} {row.middleInitial} {row.lastName}
                    <div className="small text-muted">
                      DOB: {new Date(row.dob).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    <div>{row.email}</div>
                    <div>{row.phone1}</div>
                    {row.phone2 && <div>Alt: {row.phone2}</div>}
                  </td>
                  <td>
                    <span className={`badge ${row.status === 'A' ? 'bg-success' : 'bg-secondary'}`}>
                      {row.status === 'A' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="small">
                      <strong>Start:</strong> {new Date(row.serviceStart).toLocaleDateString()}
                    </div>
                    <div className="small">
                      <strong>End:</strong> {row.serviceEnd ? new Date(row.serviceEnd).toLocaleDateString() : 'Present'}
                    </div>
                  </td>
                  <td>
                    <div>{row.homeAddress1}</div>
                    {row.homeAddress2 && <div>{row.homeAddress2}</div>}
                    <div>
                      {row.homeCity}, {row.homeState} {row.homeZip}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center">
                  No record found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default DataGrid;