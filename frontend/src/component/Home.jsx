import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import FileCard from "./ui/FileCard";
import axios from "axios";
import UploadFile from "./UploadFile";

function Home() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  if (!token) {
    navigate("/signin");
    toast.error("Please Login First");
  }
  const [userFiles, setUserFiles] = useState([]);
  const [fileLoadingState, setfileLoadingState] = useState(false);

  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

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

  const handleFileClick = (file) => {
    navigate(`/file/${file}`);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);
    }
    // console.log(uploadedFile);
    
    // if(uploadedFile && previewUrl){
    //   navigate('/uploaded',{state:{uploadedFile:uploadedFile, fileData:previewUrl}});
    // }
  };

  if (uploadedFile) {
    return (
      <div className="w-full h-full">
        <UploadFile uploadedFile={uploadedFile} fileData={previewUrl} />
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <div className="flex items-center justify-center h-[35rem] w-full px-10">
        <label
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
              <span className="text-white px-2 py-1 rounded-md bg-red-600 mr-2">JPG</span>
              <span className="text-white px-2 py-1 rounded-md bg-green-600 mr-2">JPEG</span>
              <span className="text-white px-2 py-1 rounded-md bg-blue-600 mr-2">PNG</span>
              <span className="text-white px-2 py-1 rounded-md bg-yellow-600">PDF</span>
            </p>
          </div>
          <input
            id="dropzone-file"
            type="file"
            onChange={handleFileChange}
            className="hidden"
            accept="image/jpg,image/jpeg,image/png,application/pdf"
          />
        </label>
      </div>
      {/* <div>
        <div className="font-semibold pt-6 pb-4 text-left text-3xl ml-20">
          Saved Files
        </div>
        <div className="flex items-center justify-evenly gap-6 flex-wrap">
          {userFiles.map((file) => (
            <div key={file._id} onClick={() => handleFileClick(file.ipfsCID)}>
              <FileCard file={file} />
            </div>
          ))}
        </div>
      </div> */}
    </div>
  );
}

export default Home;
