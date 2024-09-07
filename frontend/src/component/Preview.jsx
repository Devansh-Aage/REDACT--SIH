import { Cloud, Download } from "lucide-react";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import FileRenderer from "./FileRenderer";

const Preview = () => {
  const [sensitiveWords, setSensitiveWords] = useState([
    "aadhar",
    "pan",
    "aadhar",
    "pan",
    "aadhar",
    "pan",
    "aadhar",
    "pan",
    "aadhar",
    "pan",
  ]);
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

  return (
    <div className="w-full flex items-center justify-between">
      <div className="w-[65%] h-[40rem] overflow-y-auto">
        {/* <FileRenderer  /> */}
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
        <Link
          to="/redacted"
          className="bg-blue-800 shadow-md hover:cursor-pointer text-white px-2 py-1 rounded"
        >
          Confirm Redaction
        </Link>
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
