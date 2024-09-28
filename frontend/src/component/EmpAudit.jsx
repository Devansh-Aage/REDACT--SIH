import { formatTimestamp } from "../helper/getRole";
import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Table, Input } from "antd";
import { toast } from "react-toastify";
import axios from "axios";

const { Search } = Input;

const EmpAudit = () => {
  const { empId } = useParams();
  const location = useLocation();
  const empName = location.state.empname;
  const token = localStorage.getItem("token");
  const [empAudits, setempAudits] = useState([]);

  const [filteredAudits, setFilteredAudits] = useState(empAudits);
  const [searchText, setSearchText] = useState("");
  useEffect(() => {
    const getAudits = async () => {
      try {
        const getAuditFromBC = await axios.get(
          "http://localhost:3001/api/audit/get-employee-audits",
          {
            params: {
              userId: empId,
            },
            headers: {
              "auth-token": token,
            },
          }
        );

        const rawAudits = await getAuditFromBC.data;
        setempAudits(rawAudits?.updatedEvents);
        setFilteredAudits(rawAudits?.updatedEvents);
      } catch (error) {
        toast.error("Failed to fetch audits from blockchain");
        console.log(error);
      }
    };

    getAudits();
  }, [empId]);

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
        <div className="font-semibold text-3xl">{empName}'s Audits</div>
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

export default EmpAudit;
