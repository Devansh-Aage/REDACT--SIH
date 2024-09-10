import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import FileRenderer from "./FileRenderer";
import extractFileType from "../helper/extractFileType";
import axios from "axios";
import { toast } from "react-toastify";

const Preview = () => {
  const location = useLocation();
  const base64Data = location.state.filebase64;
  const sensWords = location.state.sensitiveWords;
  const orgBase64= location.state.orgBase64;
  const navigate = useNavigate();

  const rawfileType = extractFileType(base64Data);
  const fileType = rawfileType.split("/")[1];

  const [sensitiveWords, setSensitiveWords] = useState(sensWords);
  const [newWord, setNewWord] = useState("");

  // Function to remove a word from the state
  const removeWord = (wordToRemove) => {
    setSensitiveWords(sensitiveWords.filter((word) => word !== wordToRemove));
  };

  // Function to add a word to the state
  const addWord = () => {
    if (newWord && !sensitiveWords.includes(newWord)) {
      setSensitiveWords([...sensitiveWords, newWord]);
      setNewWord("");
    }
  };

  const confirmRedaction = async () => {
    try {
      let formData = new FormData();
      formData.append("file",orgBase64);
      formData.append("exclude_words",sensitiveWords);
      const res = await axios.post(
        "http://localhost:5000/confirm_image_redaction",formData
      );
      if (!res.data) {
        toast.error("Something went wrong");
      }
      const data = await res.data;
      const fileBase64 = data.redacted_image;
      const fileType = extractFileType(fileBase64);
console.log(base64Data);

      navigate("/redacted", {
        state: {
          redactedBase64: fileBase64,
          previewBase64:base64Data,
          fileType: fileType,
        },
      });
    } catch (error) {
      toast.error("Something went wrong")
      console.log(error);
      
    }

    // navigate('/redacted',{state:{

    // }})
  };

  return (
    <div className="w-full flex items-center justify-between">
      <div className="w-[65%] h-[50rem] overflow-y-auto">
        <FileRenderer fileData={base64Data} fileMimeType={fileType} />
      </div>
      <div className="bg-slate-50 py-4 w-[40%] flex flex-col gap-6 px-16">
        <div className="font-bold text-lg text-start"> Sensitive Words </div>
        <ul className="max-h-[400px] overflow-y-auto">
          {sensitiveWords.map((word, index) => (
            <li
              key={index}
              className="flex items-center justify-between my-2 w-[50%] gap-6"
            >
              {word}
              <button
                className="hover:text-red-600 hover:underline"
                onClick={() => removeWord(word)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newWord}
            onChange={(e) => setNewWord(e.target.value)}
            className="border p-2 rounded"
            placeholder="Add new word"
          />
          <button
            className="bg-green-500 shadow-md text-white px-2 py-1 rounded"
            onClick={addWord}
          >
            Add
          </button>
        </div>
        <div className="bg-blue-500 shadow-md hover:cursor-pointer text-white px-2 py-1 rounded">
          Update Redaction
        </div>
        <div
          onClick={()=>confirmRedaction()}
          className="bg-blue-800 shadow-md hover:cursor-pointer text-white px-2 py-1 rounded"
        >
          Confirm Redaction
        </div>
        {/* <div className="flex items-center justify-around">
          <div className="bg-blue-500 hover:cursor-pointer  shadow-md text-white px-2 py-1 rounded flex items-center gap-2">
            <Download size={20} />
            Download file
          </div>
          <div className="bg-blue-500  hover:cursor-pointer shadow-md text-white px-2 py-1 rounded flex items-center gap-2 ">
            <Cloud size={20} />
            Save in Cloud
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default Preview;
