import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SignUp = () => {
  const [credential, SetCredential] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const navigate = useNavigate();

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
            "http://localhost:3001/api/auth/createuser",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                name: credential.name,
                email: credential.email,
                password: credential.password,
              }),
            }
          );

          const cred = await response.json();

          if (cred.success) {
            localStorage.setItem("token", cred.authtoken);
            navigate("/signin");
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
    <div className="flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mt-12">
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
              Full Name
            </label>
            <input
              type="text"
              name="name" // Add the name attribute
              onChange={onchange}
              id="name"
              placeholder="Enter your full name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
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
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition-colors duration-300"
          >
            Sign Up
          </button>
        </form>
        <div className="mt-6 text-center">
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
