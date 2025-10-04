import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { fetchAgenciesByVendor, setSearch, setPage } from "../../../../store/IDB_SYS/Clients/agencySlice";

const FilterSection = ({ search: showSearch }) => {
  const dispatch = useDispatch();
  const { pagination } = useSelector((state) => state.agency);
  const [searchText, setSearchTextLocal] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchText);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    dispatch(setPage(1));
    dispatch(setSearch(debouncedSearch));
    dispatch(fetchAgenciesByVendor());
  }, [debouncedSearch, dispatch]);

  const handlePageChange = (newPage) => {
    if (newPage === pagination.page || newPage < 1 || newPage > pagination.pages) return;
    dispatch(setPage(newPage));
    dispatch(fetchAgenciesByVendor());
  };

  return (
    <div className="bg-white d-flex justify-content-between align-items-center py-2">
      <div className="d-flex flex-wrap">
        {showSearch && (
          <div className="bg-white py-2 navBar">
            <div className="row">
              <div className="col-md-8 d-flex justify-content-start gap-3">
                <div className="d-flex flex-wrap">
                  <input
                    type="text"
                    className="form-control py-0 custom-search"
                    value={searchText}
                    onChange={(e) => setSearchTextLocal(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="d-flex align-items-center">
        <button
          className="btn btn-success btn-sm border rounded-start"
          disabled={pagination.page <= 1}
          onClick={() => handlePageChange(1)}
        >
          &laquo;
        </button>
        <button
          className="btn btn-success btn-sm border"
          disabled={pagination.page <= 1}
          onClick={() => handlePageChange(pagination.page - 1)}
        >
          &lsaquo;
        </button>
        <div className="border px-2 py-1 text-success small mx-1 f-11">
          {pagination.total > 0
            ? `${(pagination.page - 1) * pagination.limit + 1} to ${Math.min(
                pagination.page * pagination.limit,
                pagination.total
              )} of ${pagination.total} Records`
            : "No Records Found"}
        </div>
        <button
          className="btn btn-success btn-sm border"
          disabled={pagination.page >= pagination.pages}
          onClick={() => handlePageChange(pagination.page + 1)}
        >
          &rsaquo;
        </button>
        <button
          className="btn btn-success btn-sm border rounded-end ms-1"
          disabled={pagination.page >= pagination.pages}
          onClick={() => handlePageChange(pagination.pages)}
        >
          &raquo;
        </button>
      </div>
    </div>
  );
};

export default FilterSection;
