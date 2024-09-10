import React, { useState, useEffect } from "react";
import FileCard from "./ui/FileCard";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { Skeleton } from "antd";

const SavedFiles = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  if (!token) {
    navigate("/signin");
    toast.error("Please Login First");
  }

  const [userFiles, setUserFiles] = useState([]);
  const [fileLoadingState, setfileLoadingState] = useState(false);

  useEffect(() => {
    const getUserFiles = async () => {
      setfileLoadingState(true);
      try {
        const res = await axios.get(
          "http://localhost:3001/api/cloud/getuserfiles",
          {
            headers: {
              "auth-token": token,
            },
          }
        );
        if (res.status == 400) {
          return;
        }
        const response = await res.data;
        if (response.success) {
          setUserFiles(response.files);
          
        }
      } catch (error) {
        console.error(error, "Error while fetching user files");
        toast.error("Failed to fetch user files");
      } finally {
        setfileLoadingState(false);
      }
    };

    getUserFiles();
  }, [token]);

  const handleFileClick=(cid)=>{
    navigate(`/file/${cid}`);
  }

  return (
    <div>
      <div className="font-semibold pt-6 pb-4 text-left text-3xl ml-20">
        Saved Files
      </div>
      <div className="flex items-center justify-evenly gap-6 flex-wrap">
        {userFiles.map((file) => (
          <div key={file._id} onClick={() => handleFileClick(file.ipfsCID)}>
            {fileLoadingState && (
              <Skeleton.Image active className="w-64 h-64 mt-6" />
            )}
            <FileCard file={file} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavedFiles;
