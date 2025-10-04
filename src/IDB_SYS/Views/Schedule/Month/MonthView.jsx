import React, { Suspense, useState } from "react";
import ExportNav from "./ExportNav";
import SearchBar from "./SearchBar";
import FilterSection from "./FilterSection";
import DataGrid from "./DataGrid";
import SchedulePopup from "../../../components/Popup/SchedulePopup";

const MonthView = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const togglePopup = () => setIsPopupOpen(!isPopupOpen);

  const handleSave = (formData) => {
    console.log("Saved data:", formData);
    // Handle the saved data (send to API, etc.)
  };

  return (
    <div className="listing">
      <ExportNav togglePopup={togglePopup} />
      <div className="px-4">
        {/* <SearchBar /> */}
        {/* <FilterSection  search={true}/> */}
        <DataGrid togglePopup={togglePopup} setIsPopupOpen={setIsPopupOpen} isPopupOpen={isPopupOpen}/>
      </div>
    </div>
  );
};

export default React.memo(MonthView);
