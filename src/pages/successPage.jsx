import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Typography, CircularProgress, Paper, Grid } from '@mui/material';

const BaseUrl = process.env.REACT_APP_BASH_URL;

const options = {
    Authorization: `Bearer ${localStorage.getItem("shinpay-vendor-token")}`,
    "Content-Type": "application/json",
};

const SuccessPage = () => {
    const [loading, setLoading] = useState(true);
    const [subscription, setSubscription] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getSession = async () => {
            const queryParams = new URLSearchParams(window.location.search);
            const sessionId = queryParams.get('session_id');

            if (sessionId) {
                try {
                    // Call backend to handle successful subscription and fetch subscription details
                    const response = await axios.post(`${BaseUrl}/vendor/stripe/handle-success`, { sessionId }, { headers: options });
                    setSubscription(response.data.subscription);
                } catch (err) {
                    setError('Failed to fetch subscription details.');
                } finally {
                    setLoading(false);
                }
            } else {
                setError('No session ID found.');
                setLoading(false);
            }
        };

        getSession();
    }, []);

    if (loading) return <CircularProgress />;
    if (error) return <Typography variant="h6" color="error">{error}</Typography>;

    return (
        <Container>
            <Typography variant="h4" gutterBottom>Thank you for your subscription!</Typography>
            <Paper style={{ padding: 20 }}>
                <Typography variant="h6">Subscription Details:</Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <Typography variant="body1"><strong>Subscription ID:</strong> {subscription.id}</Typography>
                        <Typography variant="body1"><strong>Plan Title:</strong> {subscription.title}</Typography>
                        <Typography variant="body1"><strong>Type:</strong> {subscription.type}</Typography>
                        <Typography variant="body1"><strong>Price:</strong> ${subscription.price.toFixed(2)}</Typography>
                        <Typography variant="body1"><strong>Payment Term:</strong> {subscription.paymentTerm}</Typography>
                        <Typography variant="body1"><strong>Start Date:</strong> {new Date(subscription.startDate).toLocaleDateString()}</Typography>
                        <Typography variant="body1"><strong>Trial Period:</strong> {subscription.trialPeriodDays} days</Typography>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
};

export default SuccessPage;
