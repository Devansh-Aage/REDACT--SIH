require("dotenv").config();
const axios = require("axios");
const express = require("express");
const crypto = require("crypto");
const File = require("../models/File.js");
const fetchuser = require("../middleware/fetchuser.js");

const router = express.Router();

router.get("/getuserfiles", fetchuser, async (req, res) => {
  let success = false;
  try {
    const userId = req.user.id;
    const files = await File.find({ user: userId }).select('-encryptionkey');
    if(!files){
      res.status(400).send({message:"No User Files Saved in Cloud"})
    }
    success = true;
    res.json({
      success,
      files,
    });
  } catch (error) {
    console.error("Error while fetching user files", error);
  }
});

module.exports=router;