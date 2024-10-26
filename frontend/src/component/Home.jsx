import React, { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, message } from "antd";
import { toast } from "react-toastify";
import UploadFile from "./UploadFile";
import { InboxOutlined } from "@ant-design/icons";

const { Dragger } = Upload;
function Home() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  if (!token) {
    navigate("/signin");
    toast.error("Please Login First");
  }

  useEffect(() => {
    if (!token) {
      navigate("/");
      toast.error("Please Login First");
    }
  }, [token])
  

  const publicKey = import.meta.env.VITE_RSA_PUBLIC_KEY;
  const [fileName, setfileName] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [base64FileData, setBase64FileData] = useState(null);

  const handleFileChange = ({ file }) => {
    if (file.status !== "uploading") {
      console.log(file);
    }
    if (file.status === "done") {
      // When the file is uploaded, process it
      const fileData = file.originFileObj; // Get the actual file
      setUploadedFile(fileData);
      setfileName(fileData.name);

      const fileUrl = URL.createObjectURL(fileData);

      // Read file as base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setBase64FileData(reader.result);
      };
      reader.readAsDataURL(fileData);

      message.success(`${fileData.name} file uploaded successfully`);
    } else if (file.status === "error") {
      message.error(`${file.name} file upload failed.`);
    }
  };

  const uploadProps = {
    name: "file",
    multiple: false,
    accept: "image/jpg,image/jpeg,image/png,application/pdf",
    showUploadList: false,
    customRequest: ({ file, onSuccess }) => {
      // Simulate an async upload
      setTimeout(() => {
        onSuccess("ok");
      }, 1000);
    },
    onChange: handleFileChange,
  };

  if (uploadedFile) {
    return (
      base64FileData && (
        <div className="w-full h-full">
          <UploadFile
            uploadedFile={uploadedFile}
            fileData={base64FileData}
            fileName={fileName}
          />
        </div>
      )
    );
  }

  return (
    <div className="flex items-center justify-center overflow-y-hidden h-[85vh] w-full px-10">
      <Dragger {...uploadProps} className="w-full h-full">
        <p className="ant-upload-drag-icon"><InboxOutlined  /></p>
        <p className="ant-upload-text">
          Click or drag file to this area to upload
        </p>
        <p className="ant-upload-hint">
        <span className="text-white px-2 py-1 rounded-md bg-red-600 mr-2">
                JPG
              </span>
              <span className="text-white px-2 py-1 rounded-md bg-green-600 mr-2">
                JPEG
              </span>
              <span className="text-white px-2 py-1 rounded-md bg-blue-600 mr-2">
                PNG
              </span>
              <span className="text-white px-2 py-1 rounded-md bg-yellow-600">
                PDF
              </span>
        </p>
      </Dragger>
      {/* <label
          htmlFor="dropzone-file"
          className="flex flex-col items-center justify-center w-full  border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 h-full dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg
              className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 16"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
              />
            </svg>
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold">Click to upload</span> or drag and
              drop
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              <span className="text-white px-2 py-1 rounded-md bg-red-600 mr-2">
                JPG
              </span>
              <span className="text-white px-2 py-1 rounded-md bg-green-600 mr-2">
                JPEG
              </span>
              <span className="text-white px-2 py-1 rounded-md bg-blue-600 mr-2">
                PNG
              </span>
              <span className="text-white px-2 py-1 rounded-md bg-yellow-600">
                PDF
              </span>
            </p>
          </div>
          <input
            id="dropzone-file"
            type="file"
            onChange={handleFileChange}
            className="hidden"
            accept="image/jpg,image/jpeg,image/png,application/pdf"
          />
        </label> */}
    </div>
  );
}

export default Home;
