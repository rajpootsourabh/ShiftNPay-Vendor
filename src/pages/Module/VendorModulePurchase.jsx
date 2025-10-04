import React, { useEffect, useState, useCallback } from "react";
import { Row, Col, Modal, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchModules,
  createStripeCheckoutSession,
  fetchPurchasedModules,
  createTrialCheckoutSession,
} from "../../store/MemberShip/memberShipSlice";
import { loadStripe } from "@stripe/stripe-js";
import * as MdIcons from "react-icons/md";

const stripePromise = loadStripe(
  "pk_test_51HXRXfI1EP17yzxTUMGjxwf2E1TGzaYEsST2G8RM8JJMLmjIwjjAMDCIP561YpUmMg4PNGMWNfMhbrPNLST1mTgv00n2iRfjWs"
);

const VendorModulePurchase = () => {
  const dispatch = useDispatch();
  const { modules, status, error } = useSelector((state) => state.membership);
  const [selected, setSelected] = useState([]);
  const [purchasedModules, setPurchasedModules] = useState([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Get the appropriate icon component
  const getIconComponent = (iconName) => {
    const IconComponent = MdIcons[iconName] || MdIcons.MdDashboard;
    return <IconComponent size={40} color="#108A00" />;
  };

  const fetchData = useCallback(async () => {
    try {
      setIsInitialLoad(true);
      await dispatch(fetchModules());
      const purchased = await dispatch(fetchPurchasedModules()).unwrap();
      setPurchasedModules(purchased.modules || []);
    } catch (err) {
      console.error("Error loading modules:", err);
    } finally {
      setIsInitialLoad(false);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleSelection = useCallback((cat) => {
    setSelected((prev) =>
      prev.includes(cat) ? prev.filter((id) => id !== cat) : [...prev, cat]
    );
  }, []);

  const handleCheckout = useCallback(async () => {
    if (!selected.length) return alert("Select at least one module.");

    const stripe = await stripePromise;
    const { payload } = await dispatch(
      createStripeCheckoutSession({ moduleCats: selected })
    );

    if (payload?.id) {
      await stripe.redirectToCheckout({ sessionId: payload.id });
    } else {
      alert("Failed to initiate checkout.");
    }
  }, [selected, dispatch]);

  const handleStartTrial = useCallback(async () => {
    if (!selected.length) return alert("Select at least one module.");

    const stripe = await stripePromise;

    const { payload } = await dispatch(
      createTrialCheckoutSession({ moduleCats: selected })
    );

    if (payload?.id) {
      await stripe.redirectToCheckout({ sessionId: payload.id });
    } else {
      alert("Failed to initiate trial checkout.");
    }
  }, [selected, dispatch]);

  const availableModules = React.useMemo(() => {
    return modules.filter((mod) => !purchasedModules.includes(mod.cat));
  }, [modules, purchasedModules]);

  return (
    <div className="Module-name" style={{ background: "#F6F6F6" }}>
      <div className="container">
        <h1 className="text-center mb-4">Choose Your Modules</h1>

        {isInitialLoad ? (
          <div className="text-center my-5">
            <Spinner animation="border" />
          </div>
        ) : error ? (
          <p className="text-danger text-center">Failed to load modules.</p>
        ) : availableModules.length === 0 ? (
          <p className="text-center text-muted">
            You have already purchased all available modules.
          </p>
        ) : (
          <Row>
            <Col md={8}>
              <Row>
                {availableModules.map((mod) => (
                  <Col md={6} key={mod.cat} className="mb-3">
                    <div className="module-name">
                      <div className="module-ico">
                        {getIconComponent(mod.icon)}
                      </div>
                      <div className="module-desc">
                        <h2>{mod.title}</h2>
                        <p>{mod.description || "Access to module features"}</p>
                        <h5>${mod.pricePerMonth} / month</h5>
                        <div className="button">
                          <a
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              toggleSelection(mod.cat);
                            }}
                            style={{
                              backgroundColor: selected.includes(mod.cat)
                                ? "#0d6efd"
                                : "#108A00",
                            }}
                          >
                            {selected.includes(mod.cat)
                              ? "Selected"
                              : "Select Module"}
                          </a>
                        </div>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            </Col>

            <Col md={4}>
              <div className="free-trial">
                <h2>Get started with your 30-day free trial!</h2>
                <div className="free-trial-btn">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowModal(true);
                    }}
                  >
                    Start your free Trial
                  </a>
                </div>
              </div>
            </Col>
          </Row>
        )}

        {selected.length > 0 && (
          <div className="text-center mt-4">
            <button className="btn btn-dark btn-lg" onClick={handleCheckout}>
              Proceed to Checkout
            </button>
          </div>
        )}

        <Modal
          show={showModal}
          onHide={() => setShowModal(false)}
          centered
          className="module-popup"
        >
          <Modal.Header closeButton style={{ border: "none" }} />
          <Modal.Body className="text-center pb-5">
            {getIconComponent("MdCardGiftcard")}
            <h4>Try it free for 30 days!</h4>
            <p className="text-secondary">
              <small>You won't be charged until your trial ends.</small>
            </p>
            <div className="mt-3">
              <p className="text-muted mb-2">
                <strong>Select modules for trial:</strong>
              </p>
              <div className="d-flex flex-wrap justify-content-center">
                {availableModules.map((mod) => (
                  <div
                    key={mod.cat}
                    className="badge  border m-1 px-3 py-2"
                    style={{
                      cursor: "pointer",
                      backgroundColor: selected.includes(mod.cat)
                        ? "#108a00"
                        : "#f8f9fa",
                      color: selected.includes(mod.cat) ? "#fff" : "#000",
                    }}
                    onClick={() => toggleSelection(mod.cat)}
                  >
                    {mod.title}
                  </div>
                ))}
              </div>
            </div>

            <div className="button mt-4">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleStartTrial();
                }}
              >
                Start your free Trial
              </a>
            </div>
          </Modal.Body>
        </Modal>
      </div>

      <style jsx>{`
        .Module-name {
          padding: 35px 0;
          font-family: "Poppins", sans-serif;
        }

        .Module-name h1 {
          font-size: 30px;
          color: #000;
          text-align: center;
        }

        .module-name {
          background: #fff;
          padding: 25px 15px;
          border: 1px solid #b1cdd9;
          border-radius: 10px;
          margin-top: 20px;
          display: flex;
        }

        .module-desc h2 {
          font-size: 22px;
          margin: 0;
        }

        .module-desc p {
          color: #767676;
          margin: 0;
        }

        .module-desc h5 {
          font-weight: bold;
          font-size: 18px;
          padding: 5px 0;
        }

        .button a {
          display: inline-block;
          background: #108a00;
          padding: 5px 15px;
          color: #fff;
          border-radius: 5px;
          text-decoration: none;
          transition: background-color 0.3s;
        }

        .button a:hover {
          background: #0c7000;
          color: #fff;
        }

        .module-ico {
          margin-right: 15px;
          display: flex;
          align-items: center;
        }

        .free-trial {
          background: #108a00;
          padding: 25px;
          border-radius: 20px;
          margin-top: 20px;
          border: 2px solid #fff;
        }

        .free-trial h2 {
          color: #fff;
          font-size: 24px;
        }

        .free-trial-btn a {
          background: #fff;
          color: #000;
          font-size: 16px;
          text-decoration: none;
          padding: 5px 15px;
          border-radius: 4px;
          margin-top: 6px;
          display: inline-block;
          transition: background-color 0.3s;
        }

        .free-trial-btn a:hover {
          background: #f0f0f0;
          color: #000;
        }

        .module-popup .modal-body {
          text-align: center;
          padding-bottom: 40px;
        }

        .module-popup svg {
          width: 80px;
          height: 80px;
          color: #108a00;
          margin-bottom: 15px;
        }
      `}</style>
    </div>
  );
};

export default VendorModulePurchase;
