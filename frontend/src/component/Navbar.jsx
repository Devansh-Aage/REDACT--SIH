import getRole from "../helper/getRole";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const logout = () => {
    localStorage.removeItem("token");
    toast.success("You have logged out successfully");
    navigate("/");
  };


  const role = getRole(token);

  return (
    <nav className="bg-gray-800 text-white py-3 px-6 flex w-[60%] rounded-3xl shadow-lg mx-auto mb-4 mt-2 justify-between items-center">
      <div className="flex items-center">
        <a href="/home" className="text-xl font-bold">
          Redactronix
        </a>
      </div>
      <div className="flex justify-center space-x-4">
        {token && (
          <>
           {role ==="admin" &&
             <Link to="/admin-dashboard" className="hover:text-gray-300">
             Admin Dashboard
           </Link>
            }
            <Link to="/home" className="hover:text-gray-300">
              Home
            </Link>
            <Link to="/savedfiles" className="hover:text-gray-300">
              Files
            </Link>
            <Link to="/history" className="hover:text-gray-300">
              Audits
            </Link>
           
          </>
        )}
      </div>
      {token ? (
        <div>
          <button
            onClick={logout}
            className="border-red-500 border-2  hover:bg-red-600 text-white px-2 py-2 rounded-md"
          >
            Logout
          </button>
        </div>
      ) : (
        <Link to="/">Sign-in</Link>
      )}
    </nav>
  );
};

export default Navbar;
