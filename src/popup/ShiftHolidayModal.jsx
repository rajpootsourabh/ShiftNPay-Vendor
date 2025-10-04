import React from "react";
import { Modal, Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, IconButton, Divider } from "@mui/material";

const ShiftHolidayModal = ({ showModal, modalData, setShowModal }) => {

  console.log(modalData)
  return (
    <Modal
      open={showModal}
      onClose={() => setShowModal(false)}
      aria-labelledby="view-info-modal-title"
      aria-describedby="view-info-modal-description"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "60%",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography id="view-info-modal-title" variant="h6">
            Shift and Holiday Info for{" "}
            {new Date(modalData?.date).toLocaleDateString("en-US")}{" "}
          </Typography>
          
        </Box>
        <Divider sx={{ my: 2 }} />

        {/* Shifts Table */}
        <Typography variant="subtitle1">Shifts:</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Employee Name</TableCell>
                <TableCell>Start Time</TableCell>
                <TableCell>End Time</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
            {modalData?.shifts?.map((shift, index) => (
  <TableRow key={index}>
    <TableCell>{shift.name}</TableCell>
    <TableCell>
      {new Date(shift.shift.start).toLocaleDateString("en-US")}{" "}
      {new Date(shift.shift.start).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })}
    </TableCell>
    <TableCell>
      {new Date(shift.shift.end).toLocaleDateString("en-US")}{" "}
      {new Date(shift.shift.end).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })}
    </TableCell>
  </TableRow>
))}

            </TableBody>
          </Table>
        </TableContainer>

        {/* Holidays Table */}
        <Typography variant="subtitle1" sx={{ mt: 3 }}>
          Holidays:
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Employee Name</TableCell>
                <TableCell>Holiday Type</TableCell>
                <TableCell>Reason</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {modalData?.holidays?.map((holiday, index) => (
                <TableRow key={index}>
                  <TableCell>{holiday.name}</TableCell>
                  <TableCell>{holiday.leaveType}</TableCell>
                  <TableCell>{holiday.reason}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Close Button */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
          <Button variant="outlined" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ShiftHolidayModal;
