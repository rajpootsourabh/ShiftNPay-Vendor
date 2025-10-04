import React, { Suspense } from "react";
import FilterSection from "./FilterSection";
import DataGrid from "./DataGrid";

const Notes = () => {
    
    return <div className="listing">
            <div className="px-4">
                <FilterSection  search={true}/>
                <DataGrid />
                <FilterSection search={false} />

            </div>
    </div>
}

export default Notes;