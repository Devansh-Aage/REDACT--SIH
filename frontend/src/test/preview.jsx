import React from 'react';

function Preview({ uploadedFile, previewUrl, handleSubmit }) {
    return (
        <div className="h-screen w-full max-w-full max-h-full flex flex-col items-center justify-start bg-gray-50">
            <div className="w-full max-w-4xl max-h-full p-10 pb-20 bg-white rounded-lg shadow-lg">
                <p className="text-xl text-center mb-6 font-semibold text-gray-700">File Preview:</p>
                {uploadedFile && uploadedFile.type.startsWith('image/') ? (
                    <img
                        src={previewUrl}
                        alt="Uploaded Image Preview"
                        className="w-full h-auto mt-3 border-2 border-gray-300 rounded-lg shadow-md"
                    />
                ) : uploadedFile && uploadedFile.type === 'application/pdf' ? (
                    <object
                        data={previewUrl}
                        type="application/pdf"
                        className="w-full h-96 mt-3 border-2 border-gray-300 rounded-lg"
                    >
                        <p>Your browser does not support PDFs. <a href={previewUrl}>Download the PDF</a>.</p>
                    </object>
                ) : (
                    <p className="text-center text-gray-500">Preview not available for this file type.</p>
                )}

                <div className="flex justify-center mt-5">
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        Submit
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Preview;