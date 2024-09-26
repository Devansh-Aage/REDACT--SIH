import { Cloud, Download, Home } from "lucide-react";
import React from "react";
import { useLocation } from "react-router-dom";
import FileRenderer from "./FileRenderer";

const Redacted = () => {
  const location = useLocation();
  const base64Data = location.state.redactedBase64;
  const rawfileType = location.state.fileType;
  const previewBase64 = location.state.previewBase64;

  const fileType = rawfileType.split("/")[1];

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="w-full h-full flex items-start justify-between p-8 space-x-8">
        {/* Preview File Renderer */}
        <div className="w-1/2 h-full border border-gray-300 p-4">
          <h2 className="text-center text-lg font-semibold mb-4">
            Preview File
          </h2>
          <FileRenderer fileData={previewBase64} fileMimeType={fileType} />
        </div>

        {/* Redacted File Renderer */}
        <div className="w-1/2 h-full border border-gray-300 p-4">
          <h2 className="text-center text-lg font-semibold mb-4">
            Redacted File
          </h2>
          <FileRenderer fileData={base64Data} fileMimeType={fileType} />
        </div>
      </div>

      <div className="bg-slate-50 py-4 h-auto flex flex-col gap-6 px-16">
        {/* Download and Save in Cloud Buttons */}
        <div className="flex items-center justify-around">
          <div className="bg-blue-400 hover:cursor-pointer shadow-md text-white mr-4 px-2 py-1 rounded flex items-center gap-2">
            <Download size={20} />
            Download file
          </div>
          <div className="bg-blue-800 hover:cursor-pointer shadow-md text-white px-2 py-1 rounded flex items-center gap-2">
            <Cloud size={20} />
            Save in Cloud
          </div>
        </div>

        {/* Back to Home Button */}
        <div className="bg-blue-500 hover:cursor-pointer mx-auto w-[60%] shadow-md text-white px-2 py-1 rounded flex items-center justify-center gap-2">
          <Home size={20} />
          Back to Home
        </div>
      </div>
    </div>
  );
};

export default Redacted;
