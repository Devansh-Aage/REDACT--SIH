import React, { useState } from "react";
import FileRenderer from "./FileRenderer";
import { Checkbox, Button } from "antd";
import { ArrowBigLeft } from "lucide-react";

const UploadFile = ({ uploadedFile, fileData }) => {
  const [selectedValues, setSelectedValues] = useState([]);
  const rawMimeType = uploadedFile?.type;
  const mimeType = rawMimeType.split("/")[1];

  const options = ["person", "aadhar", "pan", "organization", "blood group"]; // List of options

  const handleCheckboxChange = (checkedValues) => {
    setSelectedValues(checkedValues); // Update state with checked values
  };

  const handleSaveClick = () => {
    console.log("Selected values to redact:", selectedValues); // Log the selected values
    // You can perform further actions with the selected values here
  };

  const clearUploadedFile=()=>{
    window.location.reload();
  }

  return (
    <div className="flex justify-around gap-6 w-full h-full">
      <div className="w-[65%] h-[40rem] overflow-y-auto">
        <FileRenderer fileMimeType={mimeType} fileData={fileData} />
      </div>
      <div className="mt-10">
        <div onClick={()=>clearUploadedFile()} className="cursor-pointer px-4 py-2 w-24 flex items-center font-semibold text-base bg-blue-500 text-white rounded-md mb-4">
          <ArrowBigLeft size={20}/>
          Back
        </div>
        <div className="font-semibold text-3xl ">Parameters To Redact</div>
        <Checkbox.Group
          options={options}
          onChange={handleCheckboxChange}
          className="mb-4"
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
