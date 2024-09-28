import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import FileRenderer from "./FileRenderer";
import extractFileType from "../helper/extractFileType";
import axios from "axios";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";

const Preview = () => {
  const location = useLocation();
  const base64Data = location.state.filebase64;
  const sensWords = location.state.sensitiveWords;
  const orgBase64 = location.state.orgBase64;
  const isPdf = location.state.isPDF;
  const navigate = useNavigate();

  const [loaderState, setloaderState] = useState(false);

  const rawfileType = extractFileType(base64Data);
  const fileType = rawfileType.split("/")[1];

  const [sensitiveWords, setSensitiveWords] = useState(sensWords);
  const [newWord, setNewWord] = useState("");

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
      setloaderState(true);
      let formData = new FormData();
      formData.append("file", orgBase64);
      formData.append("exclude_words", sensitiveWords);
      if (isPdf) {
        const res = await axios.post(
          "http://localhost:5000/confirm_pdf_redaction",
          formData
        );
        if (!res.data) {
          toast.error("Something went wrong");
        }
        const data = await res.data;
        const fileBase64 = data.redacted_file;
        const fileType = extractFileType(fileBase64);

        navigate("/redacted", {
          state: {
            redactedBase64: fileBase64,
            previewBase64: base64Data,
            fileType: fileType,
          },
        });
      } else {
        const res = await axios.post(
          "http://localhost:5000/confirm_image_redaction",
          formData
        );
        if (!res.data) {
          toast.error("Something went wrong");
        }
        const data = await res.data;
        const fileBase64 = data.redacted_image;
        const fileType = extractFileType(fileBase64);

        navigate("/redacted", {
          state: {
            redactedBase64: fileBase64,
            previewBase64: base64Data,
            fileType: fileType,
          },
        });
      }
    } catch (error) {
      toast.error("Something went wrong");
      console.log(error);
    } finally {
      setloaderState(false);
    }
  };

  return (
    <div className="w-full flex items-center justify-between">
      <div className="w-[65%] h-[38rem] overflow-y-auto">
        <FileRenderer fileData={base64Data} fileMimeType={fileType} />
      </div>
      <div className=" py-4 w-[35%] flex flex-col px-16 h-full">
        <div className="font-bold  text-lg text-start my-2">
          Sensitive Words
        </div>
        <ul className="max-h-[400px] w-full overflow-y-auto">
          {sensitiveWords.map((word, index) => (
            <li
              key={index}
              className="flex items-center justify-between my-2 w-full px-6 gap-6"
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
        <div className="flex items-center gap-2 my-2 w-full">
          <input
            type="text"
            value={newWord}
            onChange={(e) => setNewWord(e.target.value)}
            className="border flex-1 p-2 rounded-xl"
            placeholder="Add new word"
          />
          <button
            className="bg-gray-500 shadow-md text-white px-3 py-2 rounded-lg"
            onClick={addWord}
          >
            Add
          </button>
        </div>
        <div className="bg-gray-800 shadow-md hover:cursor-pointer text-white px-2 py-1 rounded">
          Update Redaction
        </div>
        <button
          onClick={() => confirmRedaction()}
          className={`px-4 py-2 bg-black cursor-pointer text-white rounded-md mt-4 font-semibold text-base hover:opacity-80 ${
            loaderState && "bg-gray-600 cursor-not-allowed"
          }`}
          disabled={loaderState}
        >
          {loaderState ? (
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="animate-spin " size={15} />
              Processing...
            </div>
          ) : (
            "Confirm Redaction"
          )}
        </button>
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
