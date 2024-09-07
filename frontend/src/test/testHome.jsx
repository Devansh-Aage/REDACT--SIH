// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom'; 
// import { CloudUpload } from 'lucide-react';
// import Preview from './Preview';

// function Home() {
//   const [uploadedFile, setUploadedFile] = useState(null);
//   const [previewUrl, setPreviewUrl] = useState(null);
//   const [fileError, setFileError] = useState('');
//   const navigate = useNavigate();

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setUploadedFile(file);
//       const fileUrl = URL.createObjectURL(file);
//       setPreviewUrl(fileUrl);
//       setFileError('');
//     } else {
//       setUploadedFile(null);
//       setFileError('Please upload a valid file.');
//     }
//   };

//   const handleSubmit = async () => {
//     if (!uploadedFile) {
//       alert('Please upload a file');
//       return;
//     }

//     const formData = new FormData();
//     formData.append('file', uploadedFile);

//     try {
//       const response = await fetch('http://localhost:5000/redact_image', {
//         method: 'POST',
//         body: formData,
//       });

//       if (!response.ok) {
//         throw new Error('Failed to upload file');
//       }

//       const data = await response.json(); 
//       const redactedImageUrl = data.redacted_image_url; // yaha pe redacted file ka url mil raha hai

//       // redacted file ke url ko navigate kiya
//       navigate('/redacted', { state: { previewUrl: http://localhost:5000/${redactedImageUrl} } });
//     } catch (error) {
//       console.error('Error uploading the file:', error);
//     }
//   };

//   return (
//     <div className="h-screen w-full max-w-full max-h-full flex items-center justify-center">
//       <div className="w-full h-full max-w-full max-h-full flex flex-col items-center justify-center">
//         {!uploadedFile && (
//           <label htmlFor="dropzone-file" className="m-20 flex flex-col items-center justify-center w-full h-full border-4 border-dashed border-indigo-400 rounded-lg cursor-pointer bg-white hover:bg-gray-100 transition duration-300 ease-in-out shadow-lg hover:shadow-2xl">
//             <div className="flex flex-col items-center justify-center pt-5 pb-6">
//               <CloudUpload className="w-10 h-10 text-indigo-500" />
//               <p className="mb-2 text-xl text-gray-500">
//                 <span className="font-semibold">Click to upload</span> or drag and drop
//               </p>
//               <p className="text-ms text-gray-500">Any file type</p>
//             </div>
//             <input id="dropzone-file" type="file" onChange={handleFileChange} className="hidden"/>
//           </label>
//         )}
//         {fileError && <p className="mt-2 text-red-500">{fileError}</p>}
//         {uploadedFile && (
//           <>
//             <Preview uploadedFile={uploadedFile} previewUrl={previewUrl} handleSubmit={handleSubmit} />
//           </>
//         )}
//       </div>
//     </div>
//   );
// }

// export default Home;