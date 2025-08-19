import React, { use, useContext } from "react";
import "./Navbar.css";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { toast } from "react-hot-toast";
import { AuthContext } from "../../context/AuthContext";
import { assets } from "../../assets/assets";

const Navbar = ({ toggleSidebar, url }) => {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out of your account.",
      // icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Logout",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        toast.success("Logged Out Successfully");
        navigate("/login");
      }
    });
  };

  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary py-1 px-md-4 px-2">
      <div className="container-fluid" style={{ height: "60px" }}>
        <div className="ham" onClick={toggleSidebar}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="#1f1f1f"
          >
            <path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z" />
          </svg>
        </div>
        <div className="name">{user?.mandalName.toUpperCase()}</div>
        <Link to="/dashboard" className="img">
          {user?.mandalName === "Shri Shyam Sewak Yuva Mandal Sangam Vihar" ? (
            <img
              src={assets.sangam_logo}
              height={60}
              alt=""
            />
          ) : (
            <img
              src={assets.sarojini_logo}
              height={60}
              alt=""
            />
          )}
        </Link>
        <div className="nav-item dropdown">
          <a
            className="nav-link dropdown-toggle no-caret"
            href="#"
            role="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <img
              src={`${url}${user?.profilePic}`}
              width={40}
              height={40}
              alt=""
              className="rounded-circle border"
            />
          </a>
          <ul className="dropdown-menu dropdown-menu-end">
            <li className="dropdown-item">
              <b>Hello, {user?.memberName}</b>
            </li>
            <li>
              <hr className="dropdown-divider" />
            </li>
            <li>
              <Link to="/profile" className="dropdown-item" href="#">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 -960 960 960"
                  width="24px"
                  fill="#1f1f1f"
                >
                  <path d="M234-276q51-39 114-61.5T480-360q69 0 132 22.5T726-276q35-41 54.5-93T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 59 19.5 111t54.5 93Zm246-164q-59 0-99.5-40.5T340-580q0-59 40.5-99.5T480-720q59 0 99.5 40.5T620-580q0 59-40.5 99.5T480-440Zm0 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q53 0 100-15.5t86-44.5q-39-29-86-44.5T480-280q-53 0-100 15.5T294-220q39 29 86 44.5T480-160Zm0-360q26 0 43-17t17-43q0-26-17-43t-43-17q-26 0-43 17t-17 43q0 26 17 43t43 17Zm0-60Zm0 360Z" />
                </svg>
                &nbsp; Profile
              </Link>
            </li>
            <li>
              <Link to="/change-password" className="dropdown-item" href="#">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 -960 960 960"
                  width="24px"
                  fill="#1f1f1f"
                >
                  <path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480h80q0 66 25 124.5t68.5 102q43.5 43.5 102 69T480-159q134 0 227-93t93-227q0-134-93-227t-227-93q-89 0-161.5 43.5T204-640h116v80H80v-240h80v80q55-73 138-116.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm-80-240q-17 0-28.5-11.5T360-360v-120q0-17 11.5-28.5T400-520v-40q0-33 23.5-56.5T480-640q33 0 56.5 23.5T560-560v40q17 0 28.5 11.5T600-480v120q0 17-11.5 28.5T560-320H400Zm40-200h80v-40q0-17-11.5-28.5T480-600q-17 0-28.5 11.5T440-560v40Z" />
                </svg>
                &nbsp;Change Password
              </Link>
            </li>
            <li>
              <hr className="dropdown-divider" />
            </li>
            <li>
              <Link className="dropdown-item" onClick={handleLogout}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 -960 960 960"
                  width="24px"
                  fill="red"
                >
                  <path d="M480-120q-75 0-140.5-28.5t-114-77q-48.5-48.5-77-114T120-480q0-75 28.5-140.5t77-114q48.5-48.5 114-77T480-840v80q-117 0-198.5 81.5T200-480q0 117 81.5 198.5T480-200v80Zm160-160-56-57 103-103H360v-80h327L584-624l56-56 200 200-200 200Z" />
                </svg>
                &nbsp; Logout
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
