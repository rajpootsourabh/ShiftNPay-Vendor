import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Typography, Paper, List, ListItem, Divider } from "@mui/material";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/en-gb";
import "./notification.css";
import { FaBell } from "react-icons/fa"; // Importing notification icon from react-icons
import {
  markAllAsRead,
  notificationList,
} from "../store/Notification/userNotificationsSlice";

dayjs.extend(relativeTime);
dayjs.locale("en-gb");

const NotificationList = ({ user }) => {
  const dispatch = useDispatch();

  const notifications = useSelector(
    (state) => state.notifications.notifications
  );

  useEffect(() => {
    dispatch(notificationList(user?._id));
    dispatch(markAllAsRead(user?._id));
  }, [user?._id]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen mainStartDiv">
      <div className="card" style={{ overflow: "hidden" }}>
        <div
          className="scrollbar-overlay simplebar-scrollable-y"
          style={{
            maxHeight: "590px",
            marginRight: "-34px",
            overflowY: "Scroll",
          }}
          data-simplebar="init"
        >
          {notifications.length > 0 ? (
            <div className="simplebar-wrapper" style={{ margin: "0px" }}>
              <div className="simplebar-height-auto-observer-wrapper">
                <div className="simplebar-height-auto-observer"></div>
              </div>
              <div className="simplebar-mask">
                <div
                  className="simplebar-offset"
                  style={{ right: "0px", bottom: "0px" }}
                >
                  <div
                    className="simplebar-content-wrapper"
                    tabindex="0"
                    role="region"
                    aria-label="scrollable content"
                    style={{ height: "100%", overflow: "hidden scroll" }}
                  >
                    <div
                      className="simplebar-content notification"
                      style={{ padding: "0px" }}
                    >
                      {notifications.map((notification) => (
                        <div
                          className={`px-2 px-sm-3 py-3 notification-card position-relative ${
                            notification.readStatus == true ? "read" : "unread "
                          } border-bottom`}
                        >
                          <div className="d-flex align-items-center justify-content-between position-relative">
                            <div className="d-flex">
                              <div className="avatar avatar-m status-online me-3 bellIconInList">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="25px"
                                  height="25px"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  stroke-width="2"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  class="feather feather-bell"
                                >
                                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                                </svg>
                              </div>
                              <div className="flex-1 me-sm-3">
                                <h4 className="fs-9 text-body-emphasis mb-1">
                                  {notification?.title}
                                </h4>
                                <p className="fs-9 text-body-highlight mb-0 fw-normal">
                                  <span className="me-1 fs-10"></span>
                                  {notification?.body}
                                </p>
                                <p className="text-body-secondary fs-9 mb-2">
                                  <svg
                                    className="svg-inline--fa fa-clock me-1"
                                    aria-hidden="true"
                                    focusable="false"
                                    data-prefix="fas"
                                    data-icon="clock"
                                    role="img"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 512 512"
                                    data-fa-i2svg=""
                                  >
                                    <path
                                      fill="currentColor"
                                      d="M256 0a256 256 0 1 1 0 512A256 256 0 1 1 256 0zM232 120V256c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2V120c0-13.3-10.7-24-24-24s-24 10.7-24 24z"
                                    ></path>
                                  </svg>
                                  <span className="fw-bold">
                                    {dayjs(notification.sentAt).fromNow()}{" "}
                                  </span>
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="simplebar-placeholder"
                style={{ width: "358px", height: "0px" }}
              ></div>
            </div>
          ) : (
            <div
              className="text-center text-gray-600 mt-8"
              style={{ width: "358px", height: "0px" }}
            >
              <p className="text-lg">No notifications found</p>
            </div>
          )}

          {/* <div
                className="simplebar-track simplebar-vertical"
                style={{ visibility: "visible" }}
              >
                <div
                  className="simplebar-scrollbar"
                  style={{
                    height: "300px",
                    display: "block",
                    transform: "translate3d(0px, 0px, 0px)",
                  }}
                ></div>
              </div> */}
        </div>
      </div>
    </div>
  );
};

export default NotificationList;
