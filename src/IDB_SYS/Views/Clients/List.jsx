import React, { Suspense } from "react";
import ClientNav from "../../components/InnerNavBars/ClientNav";
import ExportNav from "./ExportNav";
import SearchBar from "./SearchBar";
import FilterSection from "./FilterSection";
import DataGrid from "./DataGrid";

const List = () => {
    
    return <div className="listing">
            <ClientNav />
            {/* <ExportNav /> */}
            <div className="px-4">
                {/* <SearchBar /> */}
                <FilterSection  search={true}/>
                <DataGrid />
                <FilterSection search={false} />

            </div>
    </div>
}

export default React.memo(List);