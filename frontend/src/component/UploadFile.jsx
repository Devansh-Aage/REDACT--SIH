import React, { useState } from "react";
import FileRenderer from "./FileRenderer";
import { Checkbox } from "antd";
import { ArrowBigLeft, Loader2 } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import extractFileType from "../helper/extractFileType";
import { Collapse, Tooltip } from "antd";
import Btn from "./ui/Btn";

const UploadFile = ({ uploadedFile, fileData, fileName }) => {
  const [selectedValues, setSelectedValues] = useState([]);
  const [loaderState, setloaderState] = useState(false);
  const rawMimeType = uploadedFile?.type;
  const mimeType = rawMimeType.split("/")[1];
  const navigate = useNavigate();
  console.log(selectedValues);

  const fileType = extractFileType(fileData);

  const options = [
    {
      category: "General",
      items: ["Person", "Age", "Date", "Time", "Phone", "Email", "Location"],
    },
    {
      category: "Medical",
      items: ["Aadhar Number", "Health", "Medication"],
    },
    {
      category: "Legal",
      items: ["Organization", "Crime"],
    },
    {
      category: "Finance",
      items: [
        "Organization",
        "GPE",
        "Aadhar Number",
        "Credit Card",
        "PAN Number",
      ],
    },
  ];

  const tooltips = {
    Person: "Person Name",
    Age: "Age",
    Date: "Date",
    Time: "Time",
    Phone: "Phone Number",
    Email: "Email Address",
    Location: "Location",
    "Aadhar Number": "Aadhar Card Number",
    Health: "Health: Includes Names of Diseases",
    Medication: "Names of Medicines",
    Organization: "Organization",
    Crime: "Example: Murder, Theft and Burglary,etc",
    "Credit Card": "Credit and Debit Card Number",
    "PAN Number": "PAN Card Number",
    GPE: "Geographical/Political Words ",
  };

  const handleCheckboxChange = (checkedValues, category) => {
    setSelectedValues((prevSelectedValues) => {
      let newSelectedValues = [...prevSelectedValues];
      const categoryItems = options.find(
        (option) => option.category === category
      ).items;
      newSelectedValues = newSelectedValues.filter(
        (value) => !categoryItems.includes(value)
      );
      newSelectedValues = [...newSelectedValues, ...checkedValues];
      return newSelectedValues;
    });
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
    <div className="flex justify-around  gap-6 w-full h-full">
    
      <div className="w-[70%] h-[40rem] overflow-y-auto">
        <FileRenderer fileMimeType={mimeType} fileData={fileData} />
      </div>
      <div className="mt-2 w-[30%]">
        <Btn
        className="w-[100px] flex items-center gap-3"
          onClick={() => clearUploadedFile()}
        >
          <ArrowBigLeft size={20} />
          Back
        </Btn>
        <div className="font-semibold text-3xl mb-3">Parameters To Redact</div>

        <Collapse
          className=""
          items={options.map((option) => ({
            key: option.category,
            label: option.category,
            children: (
              <Checkbox.Group
                rootClassName=""
                value={selectedValues.filter((value) =>
                  option.items.includes(value)
                )}
                onChange={(checkedValues) =>
                  handleCheckboxChange(checkedValues, option.category)
                }
                className=""
              >
                {option.items.map((item) => (
                  <Tooltip
                    key={item}
                    title={tooltips[item]}
                    className="flex items-center"
                  >
                    <Checkbox value={item}>{item}</Checkbox>
                  </Tooltip>
                ))}
              </Checkbox.Group>
            ),
          }))}
        />

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
