import React, { useState } from "react";
import { Input } from "antd"; // Import AntD's Input component
import "antd/dist/reset.css"; // Import AntD styles
import axios from "axios";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Org = () => {
  const token = localStorage.getItem("token");
  const [orgName, setOrgName] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const authToken = location.state.authToken;

  const handleOrgNameChange = (event) => {
    setOrgName(event.target.value);
  };

  const handleClick = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/org/add-org`,
        {
          name: orgName,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "auth-token": token,
          },
        }
      );
      const data = await res.json();
      if (data.success) {
        navigate("/admin-dashboard");
        toast.success("Organization Added!");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  useEffect(() => {
    const checkIfOrg = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/api/org/get-org`,
          {
            headers: {
              "auth-token": authToken,
            },
          }
        );
        const data = await res.data;
        if (data.success) {
          navigate("/admin-dashboard");
        }
      } catch (error) {
        console.log(error);
      }
    };
    checkIfOrg();
  }, [authToken]);

  return (
    <div className="flex items-center justify-center w-full ">
      <div className="bg-white p-8 rounded-lg shadow-lg  mt-20">
        <div className="flex items-center gap-3 my-4">
          <label htmlFor="orgName">Organization Name:</label>
          <Input
            id="orgName"
            value={orgName}
            onChange={handleOrgNameChange}
            placeholder="Enter organization name"
            style={{ width: 300 }}
          />
        </div>
        <button
          onClick={() => handleClick()}
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition-colors duration-300"
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default Org;
