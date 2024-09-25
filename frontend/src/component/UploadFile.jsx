import React, { useState } from "react";
import FileRenderer from "./FileRenderer";
import { Checkbox, Button } from "antd";
import { ArrowBigLeft, Loader2 } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import extractFileType from "../helper/extractFileType";
// import encryptionFile from "../helper/encryptFile";

const UploadFile = ({ uploadedFile, fileData, fileName }) => {
  const [selectedValues, setSelectedValues] = useState([]);
  const [loaderState, setloaderState] = useState(false);
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
    setloaderState(true);
    try {
      let form = new FormData();
      form.append("file", fileData);
      form.append("entities", selectedValues);
      form.append("filename", fileName);
      if (fileType === "application/pdf") {
        const res = await axios.post("http://localhost:5000/redact_pdf", form);
        const data = await res.data;
        if (data) {
          console.log(data.redacted_image);

          navigate("/preview", {
            state: {
              filebase64: data.redacted_file,
              sensitiveWords: data.words_redacted,
              orgBase64: fileData,
              isPDF: true,
            },
          });
        }
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
              orgBase64: fileData,
            },
          });
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Error while Sending file to server!");
    } finally {
      setloaderState(false);
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
          className="cursor-pointer px-4 py-2 w-24 flex items-center font-semibold text-base bg-black text-white rounded-md mb-4 hover:opacity-80 "
        >
          <ArrowBigLeft size={20} />
          Back
        </div>
        <div className="font-semibold text-3xl ">Parameters To Redact</div>
        <Checkbox.Group
          options={options}
          onChange={handleCheckboxChange}
          className="flex-col items-center"
          rootClassName="grid grid-cols-2 w-full my-4 gap-2"
        />
        {/* Button to save selected values */}
        <button
          className={`px-4 py-2 bg-black cursor-pointer text-white w-full rounded-md mt-4 font-semibold text-base hover:opacity-80 ${
            loaderState && "bg-gray-600 cursor-not-allowed"
          }`}
          onClick={handleSaveClick}
          disabled={loaderState}
        >
          {loaderState ? (
            <div className="flex items-center gap-3 justify-center">
              <Loader2 className="animate-spin " size={15} />
              Processing...
            </div>
          ) : (
            "Apply Parameters"
          )}
        </button>
      </div>
    </div>
  );
};

export default UploadFile;
