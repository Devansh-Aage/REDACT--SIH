import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Cascader } from "antd";
import axios from "axios";
import Btn from "./ui/Btn";

const options = [
  {
    value: "admin",
    label: "Admin",
  },
  {
    value: "employee",
    label: "Employee",
  },
  {
    value: "normal",
    label: "Regular",
  },
];

const SignIn = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [credential, SetCredential] = useState({
    email: "",
    password: "",
    role: "",
  });

  useEffect(() => {
    if (token) {
      navigate("/home");
    }
  }, [token]);

  const handleChange = (value) => {
    SetCredential({
      ...credential,
      role: value[0],
    });
  };

  const handleSubmitClick = async (e) => {
    e.preventDefault();

    // Show the toast notification while the promise resolves
    await toast.promise(
      new Promise(async (resolve, reject) => {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_SERVER_URL}/api/auth/loginuser`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: credential.email,
                role: credential.role,
                password: credential.password,
              }),
            }
          );

          const cred = await response.json();
          if (cred.success) {
            localStorage.setItem("token", cred.authtoken);
            if (credential.role === "admin") {
              navigate("/org", {
                state: {
                  authToken: cred.authtoken,
                },
              });
            }
            else{

              navigate("/home");
            }
            resolve(); // Resolve the promise if successful
          } else {
            reject(); // Reject the promise for an invalid credential
          }
        } catch (error) {
          console.error("Error occurred during sign-in", error);
          reject(); // Reject the promise for any error during the request
        }
      }),
      {
        pending: "Signing in...",
        success: "Sign in successful 👌",
        error: "Sign in failed 🤯",
      }
    );
  };

  const onchange = (element) => {
    SetCredential({
      ...credential,
      [element.target.name]: element.target.value,
    });
  };

  return (
    <div className="flex items-center justify-around w-full h-full px-20">
       <div className="w-[40%] ">
        <img src="/login.png" className="w-full" alt="" />
      </div>
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-[30%]">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 text-center">
          Sign In
        </h2>
        <form onSubmit={handleSubmitClick}>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="flex items-center justify-start text-gray-700 text-sm font-semibold mb-2"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={onchange}
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="role"
              className="flex items-center justify-start text-gray-700 text-sm font-semibold mb-2"
            >
              Role
            </label>
            <Cascader
              options={options}
              value={credential.role}
              onChange={handleChange}
              placeholder="Select Role"
              className="w-full"
              popupClassName="w-[15rem] h-[200px]"
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="password"
              className="flex items-center justify-start text-gray-700 text-sm font-semibold mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={onchange}
              required
            />
          </div>
          <Btn
            type="submit"
          >
            Sign In
          </Btn>
        </form>
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Don't have an account?{" "}
            <NavLink to="/signup" className="text-blue-500 hover:underline">
              Sign Up
            </NavLink>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
