import React from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Paper } from "@mui/material";

const HolidayList = ({ holidays, onEdit, onDelete }) => (
  <TableContainer component={Paper}>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Holiday Name</TableCell>
          <TableCell>Date</TableCell>
          <TableCell align="right">Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {holidays.map((holiday) => (
          <TableRow key={holiday._id}>
            <TableCell>{holiday.name}</TableCell>
            <TableCell>{new Date(holiday.date).toLocaleDateString()}</TableCell>
            <TableCell align="right">
              <Button
                variant="contained"
                color="primary"
                sx={{ marginRight: 1 }}
                onClick={() => onEdit(holiday)}
              >
                Edit
              </Button>
              <Button variant="contained" color="error" onClick={() => onDelete(holiday._id)}>
                Delete
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

export default HolidayList;
