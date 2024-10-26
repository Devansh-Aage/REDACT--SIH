import { Cloud, Download, Home } from "lucide-react";
import React from "react";
import { useLocation } from "react-router-dom";
import FileRenderer from "./FileRenderer";
import { useState } from "react";
import axios from "axios";
import { Modal } from "antd";
import { toast } from "react-toastify";

const Redacted = () => {
  const token = localStorage.getItem("token");
  const location = useLocation();
  const base64Data = location.state.redactedBase64;
  const rawfileType = location.state.fileType;
  const previewBase64 = location.state.previewBase64;

  const [loaderState, setloaderState] = useState(false);
  const [DownloadloaderState, setDownloadloaderState] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileName, setFileName] = useState("");

  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [DownloadfileName, setDownloadFileName] = useState("");

  const fileType = rawfileType.split("/")[1];

  const saveFileToCloud = async () => {
    try {
      setloaderState(true);
      const res = await axios.post(
        "http://localhost:3001/api/files/upload",
        {
          base64Data: base64Data,
          mimeType: rawfileType,
          filename: fileName,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "auth-token": token,
          },
        }
      );

      const data = await res.data;
      const cid = data.cid;
      if (data.success) {
        setloaderState(false);
        toast.success("File saved to cloud successfully");

        const addAudit = async () => {
          const res = await axios.post(
            "http://localhost:3001/api/audit/addaudit",
            {
              cid: cid,
              eventType: 0,
              filename: fileName,
            },
            {
              headers: {
                "auth-token": token,
              },
            }
          );
          const data = await res.data;
          if (data.success) {
            toast.success("Audit Saved Successfully");
          }
        };
        addAudit();
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong while uploading file");
    } finally {
      setloaderState(false);
      setIsModalOpen(false);
      setFileName("");
    }
  };

  const downloadFile = () => {
    setDownloadloaderState(true);
    const link = document.createElement("a");
    const blob = base64ToBlob(base64Data, rawfileType);
    const url = URL.createObjectURL(blob);

    link.href = url;
    link.download = `${DownloadfileName}.${fileType}`;
    document.body.appendChild(link);
    link.click();

    const addAudit = async () => {
      const res = await axios.post(
        "http://localhost:3001/api/audit/addaudit",
        {
          cid: "",
          eventType: 0,
          filename: DownloadfileName,
        },
        {
          headers: {
            "auth-token": token,
          },
        }
      );
      const data = await res.data;
      if (data.success) {
        toast.success("Audit Saved Successfully");
      }
    };
    setIsDownloadModalOpen(false);
    setDownloadFileName("");
    addAudit();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setDownloadloaderState(false);
  };

  const base64ToBlob = (base64, mimeType) => {
    const byteCharacters = atob(base64.split(",")[1]); // Decode base64
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    return new Blob(byteArrays, { type: mimeType });
  };

  console.log(base64Data);
  

  return (
    <div className="w-full flex h-full ">
      <div className="w-[70%] h-screen overflow-y-auto">
        <FileRenderer fileData={base64Data} fileMimeType={fileType} />
      </div>

      <div className=" h-full mx-auto flex flex-col gap-6 mt-20">
        <button
          onClick={() => setIsDownloadModalOpen(true)}
          className="bg-black w-[17rem] hover:cursor-pointer font-semibold text-base shadow-md text-white px-3 py-2 rounded flex items-center justify-center gap-2"
        >
          <Download size={20} />
          Download file
        </button>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-black w-[17rem] hover:cursor-pointer font-semibold text-base shadow-md text-white px-3 py-2 rounded flex items-center justify-center gap-2"
        >
          <Cloud size={20} />
          Save in Cloud
        </button>
      </div>
      <Modal
        title="Save File to Cloud"
        open={isModalOpen}
        onOk={saveFileToCloud}
        onCancel={() => {
          setIsModalOpen(false);
          setFileName("");
        }}
        confirmLoading={loaderState} // Show loader on submit
      >
        <div className="flex items-center gap-4">
          <label htmlFor="file-name">File Name:</label>
          <input
            id="file-name"
            type="text"
            className="border border-gray-300 rounded p-2"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)} // Update state on input change
            placeholder="Enter file name"
          />
        </div>
      </Modal>

      <Modal
        title="Save File on PC"
        open={isDownloadModalOpen}
        onOk={downloadFile}
        onCancel={() => {
          setIsDownloadModalOpen(false);
          setDownloadFileName("");
        }}
      >
        <div className="flex items-center gap-4">
          <label htmlFor="d-file-name">File Name:</label>
          <input
            id="d-file-name"
            type="text"
            className="border border-gray-300 rounded p-2"
            value={DownloadfileName}
            onChange={(e) => setDownloadFileName(e.target.value)} // Update state on input change
            placeholder="Enter file name"
          />
        </div>
      </Modal>
    </div>
  );
};

export default Redacted;
