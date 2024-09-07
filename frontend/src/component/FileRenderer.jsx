import React from "react";
import FileViewer from "react-file-viewer";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

const FileRenderer = ({ fileMimeType, fileData }) => {
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  return (
    <>
      {fileMimeType === "pdf" ? (
        <div className="mx-20 my-6">
          <Worker
            workerUrl={`https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js`}
          >
            <Viewer
              fileUrl={fileData}
              plugins={[defaultLayoutPluginInstance]}
            />
          </Worker>
        </div>
      ) : (
        <FileViewer
          fileType={fileMimeType}
          filePath={fileData}
          onError={(e) => console.log("Error:", e)}
        />
      )}
    </>
  );
};

export default FileRenderer;
