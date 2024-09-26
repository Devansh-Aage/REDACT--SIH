import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Table, Input } from "antd";
import "antd/dist/reset.css";

const { Search } = Input;

const Audits = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  if (!token) {
    navigate("/login");
  }

  const [audits, setAudits] = useState([]);
  const [filteredAudits, setFilteredAudits] = useState([]);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const getAudits = async () => {
      try {
        const getAuditFromBC = await axios.get(
          "http://localhost:3001/api/audit/getuseraudits",
          {
            headers: {
              "auth-token": token,
            },
          }
        );

        const rawAudits = await getAuditFromBC.data;
        setAudits(rawAudits?.updatedEvents);
        setFilteredAudits(rawAudits?.updatedEvents);
      } catch (error) {
        toast.error("Failed to fetch audits from blockchain");
      }
    };

    getAudits();
  }, [token]);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp * 1000); // Convert seconds to milliseconds
    return date.toLocaleString(); // Converts to local date and time string
  };

  const handleSearch = (value) => {
    setSearchText(value);
    const filtered = audits.filter((audit) =>
      audit.filename.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredAudits(filtered);
  };

  const columns = [
    {
      title: "Filename",
      dataIndex: "filename",
      key: "filename",
    },
    {
      title: "Timestamp",
      dataIndex: "timestamp",
      key: "timestamp",
      render: (text) => formatTimestamp(text),
    },
    {
      title: "Action",
      dataIndex: "eventType",
      key: "eventType",
      render: (text) => {
        return text === 0 ? (
          <div className="bg-red-500 text-white p-1 w-[5rem] text-center rounded-md">
            Redacted
          </div>
        ) : (
          <div className="bg-blue-500 text-white p-1 w-[5rem] text-center rounded-md">
            Accessed
          </div>
        );
      },
    },
  ];

  return (
    <div className="w-full h-full">
      <div className="w-full flex items-center justify-between mx-auto px-20 mt-6 mb-5">
        <div className="font-semibold text-3xl">
          Access Audits
        </div>
        <Search
          placeholder="Search by filename"
          onSearch={handleSearch}
          enterButton
          style={{ marginBottom: 16, width: "300px" }}
        />
      </div>
      <Table
        dataSource={filteredAudits}
        columns={columns}
        rowKey="cid"
        className="px-20"
        pagination={false}
      />
    </div>
  );
};

export default Audits;
