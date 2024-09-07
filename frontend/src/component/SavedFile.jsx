import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import FileRenderer from "./FileRenderer";

const SavedFile = ({}) => {
  const { cid } = useParams();
  const [file, setFile] = useState(null);
  const [mimeTypeFile, setmimeTypeFile] = useState("");


  useEffect(() => {
    const fetchFile = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/api/files/retrieve/${cid}`
        );
        const base64String = response.data.decryptedBase64; // Assuming this is your base64 data
        const mimeType = response.data.mimeType; // Assuming this is your MIME type
        setmimeTypeFile(mimeType.split("/")[1]);
        // Prepare file data for FileViewer
        const fileUrl = `data:${mimeType};base64,${base64String}`;
        setFile(fileUrl);
      } catch (error) {
        console.error("Error fetching file:", error);
      }
    };
    fetchFile();
  }, [cid]);

  return (
    <div style={{ height: "750px", width: "100%" }}>
      <FileRenderer fileData={file} fileMimeType={mimeTypeFile} />
    </div>
  );
};

export default SavedFile;
