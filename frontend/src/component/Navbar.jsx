import getRole from "../helper/getRole";
import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const token = localStorage.getItem("token");

  const logout = () => {
    localStorage.removeItem("token");
    toast.success("You have logged out successfully");
    navigate("/");
  };

  const notAllowedRoutes = ["/", "/signup", "/org"];

  const role = getRole(token);

  return (
    <nav
      className={`${notAllowedRoutes.includes(pathname) && "hidden"} bg-gray-800 text-white py-2 px-6 flex w-[60%] rounded-3xl shadow-lg mx-auto mb-4 mt-2 justify-between items-center`}
    >
      <div className="flex items-center">
        <a href="/home" className="text-xl font-semibold">
          Redactronix
        </a>
      </div>
      <div className="flex justify-center space-x-4">
        {token && (
          <>
            <NavLink
              to="/home"
              className={({ isActive }) =>
                `hover:text-gray-300 h-fit text-lg ${
                  isActive ? "underline" : ""
                }`
              }
            >
              Home
            </NavLink>
            {role === "admin" && (
              <NavLink
                to="/admin-dashboard"
                className={({ isActive }) =>
                  `hover:text-gray-300 h-fit text-lg ${
                    isActive ? "underline" : ""
                  }`
                }
              >
                Dashboard
              </NavLink>
            )}
            <NavLink
              to="/savedfiles"
              className={({ isActive }) =>
                `hover:text-gray-300 h-fit text-lg ${
                  isActive ? "underline" : ""
                }`
              }
            >
              Files
            </NavLink>
            <NavLink
              to="/history"
              className={({ isActive }) =>
                `hover:text-gray-300 h-fit text-lg ${
                  isActive ? "underline" : ""
                }`
              }
            >
              Audits
            </NavLink>
          </>
        )}
      </div>
      {token ? (
        <div>
          <button
            onClick={logout}
            className="border-red-500 border-2 hover:bg-red-600 text-white px-2 py-2 rounded-md"
          >
            Logout
          </button>
        </div>
      ) : (
        <NavLink to="/" className="px-2 py-2">
          Sign-in
        </NavLink>
      )}
    </nav>
  );
};

export default Navbar;
