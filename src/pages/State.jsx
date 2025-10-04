import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { processWeeklyData } from "./../Helper/functions";
import "./state.css";
import DataTable from "react-data-table-component";
import { useDispatch, useSelector } from "react-redux";
import { CSVLink } from "react-csv";
import { weeklyOverTimeList } from "../store/OverTimeList/overTimeSlice";
const OverTimeList = () => {
  const [view, setView] = useState("dayGridMonth");
  const [data, setData] = useState([]);
  const overTime = useSelector((state) => state.overTime.list);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(weeklyOverTimeList());
  }, []);

  useEffect(() => {
    let newData = processWeeklyData(
      overTime.data
    );
    setData(newData);
  }, [overTime]);

  useEffect(() => {
    console.log("data : ", data);
  }, [data]);

  const columns = [
    {
      name: "Emp Id",
      selector: (row) => row.empId,
      sortable: true,
    },
    {
      name: "SSN No.",
      selector: (row) => row.ssnNo,
      sortable: true,
    },
    {
      name: "Name",
      selector: (row) => row.employeeName,
      sortable: true,
    },
    {
      name: "Job Name",
      selector: (row) => row.jobName,
      sortable: true,
    },
    {
      name: "Date",
      selector: (row) => row.date,
      sortable: true,
    },
    {
      name: "Productive Hours",
      selector: (row) => row.productiveHours,
      sortable: true,
    },
    {
      name: "Break Time",
      selector: (row) => row.breakTime,
      sortable: true,
    },
    {
      name: "OT Time",
      selector: (row) => row.overtimeHours,
      sortable: true,
    },
    {
      name: "Working Time",
      selector: (row) => row.totalHours,
      sortable: true,
    },
  ];

  return (
    <div className="outerDiv">
        <div className="MuiBox-root css-hoht9f">
            <div className="MuiBox-root css-i9gxme"></div>
        <CSVLink data={data} filename="data.csv" className="csvButton">
            Export to CSV
          </CSVLink>
        </div>
      <div className="bg-white shadow-lg rounded-lg p-6">
        
        <div className="MuiPaper-root MuiPaper-elevation MuiPaper-rounded MuiPaper-elevation1 MuiTableContainer-root css-11xur9t-MuiPaper-root-MuiTableContainer-root">
        <div style={{maxWidth:"79vw"}}>
        <DataTable
              columns={columns}
              data={data ? data : []}
              pagination
              highlightOnHover
              striped
              className=""
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverTimeList;
