import React, { useState, useEffect } from "react";
import { TextField, Button, Paper } from "@mui/material";

const HolidayForm = ({ onSubmit, holiday }) => {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    if (holiday) {
      setName(holiday.name);
      setDate(holiday.date.split("T")[0]); // Extracts date portion for date input
    }
  }, [holiday]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name, date });
    setName("");
    setDate("");
  };

  return (
    <Paper sx={{ padding: 2, marginBottom: 2 }}>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Holiday Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          required
          sx={{ marginBottom: 2 }}
        />
        <TextField
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          fullWidth
          required
          sx={{ marginBottom: 2 }}
          InputLabelProps={{
            shrink: true,
          }}
        />
        <Button type="submit" variant="contained" color="primary">
          {holiday ? "Update Holiday" : "Add Holiday"}
        </Button>
      </form>
    </Paper>
  );
};

export default HolidayForm;
