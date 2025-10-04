import columnChooser from "./../../assets/images/columnChooser.png";
import outlookIcon from "./../../assets/images/outlook-icon.png";
import mass_update from "./../../assets/images/mass_update.png";

import managerView from "./../../assets/images/Manager-view.png";

const ClientNav = () => {
  return (
    <div className="bg-white  py-2 navBar">
      <div className="row">
        <div className="col-md-4"></div>

        <div className="col-md-8 d-flex justify-content-start gap-3">
          <div className="d-flex flex-wrap">
            <div className="custom-btn">
              <span className="d-flex align-items-center">
                <img src={columnChooser} className="icons" />
                <span>Column Chooser</span>
              </span>
            </div>
          </div>
          <div className="d-flex flex-wrap">
            <div className="custom-btn">
              <span className="d-flex align-items-center">
                <img src={outlookIcon} className="icons" />
                <span>Outlook</span>
              </span>
            </div>
          </div>
          <div className="d-flex flex-wrap">
            <div className="custom-btn">
              <span className="d-flex align-items-center">
                <img src={mass_update} className="icons" />
                <span>Mass Update</span>
              </span>
            </div>
          </div>
          <div className="d-flex flex-wrap">
            <div className="custom-btn">
              <span className="d-flex align-items-center">
                <img src={managerView} className="icons" />
                <span>Show Inactive</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientNav;
