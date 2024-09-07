import { Cloud, Download, Home } from "lucide-react";
import React from "react";

const Redacted = () => {
  return (
    <div className="w-full flex items-center justify-between">
      <div>File</div>
      <div className="bg-slate-50 py-4 w-[40%] h-[30rem] flex flex-col gap-6 px-16">
        <div className="flex items-center justify-around">
          <div className="bg-blue-500 hover:cursor-pointer  shadow-md text-white px-2 py-1 rounded flex items-center gap-2">
            <Download size={20} />
            Download file
          </div>
          <div className="bg-blue-500  hover:cursor-pointer shadow-md text-white px-2 py-1 rounded flex items-center gap-2 ">
            <Cloud size={20} />
            Save in Cloud
          </div>
        </div>
        <div className="bg-blue-500  hover:cursor-pointer mx-auto w-[60%] shadow-md text-white px-2 py-1 rounded flex items-center justify-center gap-2 ">
            <Home size={20} />
            Back to Home
          </div>
      </div>
    </div>
  );
};

export default Redacted;
