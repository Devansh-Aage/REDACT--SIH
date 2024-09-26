import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import FileRenderer from "./FileRenderer";

const SavedFile = ({}) => {
  const token = localStorage.getItem("token");
  const { cid } = useParams();
  const [file, setFile] = useState(null);
  const [loaderState, setloaderState] = useState(false)
  const [mimeTypeFile, setmimeTypeFile] = useState("");

  useEffect(() => {
    const fetchFile = async () => {
      try {
        setloaderState(true);
        const response = await axios.get(
          `http://localhost:3001/api/files/retrieve/${cid}`
        );
        const base64String = response.data.decryptedBase64; 
        const filename = response.data.filename;
        const mimeType = response.data.mimeType;
        setmimeTypeFile(mimeType.split("/")[1]);
        // Prepare file data for FileViewer
        const fileUrl = `data:${mimeType};base64,${base64String}`;
        setFile(fileUrl);
        const saveAudit = async () =>
          await axios.post(
            "http://localhost:3001/api/audit/addaudit",
            {
              cid: cid,
              eventType: 1,
              filename:filename,
            },
            {
              headers: {
                "auth-token": token,
              },
            }
          );
          saveAudit();
      } catch (error) {
        console.error("Error fetching file:", error);
      }
      finally{
        setloaderState(false);
      }
    };
    fetchFile();
  }, [cid]);

  return (
    <div className="relative w-full h-[750px]">
      {loaderState && <span className="loader bottom-50 mt-[15rem] absolute"></span>}
      <FileRenderer fileData={file} fileMimeType={mimeTypeFile} />
    </div>
  );
};

export default SavedFile;
