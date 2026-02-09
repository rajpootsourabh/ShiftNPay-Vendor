import React, { useState } from "react";
import { useSelector } from "react-redux";
import { FaColumns, FaPlus, FaMinus } from "react-icons/fa";
import ClientNav from "../../components/InnerNavBars/ClientNav";
import FilterSection from "./FilterSection";
import DataGrid from "./DataGridNew";
import { ColumnChooser } from "../../components/ColumnChooser";
import { ClientExport } from "../../components/ClientExport";
import { useColumnPreferences, useTableFontSize } from "../../hooks";

const List = () => {
    const { user } = useSelector((state) => state.user);
    const [isColumnChooserOpen, setIsColumnChooserOpen] = useState(false);
    
    const {
        visibleColumns,
        columnOrder,
        savePreferences,
    } = useColumnPreferences(user?._id);

    // Font size control for table
    const {
        fontSize,
        increaseFontSize,
        decreaseFontSize,
        canIncrease,
        canDecrease,
    } = useTableFontSize();

    const handleColumnChooserApply = ({ visibleColumns, columnOrder }) => {
        savePreferences({ visibleColumns, columnOrder });
    };
    
    return <div className="listing">
            <ClientNav />
            {/* <ExportNav /> */}
            <div className="px-4">
                {/* Column Chooser and Export Buttons */}
                <div className="d-flex justify-content-end mt-2 gap-2">
                    <ClientExport 
                        visibleColumns={visibleColumns}
                        columnOrder={columnOrder}
                    />
                    <button
                        className="btn btn-outline-success btn-sm d-flex align-items-center"
                        onClick={() => setIsColumnChooserOpen(true)}
                        title="Choose columns to display"
                    >
                        <FaColumns className="me-2" />
                        Column Chooser
                    </button>
                    
                    {/* Font Size Controls */}
                    <div className="btn-group" role="group" aria-label="Font size controls">
                        <button
                            className="btn btn-success btn-sm d-flex align-items-center"
                            onClick={increaseFontSize}
                            disabled={!canIncrease}
                            title="Increase table font size"
                            style={{ 
                                minWidth: '85px',
                                opacity: canIncrease ? 1 : 0.6 
                            }}
                        >
                            <FaPlus className="me-1" style={{ fontSize: '0.7rem' }} />
                            Font (+)
                        </button>
                        <button
                            className="btn btn-success btn-sm d-flex align-items-center"
                            onClick={decreaseFontSize}
                            disabled={!canDecrease}
                            title="Decrease table font size"
                            style={{ 
                                minWidth: '85px',
                                opacity: canDecrease ? 1 : 0.6,
                                borderLeft: '1px solid rgba(255,255,255,0.3)'
                            }}
                        >
                            <FaMinus className="me-1" style={{ fontSize: '0.7rem' }} />
                            Font (-)
                        </button>
                    </div>
                </div>

                {/* Column Chooser Modal */}
                <ColumnChooser
                    isOpen={isColumnChooserOpen}
                    onClose={() => setIsColumnChooserOpen(false)}
                    visibleColumns={visibleColumns}
                    columnOrder={columnOrder}
                    onApply={handleColumnChooserApply}
                />

                {/* <SearchBar /> */}
                <FilterSection  search={true}/>
                <DataGrid fontSize={fontSize} />
                <FilterSection search={false} />

            </div>
    </div>
}

export default React.memo(List);