import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { Table, Input, Button } from "antd";
import Btn from "./ui/Btn";

const { Search } = Input;

const CACHE_KEY = "audits_cache";
const CACHE_EXPIRATION = 5 * 60 * 1000; // 5 minutes in milliseconds

const Audits = () => {
  const navigate = useNavigate();
  const [audits, setAudits] = useState([]);
  const [filteredAudits, setFilteredAudits] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  const getCachedAudits = () => {
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) {
      const { timestamp, data } = JSON.parse(cachedData);
      if (Date.now() - timestamp < CACHE_EXPIRATION) {
        return data;
      }
    }
    return null;
  };

  const setCachedAudits = (data) => {
    const cacheData = {
      timestamp: Date.now(),
      data: data,
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  };

  const fetchAudits = useCallback(
    async (forceRefresh = false) => {
      if (!token) return;

      if (!forceRefresh) {
        const cachedAudits = getCachedAudits();
        if (cachedAudits) {
          setAudits(cachedAudits);
          setFilteredAudits(cachedAudits);
          return;
        }
      }

      setLoading(true);
      try {
        const response = await axios.get(
          "http://localhost:3001/api/audit/getuseraudits",
          {
            headers: {
              "auth-token": token,
            },
          }
        );

        const rawAudits = response.data?.updatedEvents || [];
        setAudits(rawAudits);
        setFilteredAudits(rawAudits);
        setCachedAudits(rawAudits);
      } catch (error) {
        toast.error("Failed to fetch audits from blockchain");
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    fetchAudits();
  }, [fetchAudits]);

  const handleSearch = (value) => {
    const filtered = audits.filter((audit) =>
      audit.filename.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredAudits(filtered);
  };

  const handleRefresh = () => {
    fetchAudits(true);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
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
      render: (text) => (
        <div
          className={`${
            text === 0 ? "bg-red-500" : "bg-blue-500"
          } text-white p-1 w-20 text-center rounded-md`}
        >
          {text === 0 ? "Redacted" : "Accessed"}
        </div>
      ),
    },
  ];

  return (
    <div className="w-full h-full">
      <div className="w-full flex items-center justify-between mx-auto px-20 mt-6 mb-5">
        <div className="font-semibold text-3xl">Access Audits</div>
        <Search
          placeholder="Search by filename"
          onSearch={handleSearch}
          enterButton
          style={{ width: "300px" }}
        />
        <Btn onClick={handleRefresh} loading={loading}>
          Refresh Audits
        </Btn>
      </div>
      <Table
        dataSource={filteredAudits}
        columns={columns}
        rowKey="timestamp"
        className="px-20"
        pagination={false}
      />
    </div>
  );
};

export default Audits;
