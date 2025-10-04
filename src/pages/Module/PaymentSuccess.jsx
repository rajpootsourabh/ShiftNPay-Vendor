import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  Spinner,
  Alert,
  ListGroup,
  ListGroupItem,
  Button,
} from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSession,
  saveTransaction,
} from "../../store/MemberShip/memberShipSlice";

const PaymentSuccess = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const { sessionDetails, loading } = useSelector((state) => state.membership);

  useEffect(() => {
    if (sessionId) {
      dispatch(fetchSession(sessionId));
    }
  }, [dispatch, sessionId]);

  useEffect(() => {
    if (sessionDetails) {
      dispatch(saveTransaction(sessionDetails));
    }
  }, [sessionDetails]);

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <Container
      fluid
      className="d-flex align-items-center justify-content-center min-vh-100 bg-light"
    >
      <Row className="w-100 justify-content-center">
        <Col md={8} lg={6}>
          {loading ? (
            <div className="text-center py-5">
              <Spinner color="primary" />
            </div>
          ) : !sessionDetails ? (
            <Alert color="danger" className="text-center mt-5">
              Unable to retrieve payment details.
            </Alert>
          ) : (
            <Card className="shadow">
              <CardBody>
                <CardTitle tag="h4" className="text-success mb-4 text-center">
                  ✅ Payment Successful
                </CardTitle>

                <p>
                  <strong>Payment Status:</strong>{" "}
                  {sessionDetails.payment_status}
                </p>
                <p>
                  <strong>Total Amount:</strong> $
                  {(sessionDetails.amount_total / 100).toFixed(2)}{" "}
                  {sessionDetails.currency.toUpperCase()}
                </p>
                <p>
                  <strong>Customer:</strong>{" "}
                  {sessionDetails.customer_details?.name} (
                  {sessionDetails.customer_details?.email})
                </p>
                <p>
                  <strong>Subscription ID:</strong>{" "}
                  {sessionDetails.subscription?.id}
                </p>

                {sessionDetails.metadata?.type === "trial" ? (
                  <>
                    <p>
                      <strong>Plan Type:</strong> 30-Day{" "}
                      <span className="text-info">Free Trial</span>
                    </p>
                    <p>
                      <strong>Trial Period:</strong> 30 days
                    </p>
                    <p>
                      <strong>Trial Ends On:</strong>{" "}
                      {sessionDetails.trial_end
                        ? new Date(
                            sessionDetails.trial_end * 1000
                          ).toLocaleDateString()
                        : "N/A"}
                    </p>
                    <Alert color="info">
                      Enjoy your trial! You won’t be charged until the trial
                      ends.
                    </Alert>
                  </>
                ) : (
                  <p>
                    <strong>Plan Type:</strong> Paid Subscription
                  </p>
                )}

                <hr />

                <h5>Modules Purchased:</h5>
                <ListGroup>
                  {sessionDetails.line_items?.data?.map((item) => (
                    <ListGroupItem key={item.id}>
                      <strong>{item.description}</strong> — $
                      {(item.amount_total / 100).toFixed(2)} /{" "}
                      {item.price.recurring.interval}
                    </ListGroupItem>
                  ))}
                </ListGroup>

                <div className="text-center mt-4">
                  <Button color="primary" onClick={handleBackToDashboard}>
                    Go to Dashboard
                  </Button>
                </div>
              </CardBody>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default PaymentSuccess;
