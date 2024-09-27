import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Cascader } from "antd";
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

const SignUp = () => {
  const [credential, SetCredential] = useState({
    name: "",
    email: "",
    role: "",
    password: "",
    confirmPassword: "",
  });

  const navigate = useNavigate();

  const handleChange = (value) => {
    SetCredential({
      ...credential,
      role: value[0],
    });
  };

  const handleSubmitClick = async (e) => {
    e.preventDefault();

    // Check if password and confirmPassword match
    if (credential.password !== credential.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    // Show the toast notification while the promise resolves
    await toast.promise(
      new Promise(async (resolve, reject) => {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_SERVER_URL}/api/auth/createuser`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                name: credential.name,
                email: credential.email,
                password: credential.password,
                role: credential.role,
              }),
            }
          );

          const cred = await response.json();

          if (cred.success) {
            // localStorage.setItem("token", cred.authtoken);
            navigate("/");
            resolve(); // Resolve the promise if successful
          } else {
            reject(); // Reject the promise if credentials are invalid
          }
        } catch (error) {
          console.error("Error occurred during sign-up", error);
          reject(); // Reject the promise in case of an error
        }
      }),
      {
        pending: "Creating account...",
        success: "Account created successfully 👌",
        error: "Sign up failed 🤯",
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
        <img src="/signup.png" className="w-full" alt="" />
      </div>
      <div className="bg-white p-8 rounded-lg shadow-lg w-[30%] mt-4">
        <h2 className="text-3xl font-bold mb-6 text-gray-900 text-center">
          Sign Up
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
              name="email" // Add the name attribute
              onChange={onchange}
              id="email"
              placeholder="Enter your email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="name"
              className="flex items-center justify-start text-gray-700 text-sm font-semibold mb-2"
            >
              Username
            </label>
            <input
              type="text"
              name="name" // Add the name attribute
              onChange={onchange}
              id="name"
              placeholder="Enter Username"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              popupClassName="w-[15rem] "
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="password"
              className="flex items-center justify-start text-gray-700 text-sm font-semibold mb-2"
            >
              Password
            </label>
            <input
              type="password"
              name="password" // Add the name attribute
              onChange={onchange}
              id="password"
              placeholder="Create a password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="confirm-password"
              className="flex items-center justify-start text-gray-700 text-sm font-semibold mb-2"
            >
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword" // Add the name attribute and adjust onchange handler
              onChange={onchange}
              id="confirm-password"
              placeholder="Confirm your password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <Btn
            type="submit"
            className=""
          >
            Sign Up
          </Btn>
        </form>
        <div className="mt-2 text-center">
          <p className="text-gray-600 text-sm">
            Already have an account?{" "}
            <Link to="/" className="text-blue-500 hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
