import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Typography, Container, CircularProgress } from '@mui/material';
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';
import { fetchSubscriptionPlans } from '../store/MemberShip/memberShipSlice';

const stripePromise = loadStripe('pk_test_51HXRXfI1EP17yzxTUMGjxwf2E1TGzaYEsST2G8RM8JJMLmjIwjjAMDCIP561YpUmMg4PNGMWNfMhbrPNLST1mTgv00n2iRfjWs'); // Use your Stripe publishable key
const BaseUrl = process.env.REACT_APP_BASH_URL;

const options = {
    Authorization: `Bearer ${localStorage.getItem("shinpay-vendor-token")}`,
    "Content-Type": "application/json",
  };



const SubscriptionPlans = () => {
  const dispatch = useDispatch();
  const { plans, status, error } = useSelector((state) => state.membership);

  useEffect(() => {
      dispatch(fetchSubscriptionPlans());
  }, []);
  useEffect(()=>{
    console.log('plans : ' , plans)
  },[plans])
  const handleSubscribe = async (planId) => {
    const stripe = await stripePromise;

    try {
      const { data: sessionId } = await axios.post(`${BaseUrl}/vendor/create-checkout-session`, { planId }, { headers: options });

      const { error } = await stripe.redirectToCheckout({ sessionId:sessionId.id });

      if (error) {
        console.error('Error redirecting to checkout:', error);
      }
    } catch (error) {
      console.error('Error subscribing:', error);
    }
  };

  if (status === 'loading') {
    return (
      <Container>
        <CircularProgress />
      </Container>
    );
  }

  if (status === 'failed') {
    return (
      <Container>
        <Typography variant="h6" color="error">
          Error: {error}
        </Typography>
      </Container>
    );
  }


  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Subscription Plans
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Plan</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Price (Monthly)</TableCell>
              <TableCell>Price (Annually)</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
           {plans?.map((plan) => {

              return (
                <TableRow key={plan._id}>
                  <TableCell>{plan.title}</TableCell>
                  <TableCell>{plan.type}</TableCell>
                  <TableCell>${plan.monthlyPrice.toFixed(2)}</TableCell>
                  <TableCell>${plan.yearlyPrice.toFixed(2)}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleSubscribe(plan._id)}
                    >
                      Subscribe
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default SubscriptionPlans;
