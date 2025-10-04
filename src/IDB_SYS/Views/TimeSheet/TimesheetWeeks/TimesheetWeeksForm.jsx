import React, { Suspense, useState } from "react";
import DataGrid from "./DataGrid";
import TimeSheetWeeks from "../../../components/InnerNavBars/TimeSheetWeeksNav";

const TimesheetWeeksForm = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const togglePopup = () => setIsPopupOpen(!isPopupOpen);



  return (
    <div className="listing">
        <TimeSheetWeeks />

      <div className="p-4">
        <DataGrid />
      </div>
    </div>
  );
};

export default React.memo(TimesheetWeeksForm);
