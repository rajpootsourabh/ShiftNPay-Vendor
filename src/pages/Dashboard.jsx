import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import {
  Box,
  CssBaseline,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Badge,
  Divider,
  styled,
} from "@mui/material";
import * as MdIcons from "react-icons/md";
import { getUnreadCount } from "../store/Notification/userNotificationsSlice";
import Header from "../common/Header";
import {
  fetchAllowedCategories,
  fetchCompanyProfile,
} from "../store/userSlice";
import { SocketProvider } from "../context/socketContext";
import { fetchPurchasedModules } from "../store/MemberShip/memberShipSlice";

const drawerWidth = 280;

const StyledListItemButton = styled(ListItemButton)(({ theme, active }) => ({
  borderRadius: "8px",
  backgroundColor: active ? "#108a00" : "transparent",
  color: active ? "white" : theme.palette.text.primary,
  "&:hover": {
    backgroundColor: active ? "#108a00" : theme.palette.action.hover,
  },
  my: 0.5,
  transition: "all 0.2s ease-in-out",
}));

const StyledListItemIcon = styled(ListItemIcon)(({ active }) => ({
  minWidth: "40px",
  color: active ? "white" : "inherit",
}));

// Dynamic icon loader
const getIconComponent = (iconName) => {
  const IconComponent = MdIcons[iconName];
  return IconComponent ? (
    <IconComponent size={20} />
  ) : (
    <MdIcons.MdDashboard size={20} />
  );
};

const MenuItem = ({ item, active, setActive, level = 0 }) => {
  console.log(item, "item");
  const location = useLocation();
  const notificationCount = useSelector(
    (state) => state.notifications.unreadCount
  );
  const isActive = active === item.path;

  return (
    <ListItem disablePadding sx={{ pl: level * 2 }}>
      <StyledListItemButton
        onClick={() => setActive(item.path)}
        active={isActive ? 1 : 0}
        component={Link}
        to={item.path}
      >
        <StyledListItemIcon active={isActive ? 1 : 0}>
          {getIconComponent(item.icon)}
        </StyledListItemIcon>
        <ListItemText
          primary={item.title}
          primaryTypographyProps={{ fontWeight: isActive ? "600" : "normal" }}
        />
        {item.path === "/notifications" && notificationCount > 0 ? (
          <Badge badgeContent={notificationCount} color="error" />
        ) : null}
      </StyledListItemButton>
    </ListItem>
  );
};

function Dashboard({ user }) {
  const [activeMenu, setActiveMenu] = useState("/");
  const companyLogo = useSelector((state) => state.user.companyLogo);
  const dispatch = useDispatch();
  const location = useLocation();
  const { purchasedModules } = useSelector((state) => state.membership);

  const componentMap = {
    Home: React.lazy(() => import("./Home")),
    Staff: React.lazy(() => import("./Staff")),
    Profile: React.lazy(() => import("./Profile")),
    Jobs: React.lazy(() => import("./Jobs")),
    EmpDetails: React.lazy(() => import("../view/EmpDetails")),
    Calendar: React.lazy(() => import("./Calendar")),
    ExportAllEmployeesData: React.lazy(() =>
      import("./ExportAllEmployeesData")
    ),
    State: React.lazy(() => import("./State")),
    NotificationList: React.lazy(() => import("./NotificationList")),
    TimeTracker: React.lazy(() => import("./timeTracker")),
    CheckList: React.lazy(() => import("./checkList")),
    TimeTrackerRequest: React.lazy(() => import("./TimeTrackerRequest")),
    AddLeave: React.lazy(() => import("./Leaves/AddLeave")),
    EmployeeLeaveList: React.lazy(() => import("./Leaves/EmployeeLeaveList")),
    LeaveTypeManagement: React.lazy(() =>
      import("./Leaves/LeaveTypeManagement")
    ),
    LeaveRequest: React.lazy(() => import("./LeaveRequest")),
    Holidays: React.lazy(() => import("./Holidays")),
    ShiftSchedule: React.lazy(() => import("./ShiftSchedule")),
    Anlaytics: React.lazy(() => import("./Anlaytics")),
    Invoice: React.lazy(() => import("./Invoice")),
    InvoiceListing: React.lazy(() => import("./InvoiceListing")),
    VendorDashboard: React.lazy(() => import("../components/VendorDashboard")),
    Shift: React.lazy(() => import("./Shift")),
    ShiftAssign: React.lazy(() => import("../view/ShiftAssign")),
    RewardManagement: React.lazy(() => import("./RewardManagement")),
    AutoSchedular: React.lazy(() => import("../components/AutoSchedular")),
    Product: React.lazy(() => import("./Product/product")),
    ChatApp: React.lazy(() => import("../components/Chat/ChatApp")),
  };

  // Sync activeMenu with current URL
  useEffect(() => {
    setActiveMenu(location.pathname);
  }, [location.pathname]);

  // Sync activeMenu with current URL
  useEffect(() => {
    console.log(purchasedModules, "purchasedModules");
  }, [purchasedModules]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        await dispatch(fetchPurchasedModules()).unwrap();
      } catch (err) {
        console.error("Error loading modules:", err);
      }
    };

    fetchAll();
  }, [dispatch]);

  useEffect(() => {
    dispatch(getUnreadCount(user?._id));
    dispatch(fetchCompanyProfile(user?._id));
    dispatch(fetchAllowedCategories());
  }, [user, dispatch]);

  // Get the current module based on the URL path
  const currentModule = useMemo(() => {
    if (!purchasedModules || !location.pathname) return null;

    // Normalize paths by removing trailing slashes
    const normalizePath = (path) => path.replace(/\/+$/, "");

    // Find the module that contains the current route
    return purchasedModules.find((module) =>
      module.routes.some((route) => {
        const routePath = normalizePath(route.path);
        const currentPath = normalizePath(location.pathname);

        // Exact match
        if (currentPath === routePath) return true;

        // Nested route match (e.g., /shift/assign/123 matches /shift/assign/:id)
        if (
          routePath.includes("/:") &&
          currentPath.startsWith(routePath.split("/:")[0] + "/")
        ) {
          return true;
        }

        return false;
      })
    );
  }, [purchasedModules, location.pathname]);

  // Generate routes dynamically from the API data
  const generateRoutes = useMemo(() => {
    if (!purchasedModules) return null;

    return purchasedModules.flatMap((module) =>
      module.routes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={
            <SocketProvider>
              <React.Suspense fallback={<div>Loading...</div>}>
                {React.createElement(componentMap[route.component], { user })}
              </React.Suspense>
            </SocketProvider>
          }
        />
      ))
    );
  }, [purchasedModules, user]);

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <CssBaseline />
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            borderRight: "1px solid rgba(0, 0, 0, 0.12)",
            backgroundColor: "#f9f9f9",
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 2,
            height: 120,
            backgroundColor: "white",
            borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
          }}
        >
          <img
            src={companyLogo || "./logo/sky.png"}
            alt="logo"
            style={{
              maxHeight: "100%",
              maxWidth: "160px",
              objectFit: "contain",
            }}
          />
        </Box>
        <Box sx={{ p: 2, overflowY: "auto", flexGrow: 1 }}>
          <List>
            <ListItem disablePadding>
              <StyledListItemButton
                component={Link}
                to="/dashboard"
                active={activeMenu === "/dashboard" ? 1 : 0}
                onClick={() => setActiveMenu("/dashboard")}
              >
                <StyledListItemIcon
                  active={activeMenu === "/dashboard" ? 1 : 0}
                >
                  <MdIcons.MdArrowBackIosNew size={20} />
                </StyledListItemIcon>
                <ListItemText
                  primary="Main Menu"
                  primaryTypographyProps={{
                    fontWeight: activeMenu === "/dashboard" ? "600" : "normal",
                  }}
                />
              </StyledListItemButton>
            </ListItem>
            <Divider sx={{ my: 1 }} />
            {/* Sidebar Content */}
            {currentModule && (
              <>
                {/* Module Header */}
                <ListItem disablePadding>
                  <StyledListItemButton active={0} component="div">
                    <StyledListItemIcon active={0}>
                      {getIconComponent(currentModule.icon)}
                    </StyledListItemIcon>
                    <ListItemText
                      primary={currentModule.title}
                      primaryTypographyProps={{ fontWeight: "600" }}
                    />
                  </StyledListItemButton>
                </ListItem>

                {/* Module Routes */}
                <List component="div" disablePadding>
                  {currentModule.routes
                    .filter((route) => route.isOuter) // Only show outer routes
                    .map((route) => (
                      <ListItemButton
                        key={route.path}
                        component={Link}
                        to={route.path}
                        selected={location.pathname === route.path}
                        sx={{ pl: 4 }} // Indent nested items
                      >
                        <ListItemIcon>
                          {getIconComponent(route.icon)}
                        </ListItemIcon>
                        <ListItemText primary={route.title} />
                      </ListItemButton>
                    ))}
                </List>
                <Divider sx={{ my: 1 }} />
              </>
            )}
          </List>
        </Box>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "background.default",
          p: 3,
          height: "100vh",
          overflowX: "hidden",
          overflowY: "auto",
          maxWidth: `calc(100% - ${drawerWidth}px)`,
        }}
      >
        {activeMenu !== "/account" && (
          <Header
            title={
              purchasedModules
                ?.flatMap((m) => m.routes)
                .find((r) => r.path === activeMenu)?.title || "Dashboard"
            }
          />
        )}
        <Routes>{generateRoutes}</Routes>
      </Box>
    </Box>
  );
}

export default Dashboard;
