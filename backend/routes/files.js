require("dotenv").config();
const multer = require("multer");
const axios = require("axios");
const express = require("express");
const crypto = require("crypto");
const fs = require("fs/promises");
const syncFS = require("fs");
const path = require("path");
const File = require("../models/File.js");
const FormData = require("form-data");
const stream = require("stream");
const fetchuser = require("../middleware/fetchuser.js");
const { PinataSDK } = require("pinata");

const router = express.Router();

const JWT = process.env.PINATA_JWT;
const API = process.env.PINATA_API;
const pinataGateway = process.env.PINATA_GATEWAY;

const pinata = new PinataSDK({
  pinataJwt: JWT,
  pinataGateway: pinataGateway,
});

// Configure multer to save files to disk
const upload = multer({ dest: "./uploads/" });

const encryptFile = (buffer, key) => {
  const cipher = crypto.createCipheriv("aes-256-cbc", key, key.slice(0, 16));
  let encrypted = cipher.update(buffer);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return encrypted;
};

const decryptFile = (buffer, key) => {
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    key,
    key.slice(0, 16)
  );
  let decrypted = decipher.update(buffer);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted;
};

router.post(
  "/upload",
  fetchuser,
  upload.single("orgFile"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const key = crypto.randomBytes(32);
    console.log(req.file);
    
    try {
      let formData = new FormData();
      // Read the file from disk
      const filePath = path.join(__dirname, "..", req.file.path);

      const buffer = await fs.readFile(filePath);
      const encryptedBuffer = encryptFile(buffer, key);

      // Create a readable stream from the encrypted buffer
      // const encryptedStream = new stream.Readable();
      // encryptedStream.push(encryptedBuffer);
      // encryptedStream.push(null); // End the stream

      // Add the encrypted stream to the FormData
      const encryptedbase64String = encryptedBuffer.toString("base64");

      formData.append("file", encryptedbase64String);

      const response = await pinata.upload.base64(encryptedbase64String);

      // const IPFSHash = await response.data.IpfsHash;
      console.log(response);

      let file = await File.findOne({ encryptionkey: key });
      if (file) {
        return res
          .status(500)
          .json({ message: "This encryption key has already been used!" });
      }

      file = await File.create({
        user: req.user.id,
        encryptionkey: key,
        ipfsCID: response.cid,
        mimeType:req.file.mimetype,
        filename:req.file.originalname,
      });

      // Delete the file from the upload folder
      await fs.unlink(filePath);
      console.log("File deleted");

      res.status(200).json({
        buffer,
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      res
        .status(500)
        .json({ message: "Error uploading file", error: error.message });
    }
  }
);

// Add this new route to retrieve a file using its CID
router.get("/retrieve/:cid", fetchuser, async (req, res) => {
  const { cid } = req.params;

  try {
    // Retrieve the file entry from the database
    const fileDB = await File.findOne({ ipfsCID: cid });
    if (!fileDB)
      return res.status(400).json({ message: "File CID not found in DB" });

    // Convert the stored Base64 key to a Buffer
    const key = fileDB.encryptionkey; // Directly use the buffer
    console.log(`Key Length: ${key.length}`); // Should output 32

    console.log(fileDB);
    console.log(cid);

    // Fetch the file from IPFS
    const response = await pinata.gateways.get(cid);
    console.log(response.data);

    // Convert the Blob response to a Buffer
    const buffer = await response.data.arrayBuffer();
    const encryptedBuffer = Buffer.from(buffer);

    // Decrypt the file
    const decryptedBuffer = decryptFile(encryptedBuffer, key);

    // Convert the decrypted buffer to Base64 format (if needed)
    const decryptedBase64 = Buffer.from(decryptedBuffer).toString("base64");

    // Send the Base64 encoded data in the response
    res.status(200).json({
      decryptedBase64,
    });
  } catch (error) {
    console.error("Error retrieving file from IPFS:", error.message);
    res
      .status(500)
      .json({ message: "Error retrieving file", error: error.message });
  }
});

module.exports = router;
