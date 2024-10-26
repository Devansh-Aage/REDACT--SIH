import axios from "axios";
import React, { useEffect, useState } from "react";
import { Button, Modal, Form, Input, Table } from "antd";
import { toast } from "react-toastify";
import getEmp from "../helper/getEmp";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [org, setOrg] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [adminForm] = Form.useForm();
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const getOrg = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/api/org/get-org`,
          {
            headers: {
              "auth-token": token,
            },
          }
        );
        const data = await res.data;
        setOrg(data.org);
      } catch (error) {
        toast.error("Something went wrong");
        console.error(error);
      }
    };
    getOrg();
  }, [token]);

  useEffect(() => {
    const fetchEmployees = async () => {
      if (org?.employee && org.employee.length > 0) {
        const empData = await getEmp(org.employee); // Await the result of getEmp
        if (empData) {
          setEmployees(empData); // Set the employee data in state
          console.log(empData);
        }
      }
    };

    if (org) {
      fetchEmployees();
    }
  }, [org]);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    form.resetFields(); // Reset form fields when closing the modal
  };

  const handleFormSubmit = () => {
    addEmp();
    closeModal();
  };

  const columns = [
    {
      title: "Employee Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Activity",
      dataIndex: "activity",
      key: "_id",
      render: (text, record) => {
        console.log(record);

        return (
          <button
            onClick={() =>
              navigate(`/emp-audit/${record._id}`, {
                state: { empname: record.name },
              })
            }
            className="bg-black px-4 py-2 font-semibold text-white rounded-lg"
          >
            Audit
          </button>
        );
      },
    },
  ];

  const addEmp = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/org/add-employee`,
        {
          email: form.getFieldValue("email"),
          name: form.getFieldValue("name"),
          password: form.getFieldValue("password"),
        },
        {
          headers: {
            "auth-token": token,
          },
        }
      );

      const data = res.data;
      if (data.success) {
        toast.success("Employee added successfully");
        const res = await axios.post(
          `${import.meta.env.VITE_SERVER_URL}/api/mail/send-emp-mail`,
          {
            email: form.getFieldValue("email"),
            password: form.getFieldValue("password"),
          },
          {
            headers: {
              "auth-token": token,
            },
          }
        );
        const data = res.data();
      }
    } catch (error) {
      console.log(error);

      toast.error("Something Went Wrong");
    }
  };

  return (
    <div className="w-full p-6 px-10">
      {org && <h1 className="text-3xl font-bold mb-4 text-left">{org.name}</h1>}

      <div className="flex justify-start gap-4 mt-4">
        <button
          className="bg-black text-white rounded-lg px-3 py-1 hover:opacity-90"
          onClick={openModal}
        >
          Add Employee
        </button>
        <button
          className="bg-slate-800 text-white rounded-lg px-3 py-1 hover:opacity-90"
          onClick={() => setIsAdminModalOpen(true)}
        >
          Add Admin
        </button>
      </div>

      {/* Modal for Add Employee/Admin */}
      <Modal
        title="Add Employee"
        visible={isModalOpen}
        onCancel={closeModal}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Please enter the name" }]}
          >
            <Input placeholder="Enter name" />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: "Please enter the email" }]}
          >
            <Input placeholder="Enter email" />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please enter the password" }]}
          >
            <Input.Password placeholder="Enter password" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
            <Button onClick={closeModal} style={{ marginLeft: "10px" }}>
              Cancel
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Add Admin"
        visible={isAdminModalOpen}
        onCancel={() => setIsAdminModalOpen(false)}
        footer={null}
      >
        <Form form={adminForm} layout="vertical" onFinish={{}}>
          <Form.Item
            label="Name"
            name="adminName"
            rules={[{ required: true, message: "Please enter the name" }]}
          >
            <Input placeholder="Enter name" />
          </Form.Item>
          <Form.Item
            label="Email"
            name="adminEmail"
            rules={[{ required: true, message: "Please enter the email" }]}
          >
            <Input placeholder="Enter email" />
          </Form.Item>
          <Form.Item
            label="Password"
            name="adminPassword"
            rules={[{ required: true, message: "Please enter the password" }]}
          >
            <Input.Password placeholder="Enter password" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
            <Button onClick={closeModal} style={{ marginLeft: "10px" }}>
              Cancel
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Table for Employees */}
      <Table
        className="mt-8"
        dataSource={employees}
        columns={columns}
        pagination={false}
      />
    </div>
  );
};

export default AdminDashboard;
