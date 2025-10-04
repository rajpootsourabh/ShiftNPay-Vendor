import addFile from "../../../assets/images/add-file-over.png";
import careSearch from "../../../assets/images/caresearch.png";
import closeFileOver from "../../../assets/images/close-file-over.png";
import editIcon from "../../../assets/images/editIcon.png";
import note from "../../../assets/images/note.png";
import font from "../../../assets/images/font.png";
import print from "../../../assets/images/print.png";
import refresh from "../../../assets/images/refresh.png";
import fontLarge from "../../../assets/images/font-large.png";
import checkFormOver from "../../../assets/images/check-form-over.png";

const ClientNav = ({togglePopup}) => {
   

  return (
    <div className="bg-white  py-2 navBar">
      <div className="row">
        <div className="col-md-4"></div>

        <div className="col-md-12 d-flex justify-content-center gap-1">
          <div className="d-flex flex-wrap">
            <div className="custom-btn cursor-pointer" onClick={togglePopup}>
              <span className="d-flex align-items-center">
                <img src={addFile} className="icons" />
                <span>Add Schedule</span>
              </span>
            </div>
          </div>

          <div className="d-flex flex-wrap">
            <div className="custom-btn">
              <span className="d-flex align-items-center">
                <img src={editIcon} className="icons" />
                <span>Edit Schedule</span>
              </span>
            </div>
          </div>
          <div className="d-flex flex-wrap">
            <div className="custom-btn">
              <span className="d-flex align-items-center">
                <img src={closeFileOver} className="icons" />
                <span>Delete Range</span>
              </span>
            </div>
          </div>

          <div className="d-flex flex-wrap">
            <div className="custom-btn">
              <span className="d-flex align-items-center">
                <img src={note} className="icons" />
                <span>Client Note</span>
              </span>
            </div>
          </div>
          <div className="d-flex flex-wrap">
            <div className="custom-btn">
              <span className="d-flex align-items-center">
                <img src={checkFormOver} className="icons" />
                <span>Confirm</span>
              </span>
            </div>
          </div>
          <div className="d-flex flex-wrap">
            <div className="custom-btn">
              <span className="d-flex align-items-center">
                <img src={fontLarge} className="icons" />
                <span>Font(+)</span>
              </span>
            </div>
          </div>
          <div className="d-flex flex-wrap">
            <div className="custom-btn">
              <span className="d-flex align-items-center">
                <img src={font} className="icons" />
                <span>Font(-)</span>
              </span>
            </div>
          </div>
          <div className="d-flex flex-wrap">
            <div className="custom-btn">
              <span className="d-flex align-items-center">
                <img src={print} className="icons" />
                <span>Print</span>
              </span>
            </div>
          </div>
          <div className="d-flex flex-wrap">
            <div className="custom-btn">
              <span className="d-flex align-items-center">
                <img src={careSearch} className="icons" />
                <span>Caregiver Search</span>
              </span>
            </div>
          </div>
          <div className="d-flex flex-wrap">
            <div className="custom-btn">
              <span className="d-flex align-items-center">
                <img src={refresh} className="icons" />
                <span>Refresh</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientNav;
