import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';

const columns = [
    { field: '_id', headerName: 'ID', width: 90 },
    { field: 'Name', headerName: 'Name', width: 150, editable: true },
    { field: 'email', headerName: 'Email', width: 150, editable: true },
];

function ReportView({ filterdData }) {
    return (
        <div style={{ height: 400, width: '100%' }}>
            <DataGrid
                rows={filterdData}
                columns={columns}
                getRowId={(row) => row._id}
                initialState={{
                    pagination: {
                        paginationModel: {
                            pageSize: 5,
                        },
                    },
                }}
                pageSizeOptions={[5]}
                checkboxSelection
                // disableRowSelectionOnClick
                autoHeight
            />
        </div>
    )
}

export default ReportView