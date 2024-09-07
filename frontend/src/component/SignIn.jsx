import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SignIn = () => {
  const [credential, SetCredential] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  if (token) {
    navigate("/home");
  }

  const handleSubmitClick = async (e) => {
    e.preventDefault();

    // Show the toast notification while the promise resolves
    await toast.promise(
      new Promise(async (resolve, reject) => {
        try {
          const response = await fetch(
            "http://localhost:3001/api/auth/loginuser",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: credential.email,
                password: credential.password,
              }),
            }
          );

          const cred = await response.json();
          if (cred.success) {
            localStorage.setItem("token", cred.authtoken);
            navigate("/home");
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
    <div className="flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full mt-20">
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
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition-colors duration-300"
          >
            Sign In
          </button>
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
