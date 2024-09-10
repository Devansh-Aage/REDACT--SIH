import React, { useState } from "react";
import FileRenderer from "./FileRenderer";
import { Checkbox, Button } from "antd";
import { ArrowBigLeft } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import extractFileType from "../helper/extractFileType";

const UploadFile = ({ uploadedFile, fileData, fileName }) => {
  const [selectedValues, setSelectedValues] = useState([]);
  const rawMimeType = uploadedFile?.type;
  const mimeType = rawMimeType.split("/")[1];
  const navigate = useNavigate();

  const fileType = extractFileType(fileData);

  const options = [
    "PERSON",
    "ORG",
    "PAN",
    "ACN",
    "IFSC",
    "CASTE",
    "RELIGION",
    "SEX",
    "DATE",
    "HEALTH",
    "POLITICAL",
  ]; // List of options

  const handleCheckboxChange = (checkedValues) => {
    setSelectedValues(checkedValues); // Update state with checked values
  };

  const handleSaveClick = async () => {
    try {
      let form = new FormData();
      form.append("file", fileData);

      form.append("entities", selectedValues);
      form.append("filename", fileName);
      if (fileType === "application/pdf") {
        const res = await axios.post("http://localhost:5000/redact_pdf", form);
        const data = await res.data;
        console.log(data);
      } else {
        const res = await axios.post(
          "http://localhost:5000/redact_image",
          form
        );
        const data = await res.data;
        console.log(data);
        if (data) {
          navigate("/preview", {
            state: {
              filebase64: data.redacted_image,
              sensitiveWords: data.name_redacted,
              orgBase64:fileData
            },
          });
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Error while Sending file to server!");
    }
  };

  const clearUploadedFile = () => {
    window.location.reload();
  };

  return (
    <div className="flex justify-around gap-6 w-full h-full">
      <div className="w-[65%] h-[40rem] overflow-y-auto">
        <FileRenderer fileMimeType={mimeType} fileData={fileData} />
      </div>
      <div className="mt-10">
        <div
          onClick={() => clearUploadedFile()}
          className="cursor-pointer px-4 py-2 w-24 flex items-center font-semibold text-base bg-blue-500 text-white rounded-md mb-4"
        >
          <ArrowBigLeft size={20} />
          Back
        </div>
        <div className="font-semibold text-3xl ">Parameters To Redact</div>
        <Checkbox.Group
          options={options}
          onChange={handleCheckboxChange}
          className="flex-col items-center"
        />
        {/* Button to save selected values */}
        <Button type="primary" onClick={handleSaveClick}>
          Save Selected Values
        </Button>
      </div>
    </div>
  );
};

export default UploadFile;
