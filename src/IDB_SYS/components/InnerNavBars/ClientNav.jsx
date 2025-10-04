import home from "./../../assets/images/icons/home.png";
import message from "./../../assets/images/icons/message.png";
import alert from "./../../assets/images/icons/bell.png";
import notification from "./../../assets/images/icons/broadcast.png";
import userProfile from "./../../assets/images/icons/profile.png";
import upload from "./../../assets/images/icons/upload.png";
import setting from "./../../assets/images/icons/setting.png";
import info from "./../../assets/images/icons/info.png";
const ClientNav = () => {
  return (
    <div className="bg-dark-green navBar">
      <div className="row">
        <div className="col-md-5">
          <div className="text-white d-flex flex-wrap">
            {/* <div className="p-2 border-r text-center navbar-item">
              <span>
                <img src={home} className="icons" />
              </span>
            </div> */}
            {/* <div className="p-2 border-r text-center navbar-item">
              <span>Clients</span>
            </div>
            <div className="p-2 text-center navbar-item">
              <span>Case Managers</span>
            </div> */}
          </div>
        </div>

        <div className="col-md-7 d-flex justify-content-end">
          <div className="text-white d-flex flex-wrap">
            <div className="p-2 border-r text-center navbar-item">
              <span>
                <img src={message} className="icons" /> <span>Shift Request</span>
              </span>
            </div>
            <div className="p-2 border-r text-center navbar-item">
              <span>
                <img src={message} className="icons" /> <span>Messages</span>
              </span>
            </div>
           <div className="p-2 border-r text-center navbar-item">
              <span>
                <img src={alert} className="icons" /> <span>Alerts</span>
              </span>
            </div>
           <div className="p-2 border-r text-center navbar-item">
              <span>
                <img src={notification} className="icons" /> <span>Notifications</span>
              </span>
            </div>
            <div className="p-2 border-r text-center navbar-item">
              <span>
                <img src={userProfile} className="icons" /> <span>Active Users</span>
              </span>
            </div>

            <div className="p-2 border-r text-center navbar-item">
              <span>
                <img src={upload} className="icons" />
              </span>
            </div>
            <div className="p-2 border-r text-center navbar-item">
              <span>
                <img src={setting} className="icons" />
              </span>
            </div>
            <div className="p-2 border-r text-center navbar-item">
              <span>
                <img src={info} className="icons" />
              </span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default ClientNav;
