import React, { Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import routes from "../routes";

const AppContent = () => {

  return (
    <div className="" lg>
        <Routes>
          {routes.map((route, idx) => {
            // if (!route.roles.includes(userRole)) {
            //   return null;
            // }
            return (
              <Route
                key={idx}
                path={route.path}
                exact={route.exact}
                element={<route.element />}
              />
            );
          })}
        </Routes>
    </div>
  );
};

export default React.memo(AppContent);
