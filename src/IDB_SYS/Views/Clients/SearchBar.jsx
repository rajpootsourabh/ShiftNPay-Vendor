const SearchBar = () => {
  return (
    <div className="bg-white  py-2 navBar">
      <div className="row">
        <div className="col-md-8 d-flex justify-content-start gap-3">
          <div className="d-flex flex-wrap">
            <input type="text" className="form-control py-0 custom-search" />
          </div>
          <div className="d-flex flex-wrap">
            <div className="custom-btn pl-2">
              <span className="d-flex align-items-center">
                <span>Search</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
