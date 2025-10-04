import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link, useNavigate } from "react-router-dom";
import { Button, Spinner } from "reactstrap";
import { FiLogOut } from "react-icons/fi";
import { useDispatch } from "react-redux";
import { fetchPurchasedModules } from "../store/MemberShip/memberShipSlice";
import * as MdIcons from "react-icons/md";
import "./profile.css";
import logo from "./../assets/widgets/logo.png";
import { startTransition } from "react";

const widgetImageMap = {
  1: require("./../assets/widgets/Employee.png"),
  2: require("./../assets/widgets/attendence.png"),
  3: require("./../assets/widgets/hire.png"),
  4: require("./../assets/widgets/restaurent.png"),
  5: require("./../assets/widgets/finance.png"),
  6: require("./../assets/widgets/homecare-new.png"),
};

const ProductWidget = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [allowedWidgets, setAllowedWidgets] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("shinpay-vendor-token");
    navigate("/login");
  };

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const res = await dispatch(fetchPurchasedModules()).unwrap();
        const { modules = [] } = res;

        const widgets = modules.map((mod) => {
          return {
            cat: mod.cat,
            title: mod.title,
            img: widgetImageMap[mod.cat] || "",
            link: mod.routes?.[0]?.path || "/",
          };
        });

        // Add the "Purchase Module" option
        widgets.push(
          {
            cat: "purchase",
            title: "Purchase Module",
            img: require("./../assets/widgets/purchase_module.png"),
            link: "/modules",
          },
          {
            cat: "homeCare",
            title: "HomeCare Management",
            img: require("./../assets/widgets/homecare-new.png"),
            link: "/generations.idb-sys/home",
          }
        );

        setAllowedWidgets(widgets);
      } catch (err) {
        console.error("Failed to fetch vendor modules", err);
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, [dispatch]);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner color="primary" />
      </div>
    );
  }

  return (
    <div className="product-widget-outer" style={{ position: "relative" }}>
      <img
        src={logo}
        width="150px"
        style={{ position: "absolute", left: "21px", top: "-32px" }}
      />
      <Button
        color="danger"
        outline
        className="position-absolute top-0 end-0 m-3 d-flex align-items-center"
        onClick={handleLogout}
        style={{ zIndex: 10 }}
      >
        <FiLogOut className="me-2" style={{ fontSize: "1.25rem" }} />
        Logout
      </Button>

      <div className="container">
        <div className="product-widget mx-auto">
          <ul className="list-unstyled text-center">
            {allowedWidgets.map((item, index) => (
              <li key={index}>
                <button
                  className="btn p-0 list-style-none"
                  onClick={() =>
                    startTransition(() => {
                      navigate(item.link);
                    })
                  }
                >
                  <span className="wgt-icon">
                    <img src={item.img} alt={item.title} />
                  </span>
                  {item.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProductWidget;
