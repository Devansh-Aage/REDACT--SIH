require("dotenv").config();
const multer = require("multer");
const express = require("express");
const crypto = require("crypto");
const File = require("../models/File.js");
const FormData = require("form-data");
const fetchuser = require("../middleware/fetchuser.js");
const { PinataSDK } = require("pinata");

const router = express.Router();

const JWT = process.env.PINATA_JWT;
const pinataGateway = process.env.PINATA_GATEWAY;

const pinata = new PinataSDK({
  pinataJwt: JWT,
  pinataGateway: pinataGateway,
});


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

router.post("/upload", fetchuser, async (req, res) => {
  const key = crypto.randomBytes(32);

  try {
    let success = false;
    const { base64Data, mimeType, filename } = req.body;
    const base64WithoutPrefix = base64Data.replace(/^data:(.*?);base64,/, "");
    const buffer = Buffer.from(base64WithoutPrefix, "base64");
    const encryptedBuffer = encryptFile(buffer, key);

    const encryptedbase64String = encryptedBuffer.toString("base64");

    const response = await pinata.upload.base64(encryptedbase64String);

    let file = await File.findOne({ encryptionkey: key });
    if (file) {
      return res
        .status(500)
        .json({ message: "This encryption key has already been used!" });
    }

    file = await File.create({
      user: req.user.id,
      encryptionkey: key,
      ipfsCID: response.data.cid,
      mimeType: mimeType,
      filename: filename,
    });

    const cid=response.data.cid;

    success = true;
    res.status(200).json({
      success,
      cid
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    res
      .status(500)
      .json({ message: "Error uploading file", error: error.message });
  }
});

// Add this new route to retrieve a file using its CID
router.get("/retrieve/:cid", async (req, res) => {
  const { cid } = req.params;

  try {
    // Retrieve the file entry from the database
    const fileDB = await File.findOne({ ipfsCID: cid });
    let success = false;
    if (!fileDB)
      return res.status(400).json({ message: "File CID not found in DB" });

    // Convert the stored Base64 key to a Buffer
    const key = fileDB.encryptionkey; // Directly use the buffer
    const filename=fileDB.filename;
    const mimeType = fileDB.mimeType;

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
    success = true;
    // Send the Base64 encoded data in the response
    res.status(200).json({
      success,
      decryptedBase64,
      mimeType,
      filename
    });
  } catch (error) {
    console.error("Error retrieving file from IPFS:", error.message);
    res
      .status(500)
      .json({ message: "Error retrieving file", error: error.message });
  }
});

module.exports = router;
