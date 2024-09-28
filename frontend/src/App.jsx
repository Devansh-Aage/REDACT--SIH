import "./App.css";
import React from "react";
import { Routes, Route } from "react-router-dom";
import SignIn from "./component/SignIn";
import SignUp from "./component/SignUp";
import Home from "./component/Home";
import Preview from "./component/Preview";
import Navbar from "./component/Navbar";
import Redacted from "./component/Redacted";
import { ToastContainer } from "react-toastify";
import SavedFile from "./component/SavedFile";
import UploadFile from "./component/UploadFile";
import SavedFiles from "./component/SavedFiles";
import Audits from "./component/Audits";
import Org from "./component/Org";
import AdminDashboard from "./component/AdminDashboard";
import EmpAudit from "./component/EmpAudit";

function App() {
  return (
    <div className="w-full h-full">
      <Navbar/>
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/home" element={<Home />} />
        <Route path="/preview" element={<Preview />} />
        <Route path="/savedfiles" element={<SavedFiles />} />
        <Route path="/redacted" element={<Redacted />} />
        <Route path="/uploaded" element={<UploadFile />} />
        <Route path="/history" element={<Audits />} />
        <Route path="/org" element={<Org />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/file/:cid" element={<SavedFile />} />
        <Route path="/emp-audit/:empId" element={<EmpAudit />} />
      </Routes>
      <ToastContainer draggable='mouse' />
    </div>
  );
}

export default App;
