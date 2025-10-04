import React, { useEffect, useState } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button
} from '@mui/material';
import moment from 'moment';
import { invoiceList } from "../store/Invoice/InvoiceSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

function InvoiceListing() {
  const invoices = useSelector((state) => state.invoice.list);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [invoiceData, setInvoiceData] = useState([]);

  useEffect(() => {
    dispatch(invoiceList());
  }, [dispatch]);

  useEffect(() => {
    setInvoiceData(invoices);
  }, [invoices]);

  return (
    <Paper sx={{ width: '100%', padding: 2 }}>

      <Button variant="contained" color="primary" 
       onClick={() => navigate(`/send-invoice`)}
       >Create Invoice</Button>
      <TableContainer component={Paper} sx={{ marginTop: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Invoice Title</TableCell>
              <TableCell>Invoice Link</TableCell>
              <TableCell>Sent To</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoiceData?.map((invoice) => (
              <TableRow key={invoice._id}>
                <TableCell>{invoice.name}</TableCell>
                <TableCell>{invoice.invoiceUrl}</TableCell>
                <TableCell>{invoice.email}</TableCell>
                <TableCell>{moment(invoice.updateAt).format('D-M-Y')}</TableCell>
                <TableCell align="right">
                <Button
    variant="contained"
    color="success"
    component="a"
    href={invoice.invoiceUrl}
    target="_blank"
    rel="noopener noreferrer"
  >
    View
  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

export default InvoiceListing;
